<script setup>
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      [
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
    validator: (value) => ["md", "lg"].includes(value),
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,

    default: "arrow-right",
  },
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
</script>

<template>
  <button
    class="base-button"
    :class="{
      [`base-button--${variant}`]: variant,
      [`base-button--${size}`]: size,
      'base-button--full-width': fullWidth,
      [`base-button--${backgroundColor}`]: backgroundColor,
    }"
    :disabled="disabled"
  >
    <BaseText
      :variant="
        {
          md: 'body-3-semibold',
          lg: 'body-2-semibold',
        }[size] || 'body-2-semibold'
      "
      class="base-button__text"
    >
      <slot />
    </BaseText>
    <template v-if="variant !== 'text' && variant !== 'outline'">
      <span
        v-if="loading"
        class="base-button__icon"
      >
        <span class="base-button__loader" />
      </span>
      <BaseIcon
        v-else
        :name="icon"
        class="base-button__icon"
      />
    </template>
  </button>
</template>

<style lang="scss" scoped>
.base-button {
  display: inline-grid;
  grid-template-columns: min-content 1fr min-content;
  grid-template-areas: "left text right";
  align-items: center;
  column-gap: 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 5px;
  cursor: pointer;
  white-space: nowrap;

  &__text {
    flex: 1 1 auto;
    text-align: center;
    padding: 0 6px;
    font-weight: 600;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
    grid-area: text;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-primary-90;
    border-radius: 50%;
    font-size: 16px;
    font-weight: 500;
    grid-area: right;
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

  &--primary {
    background-color: $color-primary-100;
    color: $color-primary-1;

    &:not(:disabled):hover {
      opacity: 0.9;
    }
  }

  &--outline {
    background-color: transparent;
    color: $color-primary-100;
    border-color: $color-primary-100;
    padding: 5px 11px;

    .base-button__icon {
      background-color: $color-primary-10;
    }
  }

  &--secondary {
    background-color: transparent;
    color: $color-primary-100;
    border-color: $color-primary-100;

    .base-button__icon {
      background-color: $color-primary-10;
    }
  }

  &--text {
    background-color: transparent;
    color: $color-primary-100;
    border-color: transparent;
    padding: 5px 11px;

    &:not(:disabled):hover {
      background-color: $color-primary-5;
    }
  }

  &--cloaked-gradient {
    background: $cloaked-gradient;
    color: $color-primary-100-dark;
    border: none;

    &:not(:disabled):hover {
      opacity: 0.9;
    }

    .base-button__icon {
      background-color: $color-base-white-15-dark;
    }
  }

  &--cloaked-gradient-secondary {
    background: $cloaked-gradient-secondary;
    color: $color-primary-100-dark;
    border: none;

    &:not(:disabled):hover {
      opacity: 0.9;
    }

    .base-button__icon {
      background-color: $color-base-white-15-dark;
    }
  }

  &--purple-gradient {
    background: linear-gradient(90deg, #878dfa 0%, #454cbe 100%);
    color: $white !important;
    border: none;

    .base-button__icon {
      background-color: rgba($white, 0.15);
    }
  }

  &--purple {
    background: #8e83ea;
    color: $white;

    .base-button__icon {
      background-color: rgba($white, 0.15);
    }
  }

  &--success {
    background-color: $color-status-success;
    color: $white;

    .base-button__icon {
      background-color: $color-base-white-15-light;
    }
  }

  &--danger {
    background-color: $color-status-error;
    color: $color-primary-1-light;

    .base-button__icon {
      background-color: $color-base-white-15-light;
    }
  }

  @mixin background-gradient($color-start, $color-end) {
    background: linear-gradient(46deg, $color-start 31%, $color-end 100%);
  }

  &--brand-2-gradient {
    color: $color-primary-100-light;

    @include background-gradient($color-brand-2-90-light, #dbdf00);

    .base-button__icon {
      background-color: rgba(#dbdf00, 0.9);
    }
  }

  &--brand-3-gradient {
    color: $color-primary-100-light;

    @include background-gradient($color-brand-3-90-light, #2ab5dc);

    .base-button__icon {
      background-color: rgba(#2ab5dc, 0.9);
    }
  }

  &--info-gradient {
    @include background-gradient($color-info, #fd9871);

    .base-button__icon {
      background-color: rgba(#fd9871, 0.9);
    }
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.9;
  }

  &--full-width {
    width: 100%;
  }

  &--md {
    min-height: 46px;

    &.base-button--full-width {
      grid-template-columns: 36px 1fr 36px;
    }
  }

  &--lg {
    min-height: 54px;

    &.base-button--full-width {
      grid-template-columns: 44px 1fr 44px;
    }
  }

  &--md &__icon {
    width: 36px;
    height: 36px;
  }

  &--lg &__icon {
    width: 44px;
    height: 44px;
  }
}
</style>
