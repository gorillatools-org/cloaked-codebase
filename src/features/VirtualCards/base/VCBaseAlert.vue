<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import type { BaseIconName } from "@/library/baseIconTypes";

type AlertColor = "success" | "yield" | "danger" | "gray";

interface Props {
  color?: AlertColor;
  icon?: BaseIconName | null;
  iconPosition?: "left" | "right";
  title?: string;
  size?: "md" | "lg";
  description?: string;
  centerContent?: boolean;
  iconWithBackground?: boolean;
  withBorder?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  description: "",
  color: "gray",
  icon: "info",
  iconPosition: "left",
  size: "md",
  centerContent: false,
  iconWithBackground: false,
  withBorder: false,
});
</script>

<template>
  <div
    class="vc-base-alert"
    :class="[
      `vc-base-alert--${props.color}`,
      `vc-base-alert--${props.size}`,
      `vc-base-alert--icon-${props.iconPosition}`,
      {
        'vc-base-alert--center-content': props.centerContent,
        'vc-base-alert--with-border': props.withBorder,
      },
    ]"
    role="status"
    aria-live="polite"
  >
    <div
      class="vc-base-alert__icon-container"
      aria-hidden="true"
      :class="{
        'vc-base-alert__icon-container--with-background':
          props.iconWithBackground,
      }"
    >
      <BaseIcon
        v-if="props.icon"
        :name="props.icon"
        class="vc-base-alert__icon"
      />
    </div>

    <div class="vc-base-alert__content">
      <div class="vc-base-alert__content-container">
        <BaseText
          v-if="props.title"
          as="p"
          :variant="props.size === 'lg' ? 'headline-5-bold' : 'headline-6-bold'"
          class="vc-base-alert__title"
        >
          {{ props.title }}
        </BaseText>

        <BaseText
          v-if="props.description"
          as="p"
          :variant="
            props.size === 'lg' ? 'body-2-semibold' : 'body-small-semibold'
          "
          class="vc-base-alert__description"
        >
          {{ props.description }}
        </BaseText>

        <template v-if="!props.title && !props.description">
          <slot />
        </template>
      </div>
      <div
        v-if="$slots.extra"
        class="vc-base-alert__content-extra"
      >
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-base-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 24px;

  &--with-border {
    border: 1px solid $color-base-black-15;
  }

  &--center-content {
    justify-content: center;
  }

  &--md {
    --vc-icon-size: 20px;
    --vc-icon-size-bg: 18px;
    --vc-icon-container-size: 26px;

    padding: 8px 12px;
    border-radius: 12px;
  }

  &--lg {
    --vc-icon-size: 36px;
    --vc-icon-size-bg: 21px;
    --vc-icon-container-size: 36px;

    padding: 20px 24px;
    border-radius: 24px;
  }

  &--icon-left {
    flex-direction: row;
  }

  &--icon-right {
    flex-direction: row-reverse;
  }

  &__icon-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;

    &--with-background {
      --vc-icon-size: var(--vc-icon-size-bg);

      width: var(--vc-icon-container-size);
      height: var(--vc-icon-container-size);
      justify-content: center !important;
      align-items: center !important;
      border-radius: 50%;
      flex-shrink: 0;
      background-color: var(--vc-icon-background-color);
    }
  }

  &--danger {
    background-color: $color-status-error-15;

    &.vc-base-alert--with-border {
      border: 1px solid $color-status-error;
    }

    .vc-base-alert__icon-container--with-background {
      background-color: $color-status-error;
    }
  }

  &--yield {
    background-color: $color-status-yield-15;

    &.vc-base-alert--with-border {
      border: 1px solid $color-status-yield;
    }

    .vc-base-alert__icon-container--with-background {
      background-color: $color-status-yield;
    }
  }

  &--success {
    background-color: $color-status-success-15;

    &.vc-base-alert--with-border {
      border: 1px solid $color-status-success;
    }

    .vc-base-alert__icon-container--with-background {
      background-color: $color-status-success;
    }
  }

  &--gray {
    background-color: $color-base-black-10;

    &.vc-base-alert--with-border {
      border: 1px solid $color-base-black-15;
    }

    .vc-base-alert__icon-container--with-background {
      background-color: $color-base-black-10;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    width: 100%;

    .vc-base-alert--center-content & {
      width: auto;
    }

    &-container {
      flex-grow: 1;
      width: 100%;
    }
  }

  &__icon {
    font-weight: 500;
    font-size: var(--vc-icon-size);

    .vc-base-alert--lg & {
      margin-top: -1px;
    }

    .vc-base-alert__icon-container--with-background & {
      color: $color-white;
    }

    /* stylelint-disable-next-line selector-max-class */
    .vc-base-alert--yield .vc-base-alert__icon-container--with-background & {
      color: $color-primary-100;
    }
  }

  &__description {
    max-width: 100%;
    overflow-wrap: anywhere;
    word-break: break-word;
    white-space: normal;

    .vc-base-alert--center-content & {
      text-align: center;
    }

    .vc-base-alert--yield & {
      color: $color-primary-70;
    }
  }
}
</style>
