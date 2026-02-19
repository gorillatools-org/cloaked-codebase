<script setup lang="ts">
import VCBasePill, {
  type VCBasePillColor,
} from "@/features/VirtualCards/base/VCBasePill.vue";
import BaseIcon from "@/library/BaseIcon.vue";

type Props = {
  label?: string;
  color?: VCBasePillColor;
};

withDefaults(defineProps<Props>(), {
  label: "Funding Source",
  color: "default",
});
</script>

<template>
  <VCBasePill
    :label="label"
    :color="color"
    clickable
    class="vc-pill-funding-source-button"
  >
    <template #icon="{ isHovered, hasHovered }">
      <BaseIcon
        name="bank"
        class="vc-pill-funding-source-button__icon"
        :class="{
          'vc-pill-funding-source-button__icon--hovered': isHovered,
          'vc-pill-funding-source-button__icon--has-hovered': hasHovered,
        }"
      />
      <BaseIcon
        name="money-filled"
        class="vc-pill-funding-source-button__icon-money"
        :class="{
          'vc-pill-funding-source-button__icon-money--hovered': isHovered,
          'vc-pill-funding-source-button__icon-money--has-hovered': hasHovered,
        }"
      />
    </template>
  </VCBasePill>
</template>

<style lang="scss" scoped>
.vc-pill-funding-source-button {
  position: relative;

  &__icon,
  &__icon-money {
    font-weight: 400;
  }

  &__icon {
    transform-origin: center;

    &--hovered {
      animation: funding-source-icon-slide-out 0.2s
        cubic-bezier(0.4, 0.29, 0.32, 1.27) forwards;
    }

    &--has-hovered:not(&--hovered) {
      animation: funding-source-icon-slide-in 0.1s ease-out forwards;
    }
  }

  &__icon-money {
    filter: blur(5px);
    font-size: 17px;
    position: absolute;
    right: 14px;
    opacity: 0;
    transform: rotate(0deg) translate(-5px, 3px) scale(0.4);
    transform-origin: bottom left;
    transition:
      filter 0.25s cubic-bezier(0.4, 0.29, 0.32, 1.27),
      transform 0.3s cubic-bezier(0.4, 0.29, 0.32, 1.27),
      opacity 0.2s cubic-bezier(0.4, 0.29, 0.32, 1.27);

    &--hovered {
      filter: blur(0);
      opacity: 1;
      transform: rotate(6deg) translate(4.5px, -4.7px) scale(1);
    }

    &--has-hovered:not(&--hovered) {
      filter: blur(5px);
      opacity: 0;
      transform: rotate(0deg) translate(-5px, 3px) scale(0.4);
    }
  }
}

@keyframes funding-source-icon-slide-out {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateX(-4px) scale(0.85);
    opacity: 0.8;
  }
}

@keyframes funding-source-icon-slide-in {
  0% {
    transform: translateX(-4px) scale(0.85);
    opacity: 0.8;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}
</style>
