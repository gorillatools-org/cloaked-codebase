<script setup>
import { ref, computed } from "vue";
import AdvancedModeModal from "@/features/AdvancedMode/AdvancedModeModal.vue";
import { useBasicMode, useBasicModeRouting } from "@/composables/useBasicMode";
import { useRouter } from "vue-router";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseToggle from "@/library/BaseToggle.vue";

const { withEncryptionGate } = useEncryptionGate();
const { isBasicModeEnabled } = useBasicMode();
const { toggleBasicModeWithRouting } = useBasicModeRouting();
const router = useRouter();

const isAdvancedModeModalOpen = ref(false);
const toggle = computed(() => !isBasicModeEnabled.value);

const openBasicModeModals = () => {
  posthogCapture("dashboard_user_toggles_advanced_mode");

  if (!isBasicModeEnabled.value) {
    store.dispatch("openModal", {
      header: "Turn off advanced mode?",
      paragraphs: [
        "Everything you do in advanced mode will always be available if you turn it back on, including any Identities you create, emails and messages you send, etc.",
        "For additional help, you can reach out to support@cloaked.com",
      ],
      button: {
        text: "Yes, go back to basic mode",
        onClick: changeBasicMode,
      },
    });
  } else {
    isAdvancedModeModalOpen.value = true;
  }
};

const changeBasicMode = () => {
  toggleBasicModeWithRouting(router);
  posthogCapture("dashboard_user_toggles_basic_mode");
};

const goToAdvancedMode = () => {
  isAdvancedModeModalOpen.value = false;
  withEncryptionGate(() => toggleBasicModeWithRouting(router), {
    context: "advanced-mode",
  });
  posthogCapture("dashboard_user_toggles_advanced_mode");
};

const closeAdvancedModeModal = () => {
  isAdvancedModeModalOpen.value = false;
  posthogCapture("dashboard_user_closes_advanced_mode_modal");
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
      :value="isAdvancedModeModalOpen"
      @close="closeAdvancedModeModal"
      @go-to-advanced-mode="goToAdvancedMode"
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
