<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

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
  options: {
    type: Array,
    default: () => [],
  },
  error: {
    type: Boolean,
    default: false,
  },
});

const model = defineModel({ type: String });
</script>

<template>
  <label
    class="data-delete-select"
    :class="[
      `data-delete-select--${variant}`,
      `data-delete-select--mobile-${sizeMobile}`,
      `data-delete-select--desktop-${sizeDesktop}`,
      { 'data-delete-select--error': error },
    ]"
  >
    <slot />
    <span class="data-delete-select__select-wrapper">
      <select
        v-model="model"
        v-bind="$attrs"
        class="data-delete-select__select"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="data-delete-select__option"
        >
          {{ option.label }}
        </option>
      </select>
      <InlineSvg
        name="chevron-down"
        class="data-delete-select__icon"
      />
    </span>
  </label>
</template>

<style scoped lang="scss">
.data-delete-select {
  position: relative;

  &__select {
    width: 100%;
    border-radius: 10px;
    background-color: transparent;
    cursor: pointer;
    appearance: none;
    margin-top: 5px;
    font-size: 16px; // NOTE: basetext exception -- select is not working with component/is
    font-weight: 500; // NOTE: basetext exception -- select is not working with component/is

    @at-root .data-delete-select--mobile-sm & {
      padding: 16px 14px;
    }

    @at-root .data-delete-select--mobile-md & {
      padding: 24px 20px;
    }

    @at-root .data-delete-select--desktop-sm & {
      @media (min-width: $screen-md) {
        padding: 16px 14px;
      }
    }

    @at-root .data-delete-select--desktop-md & {
      @media (min-width: $screen-md) {
        padding: 24px 20px;
      }
    }

    @at-root .data-delete-select--outline & {
      background-color: transparent;
      border: 1px solid $color-primary-50;

      &:hover {
        border: 1px solid $color-primary-50;
      }
    }

    @at-root .data-delete-select--flat & {
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

    &:focus {
      outline: 2px solid $color-primary-100;
    }

    &:disabled {
      cursor: not-allowed;
    }

    @at-root .data-delete-select--error & {
      border: 1px solid $color-alert !important;
    }

    &-wrapper {
      position: relative;
    }
  }

  &__option {
    background-color: $color-primary-90-light;
    color: $color-primary-100-dark;
  }

  &__icon {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    pointer-events: none;

    @media (min-width: $screen-md) {
      right: 24px;
    }
  }
}
</style>
