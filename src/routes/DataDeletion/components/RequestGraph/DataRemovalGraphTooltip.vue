<script setup>
import { computed } from "vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  tooltipData: {
    type: Object,
    validator: (value) => {
      if (value === null) return true;
      return (
        Object.prototype.hasOwnProperty.call(value, "formattedDate") &&
        typeof value.formattedDate === "string" &&
        Array.isArray(value.data) &&
        value.data.every(
          (item) =>
            typeof item.label === "string" &&
            typeof item.value === "number" &&
            typeof item.color === "string"
        )
      );
    },
    default: null,
  },
  tooltipLeft: {
    type: Number,
    required: true,
  },
});

const totalRecordsRemoved = computed(() => {
  return parseInt(
    props.tooltipData?.data.reduce((acc, item) => acc + item.value, 0)
  );
});

const isExtrapolated = computed(() => {
  return props.tooltipData?.isExtrapolated || false;
});
</script>

<template>
  <div
    class="data-removal-graph_tooltip"
    :style="{ left: parseInt(tooltipLeft) + 'px' }"
    :class="{ 'extrapolated-data': isExtrapolated }"
  >
    <BaseText
      as="div"
      variant="body-3-semibold"
      class="tooltip-records-removed"
    >
      {{ parseInt(totalRecordsRemoved) }}
      {{ parseInt(totalRecordsRemoved) == 1 ? "record" : "records" }} removed
    </BaseText>
    <BaseText
      as="div"
      variant="caption-semibold"
      class="tooltip-header"
    >
      as of {{ tooltipData?.formattedDate }}
      <span
        v-if="isExtrapolated"
        class="tooltip-extrapolated-tag"
      >
        (projected)
      </span>
    </BaseText>
    <div
      v-for="(item, index) in tooltipData?.data"
      :key="index"
      class="tooltip-item"
    >
      <div
        class="tooltip-color-indicator"
        :style="{ backgroundColor: item.color }"
        :class="{ dashed: item.isExtrapolated }"
      />
      <BaseText
        variant="caption-semibold"
        as="div"
      >
        {{ parseInt(item.value) }} {{ item.label }}
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.data-removal-graph_tooltip {
  position: relative;
  background-color: $color-base-white-100;
  border: 1px solid $color-primary-10;
  color: $color-primary-100;
  padding: 10px;
  box-shadow: 0 0 10px rgba($black, 0.1);
  border-radius: 5px;
  display: flex;
  flex-direction: column;

  &.extrapolated-data {
    border-style: dashed;
  }
}

.tooltip-header {
  margin-bottom: 8px;
}

.tooltip-extrapolated-tag {
  font-style: italic;
  margin-left: 4px;
  opacity: 0.8;
}

.tooltip-records-removed {
  margin-bottom: 2px;
}

.tooltip-item {
  display: flex;
  align-items: center;
}

.tooltip-color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;

  &.dashed {
    opacity: 0.5;
  }
}
</style>
