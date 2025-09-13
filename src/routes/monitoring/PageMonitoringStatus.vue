<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import IdentityTheftProtectionBlock from "@/features/IdentityTheftProtection/IdentityTheftProtectionBlock.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import MonitoringDetailHeader from "@/features/monitoring/MonitoringDetailHeader.vue";
import { computed } from "vue";

const props = defineProps({
  updatedAt: {
    type: Date,
    default: null,
  },
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const formattedUpdatedAt = computed(() =>
  timeFormatter.format(props.updatedAt).toLowerCase().split(" ").join("")
);
</script>

<template>
  <div class="page-monitoring-status">
    <MonitoringDetailHeader class="page-monitoring-status__header">
      <BaseProgressTag
        class="page-monitoring-status__tag"
        color="safe-zone-green"
      >
        Scanning
      </BaseProgressTag>
    </MonitoringDetailHeader>

    <div class="page-monitoring-status__status">
      <BaseIcon
        name="search-user"
        class="page-monitoring-status__icon"
      />
    </div>
    <BaseText
      variant="headline-2-semibold"
      class="page-monitoring-status__title"
    >
      Active Monitoring
    </BaseText>
    <BaseText
      variant="caption-semibold"
      class="page-monitoring-status__updated"
    >
      Updated today at {{ formattedUpdatedAt }}
    </BaseText>
    <IdentityTheftProtectionBlock class="page-monitoring-status__insurance" />
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.page-monitoring-status {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__header {
    align-self: stretch;
  }

  &__status {
    margin-top: 65px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
    position: relative;
    width: 80px;
    height: 80px;
    box-shadow: 0 0 40px 10px rgba($color-safe-zone-green, 0.5);

    &:before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 80px;
      transform: translate3d(-50%, -50%, 0);
      background-color: rgba($color-safe-zone-green, 0.5);
      border-radius: 100px;
      z-index: 1;
    }

    &:after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 56px;
      height: 56px;
      transform: translate3d(-50%, -50%, 0);
      background-color: $color-safe-zone-green;
      color: $color-primary-1;
      border-radius: 100px;
      z-index: 1;
    }
  }

  &__icon {
    font-size: 30px;
    position: relative;
    z-index: 2;
    color: $color-primary-1;
  }

  &__title {
    margin-top: 32px;
  }

  &__updated {
    margin-top: 8px;
    color: $color-primary-50;
  }

  &__insurance {
    width: 100%;
    margin-top: 32px;
  }
}
</style>
