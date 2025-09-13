<script setup>
defineProps({
  withBorder: {
    type: Boolean,
    default: false,
  },
  layout: {
    type: String,
    default: "horizontal",
    validator: (value) => ["horizontal", "vertical"].includes(value),
  },
});
</script>

<template>
  <footer
    class="app-modal-footer"
    :class="[
      `app-modal-footer--${layout}`,
      { 'app-modal-footer--with-border': withBorder },
    ]"
  >
    <slot />
  </footer>
</template>

<style lang="scss" scoped>
.app-modal-footer {
  padding: 32px;
  width: 100%;
  margin-top: auto;

  &--horizontal {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 8px;
  }

  &--vertical {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &--with-border {
    border-top: 1px solid $border-white;
    margin-top: 32px;
  }
}
</style>
