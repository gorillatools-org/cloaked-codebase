<script setup>
import BaseText from "@/library/BaseText.vue";
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      [
        //NEW STYLE VARIANTS
        "primary-fill",
        "primary-outline",
        "secondary-fill",
        "secondary-outline",
        "tertiary-fill",
        "tertiary-outline",
        "text-mono",
        "destructive",
        //OLD STYLE VARIANTS
        "primary",
        "secondary",
        "outline",
        "text",
        "cloaked-gradient",
        "cloaked-gradient-secondary",
      ].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  // NOTE: deprecated prop
  icon: {
    type: String,

    default: "arrow-right",
  },
  // NOTE: deprecated prop, use variant instead
  backgroundColor: {
    type: String,
    default: "",
    validator: (value) =>
      [
        "",
        "purple-gradient",
        "purple",
        "brand-2-gradient",
        "brand-3-gradient",
        "info-gradient",
        "success",
        "danger",
      ].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const computedVariant = computed(() => {
  if (props.backgroundColor) {
    //convert colored background to use primary styles
    if (props.backgroundColor === "danger") {
      return "destructive";
    }
    return "primary-fill";
  }
  const colorMapping = {
    primary: "secondary-fill",
    secondary: "secondary-outline",
    outline: "secondary-outline",
    text: "text-mono",
    "cloaked-gradient": "primary-fill",
    "cloaked-gradient-secondary": "primary-fill",
    danger: "destructive",
  };
  return colorMapping[props.variant] || props.variant;
});
</script>

<template>
  <button
    class="base-button"
    :class="{
      [`base-button--${computedVariant}`]: computedVariant,
      [`base-button--${props.size}`]: props.size,
      'base-button--full-width': props.fullWidth,
    }"
    :disabled="disabled"
  >
    <BaseText
      :variant="
        {
          sm: 'footnote-emphasized',
          md: 'callout-emphasized',
          lg: 'callout-emphasized',
        }[size]
      "
      :underline="computedVariant === 'text-mono'"
      class="base-button__text"
    >
      <slot />
    </BaseText>
    <span
      v-if="props.loading"
      class="base-button__loader"
    />
  </button>
</template>

<style lang="scss" scoped>
.base-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 1000px;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.15s ease-out,
    border-color 0.15s ease-out,
    color 0.15s ease-out;

  &__text {
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
  }

  &__loader {
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    animation: rotate 0.5s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  &--full-width {
    width: 100%;
  }

  &--sm {
    height: 32px;
    padding: 7px 16px;
  }

  &--md {
    height: 40px;
    padding: 9.5px 16px;
  }

  &--lg {
    height: 48px;
    padding: 13.5px 24px;
  }

  &--primary-fill {
    background-color: $color-brand-300;
    color: $color-primary-100-dark;
    border-color: $color-brand-300;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background-color: $color-brand-400;
      border-color: $color-brand-400;
    }

    &:not(:disabled):active {
      background-color: $color-brand-400;
      outline: 2px solid $color-neutral-0-light;
      outline-offset: -3px;
      border-color: $color-brand-400;
    }
  }

  &--primary-outline {
    background-color: transparent;
    color: $color-brand-300;
    border-color: $color-brand-300;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      border-color: $color-brand-300;
      background-color: $color-brand-100;
    }

    &:not(:disabled):active {
      border-color: $color-brand-300;
      background-color: $color-brand-200;
    }
  }

  &--secondary-fill {
    background-color: $color-primary-100;
    color: $color-primary-1;
    border-color: $color-primary-100;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background-color: $color-neutral-850;
      border-color: $color-neutral-850;
    }

    &:not(:disabled):active {
      background-color: $color-neutral-850;
      border-color: $color-neutral-850;

      @at-root .theme-light & {
        outline: 2px solid $color-neutral-0-light;
        outline-offset: -3px;
        border-color: $color-neutral-850;
      }
    }
  }

  &--secondary-outline {
    background-color: transparent;
    color: $color-primary-100;
    border-color: $color-primary-100;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      border-color: $color-primary-100;
      background-color: $color-neutral-100;
    }

    &:not(:disabled):active {
      border-color: $color-primary-100;
      background-color: $color-neutral-200;
    }
  }

  &--tertiary-fill {
    background-color: transparent;
    color: $color-primary-100;
    border-color: transparent;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background-color: $color-neutral-100;
      border-color: $color-neutral-100;
    }

    &:not(:disabled):active {
      background-color: $color-neutral-200;
      border-color: $color-neutral-200;
    }
  }

  &--tertiary-outline {
    background-color: transparent;
    color: $color-primary-100;
    border-color: $color-neutral-200;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      border-color: $color-neutral-200;
      background-color: $color-neutral-100;
    }

    &:not(:disabled):active {
      border-color: $color-neutral-300;
      background-color: $color-neutral-200;
    }
  }

  &--text-mono {
    color: $color-neutral-1000;
    border-color: transparent;
    background-color: transparent;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      color: $color-neutral-850;
    }

    &:not(:disabled):active {
      color: $color-neutral-650;
    }
  }

  &--destructive {
    background-color: $color-status-negative;
    color: $color-primary-100-dark;
    border-color: $color-status-negative;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background-color: $color-red-300;
      border-color: $color-red-300;
    }

    &:not(:disabled):active {
      background-color: $color-red-300;
      border-color: $color-red-300;
      outline: 2px solid $color-neutral-0-light;
      outline-offset: -3px;
    }
  }
}
</style>
