<script setup>
defineProps({
  noBackground: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
});
</script>

<template>
  <button
    class="sidebar-header-button"
    aria-id="SidebarCloseButton"
    :class="{
      'sidebar-header-button--no-background': noBackground,
      'sidebar-header-button--active': active,
      'sidebar-header-button--wide': wide,
    }"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.sidebar-header-button {
  width: 36px;
  height: 36px;
  background: $color-primary-10;
  border-radius: 36px;
  color: $color-primary-100;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  svg {
    max-width: 24px;
    max-height: 24px;
  }

  &:hover {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    cursor: pointer;
    background: $color-primary-100;
    color: $color-primary-1;
  }

  &:disabled {
    &:hover {
      cursor: not-allowed;
      background: $color-primary-10;
      color: $color-primary-100;
      transform: none;
      box-shadow: none;
      transition: none;
    }
  }

  &--no-background {
    background: none;
  }

  &--active {
    background: $color-primary-100;
    color: $color-primary-1;
  }

  &--wide {
    width: unset;
    min-width: 36px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 2px;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
  }

  &:disabled {
    opacity: 0.5;
    transform: none;
    box-shadow: none;
    transition: none;
  }
}
</style>
