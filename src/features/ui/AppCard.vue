<script setup>
defineProps({
  type: {
    type: String,
    default: "outline",
    validator: (value) => ["outline", "background"].includes(value),
  },
  size: {
    type: String,
    default: "sm",
    validator: (value) => ["sm", "md"].includes(value),
  },
});
</script>

<template>
  <div
    class="app-card"
    :class="[`app-card--${type}`, `app-card--${size}`]"
  >
    <slot />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.app-card {
  border-radius: 8px;

  &--outline {
    border: 1px solid $color-primary-10;
  }

  &--background {
    background-color: $color-primary-5;
    border: 1px solid $color-primary-10;
  }

  &--sm {
    padding: 16px;
  }

  &--md {
    padding: 24px;
  }
}
</style>
