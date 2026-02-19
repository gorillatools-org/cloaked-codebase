<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { useBasicModeRouting } from "@/composables/useBasicMode";
import { posthogCapture } from "@/scripts/posthog.js";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";

const router = useRouter();
const { toggleBasicModeWithRouting } = useBasicModeRouting();

const isOpen = defineModel({ type: Boolean });
const isLoading = ref(false);

const emit = defineEmits(["close", "goToBasicMode"]);

const onStayAdvanced = () => {
  if (isLoading.value) return;
  isOpen.value = false;
  emit("close");
  posthogCapture("dashboard_user_chooses_stay_advanced");
};

const onGoToBasic = async () => {
  // Re-entrancy guard - prevent duplicate toggles
  if (isLoading.value) return;

  isLoading.value = true;

  try {
    posthogCapture("dashboard_user_toggles_basic_mode");

    await toggleBasicModeWithRouting(router);

    isOpen.value = false;
    emit("goToBasicMode");
  } catch (error) {
    console.error("Error switching to basic mode:", error);
  } finally {
    isLoading.value = false;
  }
};

const onGetHelp = () => {
  if (isLoading.value) return;
  posthogCapture("dashboard_user_opens_help_center");
  const newWindow = window.open(
    HELP_CENTER_BASE_URL,
    "_blank",
    "noopener,noreferrer"
  );
  if (newWindow) {
    newWindow.opener = null;
  }
};
</script>

<template>
  <AppModal
    :value="isOpen"
    @input="onStayAdvanced"
  >
    <AppModalContent class="basic-mode-modal__content">
      <header class="basic-mode-modal__header">
        <BaseMedallion
          icon="refresh"
          size="md"
          class="basic-mode-modal__medallion"
        />
      </header>
      <BaseText
        as="h2"
        variant="headline-2-regular"
        class="basic-mode-modal__title"
      >
        Would you like to switch to basic mode?
      </BaseText>
      <BaseText
        variant="body-3-regular"
        class="basic-mode-modal__subtitle"
      >
        Advanced mode has a lot to offer but it's understandable that it may be
        more than you need right now.
      </BaseText>

      <div class="basic-mode-modal__main-buttons">
        <div
          class="basic-mode-modal__option-card"
          :class="{ 'basic-mode-modal__option-card--loading': isLoading }"
          role="button"
          tabindex="0"
          :aria-disabled="isLoading"
          @click="onGoToBasic"
          @keydown.enter="onGoToBasic"
          @keydown.space.prevent="onGoToBasic"
        >
          <span
            v-if="isLoading"
            class="basic-mode-modal__option-icon"
          >
            <span class="basic-mode-modal__option-loader" />
          </span>
          <BaseIcon
            v-else
            name="arrow-left"
            class="basic-mode-modal__option-icon"
          />
          <BaseText
            variant="headline-4-medium"
            class="basic-mode-modal__option-title"
          >
            Switch to Basic
          </BaseText>
          <BaseText
            variant="body-3-regular"
            class="basic-mode-modal__option-description"
          >
            There's a lot to explore but I want to keep it simple for now.
          </BaseText>
        </div>

        <div
          class="basic-mode-modal__option-card"
          :class="{ 'basic-mode-modal__option-card--disabled': isLoading }"
          role="button"
          tabindex="0"
          :aria-disabled="isLoading"
          @click="onStayAdvanced"
          @keydown.enter="onStayAdvanced"
          @keydown.space.prevent="onStayAdvanced"
        >
          <BaseIcon
            name="bolt"
            class="basic-mode-modal__option-icon"
          />
          <BaseText
            variant="headline-4-medium"
            class="basic-mode-modal__option-title"
          >
            Stay Advanced
          </BaseText>
          <BaseText
            variant="body-3-regular"
            class="basic-mode-modal__option-description"
          >
            I want to keep exploring Cloaked's advanced features.
          </BaseText>
        </div>
      </div>

      <div
        class="basic-mode-modal__divider"
        :class="{ 'basic-mode-modal__divider--disabled': isLoading }"
      >
        <div class="basic-mode-modal__divider-line"></div>
        <BaseText
          variant="body-small-regular"
          class="basic-mode-modal__divider-text"
        >
          or
        </BaseText>
        <div class="basic-mode-modal__divider-line"></div>
      </div>

      <div
        class="basic-mode-modal__help-card"
        :class="{ 'basic-mode-modal__help-card--disabled': isLoading }"
        role="button"
        tabindex="0"
        :aria-disabled="isLoading"
        @click="onGetHelp"
        @keydown.enter="onGetHelp"
        @keydown.space.prevent="onGetHelp"
      >
        <BaseIcon
          name="help"
          class="basic-mode-modal__help-icon"
        />
        <div class="basic-mode-modal__help-content">
          <BaseText
            variant="headline-4-medium"
            class="basic-mode-modal__help-title"
          >
            Get help from Cloaked
          </BaseText>
          <BaseText
            variant="body-3-regular"
            class="basic-mode-modal__help-description"
          >
            There's a lot to uncover and we are here to help anytime.
          </BaseText>
        </div>
      </div>
    </AppModalContent>
  </AppModal>
</template>

<style scoped lang="scss">
.basic-mode-modal {
  --card-box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);

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

  &__subtitle {
    margin-top: 12px;
    color: $color-primary-100;
  }

  &__main-buttons {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &__option-card {
    padding: 24px;
    border-radius: 24px;
    border: 1px solid $color-primary-10;
    background-color: $color-base-white-100;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: var(--card-box-shadow);

    &--loading {
      opacity: 0.2;
      cursor: not-allowed;
      pointer-events: none;
    }

    &--disabled {
      opacity: 0.2;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__option-icon {
    font-size: 20px;
    color: $color-primary-100;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__option-loader {
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    animation: rotate 0.5s linear infinite;
  }

  &__option-title {
    color: $color-primary-100;
    margin-top: 16px;
  }

  &__option-description {
    color: $color-primary-100;
    margin-top: 8px;
  }

  &__divider {
    width: 228px;
    margin: 16px auto;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;

    &--disabled {
      opacity: 0.2;
    }
  }

  &__divider-line {
    flex: 1;
    height: 1px;
    background-color: $color-primary-70;
  }

  &__divider-text {
    color: $color-primary-70;
  }

  &__help-card {
    padding: 20px;
    border-radius: 24px;
    border: 1px solid $color-primary-10;
    background-color: $color-base-white-100;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    box-shadow: var(--card-box-shadow);

    &--disabled {
      opacity: 0.2;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__help-icon {
    font-size: 20px;
    color: $color-primary-100;
  }

  &__help-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__help-title {
    color: $color-primary-100;
    margin-top: 16px;
  }

  &__help-description {
    color: $color-primary-100;
    margin-top: 8px;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
