<script setup>
import BaseText from "@/library/BaseText.vue";
import MonitoringScanningItemIcon from "@/features/monitoring/MonitoringScanningItemIcon.vue";

defineProps({
  status: {
    type: String,
    default: "inactive",
    validator: (value) => ["inactive", "scanning"].includes(value),
  },
});
</script>

<template>
  <BaseText
    variant="body-3-semibold"
    class="monitoring-scanning-item"
    :class="`monitoring-scanning-item--${status}`"
  >
    <MonitoringScanningItemIcon class="monitoring-scanning-item__status" />
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.monitoring-scanning-item {
  display: grid;
  grid-template-columns: 16px 1fr;
  column-gap: 8px;
  padding: 10px;
  border-radius: 100px;

  &__status {
    place-self: center;

    &:before {
      @at-root .monitoring-scanning-item--inactive & {
        background-color: $color-primary-50;
      }

      @at-root .monitoring-scanning-item--scanning & {
        background-color: $color-safe-zone-green;
      }
    }

    &:after {
      @at-root .monitoring-scanning-item--inactive & {
        background-color: $color-primary-50;
      }

      @at-root .monitoring-scanning-item--scanning & {
        background-color: $color-safe-zone-green;
      }
    }
  }
}
</style>
