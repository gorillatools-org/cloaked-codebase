<script setup lang="ts">
import { computed, ref } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseChip from "@/library/BaseChip.vue";
import BaseMedallion, {
  type MedallionColor,
} from "@/library/BaseMedallion.vue";
import moment from "moment";
import { phone_format } from "@/scripts/format";
import type { BaseIconName } from "@/library/baseIconTypes.ts";

type CallType = "missed" | "voicemail" | "spam" | "forwarded";

type Call = {
  id: string;
  call_type: CallType;
  from_: string;
  location: string;
  created_at: string;
};

type Props = {
  calls: Call[];
  isSetupComplete: boolean;
};

const props = defineProps<Props>();
const selectedFilter = ref("all");
const listContainerRef = ref<HTMLElement | null>(null);

const emptyStateMessage = computed(() => {
  switch (selectedFilter.value) {
    case "forwarded":
      return "No forwarded calls";
    case "missed":
      return "No missed calls";
    case "voicemail":
      return "No voicemails";
    case "spam":
      return "No spam calls";
    default:
      return "No calls";
  }
});

type CallTypeConfig = {
  icon: BaseIconName;
  color: MedallionColor;
  title: string;
};

const getCallTypeConfig = (callType: CallType): CallTypeConfig => {
  switch (callType.toLowerCase() as CallType) {
    case "missed":
      return {
        title: "Missed Call",
        icon: "incoming-call",
        color: "spirit-rose",
      };
    case "voicemail":
      return {
        title: "Voicemail Received",
        icon: "sound-bar",
        color: "caribbean-green",
      };
    case "spam":
      return { title: "Spam Blocked", icon: "block", color: "foam-blue" };
    case "forwarded":
      return {
        title: "Call Forwarded",
        icon: "phone-shield",
        color: "spam-protection",
      };
    default:
      return { title: "Call", icon: "phone", color: "foam-blue" };
  }
};

const filteredCalls = computed(() => {
  if (selectedFilter.value === "all") {
    return props.calls;
  }
  const filtered = props.calls.filter((call: Call) => {
    const callType = call.call_type?.toLowerCase() || "";
    const filterType = selectedFilter.value.toLowerCase();
    const matches = callType === filterType;
    return matches;
  });
  return filtered;
});

const handleFilterClick = (filter: string) => {
  selectedFilter.value = filter;

  if (listContainerRef.value) {
    listContainerRef.value.scrollTo({ top: 0 });
  }
};
</script>

<template>
  <div
    ref="listContainerRef"
    class="call-guard-activity-list"
  >
    <div class="call-guard-activity-list__header">
      <BaseIcon
        name="phone-shield"
        class="call-guard-activity-list__header-icon"
      />
      <BaseText
        variant="headline-3-medium"
        as="h1"
        class="call-guard-activity-list__header-title"
      >
        Call History
      </BaseText>
    </div>

    <div
      v-if="props.isSetupComplete"
      class="call-guard-activity-list__filter"
    >
      <BaseChip
        variant="display"
        size="lg"
        :selected="selectedFilter === 'all'"
        @click="handleFilterClick('all')"
      >
        All Calls
      </BaseChip>
      <BaseChip
        variant="display"
        size="lg"
        :selected="selectedFilter === 'forwarded'"
        @click="handleFilterClick('forwarded')"
      >
        Forwarded
      </BaseChip>
      <BaseChip
        variant="display"
        size="lg"
        :selected="selectedFilter === 'missed'"
        @click="handleFilterClick('missed')"
      >
        Missed
      </BaseChip>
      <BaseChip
        variant="display"
        size="lg"
        :selected="selectedFilter === 'voicemail'"
        @click="handleFilterClick('voicemail')"
      >
        Voicemail
      </BaseChip>
      <BaseChip
        variant="display"
        size="lg"
        :selected="selectedFilter === 'spam'"
        @click="handleFilterClick('spam')"
      >
        Spam
      </BaseChip>
    </div>

    <div
      v-if="props.isSetupComplete"
      class="call-guard-activity-list__list"
    >
      <div
        v-for="call in filteredCalls"
        :key="call.id"
        class="call-guard-activity-list__list-item"
      >
        <div class="call-guard-activity-list__list-item-info">
          <BaseMedallion
            :icon="getCallTypeConfig(call.call_type).icon"
            :color="getCallTypeConfig(call.call_type).color"
            size="md"
            class="call-guard-activity-list__list-item-medallion"
          />
          <div class="call-guard-activity-list__list-item-info-text">
            <BaseText
              variant="body-3-regular"
              as="p"
              class="call-guard-activity-list__list-item-title"
            >
              {{ getCallTypeConfig(call.call_type as CallType).title }}
            </BaseText>
            <BaseText
              variant="body-2-semibold"
              as="p"
              class="call-guard-activity-list__list-item-phone"
            >
              {{ phone_format(call.from_) }}
            </BaseText>
          </div>
        </div>

        <div class="call-guard-activity-list__list-item-location">
          <BaseText
            variant="body-3-regular"
            as="p"
            class="call-guard-activity-list__list-item-location-text"
          >
            {{ call.location }}
          </BaseText>
        </div>

        <div class="call-guard-activity-list__list-item-date">
          <BaseText
            variant="body-3-regular"
            as="p"
            class="call-guard-activity-list__list-item-date-text"
          >
            {{ moment(call.created_at).format("MMM D") }}
          </BaseText>
          <BaseIcon
            :name="call.call_type === 'voicemail' ? 'play-filled' : 'info'"
            class="call-guard-activity-list__list-item-date-icon"
          />
        </div>
      </div>
      <div
        v-if="filteredCalls.length === 0"
        class="call-guard-activity-list__list-item-empty"
      >
        <BaseText
          variant="headline-3-medium"
          as="h2"
        >
          {{ emptyStateMessage }}
        </BaseText>
      </div>
    </div>
    <div
      v-else
      class="call-guard-activity-list__not-active"
    >
      <BaseText
        variant="headline-3-medium"
        as="h2"
      >
        Call Guard is not active
      </BaseText>
      <BaseText
        variant="body-small-medium"
        as="p"
      >
        Please activate Call Guard to see your call history.
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.call-guard-activity-list {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  gap: 16px;
  position: relative;
  height: 100%;
  overflow-y: auto;
  @include custom-scroll-bar;

  &__header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 24px 24px 0 24px;

    &-icon {
      width: 24px;
      height: 24px;
      font-size: 24px;
    }

    &-title {
      width: 100%;
    }
  }

  &__filter {
    display: flex;
    gap: 8px;
    position: sticky;
    top: 0px;
    background-color: $color-primary-5;
    padding: 16px 24px;
    z-index: 1;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 24px 24px 24px;
    flex-grow: 1;

    &-item {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background-color: $color-base-white-100;
      border: 1px solid $color-primary-10;
      box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      padding: 16px;
      gap: 10px;

      &-info {
        display: flex;
        align-items: center;
        flex-grow: 1;
        gap: 10px;
      }

      &-location {
        min-width: 100px;
        margin-right: 20px;
        display: none;

        @media (min-width: 1204px) {
          display: block;
          text-align: right;
        }

        @media (min-width: 1284px) {
          min-width: 140px;
          display: block;
          text-align: left;
        }
      }

      &-date {
        min-width: 70px;
        text-align: right;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 5px;

        &-icon {
          width: 17px;
          height: 17px;
          font-size: 17px;
        }
      }

      &-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        height: 100%;
      }
    }
  }

  &__not-active {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
  }
}
</style>
