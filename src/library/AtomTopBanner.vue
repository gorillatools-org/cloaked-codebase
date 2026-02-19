<script setup>
defineProps({
  variant: {
    type: String,
    default: "info",
    validator: (value) =>
      ["info", "success", "danger", "warning", "cloaked"].includes(value),
  },
});
</script>

<template>
  <div
    class="atom-top-banner"
    :class="`atom-top-banner--${variant}`"
  >
    <div class="atom-top-banner__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.atom-top-banner {
  padding: 12px 20px;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  text-align: center;

  &--info {
    background-color: $color-brand-4-100;
    color: $color-primary-100-dark;
  }

  &--success {
    background-color: $color-brand-6-70-dark;
    color: $color-primary-100-dark;
  }

  &--warning {
    background-color: $color-warning;
    color: $color-primary-1-dark;
  }

  &--danger {
    background-color: $color-alert;
    color: $color-primary-100-dark;
  }

  &--cloaked {
    background: $cloaked-gradient;
    color: $color-primary-100-dark;
  }

  &__content {
    margin: auto;
    max-width: 800px;
  }
}
</style>
