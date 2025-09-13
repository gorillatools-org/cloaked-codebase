<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import BaseButton from "@/library/BaseButton.vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { useDataDeleteOperator } from "@/routes/DataDeletion/composables/useDataDeleteOperator";
import {
  HELP_CENTER_DATA_DELETION_GUIDES_URL,
  LOCAL_STORAGE_KEYS,
} from "@/scripts/constants";
import { openExtensionInstallPage } from "@/scripts/browserPluginUtils";
import {
  PH_EVENT_OPERATOR_EXTENSION_MODAL_USER_CLICKED_INSTALL_CLOAKED_EXTENSION,
  PH_EVENT_OPERATOR_EXTENSION_MODAL_USER_CLICKED_VIEW_MANUAL_REMOVAL_STEPS,
  PH_EVENT_DATA_REMOVAL_USER_CLICKED_OPERATOR_OPEN_EXTENSION,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";

const emit = defineEmits(["onViewManualRemovalSteps"]);

const {
  extensionOutdated,
  extensionInstalled,
  openExtension,
  requestOperatorDashboardLink,
  canProceedToOperator,
} = useDataDeleteOperator();

// Definitions for manual data removal (fallback) in a collapsible section
const props = defineProps({
  brokerFamily: {
    type: Object,
    default: () => ({}),
  },
});

function closeModal() {
  store.dispatch("closeModal");
}

function downloadExtension() {
  // Store marker in local storage for extension to read later when extension is installed and open the operator dashboard
  localStorage.setItem(
    LOCAL_STORAGE_KEYS.TRIGGER_EXTENSION_DATA_REMOVAL,
    "true"
  );

  posthogCapture(
    PH_EVENT_OPERATOR_EXTENSION_MODAL_USER_CLICKED_INSTALL_CLOAKED_EXTENSION
  );
  openExtensionInstallPage();
}

try {
  requestOperatorDashboardLink();
} catch (error) {
  console.error("Error requesting operator dashboard link", error);
}

const handleClick = () => {
  if (extensionOutdated.value) {
    // For outdated extension, don't do anything - button will be disabled
    return;
  } else if (canProceedToOperator.value) {
    posthogCapture(PH_EVENT_DATA_REMOVAL_USER_CLICKED_OPERATOR_OPEN_EXTENSION);
    openExtension();
  } else {
    downloadExtension();
  }
};

function openManualRemovalSteps() {
  posthogCapture(
    PH_EVENT_OPERATOR_EXTENSION_MODAL_USER_CLICKED_VIEW_MANUAL_REMOVAL_STEPS
  );
  emit("onViewManualRemovalSteps", props.brokerFamily);
  closeModal();
}
</script>

<template>
  <div>
    <AppModal
      :value="true"
      @close="closeModal"
    >
      <div class="operator-modal">
        <div class="operator-modal__content">
          <BaseText
            variant="headline-2-semibold"
            as="h1"
            class="operator-modal__title"
          >
            Automate Data Removal
          </BaseText>

          <div class="operator-modal__description">
            <BaseText
              variant="headline-6-medium"
              as="p"
            >
              Remove your data from difficult brokers with our AI-powered
              extension – right in your browser.
            </BaseText>
          </div>

          <div
            v-if="extensionOutdated"
            class="operator-modal__alert"
          >
            <InlineSvg
              name="warning-filler"
              class="alert-icon"
            />
            <BaseText
              variant="headline-6-medium"
              as="p"
            >
              Please
              <strong>restart your browser</strong>
              to update the extension.
            </BaseText>
          </div>

          <div class="operator-modal__actions">
            <BaseButton
              variant="cloaked-gradient-secondary"
              size="lg"
              class="operator-modal__primary-button"
              :disabled="extensionOutdated"
              :icon="extensionInstalled ? 'arrow-right' : 'download'"
              @click="handleClick"
            >
              {{ extensionInstalled ? "Open" : "Install" }} Cloaked Extension
            </BaseButton>

            <BaseButton
              variant="text"
              size="md"
              class="operator-modal__text-button"
              @click="openManualRemovalSteps"
            >
              Want to handle it yourself?
            </BaseButton>
          </div>

          <div class="operator-modal__footnote">
            <BaseText
              variant="body-small-medium"
              as="p"
            >
              This feature is experimental.
              <a
                :href="HELP_CENTER_DATA_DELETION_GUIDES_URL"
                target="_blank"
                class="operator-modal__help-link"
              >
                Need help?
              </a>
            </BaseText>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.operator-modal {
  width: 480px;
  max-width: 90vw;
  border-radius: 18px;
  background-color: $color-background;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba($black, 0.1);

  &__content {
    display: flex;
    flex-direction: column;
    padding: 36px;
    text-align: center;
  }

  &__title {
    margin-bottom: 12px;
  }

  &__description {
    margin-bottom: 32px;

    p {
      color: $color-primary-70;
      margin: 0;
      line-height: 1.5;
    }
  }

  &__alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background-color: $color-warning-light;
    border-radius: 10px;
    text-align: left;
    margin-bottom: 24px;

    .alert-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: $color-warning;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__primary-button {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  &__text-button {
    color: $color-primary-70;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary-90;
    }
  }

  &__footnote {
    color: $color-primary-50;
    border-top: 1px solid $color-primary-20;
    padding-top: 16px;
  }

  &__help-link {
    margin-left: 6px;
    color: $color-primary-90;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
