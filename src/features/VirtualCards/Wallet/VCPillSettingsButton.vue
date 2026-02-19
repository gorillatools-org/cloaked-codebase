<script setup lang="ts">
import VCBasePill from "@/features/VirtualCards/base/VCBasePill.vue";
import BaseIcon from "@/library/BaseIcon.vue";

type Props = {
  label?: string;
};

withDefaults(defineProps<Props>(), {
  label: "Settings",
});
</script>

<template>
  <VCBasePill
    :label="label"
    clickable
    class="vc-pill-settings-button"
  >
    <template #icon="{ isHovered, hasHovered }">
      <BaseIcon
        name="setting"
        class="vc-pill-settings-button__icon"
        :class="{
          'vc-pill-settings-button__icon--hovered': isHovered,
          'vc-pill-settings-button__icon--has-hovered': hasHovered,
        }"
      />
    </template>
  </VCBasePill>
</template>

<style lang="scss" scoped>
.vc-pill-settings-button {
  &__icon {
    font-weight: 400;

    &--hovered {
      animation: icon-rotate 0.6s cubic-bezier(0.4, 0.29, 0.32, 1.27) forwards;
    }

    &--has-hovered:not(&--hovered) {
      animation: icon-rotate-reverse 0.3s ease-out forwards;
    }
  }
}

@keyframes icon-rotate {
  0% {
    transform: rotate(0deg);
  }

  40% {
    transform: rotate(120deg);
  }

  60% {
    transform: rotate(105deg);
  }

  100% {
    transform: rotate(120deg);
  }
}

@keyframes icon-rotate-reverse {
  0% {
    transform: rotate(120deg);
  }

  100% {
    transform: rotate(0deg);
  }
}
</style>
