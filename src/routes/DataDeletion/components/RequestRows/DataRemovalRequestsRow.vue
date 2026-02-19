<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import DataRemovalRequestsRowDetailsPeopleList from "@/routes/DataDeletion/components/RequestRows/DataRemovalRequestsRowDetailsPeopleList.vue";
import { computed } from "vue";
import {
  MONTHS,
  DATA_REMOVAL_STATUS,
  DATA_REMOVAL_STATUS_DISPLAY,
} from "@/scripts/constants";
import { formatAddress } from "@/scripts/format";
import AtomProgressBar from "@/library/AtomProgressBar.vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["open"]);

const recordsFormatted = computed(() => {
  return props.request.records.map((record) => {
    const parsedPII = JSON.parse(record.pii);
    parsedPII.addresses = parsedPII.addresses.map((address) => {
      return formatAddress(address);
    });
    return {
      ...record,
      pii: parsedPII,
    };
  });
});

const statusIcon = computed(() => {
  switch (props?.request?.state?.toLowerCase()) {
    case DATA_REMOVAL_STATUS.SCANNING:
      return "scanning";
    case DATA_REMOVAL_STATUS.NO_RECORDS_FOUND:
      return "stars-magic";
    case DATA_REMOVAL_STATUS.REMOVAL_IN_PROGRESS:
      return "clock-progress";
    case DATA_REMOVAL_STATUS.CONTINUED:
      return "arrow-continue";
    case DATA_REMOVAL_STATUS.REMOVED:
      return "checkbox-checked";
    default:
      return "";
  }
});

const statusText = computed(() => {
  return DATA_REMOVAL_STATUS_DISPLAY[props?.request?.state];
});

const statusShortText = computed(() => {
  if (props?.request?.state === DATA_REMOVAL_STATUS.CONTINUED) {
    return "Continued";
  }
  return statusText.value;
});

const statusClass = computed(() => {
  switch (props?.request?.state?.toLowerCase()) {
    case DATA_REMOVAL_STATUS.SCANNING:
      return "status-scanning";
    case DATA_REMOVAL_STATUS.NO_RECORDS_FOUND:
      return "status-no-records";
    case DATA_REMOVAL_STATUS.REMOVAL_IN_PROGRESS:
      return "status-in-progress";
    case DATA_REMOVAL_STATUS.REMOVED:
      return "status-removed";
    default:
      return "";
  }
});

const alertText = computed(() => {
  switch (props?.request?.state?.toLowerCase()) {
    case DATA_REMOVAL_STATUS.SCANNING:
      return `Cloaked is scanning this broker for your information...`;
    case DATA_REMOVAL_STATUS.NO_RECORDS_FOUND:
      return `Cloaked found no records on ${props.request?.broker_name} with your information`;
    case DATA_REMOVAL_STATUS.REMOVAL_IN_PROGRESS:
    case DATA_REMOVAL_STATUS.CONTINUED:
      return `Cloaked is working to remove your records from ${props.request?.broker_name}`;
    case DATA_REMOVAL_STATUS.REMOVED:
      return `Cloaked removed ${props.request?.records_matched} ${
        props.request?.records_matched === 1 ? "record" : "records"
      } from ${props.request?.broker_name}`;
    default:
      return "";
  }
});

const totalRecordItems = computed(() => {
  const cumulativeTotal = props.request.records.reduce(
    (acc, record) => acc + (record.total_items || 0),
    0
  );
  return cumulativeTotal;
});

const totalRecordItemsRemoved = computed(() => {
  const cumulativeTotal = props.request.records.reduce((acc, record) => {
    if (record.is_removed) {
      return acc + (record.total_items || 0);
    }
    return acc;
  }, 0);
  return cumulativeTotal;
});

const removalProgress = computed(() => {
  if (!totalRecordItems.value) {
    // If no records found, show 100% progress
    return 100;
  }
  return (totalRecordItemsRemoved.value / totalRecordItems.value) * 100;
});

const sentDate = computed(() => {
  if (props.request.sent_at) {
    const sentAtDate = new Date(props.request.sent_at);
    return ` ${
      MONTHS[sentAtDate.getMonth()]
    } ${sentAtDate.getDate()}, ${sentAtDate.getFullYear()}`;
  }
  return "—";
});

const completedDate = computed(() => {
  if (props.request.completed_at) {
    const completedAtDate = new Date(props.request.completed_at);
    return ` ${
      MONTHS[completedAtDate.getMonth()]
    } ${completedAtDate.getDate()}, ${completedAtDate.getFullYear()}`;
  }
  return "—";
});

