<script setup>
import BaseInput from "@/library/BaseInput.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.js";
import { ref, watch, toValue, onMounted } from "vue";
import { useSsnValidation } from "@/composables/validation/useSsnValidation.js";
import { getFormattedSsnValue } from "@/features/enrollment/utils.js";
import BaseIcon from "@/library/BaseIcon.vue";
import store from "@/store";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { useToast } from "@/composables/useToast.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { useColorScheme } from "@/composables/useColorScheme";
import { formatPhoneStringBasic } from "@/scripts/format.js";
import { toApiPayloadMapped } from "@/features/enrollment/data-utils.js";

const toast = useToast();

const props = defineProps({
  autofillData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["exit-delete-flow"]);

const { colorScheme } = useColorScheme();

onMounted(() =>
  posthogCapture("user_viewed_enrollment_form_monitoring", {
    theme: colorScheme.value,
  })
);

const phone = defineModel("phone", { type: String });
const ssn = defineModel("ssn", {
  type: String,
  get: getFormattedSsnValue,
});

// Set default values after props are available
const hasPrefilledData = ref(false);
watch(
  () => props.autofillData,
  (newAutofillData) => {
    const autofillData = toValue(newAutofillData);
    if (autofillData && !hasPrefilledData.value) {
      phone.value = autofillData.phone_numbers?.[0] || "";
      ssn.value = autofillData.ssn || "";
      hasPrefilledData.value = true;
    }
  },
  { immediate: true, deep: true }
);

const {
  error: phoneError,
  validate: validatePhone,
  validateDebounced: validatePhoneDebounced,
} = usePhoneValidation(phone, { isRequired: false });

const {
  error: ssnError,
  validate: validateSsn,
  validateDebounced: validateSsnDebounced,
} = useSsnValidation(ssn, { isRequired: false });

const isSubmitting = ref(false);

function submitMonitoring() {
  isSubmitting.value = true;
  validatePhone();
  validateSsn();

  if (phoneError.value || ssnError.value) {
    isSubmitting.value = false;
    return;
  }

  const payload = {};
  if (ssn.value.length) {
    payload.ssn = ssn.value;
  }
  if (phone.value.length) {
    const formattedPhone = formatPhoneStringBasic(phone.value);
    payload.phone_numbers = [formattedPhone];
  }

  const mappedPayload = toApiPayloadMapped(payload);

  DataDeleteService.updateEnrollmentProfilePatch(mappedPayload)
    .then(() => {
      if (mappedPayload?.ssns?.length) {
        posthogCapture("user_enrolled_ssn_monitoring", {
          theme: colorScheme.value,
        });
      } else {
        posthogCapture("user_skipped_ssn_monitoring", {
          theme: colorScheme.value,
        });
      }
      emit("exit-delete-flow");
    })
    .catch((error) => {
      console.error("Error updating enrollment:", error);
      toast.error("Failed to update enrollment. Please try again.");
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}

function showDoLaterConfirmation() {
  store.dispatch("openModal", {
    header: "Do you want to continue without adding real time alerts?",
    paragraphs: [
      "We monitor your SSN in real-time for usage across a variety of high-risk actions, including loan applications, employment and healthcare records, tax filings, online documents signings and payment platforms.",
      "You'll receive instant alerts in the mobile app if your information is compromised.",
    ],
    button: {
      text: "Do this later",
      onClick: () => {
        posthogCapture("user_skipped_ssn_monitoring", {
          theme: colorScheme.value,
        });
        emit("exit-delete-flow");
      },
    },
    cancelText: "Back",
    cancelIcon: "arrowturnup-left",
  });
}

function showWhyDoINeedThis() {
  store.dispatch("openModal", {
    header: "Why do I need this?",
    paragraphs: [
      "We monitor your SSN in real-time for usage across a variety of high-risk actions, including loan applications, employment and healthcare records, tax filings, online documents signings and payment platforms.",
      "You'll receive instant alerts in the mobile app if your information is compromised.",
    ],
    cancelText: "Close",
  });
}
</script>

<template>
  <div class="enrollment-v2-monitoring">
    <div class="enrollment-v2-monitoring__content">
      <div class="enrollment-v2-monitoring__header">
        <BaseText variant="headline-3-bold">
          Confirm Your Sensitive Information
        </BaseText>
        <BaseText variant="body-3-regular">
          To enhance the scope of real-time alerts for identity theft and fraud.
        </BaseText>
      </div>
      <div class="enrollment-v2-monitoring__form">
        <div class="enrollment-v2-monitoring__input-container">
          <BaseInput
            v-model="phone"
            :error="phoneError"
            title="Phone Number (optional)"
            placeholder="(212) 555-0101"
            autocomplete="tel"
            inputmode="tel"
            @blur="validatePhone"
            @input="validatePhoneDebounced"
          />
          <BaseIcon
            name="phone-shield"
            class="enrollment-v2-monitoring__preaction"
          />
        </div>

        <div class="enrollment-v2-monitoring__input-container">
          <BaseInput
            v-model="ssn"
            :error="ssnError"
            title="Social Security Number (optional)"
            placeholder="123-45-6789"
            inputmode="numeric"
            :maxlength="11"
            autocomplete="off"
            secret
            @blur="validateSsn"
            @input="validateSsnDebounced"
            @keydown.enter="submitMonitoring"
          >
            <template #label-after>
              <BaseIcon
                name="info"
                class="enrollment-v2-monitoring__label-after-icon"
                @click="showWhyDoINeedThis"
              />
            </template>
          </BaseInput>
          <BaseIcon
            name="shield-tick"
            class="enrollment-v2-monitoring__preaction"
          />
        </div>

        <BaseButton
          v-if="ssn.length || phone.length"
          icon="lock"
          size="md"
          full-width
          :loading="isSubmitting && !!ssn?.length"
          :disabled="isSubmitting"
          class="enrollment-v2-monitoring__confirm"
          @click="submitMonitoring"
        >
          Confirm and Protect
        </BaseButton>
        <BaseButton
          v-else
          icon="lock"
          size="md"
          full-width
          :loading="isSubmitting && ssn"
          :disabled="isSubmitting"
          class="enrollment-v2-monitoring__confirm"
          @click="showDoLaterConfirmation"
        >
          Continue without enhancing
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.enrollment-v2-monitoring {
  &__content {
    max-width: 400px;
    margin: 0 auto;
    padding: 32px 16px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__input-container {
    position: relative;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;

    &:deep(.base-input__input) {
      padding-left: calc(16px + 1 * (24px));
      width: 100%;

      &:not(:disabled, :focus, :active, .base-input__input--error) {
        border-color: $color-primary-50;
      }
    }
  }

  &__preaction {
    font-size: 19px;
    color: $color-primary-100;
    opacity: 0.7;
    z-index: 1;
    justify-self: flex-end;
    position: absolute;
    left: 24px;
    top: 44px;
    transform: translateX(-50%);

    @media all and (min-width: $screen-md) {
      top: 35px;
    }
  }

  &__confirm {
    margin-top: 24px;
  }

  &__next {
    margin-top: 16px;
    text-align: center;
    cursor: pointer;
    text-decoration: underline;

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
