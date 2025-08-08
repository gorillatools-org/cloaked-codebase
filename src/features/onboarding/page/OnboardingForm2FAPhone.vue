<script setup>
import { computed, onMounted, ref, reactive, watch } from "vue";

import store from "@/store";
import { debounce } from "lodash-es";
import MfaService from "@/api/actions/mfa-service.js";
import PhoneService from "@/api/actions/phone-service.js";
import AppFormInput from "@/features/AppFormInput.vue";
import InputSpinner from "@/features/InputSpinner.vue";
import AppFormError from "@/features/AppFormError.vue";
import { phone_format, phone_package } from "@/scripts/format.js";
import { phone as phoneValidation } from "@/scripts/validation.js";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_2FA } from "@/scripts/posthogEvents.js";
import { FORM_VALIDATION_DEBOUNCE_TIMEOUT } from "@/features/onboarding/page/utils.js";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  value: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["input", "next"]);

const ui = reactive({
  requestingCode: false,
  verifyingCode: false,
  errorPhone: null,
  errorCode: null,
  isValidationPending: false,
  phone: null,
  token: null,
});

const phone = computed({
  get: () => props.value.phone,
  set: (newValue) => emit("input", { ...props.value, phone: newValue }),
});

const phone2fa = computed({
  get: () => props.value.phone2fa,
  set: (newValue) => emit("input", { ...props.value, phone2fa: newValue }),
});

const isPhoneVerified = computed({
  get: () => props.value.isPhoneVerified,
  set: (value) => emit("input", { ...props.value, isPhoneVerified: value }),
});

const verificationCodeRequested = computed({
  get: () => props.value.phoneVerificationCodeRequested,
  set: (value) =>
    emit("input", { ...props.value, phoneVerificationCodeRequested: value }),
});

const verificationCode = computed({
  get: () => props.value.phoneVerificationCode,
  set: (value) =>
    emit("input", { ...props.value, phoneVerificationCode: value }),
});

const fieldPhone = ref(null);
const fieldCode = ref(null);

onMounted(() => {
  fieldPhone.value?.$el.focus();
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_2FA);
});

const finishValidation = debounce(() => {
  ui.isValidationPending = false;
}, FORM_VALIDATION_DEBOUNCE_TIMEOUT);

const validationPending = () => {
  ui.isValidationPending = true;
  finishValidation();
};

const validatePhone = debounce(function () {
  if (!phone.value?.length) {
    return (ui.errorPhone = null);
  }

  if (!phoneValidation(phone.value)) {
    return (ui.errorPhone = "Please, provide a valid phone number");
  }

  ui.errorPhone = null;
}, FORM_VALIDATION_DEBOUNCE_TIMEOUT);

watch(() => phone.value, validatePhone);
watch(() => phone.value, validationPending);

const isValidPhone = computed(
  () => !ui.isValidationPending && !ui.errorPhone && phone.value
);

const countryCode = computed(() => {
  return store.state.authentication?.user?.current_country;
});

async function requestCode() {
  if (isValidPhone.value) {
    try {
      ui.requestingCode = true;

      const { data } = await PhoneService.addPhone({
        ...phone_package(phone.value, countryCode.value),
        primary: true,
        collection_name: "phone",
        collection: store.getters["authentication/collection"]("phone"),
        user: store.state.authentication?.user?.url,
      });

      if (!data.verified) {
        const response = await PhoneService.sendVerificationCode(data.id);
        ui.phone = data;
        verificationCodeRequested.value = true;
        ui.token = response.data.session_token;
        fieldCode.value?.$el.focus();
      } else {
        await MfaService.addMfaDevice({
          deviceId: navigator.userAgent,
          method: "sms",
          methodId: data.id,
        });
        phone2fa.value = data;
        isPhoneVerified.value = true;
      }
    } catch ({ response }) {
      ui.errorPhone =
        response?.data?.[0] ?? "Something went wrong, please try again";
    } finally {
      ui.requestingCode = false;
    }
  }
}

