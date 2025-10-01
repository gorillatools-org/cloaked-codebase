<script setup>
import { ref, computed } from "vue";
import AdvancedModeModal from "@/features/AdvancedMode/AdvancedModeModal.vue";
import BasicModeModal from "@/features/AdvancedMode/BasicModeModal.vue";
import { useBasicMode } from "@/composables/useBasicMode";
import { posthogCapture } from "@/scripts/posthog.js";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseToggle from "@/library/BaseToggle.vue";

const { isBasicModeEnabled } = useBasicMode();

const isAdvancedModeModalOpen = ref(false);
const isBasicModeModalOpen = ref(false);
const toggle = computed(() => !isBasicModeEnabled.value);

const openBasicModeModals = () => {
  if (!isBasicModeEnabled.value) {
    // Use the new BasicModeModal instead of generic modal
    isBasicModeModalOpen.value = true;
  } else {
    // Analytics will be handled by the modal when user clicks "Try Advanced"
    isAdvancedModeModalOpen.value = true;
  }
};

const goToAdvancedMode = () => {
  // Modal handles its own closing and mode switching now
  // This is just for cleanup in case modal doesn't close itself
  isAdvancedModeModalOpen.value = false;
};

const goToBasicMode = () => {
  // Modal handles its own closing and mode switching now
  // This is just for cleanup in case modal doesn't close itself
  isBasicModeModalOpen.value = false;
};

const closeBasicModeModal = () => {
  isBasicModeModalOpen.value = false;
  posthogCapture("dashboard_user_closes_basic_mode_modal");
};
</script>

<template>
  <div class="navigation-advanced-toggle">
    <button
      class="navigation-advanced-toggle__button"
      @click="openBasicModeModals"
    >
      <BaseIcon name="bolt" />
      <BaseText
        as="span"
        variant="caption-semibold"
        class="navigation-advanced-toggle__button-text"
      >
        Advanced features
      </BaseText>
      <BaseToggle
        :active="toggle"
        class="navigation-advanced-toggle__button-toggle"
      />
    </button>

    <AdvancedModeModal
      v-model="isAdvancedModeModalOpen"
      @close="() => posthogCapture('dashboard_user_closes_advanced_mode_modal')"
      @go-to-advanced-mode="goToAdvancedMode"
    />

    <BasicModeModal
      v-model="isBasicModeModalOpen"
      @close="closeBasicModeModal"
      @go-to-basic-mode="goToBasicMode"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.navigation-advanced-toggle {
  &__button {
    border: none;
    cursor: pointer;
    border-radius: 20px;
    background-color: $color-base-white-100;
    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(13px);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid $color-primary-20;

    &:hover {
      background-color: $color-primary-5;
    }

    &-text {
      color: $color-primary-100;
    }
  }
}
</style>
