<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import BaseText from "@/library/BaseText.vue";
import { ref } from "vue";

export type VCBasePillColor = "default" | "error";

export type VCBasePillProps = {
  label: string;
  icon?: BaseIconName;
  clickable?: boolean;
  color?: VCBasePillColor;
};

const props = withDefaults(defineProps<VCBasePillProps>(), {
  color: "default",
  icon: undefined,
});

let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const isHovered = ref(false); // Used to avoid animation on fast mouse movements
const hasHovered = ref(false); // Used to avoid animation on mount

const handleMouseEnter = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = setTimeout(() => {
    isHovered.value = true;
    hasHovered.value = true;
  }, 100);
};

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  isHovered.value = false;
};
</script>

<template>
  <div
    class="vc-base-pill"
    :class="[
      `vc-base-pill--${props.color}`,
      { 'vc-base-pill--clickable': props.clickable },
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot name="label">
      <BaseText
        variant="body-small-semibold"
        class="vc-base-pill__label"
      >
        {{ props.label }}
      </BaseText>
    </slot>
    <slot
      name="icon"
      :is-hovered="isHovered"
      :has-hovered="hasHovered"
    >
      <BaseIcon
        v-if="props.icon"
        :name="props.icon"
        class="vc-base-pill__icon"
      />
    </slot>
  </div>
</template>

<style scoped lang="scss">
.vc-base-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid $color-base-black-15;
  gap: 6px;
  background-color: $color-base-white-100;

  &--clickable {
    cursor: pointer;
    transition:
      background-color 0.12s cubic-bezier(0.25, 0.1, 0.25, 1),
      border-color 0.12s cubic-bezier(0.25, 0.1, 0.25, 1);

    &:hover {
      background-color: $color-primary-10;
      border-color: $color-base-black-20;
    }
  }

  &--error {
    border-color: $color-status-error-15;
    background-color: $color-status-error-15;
    color: $color-status-error;

    &.vc-base-pill--clickable {
      &:hover {
        background-color: $color-status-error-15;
        border-color: $color-status-error;
      }
    }
  }

  &__icon {
    font-weight: 400;
    font-size: 18px;
  }
}
</style>
