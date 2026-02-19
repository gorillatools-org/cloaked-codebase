<script setup>
import BaseText from "@/library/BaseText.vue";

defineProps({
  threatLevel: {
    type: String,
    default: "low",
    validator: (value) => ["low", "medium", "high"].includes(value),
  },
});

const threatLevelToTagLabel = {
  low: "Spam Risk",
  medium: "Safety Risk",
  high: "High Personal Risk",
};
</script>

<template>
  <BaseText
    variant="body-3-semibold"
    class="data-delete-risk-tag"
    :class="`data-delete-risk-tag--${threatLevel}`"
  >
    {{ threatLevelToTagLabel[threatLevel] }}
  </BaseText>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-risk-tag {
  padding: 5px 10px;
  border-radius: 30px;

  &--low {
    border: 1px solid $color-in-progress;
    color: $color-in-progress;

    @at-root .theme-light & {
      border: 1px solid $color-in-progress;
      background-color: $color-in-progress;
      color: $color-primary-1;
    }
  }

  &--medium {
    border: 1px solid $color-info;
    color: $color-info;

    @at-root .theme-light & {
      border: 1px solid $color-info;
      background-color: $color-info;
      color: $color-primary-1;
    }
  }

  &--high {
    border: 1px solid $color-alert;
    color: $color-alert;

    @at-root .theme-light & {
      border: 1px solid $color-alert;
      background-color: $color-alert;
      color: $color-primary-1;
    }
  }
}
</style>
