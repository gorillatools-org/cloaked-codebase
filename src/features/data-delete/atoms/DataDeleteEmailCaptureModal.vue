<script setup>
import { ref, inject, watch, toRef } from "vue";
import DataDeleteModal from "@/features/data-delete/atoms/DataDeleteModal.vue";
import DataDeleteEmailCaptureModalContent from "@/features/data-delete/atoms/DataDeleteEmailCaptureModalContent.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.js";
import DataDeleteEmailCaptureModalTitle from "./DataDeleteEmailCaptureModalTitle.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_USER_SUBMITTED_DD_SCAN_EMAIL_MODAL_CAPTURE,
  PH_EVENT_USER_VIEWED_DD_SCAN_EMAIL_MODAL,
} from "@/scripts/posthogEvents";

const props = defineProps({
  phone: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const isOpen = toRef(props, "modelValue");

const emit = defineEmits(["update:modelValue"]);
const cioanalytics = inject("cioanalytics");

const email = ref("");
const isSending = ref(false);
const isSent = ref(false);

const {
  error: emailError,
  validate: validateEmail,
  validateDebounced: validateEmailDebounced,
} = useEmailValidation(email, { isRequired: false });

async function onAddEmail() {
  validateEmail();
  if (emailError.value || !email.value) return;

  try {
    const customerId = btoa(email.value);
    const url =
      window.location.origin +
      window.location.pathname +
      "?phone=" +
      props.phone;

    if (cioanalytics?.identify) {
      isSending.value = true;
      await cioanalytics.identify({
        id: customerId,
        email: email.value,
        subscribed: true,
        sourceUrl: url,
        source: "save-scan-results",
        phone: props.phone,
      });
      await cioanalytics.track(
        "user_submitted_data_deletion_scan_email_modal_capture",
        {
          id: customerId,
          email: email.value,
          phone: props.phone,
          sourceUrl: url,
          source: "save-scan-results",
          staging: true,
        }
      );
      posthogCapture(PH_EVENT_USER_SUBMITTED_DD_SCAN_EMAIL_MODAL_CAPTURE);
    }

    // show success after 1s
    setTimeout(() => {
      isSent.value = true;
    }, 1000);

    // close modal and reset after 3s
    setTimeout(() => {
      emit("update:modelValue", false);
      isSent.value = false;
      isSending.value = false;
      email.value = "";
    }, 5000);
  } catch (err) {
    console.error("Failed to send email:", err);
    isSending.value = false;
  }
}

watch(
  isOpen,
  (open) => {
    if (open) {
      posthogCapture(PH_EVENT_USER_VIEWED_DD_SCAN_EMAIL_MODAL);
    }
  },
  { immediate: false }
);
</script>

<template>
  <DataDeleteModal
    v-bind="$attrs"
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <!-- capture form -->
    <template v-if="!isSent">
      <DataDeleteEmailCaptureModalContent class="data-delete-threat-modal">
        <DataDeleteEmailCaptureModalTitle>
          Save your scan results
        </DataDeleteEmailCaptureModalTitle>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="data-delete-email-capture-modal__subtitle"
        >
          Don’t lose your scan — email yourself the report.
        </BaseText>

        <BaseInput
          v-model="email"
          title="Email Address"
          placeholder="john.doe@gmail.com"
          autocomplete="email"
          autofocus="true"
          inputmode="email"
          :error="emailError"
          @blur="validateEmail"
          @input="validateEmailDebounced"
          @keydown.enter.prevent="onAddEmail"
        />

        <div class="data-delete-email-capture-modal__actions">
          <BaseButton
            variant="outline"
            size="md"
            class="data-delete-email-capture-modal__actions-cancel"
            @click="emit('update:modelValue', false)"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            size="md"
            icon="arrow-right"
            :loading="isSending"
            full-width
            :disabled="isSending || emailError || !email"
            @click="onAddEmail"
          >
            {{ isSending ? "Saving" : "Save" }}
          </BaseButton>
        </div>
      </DataDeleteEmailCaptureModalContent>
    </template>

    <!-- success screen -->
    <template v-else>
      <DataDeleteEmailCaptureModalContent class="data-delete-email-sent-modal">
        <div class="data-delete-email-sent-modal__icon">
          <BaseMedallion
            size="md"
            icon="check"
            color="success-green"
          />
        </div>
        <DataDeleteEmailCaptureModalTitle>
          Email sent!
        </DataDeleteEmailCaptureModalTitle>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="data-delete-email-sent-modal__subtitle"
        >
          We’ll email your scan summary shortly. Keep an eye on your inbox and
          stay tuned for future updates.
        </BaseText>
      </DataDeleteEmailCaptureModalContent>
    </template>
  </DataDeleteModal>
</template>

<style lang="scss" scoped>
.data-delete-email-capture-modal {
  &__subtitle {
    color: #5e6165;
    line-height: 140%;
    margin-bottom: 8px;

    @at-root .theme-dark & {
      color: $color-accent-tint-light;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;

    &-cancel {
      width: 104px;
      flex-shrink: 0;
    }
  }
}

.data-delete-email-sent-modal {
  text-align: center;
  padding: 32px;

  &__icon {
    display: flex;
    justify-content: center;
  }

  &__subtitle {
    color: #5e6165;
    line-height: 140%;

    @at-root .theme-dark & {
      color: $color-accent-tint-light;
    }
  }
}
</style>
