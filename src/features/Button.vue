<script setup>
import { computed, useAttrs } from "vue";
import { RouterLink } from "vue-router";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  type: {
    type: String,
    default: "primary",
    validator: (value) =>
      [
        "hero",
        "hero-green",
        "primary",
        "secondary",
        "danger",
        "danger-secondary",
        "tag",
        "tag-selected",
        "cloaked-gradient",
        "text",
        "transparent",
        "frosted",
      ].includes(value),
  },
  as: {
    type: [String, Object],
    default: "button",
    validator: (value) => ["button", "a", RouterLink].includes(value),
  },
  size: {
    type: [String, null],
    default: null,
    validator: (value) =>
      ["sm", "md", "full", "lg", "xl", "2xl"].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
});

const attrs = useAttrs();

const computedSize = computed(() => {
  const defaultSizeForType = {
    hero: "xl",
    "hero-green": "2xl",
    primary: "lg",
    secondary: "lg",
    danger: "lg",
    "danger-secondary": "lg",
    tag: "sm",
    "tag-selected": "sm",
    transparent: "md",
    frosted: "2xl",
  };

  return props.size ?? defaultSizeForType[props.type];
});
</script>

<template>
  <Component
    v-bind="attrs"
    :is="as"
    :class="[
      'button',
      `button--${type}`,
      `button--${computedSize}`,
      { 'button--full-width': fullWidth },
    ]"
  >
    <InlineSvg
      v-if="loading"
      name="spinner"
    />
    <slot
      v-else
      name="icon"
    />
    <slot />
  </Component>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.button {
  font-family: $global-font;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  cursor: pointer;
  border-radius: 1000px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  line-height: 1.5em;

  &:disabled {
    cursor: not-allowed;
    transform: none;
    transition: none;
    box-shadow: none;
  }

  &--full-width {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  &--hero {
    background-color: $color-brand-1-100-dark;
    color: $color-primary-1;

    &:disabled {
      background-color: $color-primary-10;
      color: $color-primary-70;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--hero-green {
    background-color: $color-success;
    color: $color-primary-100-dark;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--primary {
    background-color: $color-primary-100;
    color: $color-primary-1;

    &:disabled {
      background-color: $color-primary-10;
      color: $color-primary-70;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--secondary {
    background-color: $color-base-white-100;
    color: $color-primary-100;
    border: 1px solid $color-primary-100;

    &:disabled {
      background-color: $color-base-white-100;
      color: $color-primary-50;
      border: 1px solid $color-primary-50;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--danger {
    background-color: $color-alert;
    color: $color-primary-1-light;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--danger-secondary {
    background-color: $color-base-white-100;
    color: $color-alert;
    border: 1px solid $color-alert;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--tag {
    background-color: $color-primary-1;
    color: $color-primary-100;
    border: 1px solid $color-primary-100;

    &:disabled {
      background-color: $color-primary-1;
      color: $color-primary-30;
      border: 1px solid $color-primary-30;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--tag-selected {
    background-color: $color-primary-100;
    color: $color-primary-1;
    border: 1px solid $color-primary-100;

    &:disabled {
      background-color: $color-primary-1;
      color: $color-primary-30;
      border: 1px solid $color-primary-30;
      cursor: not-allowed;
      transform: none;
      transition: none;
      box-shadow: none;
    }
  }

  &--cloaked-gradient {
    background: $cloaked-gradient;
    color: $color-primary-100-dark;

    &:hover {
      opacity: 0.9;
    }
  }

  &--text {
    background-color: transparent;
    color: $color-primary-100;

    &:hover {
      @at-root .theme-dark & {
        box-shadow: none;
      }

      @at-root .theme-light & {
        box-shadow: none;
      }
    }
  }

  &--transparent {
    background-color: transparent;
    color: $color-primary-100;
    border: 1px solid $color-primary-100;
    border-radius: 1000px;

    &:hover {
      @at-root .theme-dark & {
        box-shadow: none;
      }

      @at-root .theme-light & {
        box-shadow: none;
      }
    }
  }

  &--frosted {
    background-color: transparent; // TODO: AARON MAKE THIS FROSTED THANKS :)
    color: $color-primary-100;
    border: 1px solid $color-primary-100;
    border-radius: 1000px;

    &:hover {
      @at-root .theme-dark & {
        box-shadow: none;
      }

      @at-root .theme-light & {
        box-shadow: none;
      }
    }
  }

  &--sm {
    height: 30px;
    padding: 0 10px;
  }

  &--md {
    height: 36px;
    padding: 0 12px;
  }

  &--full {
    height: 38px;
    padding: 0 24px;
  }

  &--lg {
    height: 44px;
    padding: 0 17px;
  }

  &--xl {
    height: 44px;
    padding: 0 22px;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }

  &--2xl {
    height: 56px;
    padding: 0 22px;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }
}
</style>
