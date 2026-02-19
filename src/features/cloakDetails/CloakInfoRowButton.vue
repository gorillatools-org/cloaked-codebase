<script setup>
import { computed } from "vue";
const props = defineProps({
  icon: { type: Boolean, default: false },
  colorOverride: { type: Boolean, default: false },
  primary: { type: Boolean, default: false },
  href: { type: String, default: "" },
  danger: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
defineEmits(["click"]);
const tag = computed(() => (props.href ? "a" : "button"));
const target = computed(() => (props.href ? "_blank" : null));
</script>
<template>
  <component
    :is="tag"
    class="cloak-info-row-button"
    :class="{
      'cloak-info-row-button--icon': props.icon,
      'cloak-info-row-button--100': props.colorOverride,
      'cloak-info-row-button--primary': props.colorOverride,
      'cloak-info-row-button--danger': props.danger,
      'cloak-info-row-button--active': props.active,
      'cloak-info-row-button--disabled': props.disabled,
    }"
    :target="target"
    :href="props.href"
    :disabled="props.disabled"
    @click="($event) => $emit('click', $event)"
  >
    <slot />
  </component>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.cloak-info-row-button {
  min-width: 36px;
  height: 36px;
  background: $color-primary-100;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  border: none;
  padding: 0 17px;
  color: $color-primary-1;

  &--icon {
    padding: 0;
    background: none;

    &:not(.cloak-info-row-button--disabled) {
      &:hover {
        transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

        svg {
          color: $color-primary-100;
        }
      }
    }

    svg {
      pointer-events: none;
      color: $color-primary-100;
    }
  }

  &--100 {
    color: $color-primary-100;

    path {
      fill: $color-primary-100;
    }
  }

  &:hover,
  &--active {
    &:not(.cloak-info-row-button--disabled) {
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      cursor: pointer;
      color: $color-primary-100;
      background: $color-primary-10;
      border: none;

      svg {
        color: $color-primary-100;
      }
    }
  }

  &:hover,
  &--disabled {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    cursor: not-allowed;
  }
}
</style>
