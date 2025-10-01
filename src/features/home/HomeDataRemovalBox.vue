<script setup>
import BaseText from "@/library/BaseText.vue";
const props = defineProps({
  status: {
    type: String,
    default: null,
    validator: (value) => {
      return ["in-progress", "complete"].includes(value);
    },
  },
});
</script>
<template>
  <div class="data-removal-box">
    <BaseText
      variant="headline-3-bold"
      as="div"
      class="data-removal-value"
      :class="{
        'in-progress': props.status === 'in-progress',
        'color-success': props.status === 'complete',
      }"
    >
      <slot name="number" />
      <BaseText
        v-if="$slots.bubble"
        as="div"
        variant="caption-semibold"
        class="total-number-changed"
      >
        <slot name="bubble" />
      </BaseText>
    </BaseText>
    <BaseText
      variant="body-small-medium"
      as="div"
      class="data-removal-label"
    >
      <slot name="label" />
    </BaseText>
  </div>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.data-removal-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 78px;
  width: 100%;
  border: 1px solid $color-primary-10;
  border-radius: 12px;
  padding: 16px;

  .data-removal-value {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;

    .total-number-changed {
      color: $white;
      background-color: $color-success;
      border-radius: 49px;
      padding: 2px 6px;
      text-align: center;
    }
  }
}

.in-progress {
  color: $color-in-progress;
}

.color-success {
  color: $color-success;
}

.blue {
  color: $color-brand-3-100;
}
</style>
