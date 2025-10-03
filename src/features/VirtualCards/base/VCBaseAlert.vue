<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import type { BaseIconName } from "@/library/baseIconTypes";

type AlertColor = "success" | "yield" | "danger";

interface Props {
  color?: AlertColor;
  icon?: BaseIconName;
  title?: string;
  size?: "md" | "lg";
  description?: string;
  iconWithBackground?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  description: "",
  color: "success",
  icon: "info",
  size: "md",
  iconWithBackground: false,
});
</script>

<template>
  <div
    class="vc-base-alert"
    :class="[`vc-base-alert--${props.color}`, `vc-base-alert--${props.size}`]"
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
            props.size === 'lg' ? 'body-3-semibold' : 'body-small-semibold'
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
  border-radius: 12px;

  &--md {
    --vc-icon-size: 20px;
    --vc-icon-size-bg: 18px;
    --vc-icon-container-size: 26px;

    padding: 8px 12px;
  }

  &--lg {
    --vc-icon-size: 36px;
    --vc-icon-size-bg: 21px;
    --vc-icon-container-size: 36px;

    padding: 20px 24px;
  }

  &__icon-container {
    &--with-background {
      --vc-icon-size: var(--vc-icon-size-bg);

      width: var(--vc-icon-container-size);
      height: var(--vc-icon-container-size);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
      background-color: var(--vc-icon-background-color);
    }
  }

  &--danger {
    background-color: $color-status-error-15;

    .vc-base-alert__icon-container--with-background {
      background-color: $color-status-error;
    }
  }

  &--yield {
    background-color: $color-status-yield-15;

    .vc-base-alert__icon-container--with-background {
      background-color: $color-status-yield;
    }
  }

  &--success {
    background-color: $color-status-success-15;

    .vc-base-alert__icon-container--with-background {
      background-color: $color-status-success;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    width: 100%;

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
  }
}
</style>