const estimatedTime = computed(() => {
  if (props.request.completed_at) {
    const completedAtDate = new Date(props.request.completed_at);
    const today = new Date();
    if (today > completedAtDate) {
      return "Complete";
    }
  }
  if (typeof props.request.estimated_days_to_remove_records === "number") {
    const days = props.request.estimated_days_to_remove_records;
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  return "—";
});
</script>

<template>
  <div
    class="requests-table-row-wrapper"
    :class="{ opened: props.request.opened }"
    @click="emit('open')"
  >
    <div class="requests-table-row">
      <div class="cell broker">
        <BaseText
          variant="headline-6-medium"
          class="icon"
        >
          {{ props.request.opened ? "-" : "+" }}
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="broker-name"
        >
          {{ ` ${request.broker_name}` }}
        </BaseText>
      </div>
      <div
        class="status cell"
        :class="statusClass"
      >
        <InlineSvg
          :name="statusIcon"
          class="status-icon"
        />
        <BaseText
          variant="headline-6-medium"
          class="full-text"
        >
          {{ statusText }}
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="short-text"
        >
          {{ statusShortText }}
        </BaseText>
      </div>
      <BaseText
        v-if="props.request.state === DATA_REMOVAL_STATUS.SCANNING"
        variant="headline-6-medium"
        as="div"
        class="cell progress"
      >
        Scanning for records
      </BaseText>
      <div
        v-else
        class="cell progress"
      >
        <AtomProgressBar
          v-if="totalRecordItems > 0"
          class="items-progress-bar"
          :percent="removalProgress"
          :top-color="removalProgress === 100 ? '#00C47D' : undefined"
        />
        <BaseText
          variant="body-small-medium"
          class="items-text"
        >
          {{ totalRecordItemsRemoved }} of {{ totalRecordItems }}
        </BaseText>
      </div>
    </div>

    <div
      class="details-row-wrapper"
      :class="{ opened: props.request.opened }"
    >
      <div class="details-row-wrapper-flex">
        <BaseText
          as="div"
          variant="headline-6-medium"
          class="alert"
          :class="{
            scanning: props.request.state === DATA_REMOVAL_STATUS.SCANNING,
            'in-progress': [
              DATA_REMOVAL_STATUS.REMOVAL_IN_PROGRESS,
              DATA_REMOVAL_STATUS.CONTINUED,
            ].includes(props.request.state),
            'no-records-found':
              props.request.state === DATA_REMOVAL_STATUS.NO_RECORDS_FOUND,
            removed: props.request.state === DATA_REMOVAL_STATUS.REMOVED,
          }"
        >
          {{ alertText }}
        </BaseText>

        <div class="time-wrapper-row">
          <div class="time-wrapper">
            <BaseText
              as="h1"
              variant="body-small-medium"
            >
              Sent on
            </BaseText>
            <BaseText
              as="p"
              variant="caption-semibold"
            >
              {{ sentDate }}
            </BaseText>
          </div>
          <div class="time-wrapper">
            <BaseText
              as="h1"
              variant="body-small-medium"
            >
              Completed on
            </BaseText>
            <BaseText
              as="p"
              variant="caption-semibold"
            >
              {{ completedDate }}
            </BaseText>
          </div>
          <div class="time-wrapper">
            <BaseText
              as="h1"
              variant="body-small-medium"
            >
              Estimated completion
            </BaseText>
            <BaseText
              as="p"
              variant="caption-semibold"
            >
              {{ estimatedTime }}
            </BaseText>
          </div>
        </div>

        <DataRemovalRequestsRowDetailsPeopleList
          :broker-name="props.request.broker_name"
          :records="recordsFormatted"
          :status="props.request.state"
          :svg-icon="statusIcon"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.requests-table-row-wrapper {
  display: flex;
  flex-direction: column;
  border: 1px solid $color-primary-10;
  border-radius: 12px;
  overflow: hidden;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  padding: 24px;
  cursor: pointer;

  @at-root .theme-dark & {
    background-color: $color-primary-5;
  }
  &.opened {
    border: 1px solid $color-primary-100;
    background-color: transparent;
    box-shadow: 0px 18px 34px 0px rgba($color-primary-100-light, 0.15);
    transition: all 0.3s ease-in-out;
    @at-root .theme-dark & {
      box-shadow: 0px 18px 34px 0px rgba($color-primary-50-dark, 0.15);
    }
  }
  &:hover {
    transition: all 0.3s ease-in-out;
    transform: scale(1.003);
    border: 1px solid $color-primary-100;
  }
  .requests-table-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;

    .cell {
      color: $color-primary-100;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      width: calc((100% + 50px) / 3);
      text-wrap: wrap;

      @include line-clamp(1);
      .status-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      &:first-of-type {
        width: calc(((100% + 50px) / 3) - 24px);
      }
      &:last-of-type {
        width: calc(((100% + 50px) / 3) - 24px);
      }

      &.broker {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;

        span {
          @include line-clamp(1);
          &.broker-name {
            width: calc(100% - 42px);
          }
        }
        .icon {
          width: 11px;
        }
      }

      &.status {
        display: flex;
        align-items: center;
        gap: 8px;
        span {
          @include line-clamp(1);
        }
        &.status-removed {
          color: $color-success;
        }

        &.status-in-progress {
          color: $color-warning;
        }

        &.status-no-records {
          color: $color-lt-green;
        }
        &.status-scanning {
          color: $color-primary-100;
        }

        .full-text {
          display: flex;
        }
        .short-text {
          display: none;
        }
        @media (max-width: 1085px) {
          .full-text {
            display: none;
          }
          .short-text {
            display: flex;
          }
        }
      }
      &.progress {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        .items-progress-bar {
          width: 65%;
          @media (max-width: 1140px) {
            max-width: 110px;
          }
        }
      }
    }
  }
}

.details-row-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.3s ease-out,
    opacity 0.3s ease-out;
  &.opened {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .details-row-wrapper-flex {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    align-items: flex-start;
    color: $color-primary-100;
    width: 100%;

    .alert {
      margin-top: 16px;
      border-radius: 16px;
      text-align: center;
      color: $color-primary-100-light;
      width: 100%;
      padding: 24px 0;
      &.in-progress {
        background-color: $color-warning-light;
      }
      &.no-records-found {
        color: $color-primary-100;
        background-color: rgba($color-lt-green, 0.2);
      }
      &.removed {
        background-color: $color-success-light;
      }
      &.scanning {
        background-color: $color-primary-10-light;
      }
    }
    .time-wrapper-row {
      padding-top: 32px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      .time-wrapper {
        width: calc((100% + 50px) / 3);
        &:first-of-type {
          width: calc(((100% + 50px) / 3) - 24px);
        }
        &:last-of-type {
          width: calc(((100% + 50px) / 3) - 24px);
        }
      }
    }
  }
}
</style>
