<script setup>
import { computed, nextTick } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useRelativesApi } from "@/composables/useRelativesApi.js";
import store from "@/store/index.js";

const props = defineProps({
  broker: {
    type: Object,
    required: true,
  },
  isExpanded: {
    type: Boolean,
    required: true,
  },
});

const status = computed(() => {
  if (
    props.broker.state === "removal_in_progress" &&
    !props.broker.records.find((record) => record.is_removed)
  ) {
    return "scanning";
  }

  if (
    props.broker.state === "removal_in_progress" &&
    props.broker.records.find((record) => record.is_removed)
  ) {
    return "removal_in_progress";
  }

  return props.broker.state;
});

const emit = defineEmits(["toggle"]);

const iconName = computed(() => {
  switch (status.value) {
    case "scanning":
      return "search-text";
    case "removal_in_progress":
      return "remove";
    case "removed":
      return "verified";
    case "action_required":
      return "text-exclamation";
    case "no_records_found":
      return "tick-circle";
    default:
      return "check";
  }
});

const iconClass = computed(() => {
  return `exposure-status__broker-list-item__header-icon--${status.value}`;
});

const progressClass = computed(() => {
  return `exposure-status__removal-progress--${status.value}`;
});

const subtitle = computed(() => {
  switch (status.value) {
    case "scanning":
      return "Ensuring Broker Compliance";
    case "removal_in_progress":
      return "In progress of removing exposures";
    case "removed":
      return "Exposures Removed";
    case "action_required":
      return "Manual removal required for this broker";
    case "no_records_found":
      return "No exposures found for this broker";
    default:
      return "";
  }
});

const alertClass = computed(() => {
  return `exposure-status__broker-list-item__content-alert--${status.value}`;
});

const alertText = computed(() => {
  switch (status.value) {
    case "scanning":
      return `Cloaked has secured records at ${props.broker.broker_name} for removal`;
    case "removal_in_progress":
      return `Cloaked is working to remove your records from ${props.broker.broker_name}`;
    case "removed":
      return "Cloaked removed all exposures for this broker";
    case "action_required":
      return "Manual removal required for this broker";
    case "no_records_found":
      return `Cloaked found no records on ${props.broker.broker_name} with your information`;
    default:
      return "";
  }
});

const toggleContent = async () => {
  emit("toggle", props.broker);
  posthogCapture("dashboard_user_expands_databroker_details");

  if (!props.isExpanded) {
    await nextTick();
    const element = document.querySelector(
      `[data-broker="${props.broker.state}-${props.broker.broker_name}"]`
    );
    if (element) {
      const container = document.querySelector(
        ".page-exposure-status__content"
      );
      if (container) {
        const position = element.offsetTop;
        container.scrollTo({
          top: position,
          behavior: "smooth",
        });
      }
    }
  }
};

