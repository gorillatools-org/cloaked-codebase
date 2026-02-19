<script setup>
defineProps({
  type: {
    type: String,
    default: "light",
    validator: (value) => ["light", "dark", "alert"].includes(value),
  },
});
</script>

<template>
  <div
    class="data-delete-card"
    :class="`data-delete-card--${type}`"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.data-delete-card {
  border-radius: 16px;
  background-blend-mode: screen;
  padding: 16px;
  width: 100%;

  &--light {
    @at-root .theme-dark & {
      background: rgba($color-primary-100-dark, 0.1);
      border: 1px solid rgba($color-primary-100-dark, 0.1);
    }

    @at-root .theme-light & {
      background: rgba($color-primary-100-light, 0.05);
      border: 1px solid rgba($color-primary-100-light, 0.05);
    }
  }

  &--dark {
    @at-root .theme-dark & {
      background: rgba($color-primary-100-light, 0.3);
      border: 1px solid rgba($color-primary-100-dark, 0.1);
    }

    @at-root .theme-light & {
      background: rgba($color-primary-100-light, 0.07);
      border: 1px solid rgba($color-primary-100-dark, 0.15);
    }
  }

  &--alert {
    border: 1px solid $color-alert;
    background: rgb(242 65 65 / 10%);
  }
}
</style>