async function confirmCode() {
  if (verificationCode.value) {
    try {
      ui.verifyingCode = true;
      await PhoneService.verifyVerificationCode(ui.phone.id, {
        security_code: verificationCode.value,
        phone_number: ui.phone.phone_number,
        session_token: ui.token,
      });

      await MfaService.addMfaDevice({
        deviceId: navigator.userAgent,
        method: "sms",
        methodId: ui.phone.id,
      });

      phone2fa.value = ui.phone;
      isPhoneVerified.value = true;
    } catch {
      ui.errorCode = "Invalid 6 digit code";
    } finally {
      ui.verifyingCode = false;
    }
  }
}

watch(
  () => verificationCode.value,
  (newValue) => {
    if (ui.errorCode) {
      ui.errorCode = null;
    }
    if (newValue.length === 6) {
      confirmCode();
    }
  }
);

function filtered(phone) {
  const format = phone_format(phone, countryCode.value);
  if (format !== "undefined") {
    return format;
  }
  return phone;
}
</script>

<template>
  <div class="onboarding-form__content">
    <h1 class="onboarding-form__title">Protect your account with 2FA</h1>
    <p class="onboarding-form__text">
      We will use your phone number for two-factor authentication codes. Your
      number can be set for call and text forwarding. This can be set manually
      later.
    </p>
    <Transition
      name="fade-150"
      mode="out-in"
    >
      <fieldset
        v-if="!isPhoneVerified"
        class="onboarding-form__fieldset"
      >
        <AppFormInput
          ref="fieldPhone"
          :value="filtered(phone)"
          placeholder="___ ___ ____"
          type="tel"
          autocomplete="tel-national"
          maxlength="15"
          :error="ui.errorPhone"
          @input="phone = $event"
          @keydown.enter="requestCode"
        >
          <template #after-input>
            <button
              type="button"
              :disabled="!isValidPhone || ui.requestingCode"
              class="onboarding-form__field-button"
              :class="{
                'onboarding-form__field-button--sending': ui.requestingCode,
                'onboarding-form__field-button--resend':
                  verificationCodeRequested,
              }"
              @click="requestCode"
            >
              <template v-if="ui.requestingCode">
                Sending code
                <InputSpinner />
              </template>
              <template v-else-if="verificationCodeRequested">
                Resend code
                <InlineSvg name="arrow-right" />
              </template>
              <template v-else>
                Send code
                <InlineSvg name="arrow-right" />
              </template>
            </button>
          </template>
          <template #after>
            <AppFormError v-if="ui.errorPhone">
              {{ ui.errorPhone }}
            </AppFormError>
          </template>
        </AppFormInput>
        <AppFormInput
          ref="fieldCode"
          :value="verificationCode"
          placeholder="Enter 6 digit code"
          maxlength="6"
          inputmode="numeric"
          autocomplete="one-time-code"
          class="onboarding-form__field-code"
          :class="{
            'onboarding-form__field-code--invisible':
              !verificationCodeRequested,
          }"
          :error="ui.errorCode"
          @input="verificationCode = $event"
          @keydown.enter="confirmCode"
        >
          <template
            v-if="ui.verifyingCode"
            #after-input
          >
            <button
              type="button"
              :disabled="true"
              class="onboarding-form__field-button"
            >
              Verifying
              <InputSpinner />
            </button>
          </template>
          <template #after>
            <AppFormError v-if="ui.errorCode">
              {{ ui.errorCode }}
            </AppFormError>
          </template>
        </AppFormInput>
      </fieldset>
      <div
        v-else
        class="onboarding-form__success"
      >
        <InlineSvg
          name="checkmark"
          class="onboarding-form__success-icon"
        />
        <p>Your account is protected! Press next to continue.</p>
      </div>
    </Transition>
    <footer class="onboarding-form__footer">
      <div>&nbsp;</div>
      <button
        v-if="!isPhoneVerified"
        type="button"
        class="onboarding-form__secondary"
        @click="emit('next')"
      >
        Not now
      </button>
      <button
        type="button"
        class="onboarding-form__primary"
        :disabled="!isPhoneVerified"
        @click="emit('next')"
      >
        Next
        <InlineSvg name="arrow-right" />
      </button>
    </footer>
  </div>
</template>
