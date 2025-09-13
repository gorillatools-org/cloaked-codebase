<script setup>
import { useSlots } from "vue";
import BaseText from "@/library/BaseText.vue";

const slots = useSlots();
const emit = defineEmits(["click", "mouseover", "mouseleave", "mouseenter"]);
const props = defineProps({
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
  active: { type: Boolean, default: false },
  uppercase: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  darkFont: { type: Boolean, default: false },
  center: { type: Boolean, default: false },
  rtl: { type: Boolean, default: false },
  danger: { type: Boolean, default: false },
});
function handleClick(event) {
  if (props.disabled) {
    return;
  }
  emit("click", event);
}
</script>
<template>
  <button
    class="ui-menu-button"
    :class="{
      'ui-menu-button--active': props.active,
      'ui-menu-button--uppercase': props.uppercase,
      'ui-menu-button--disabled': props.disabled,
      'ui-menu-button--dark-font': props.darkFont,
      'ui-menu-button--center': props.center,
      'ui-menu-button--rtl': props.rtl,
      'ui-menu-button--has-subtitle': !!props.subtitle,
    }"
    tabindex="-1"
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
    @mouseenter="$emit('mouseenter')"
    @mousedown="handleClick"
  >
    <slot>
      <div
        v-if="slots.icon"
        class="ui-menu-button__icon"
        :class="{ danger: props.danger }"
      >
        <slot name="icon" />
      </div>

      <div class="ui-menu-button__label">
        <slot name="title">
          <BaseText
            variant="body-small-medium"
            class="ui-menu-button__title"
            :class="{ danger: props.danger }"
            :title="props.title"
          >
            {{ props.title }}
          </BaseText>
          <BaseText
            v-if="props.subtitle"
            class="ui-menu-button__subtitle"
            :title="props.subtitle"
          >
            {{ props.subtitle }}
          </BaseText>
        </slot>
      </div>
      <div
        v-if="slots.secondaryIcon"
        class="ui-menu-button__icon"
        :class="{ danger: props.danger }"
      >
        <slot name="secondaryIcon" />
      </div>
    </slot>
  </button>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.ui-menu-button {
  width: 100%;
  min-height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  background: $color-background;
  border: none;
  gap: 6px;
  padding: 0 10px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  &__icon {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-100;

    svg {
      width: auto;
      height: 15px;
    }
  }

  &__label {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1 1 0;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    color: $color-primary-100;
  }

  &__title {
    color: $color-primary-100;
  }

  &__title,
  &__subtitle {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
  }

  &__subtitle {
    color: $color-primary-90;
  }

  &--active {
    background: $color-primary-10;
    pointer-events: none;
  }

  &--uppercase {
    text-transform: uppercase;
  }

  &--rtl {
    flex-direction: row-reverse;
  }

  &--center {
    .ui-menu-button__title {
      text-align: center;
    }
  }

  &--dark-font:not(&--active) {
    color: $color-primary-100;
  }

  &:not(&--active, &--disabled):hover {
    background: $color-primary-5;
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  &:not(&--disabled):hover {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    cursor: pointer;
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}

.danger {
  color: $color-alert;
}
</style>
