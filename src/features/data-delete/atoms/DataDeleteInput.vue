<script setup>
defineProps({
  variant: {
    type: String,
    default: "outline",
    validator: (value) => ["outline", "flat"].includes(value),
  },
  sizeMobile: {
    type: String,
    default: "sm",
    validator: (value) => ["sm", "md"].includes(value),
  },
  sizeDesktop: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md"].includes(value),
  },
});

defineOptions({
  inheritAttrs: false,
});

const model = defineModel({ type: String });
</script>

<template>
  <label
    class="data-delete-input"
    :class="[
      `data-delete-input--${variant}`,
      `data-delete-input--mobile-${sizeMobile}`,
      `data-delete-input--desktop-${sizeDesktop}`,
      { 'data-delete-input--error': $attrs.error },
    ]"
  >
    <slot />
    <span class="data-delete-input__wrapper">
      <input
        v-model="model"
        v-bind="$attrs"
        class="data-delete-input__input"
      />
      <slot name="after-input" />
    </span>
    <slot name="after" />
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-input {
  &__wrapper {
    position: relative;
    display: block;
    margin-top: 5px;
  }

  &__input {
    width: 100%;
    border-radius: 10px;
    color: $color-primary-100;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: 1.4;
    background-color: transparent;
    cursor: text;

    @at-root .data-delete-input--mobile-sm & {
      padding: 16px 14px;
    }

    @at-root .data-delete-input--mobile-md & {
      padding: 24px 20px;
    }

    @at-root .data-delete-input--desktop-sm & {
      @media (min-width: $screen-md) {
        padding: 16px 14px;
      }
    }

    @at-root .data-delete-input--desktop-md & {
      @media (min-width: $screen-md) {
        padding: 24px 20px;
      }
    }

    @at-root .data-delete-input--outline & {
      border: 1px solid $color-primary-50;

      &:hover {
        border: 1px solid $color-primary-50;
      }
    }

    @at-root .data-delete-input--flat & {
      border: none;

      @at-root .theme-dark & {
        background: rgba($white, 0.1);

        &:hover {
          background: rgba($white, 0.11);
        }
      }

      @at-root .theme-light & {
        background: rgba($black, 0.1);

        &:hover {
          background: rgba($black, 0.11);
        }
      }
    }

    &::placeholder {
      font-weight: 400;
      color: $color-primary-100;
      opacity: 0.4;
    }

    &:focus {
      outline: 2px solid $color-primary-100;
    }

    &:disabled {
      color: $color-primary-50;
      cursor: not-allowed;

      @at-root .data-delete-input--outline & {
        border: 1px solid $color-primary-10;
      }

      @at-root .data-delete-input--flat & {
        border: none;
      }

      &::placeholder {
        opacity: 0.3;
      }
    }

    @at-root .data-delete-input--error & {
      border: 1px solid $color-alert !important;
    }
  }
}
</style>
