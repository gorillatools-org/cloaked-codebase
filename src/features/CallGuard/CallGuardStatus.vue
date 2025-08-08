<script setup lang="ts">
import { computed } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";

interface Call {
  id: string;
  call_type: string;
}

interface Props {
  calls: Call[];
  isSetupComplete: boolean;
}

const props = defineProps<Props>();

const spamCalls = computed(() =>
  props.calls.filter((call: Call) => call.call_type === "spam")
);
</script>

<template>
  <div class="call-guard-status">
    <div class="call-guard-status__header">
      <BaseIcon
        name="shield-tick"
        class="call-guard-status__header-icon"
      />
      <div class="call-guard-status__header-row">
        <BaseText
          variant="headline-3-medium"
          as="h1"
          class="call-guard-status__header-title"
        >
          Call Guard
        </BaseText>
        <BaseProgressTag
          :color="isSetupComplete ? 'spam-protection' : 'spirit-rose'"
          class="call-guard-status__header-tag"
        >
          {{ isSetupComplete ? "Protected" : "Not Protected" }}
        </BaseProgressTag>
      </div>
    </div>

    <div class="call-guard-status__content">
      <BaseText
        variant="body-2-semibold"
        class="call-guard-status__content-label"
      >
        Protected from
      </BaseText>
      <BaseText
        variant="headline-1-medium"
        class="call-guard-status__content-number"
        :class="{ 'call-guard-status__content-number--red': !isSetupComplete }"
      >
        {{ spamCalls.length }}
      </BaseText>
      <BaseText
        variant="body-2-semibold"
        class="call-guard-status__content-label"
      >
        Spam Calls
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.call-guard-status {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &-icon {
      width: 24px;
      height: 24px;
      font-size: 24px;
    }

    &-row {
      display: flex;
      align-items: center;
      gap: 16px;
      justify-content: space-between;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;

    &-number {
      color: $color-spam-protection;

      &--red {
        color: $color-spirit-rose;
      }
    }
  }
}
</style>
