<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { useBasicModeRouting } from "@/composables/useBasicMode";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import { posthogCapture } from "@/scripts/posthog.js";

const router = useRouter();
const { toggleBasicModeWithRouting } = useBasicModeRouting();
const { withEncryptionGate, isEncryptionAvailable } = useEncryptionGate();

const isOpen = defineModel({ type: Boolean });
const isLoading = ref(false);

const emit = defineEmits(["close", "go-to-advanced-mode"]);

const ADVANCED_FEATURES = [
  {
    icon: "profile-me",
    text: "Generate real, anonymous email addresses and phone numbers to protect your real ones.",
  },
  {
    icon: "shield-tick",
    text: "Privately call, text, and email right inside of Cloaked.",
  },
  {
    icon: "lock",
    text: "Generate, save, and pre-fill passwords.",
  },
  {
    icon: "plus",
    text: "So much more...",
  },
];

const onStayBasic = () => {
  if (isLoading.value) return;
  isOpen.value = false;
  emit("close");
};

const onTryAdvanced = async () => {
  isLoading.value = true;

  // Capture the initial encryption state to use consistently
  const wasEncryptedInitially = isEncryptionAvailable.value;

  try {
    posthogCapture("dashboard_user_toggles_advanced_mode");

    // If user needs encryption, close this modal first to avoid overlapping modals
    if (!wasEncryptedInitially) {
      isOpen.value = false;
    }

    await withEncryptionGate(
      async () => {
        await toggleBasicModeWithRouting(router);

        // Emit event after successful mode switch (for both encrypted and newly encrypted users)
        emit("go-to-advanced-mode");
      },
      {
        context: "advanced-mode",
      }
    );

    // If user was already encrypted, close modal normally
    if (wasEncryptedInitially) {
      isOpen.value = false;
    }
  } catch (error) {
    console.error("Error switching to advanced mode:", error);
    // On error, reopen modal if we had closed it for encryption
    if (!wasEncryptedInitially) {
      isOpen.value = true;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <AppModal
    :value="isOpen"
    @input="onStayBasic"
  >
    <AppModalContent class="advanced-mode-modal__content">
      <header class="advanced-mode-modal__header">
        <BaseMedallion
          icon="bolt"
          size="md"
          color="cloaked"
          class="advanced-mode-modal__medallion"
        />
      </header>
      <BaseText
        as="h2"
        variant="headline-2-regular"
        class="advanced-mode-modal__title"
      >
        Try Cloaked's Powerful Advanced Features
      </BaseText>
      <div class="advanced-mode-modal__description">
        <BaseText
          variant="headline-4-medium"
          class="advanced-mode-modal__subtitle"
        >
          Built for Privacy
        </BaseText>
        <div class="advanced-mode-modal__features">
          <div
            v-for="feature in ADVANCED_FEATURES"
            :key="feature.icon"
            class="advanced-mode-modal__feature"
          >
            <BaseIcon
              :name="feature.icon"
              class="advanced-mode-modal__feature-icon"
            />
            <BaseText
              variant="headline-6-medium"
              class="advanced-mode-modal__feature-text"
            >
              {{ feature.text }}
            </BaseText>
          </div>
        </div>
        <BaseText
          variant="body-3-regular"
          class="advanced-mode-modal__note"
        >
          Advanced features also work on mobile. To disable simply toggle the
          option off from the Settings menu.
        </BaseText>
      </div>
      <footer class="advanced-mode-modal__footer">
        <BaseButton
          variant="outline"
          size="lg"
          :disabled="isLoading"
          class="advanced-mode-modal__button"
          @click="onStayBasic"
        >
          Stay on Basic
        </BaseButton>
        <BaseButton
          variant="cloaked-gradient-secondary"
          size="lg"
          :loading="isLoading"
          :disabled="isLoading"
          class="advanced-mode-modal__button"
          @click="onTryAdvanced"
        >
          Try Advanced
        </BaseButton>
      </footer>
    </AppModalContent>
  </AppModal>
</template>

<style scoped lang="scss">
.advanced-mode-modal {
  &__content {
    padding: 48px 36px;
  }

  &__header {
    display: flex;
    justify-content: flex-start;
  }

  &__title {
    margin-top: 8px;
  }

  &__description {
    margin-top: 16px;
    padding: 24px;
    background-color: $color-base-white-100;
    border: 1px solid $color-primary-10;
    border-radius: 24px;
  }

  &__subtitle {
    margin-top: 0;
    font-weight: 600;
  }

  &__features {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: left;
  }

  &__feature {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    &-icon {
      font-size: 20px;
      color: $color-primary-100;
    }

    &-text {
      color: $color-primary-70;
    }
  }

  &__note {
    margin-top: 16px;
    padding: 16px;
    border: 1px solid $color-primary-10;
    background-color: $color-primary-5;
    border-radius: 12px;
    color: $color-primary-100;
    display: block;
    text-align: center;
  }

  &__footer {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    width: 100%;
  }

  &__button {
    flex: 1;
    width: calc(50% - 6px);
  }
}
</style>
