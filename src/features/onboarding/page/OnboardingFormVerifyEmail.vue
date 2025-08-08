<script setup>
import { computed, onMounted, ref, reactive, watch } from "vue";

import store from "@/store";
import EmailService from "@/api/actions/email-service.js";
import AppFormInput from "@/features/AppFormInput.vue";
import { email as emailValidation } from "@/scripts/validation.js";
import ForwardingService from "@/api/actions/forwarding-service.js";
import InputSpinner from "@/features/InputSpinner.vue";
import AppFormError from "@/features/AppFormError.vue";
import { debounce } from "lodash-es";
import { FORM_VALIDATION_DEBOUNCE_TIMEOUT } from "@/features/onboarding/page/utils.js";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_EMAIL_VERIFICATION } from "@/scripts/posthogEvents.js";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  value: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["input", "next", "back"]);

const ui = reactive({
  requestingCode: false,
  verifyingCode: false,
  errorEmail: null,
  errorCode: null,
  isValidationPending: false,
  email: null,
  token: null,
});

const email = computed({
  get: () => props.value.email,
  set: (newValue) => emit("input", { ...props.value, email: newValue }),
});

const forwardEmail = computed({
  get: () => props.value.forwardEmail,
  set: (value) => emit("input", { ...props.value, forwardEmail: value }),
});

const isEmailVerified = computed({
  get: () => props.value.isEmailVerified,
  set: (value) => emit("input", { ...props.value, isEmailVerified: value }),
});

const verificationCodeRequested = computed({
  get: () => props.value.emailVerificationCodeRequested,
  set: (value) =>
    emit("input", { ...props.value, emailVerificationCodeRequested: value }),
});

const verificationCode = computed({
  get: () => props.value.emailVerificationCode,
  set: (value) =>
    emit("input", { ...props.value, emailVerificationCode: value }),
});

const fieldEmail = ref(null);
const fieldCode = ref(null);

onMounted(() => {
  fieldEmail.value?.$el.focus();
});

const finishValidation = debounce(() => {
  ui.isValidationPending = false;
}, FORM_VALIDATION_DEBOUNCE_TIMEOUT);

const validationPending = () => {
  ui.isValidationPending = true;
  finishValidation();
};

const validateEmail = debounce(function () {
  if (!email.value?.length) {
    return (ui.errorEmail = null);
  }

  if (!emailValidation(email.value)) {
    return (ui.errorEmail = "Please, provide a valid email address");
  }

  ui.errorEmail = null;
}, FORM_VALIDATION_DEBOUNCE_TIMEOUT);

watch(() => email.value, validateEmail);
watch(() => email.value, validationPending);

const isValidEmail = computed(
  () => !ui.isValidationPending && !ui.errorEmail && email.value
);

async function requestCode() {
  if (isValidEmail.value) {
    ui.requestingCode = true;

    try {
      const { data } = await EmailService.addEmail({
        email: email.value.toLowerCase(),
        primary: true,
        collection_name: "email",
        collection: store.getters["authentication/collection"]("email"),
        user: store.state.authentication?.user?.url,
      });

      if (!data.verified) {
        const response = await EmailService.sendVerificationCode(data.id);
        ui.email = data;
        ui.token = response.data.session_token;
        fieldCode.value?.$el.focus();
        verificationCodeRequested.value = true;
      } else {
        await ForwardingService.enableEmailForwarding(data.id);
        isEmailVerified.value = true;
      }
    } catch ({ response }) {
      ui.errorEmail =
        response?.data?.[0] ?? "Something went wrong, please try again";
    } finally {
      ui.requestingCode = false;
    }
  }
}

async function confirmCode() {
  if (verificationCode.value) {
    ui.verifyingCode = true;

    try {
      await EmailService.verifyVerificationCode(ui.email.id, {
        security_code: verificationCode.value,
        email: ui.email.email,
        session_token: ui.token,
      });
      await ForwardingService.enableEmailForwarding(ui.email.id);
      isEmailVerified.value = true;
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

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_EMAIL_VERIFICATION);
});
</script>

<template>
  <div class="onboarding-form__content">
    <h1 class="onboarding-form__title">Verify your email address</h1>
    <Transition
      name="fade-150"
      mode="out-in"
    >
      <fieldset
        v-if="!isEmailVerified"
        class="onboarding-form__fieldset"
      >
        <AppFormInput
          ref="fieldEmail"
          :value="email"
          placeholder="user@email.com"
          type="email"
          autocomplete="email"
          :error="ui.errorEmail"
          @input="email = $event"
          @keydown.enter="requestCode"
        >
          <template #after-input>
            <button
              type="button"
              :disabled="!isValidEmail || ui.requestingCode"
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
            <AppFormError v-if="ui.errorEmail">
              {{ ui.errorEmail }}
            </AppFormError>
          </template>
        </AppFormInput>
        <AppFormInput
          ref="fieldCode"
          :value="verificationCode"
          placeholder="Enter 6 digit code"
          maxlength="6"
          inputmode="numeric"
          class="onboarding-form__field-code"
          autocomplete="one-time-code"
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
        <p>
          You have successfully turned on your email forwarding! Press next to
          continue.
        </p>
      </div>
    </Transition>
    <footer class="onboarding-form__footer">
      <button
        type="button"
        class="onboarding-form__secondary"
        @click="$emit('back')"
      >
        Back
      </button>
      <button
        v-if="!isEmailVerified"
        type="button"
        class="onboarding-form__secondary"
        @click="
          forwardEmail = 'Not now';
          $emit('next');
        "
      >
        Not now
      </button>
      <button
        type="button"
        class="onboarding-form__primary"
        :disabled="!isEmailVerified"
        @click="$emit('next')"
      >
        Next
        <InlineSvg name="arrow-right" />
      </button>
    </footer>
  </div>
</template>