function formatDate(date) {
  if (!date) return "-";

  try {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}

const formattedEstimatedDays = computed(() => {
  const days = props.broker.estimated_days_to_remove_records;
  return days === 1 ? "1 day" : `${days} days`;
});

const formattedSentAt = computed(() => {
  return formatDate(props.broker.sent_at);
});

const formattedCompletedAt = computed(() => {
  if (!props.broker.completed_at) return "Not yet completed";
  return formatDate(props.broker.completed_at);
});

function safeJsonParse(jsonStr) {
  try {
    return typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
  } catch {
    return jsonStr;
  }
}

const totalRecordItems = computed(() => {
  const cumulativeTotal = props.broker.records.reduce(
    (acc, record) => acc + (record.total_items || 0),
    0
  );
  return cumulativeTotal;
});

const totalRecordItemsRemoved = computed(() => {
  const cumulativeTotal = props.broker.records.reduce((acc, record) => {
    if (record.is_removed) {
      return acc + (record.total_items || 0);
    }
    return acc;
  }, 0);
  return cumulativeTotal;
});

const { relatives } = useRelativesApi();

const hasNotMyRelatives = computed(
  () => store.state.authentication?.user?.flags?.["not-my-relative"]
);
</script>

<template>
  <BaseSheet
    class="exposure-status__broker-list-item"
    :data-broker="`${broker.state}-${broker.broker_name}`"
    :class="{ 'exposure-status__broker-list-item--expanded': props.isExpanded }"
  >
    <div
      class="exposure-status__broker-list-item__header"
      @click="toggleContent"
    >
      <div class="exposure-status__broker-list-item__header-content">
        <BaseIcon
          :name="iconName"
          :class="[iconClass, 'exposure-status__broker-list-item__header-icon']"
        />
        <div>
          <BaseText
            variant="body-2-semibold"
            as="p"
            class="exposure-status__broker-list-item__header-content-title"
          >
            {{ props.broker.broker_name }}
          </BaseText>

          <BaseText
            variant="body-3-semibold"
            as="p"
            class="exposure-status__broker-list-item__header-content-subtitle"
          >
            {{ subtitle }}
          </BaseText>
        </div>

        <div
          class="exposure-status__removal-progress"
          :class="[
            progressClass,
            {
              'exposure-status__removal-progress--hidden':
                broker.state === 'action_required' ||
                totalRecordItemsRemoved === 0,
            },
          ]"
        >
          <div class="exposure-status__removal-progress-bar">
            <div
              class="exposure-status__removal-progress-bar-fill"
              :style="{
                width: `${(totalRecordItemsRemoved / totalRecordItems) * 100}%`,
              }"
            ></div>
          </div>
          <span class="exposure-status__removal-progress-value">
            {{ totalRecordItemsRemoved }} of {{ totalRecordItems }}
          </span>
        </div>
      </div>

      <div class="exposure-status__broker-list-item__header-actions">
        <div class="exposure-status__broker-list-item__header-actions-button">
          <BaseIcon :name="isExpanded ? 'minus' : 'plus'" />
        </div>
      </div>
    </div>

    <transition name="exposure-status__broker-list-item-transition">
      <div
        v-show="isExpanded"
        class="exposure-status__broker-list-item__content"
      >
        <BaseText
          v-if="alertText"
          variant="body-3-semibold"
          as="div"
          :class="[
            alertClass,
            'exposure-status__broker-list-item__content-alert',
          ]"
        >
          {{ alertText }}
        </BaseText>

        <div class="exposure-status__broker-list-item__content-info">
          <div class="exposure-status__broker-list-item__content-info-item">
            <BaseText
              variant="body-3-semibold"
              as="p"
              class="exposure-status__broker-list-item__content-info-item-title"
            >
              Est. completion time
            </BaseText>

            <BaseText
              variant="body-3-semibold"
              as="p"
              class="exposure-status__broker-list-item__content-info-item-value"
            >
              {{ formattedEstimatedDays }}
            </BaseText>
          </div>

          <div class="exposure-status__broker-list-item__content-info-item">
            <BaseText
              variant="body-3-semibold"
              as="p"
              class="exposure-status__broker-list-item__content-info-item-title"
            >
              Sent on
            </BaseText>

            <BaseText
              variant="body-3-semibold"
              as="p"
              class="exposure-status__broker-list-item__content-info-item-value"
            >
              {{ formattedSentAt }}
            </BaseText>
          </div>

          <div class="exposure-status__broker-list-item__content-info-item">
            <BaseText
              variant="body-3-semibold"
              as="p"
              class="exposure-status__broker-list-item__content-info-item-title"
            >
              Completed on
            </BaseText>

            <BaseText
              variant="body-3-semibold"
              as="p"
              class="exposure-status__broker-list-item__content-info-item-value"
            >
              {{ formattedCompletedAt }}
            </BaseText>
          </div>
        </div>

        <div
          v-if="broker.records.length > 0"
          class="exposure-status__broker-list-item__content-records"
        >
          <div
            class="exposure-status__broker-list-item__content-records-header"
          >
            <div
              v-for="(label, index) in [
                'Name',
                'Location',
                'Email',
                'Phone',
                'Relatives',
              ]"
              :key="index"
              class="exposure-status__broker-list-item__content-records-header-item"
            >
              <BaseText
                variant="body-small-semibold"
                as="p"
                class="exposure-status__broker-list-item__content-records-header-item-label"
              >
                {{ label }}
              </BaseText>
            </div>
          </div>

          <div
            v-for="record in broker.records"
            :key="record.id"
            class="exposure-status__broker-list-item__content-records-row"
          >
            <div
              class="exposure-status__broker-list-item__content-records-row-item"
            >
              <BaseText
                variant="body-3-regular"
                as="p"
              >
                {{ safeJsonParse(record.pii).full_name || "-" }}
              </BaseText>
            </div>

            <div
              class="exposure-status__broker-list-item__content-records-row-item"
            >
              <BaseText
                variant="body-3-regular"
                as="p"
              >
                {{ safeJsonParse(record.pii).addresses?.join(", ") || "-" }}
              </BaseText>
            </div>

            <div
              class="exposure-status__broker-list-item__content-records-row-item"
            >
              <BaseText
                variant="body-3-regular"
                as="p"
              >
                {{
                  safeJsonParse(record.pii).email_addresses
                    ? "Found on broker"
                    : "-"
                }}
              </BaseText>
            </div>

            <div
              class="exposure-status__broker-list-item__content-records-row-item"
            >
              <BaseText
                variant="body-3-regular"
                as="p"
              >
                {{
                  safeJsonParse(record.pii).phone_numbers
                    ? "Found on broker"
                    : "-"
                }}
              </BaseText>
            </div>

            <div
              class="exposure-status__broker-list-item__content-records-row-item"
            >
              <template v-if="safeJsonParse(record.pii).relatives?.length">
                <BaseText
                  v-for="(relative, idx) in safeJsonParse(record.pii).relatives"
                  :key="idx"
                  variant="body-3-regular"
                  as="p"
                  class="exposure-status__broker-list-item__content-records-row-item-relative"
                >
                  {{ relative }}
                </BaseText>
              </template>
            </div>
          </div>

          <footer
            v-if="hasNotMyRelatives && relatives.length"
            class="exposure-status__broker-list-item__content-footer"
          >
            <BaseText
              variant="body-3-semibold"
              as="p"
            >
              Are these profile details incorrect?
              <router-link
                :to="{ name: 'ExposureStatusRelatives' }"
                class="exposure-status__broker-list-item__content-footer-link"
              >
                Click here
              </router-link>
            </BaseText>
          </footer>
        </div>
      </div>
    </transition>
  </BaseSheet>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.exposure-status__broker-list-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
  padding: 0 0;

  &--expanded {
    box-shadow: 0px 10px 24px 0px rgba(0, 0, 0, 0.15);
    border-color: $color-primary-50;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;

    &:hover {
      cursor: pointer;
    }

    &-content {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;

      &-title {
        font-weight: 500;
      }

      &-subtitle {
        color: $color-primary-50;
        margin-top: 4px;
      }
    }

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      font-size: 24px;
      background-color: $color-safe-zone-blue-30;
      border-radius: 50%;
      color: $color-safe-zone-blue;
      margin-right: 10px;

      &--scanning {
        background-color: $color-cloaked-15;
        color: $color-cloaked;
      }

      &--removing {
        background-color: $color-safe-zone-blue-30;
        color: $color-safe-zone-blue;
      }

      &--removed {
        background-color: $color-safe-zone-green-15;
        color: $color-safe-zone-green;
      }

      &--action_required {
        background-color: $color-status-error-15;
        color: $color-status-error;
      }

      &--no_records_found {
        background-color: $color-safe-zone-green-15;
        color: $color-safe-zone-green;
      }
    }

    &-actions {
      margin-left: auto;

      &-button {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        font-weight: 600;

        &:hover {
          background-color: $color-primary-5;
        }
      }
    }
  }

  &__content {
    padding: 0 16px;
    margin-top: 8px;

    &-alert {
      padding: 16px;
      border-radius: 8px;
      background-color: $color-primary-5;
      color: $color-primary-100;
      text-align: center;

      &--scanning {
        background-color: $color-safe-zone-blue-30;
        color: $color-primary-100;
      }

      &--removing {
        background-color: $color-safe-zone-blue-30;
        color: $color-primary-100;
      }

      &--removed {
        background-color: $color-safe-zone-green-15;
        color: $color-primary-100;
      }

      &--action_required {
        background-color: $color-status-error-15;
        color: $color-primary-100;
      }

      &--no_records_found {
        background-color: $color-safe-zone-green-15;
        color: $color-primary-100;
      }
    }

    &-info {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 16px 38px;
      border-top: 1px solid $color-primary-20;
      border-bottom: 1px solid $color-primary-20;
      margin-top: 24px;
      gap: 16px;

      &-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;

        &-title {
          color: $color-primary-50;
          margin-bottom: 4px;
        }

        &-value {
          color: $color-primary-100;
          margin-bottom: 12px;
        }
      }
    }

    &-records {
      margin: 24px 0 16px 26px;
      display: flex;
      flex-direction: column;
      counter-reset: record-counter;

      &-header {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        gap: 16px;
        padding: 0 16px 0 16px;
      }

      &-header-item {
        display: flex;
        flex-direction: column;

        &-label {
          color: $color-primary-100;
          font-weight: 600;
        }
      }

      &-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        gap: 16px;
        padding: 16px;
        border-bottom: 1px solid $color-primary-5;
        counter-increment: record-counter;
        position: relative;

        &:before {
          content: counter(record-counter);
          position: absolute;
          left: -25px;
          top: 16px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid $color-primary-100;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 500;
          color: $color-primary-100;
        }

        &:last-child {
          border-bottom: none;
        }
      }

      &-row-item {
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-break: break-word;
        position: relative;
        color: $color-primary-50;
      }

      &-row-item-relative {
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    &-footer {
      background-color: $color-primary-5;
      padding: 10px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 24px;
      gap: 4px;
      margin-left: -26px;

      &-link {
        text-decoration: underline;

        &:hover {
          opacity: 0.8;
          cursor: pointer;
        }
      }
    }
  }

  &-transition {
    &-enter-active {
      transition:
        max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
        padding 0s cubic-bezier(0.4, 0, 0.2, 1) 0.25s,
        margin-top 0.5s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.25s;
      overflow: hidden;
    }

    &-leave-active {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    &-enter-from {
      max-height: 0;
      opacity: 0;
      transform: translateY(-20px);
      padding: 0;
      margin-top: 0;
    }

    &-leave-to {
      opacity: 0;
      transition:
        opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
        padding 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
        margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
      max-height: 0;
      transform: translateY(-10px);
      padding: 0;
      margin-top: 0;
    }

    &-enter-to,
    &-leave-from {
      max-height: 500px;
      opacity: 1;
      transform: translateY(0);
      margin-top: 8px;
    }
  }
}

// New top-level class for the progress bar
.exposure-status__removal-progress {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: $color-primary-100;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-right: 24px;

  &--hidden {
    display: none;
  }

  @media (max-width: 1130px) {
    display: none;
  }

  &-bar {
    width: 110px;
    height: 6px;
    background-color: $color-primary-10;
    border-radius: 4px;

    &-fill {
      height: 100%;
      background-color: $color-primary-100;
      border-radius: 4px;
    }
  }

  &-value {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.1px;
    color: $color-primary-100;
    text-align: right;
    display: inline-block;
    @media (max-width: 1215px) {
      display: none;
    }
  }

  &--removed {
    .exposure-status__removal-progress-bar {
      &-fill {
        background-color: $color-safe-zone-green;
      }
    }
  }

  &--removing {
    .exposure-status__removal-progress-bar {
      &-fill {
        background-color: $color-safe-zone-blue;
      }
    }
  }
}
</style>
