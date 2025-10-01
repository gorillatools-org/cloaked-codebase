<script setup>
import TipInfo from "@/assets/icons/tip-info.svg";
import TipWarning from "@/assets/icons/tip-warning.svg";
const props = defineProps({
  type: {
    type: String,
    default: "info",
    validator: (value) => ["info", "warning"].includes(value),
  },
});
</script>
<template>
  <div
    class="tip"
    :class="`tip--${props.type}`"
  >
    <TipInfo
      v-if="props.type === 'info'"
      class="tip__icon"
    />
    <TipWarning
      v-else-if="props.type === 'warning'"
      class="tip__icon"
    />
    <slot />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.tip {
  padding: 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  color: $color-primary-100;
  display: flex;
  align-items: center;

  &__icon {
    flex-shrink: 0;
    margin-right: 14px;
    width: 20px;
    height: 20px;
  }

  &--info {
    border: 1px solid $color-primary-30;
    color: $color-primary-100;
  }

  &--warning {
    background: $color-warning-light;
    border: 1px solid $color-warning;

    @at-root .theme-dark & {
      color: $color-primary-100-light;
    }
  }
}
</style>
