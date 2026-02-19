<script setup>
import BaseIcon from "@/library/BaseIcon.vue";

defineProps({
  variant: {
    type: String,
    default: "outline",
    validator: (value) => ["outline", "display"].includes(value),
  },
  size: {
    type: String,
    default: "lg",
    validator: (value) => ["md", "lg"].includes(value),
  },
  selected: {
    type: Boolean,
    default: false,
  },
  prependIcon: {
    type: String,
    default: null,
  },
  appendIcon: {
    type: String,
    default: null,
  },
});
</script>

<template>
  <button
    class="base-chip"
    :aria-selected="selected"
    :class="[`base-chip--${variant}`, `base-chip--size-${size}`]"
  >
    <BaseIcon
      v-if="prependIcon"
      :name="prependIcon"
      class="base-chip__icon"
    />
    <slot />
    <BaseIcon
      v-if="appendIcon"
      :name="appendIcon"
      class="base-chip__icon"
    />
  </button>
</template>

<style scoped lang="scss">
@import "@/assets/scss/recursive/library";

.base-chip {
  border-radius: 100px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &--outline {
    color: $color-primary-100;
    background-color: $color-primary-1;
    border: 1px solid $color-primary-20;

    &:hover {
      box-shadow: 0 10px 24px 0 rgba($black, 0.15);
    }

    &:active {
      background-color: $color-primary-10;
      box-shadow: none;
    }

    &[aria-selected="true"] {
      background-color: $color-primary-100;
      color: $color-primary-1;
      border-color: $color-primary-100;
      box-shadow: none;
      cursor: default;
    }

    &:disabled {
      background-color: $color-primary-5;
      border-color: $color-primary-5;
      color: $color-primary-30;
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  &--display {
    color: $color-primary-100;
    border: 1px solid transparent;
    background-color: transparent;

    &:hover {
      background-color: $color-primary-10;
      border-color: $color-primary-10;
      color: $color-primary-100;
    }

    &:active {
      background-color: $color-primary-20;
      border-color: $color-primary-20;
      box-shadow: none;
    }

    &[aria-selected="true"] {
      background-color: $color-primary-100;
      border-color: $color-primary-100;
      color: $color-primary-1;
      box-shadow: none;
      cursor: default;
    }

    &:disabled {
      color: $color-primary-30;
      background-color: transparent;
      cursor: not-allowed;
      border-color: transparent;
    }
  }

  &:focus {
    outline: none;
    border: 1px solid $color-primary-50;
  }

  &--size {
    &-md {
      height: 32px;
      padding: 0 12px;

      @include font-style-by-type("footnote-regular");
    }

    &-lg {
      height: 40px;
      padding: 0 18px;

      @include font-style-by-type("subhead-emphasized");
    }
  }

  &__icon {
    font-size: 19px;
  }
}
</style>
