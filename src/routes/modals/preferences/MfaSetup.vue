<script setup>
import { reactive, onBeforeMount, watch, useAttrs } from "vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import AuthService from "@/api/actions/auth-service.js";
import MfaService from "@/api/actions/mfa-service.js";
import { password_confirm } from "@/scripts/actions/encryption.js";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";

import { PH_EVENT_CLOAKED_AUTH_TOTP_MFA_ENABLED } from "@/scripts/posthogEvents.js";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import ValueDisplay from "@/features/ui/value-display.vue";
import Button from "@/features/Button.vue";
import Spinner from "@/assets/icons/spinner.svg";
import { phone_format } from "@/scripts/format.js";
import { phone } from "@/scripts/validation.js";
import { getPosthog } from "@/scripts/posthog.js";
import UserService from "@/api/actions/user-service.js";
import InlineSvg from "@/features/InlineSvg.vue";
import { tools } from "@/scripts/tools";
import BaseText from "@/library/BaseText.vue";

const ENTER_PASSWORD = "password";
const CHOOSE_METHOD = "chooseMethod";
const SELECT_METHOD_DEVICE = "selectMethodDevice";
const ADD_NEW_METHOD = "addNewMethod";
const VERIFY_NEW_METHOD = "verifyNewMethod";
const AVAILABLE_STEPS = [
  ENTER_PASSWORD,
  CHOOSE_METHOD,
  SELECT_METHOD_DEVICE,
  ADD_NEW_METHOD,
  VERIFY_NEW_METHOD,
];

const attrs = useAttrs();

const toast = useToast();

const emit = defineEmits([
  "toggleBack",
  "refresh",
  "email-verified",
  "phone-verified",
  "mfa-devices-updated",
]);

const props = defineProps({
  userHasTotpActivated: {
    type: Boolean,
    required: true,
  },
});

const state = reactive({
  fetching: false,
  currentPassword: "",
  newPersonalPhone: "",
  newPersonalEmail: "",
  currentInputPhoneEmail: { display: "", value: "" },
  currentMethodId: null,
  totpToken: "",
  totpUrl: null,
  totpPng: null,
  sessionToken: "",
  error: false,
  errorMessage: "",
  currentStep: ENTER_PASSWORD,
  currentMethodDisplayText: "",
  availableMethods: [],
  selectedMethod: "",
  verifiedPhoneNumbers: [],
  verifiedEmails: [],
  availableSteps: AVAILABLE_STEPS,
});

onBeforeMount(() => {
  getAvailableMfaMethods();
  getUserVerifiedPhoneNumbers();
  getUserVerifiedEmails();
});

const setCurrentStep = (step) => {
  state.error = false;
  state.errorMessage = "";
  if (step) {
    state.currentStep = step;
  } else {
    emit("toggleBack", {});
  }
};
const toggleBack = () => {
  if (state.currentStep === CHOOSE_METHOD) {
    emit("toggleBack", {});
    return;
  }
  const currentStepIndex = state.availableSteps.indexOf(state.currentStep);
  setCurrentStep(state.availableSteps[currentStepIndex - 1]);
};
const setSelectedMethod = (method) => {
  state.selectedMethod = method;
  state.currentMethodDisplayText = getMethodDisplayText(method);
  if (
    method === "call" ||
    (method === "sms" && state.verifiedPhoneNumbers?.length > 0)
  ) {
    state.availableSteps = [
      ENTER_PASSWORD,
      CHOOSE_METHOD,
      SELECT_METHOD_DEVICE,
      ADD_NEW_METHOD,
      VERIFY_NEW_METHOD,
    ];
    setCurrentStep(SELECT_METHOD_DEVICE);
    return;
  } else if (method === "email" && state.verifiedEmails?.length > 0) {
    state.availableSteps = [
      ENTER_PASSWORD,
      CHOOSE_METHOD,
      SELECT_METHOD_DEVICE,
      ADD_NEW_METHOD,
      VERIFY_NEW_METHOD,
    ];
    setCurrentStep(SELECT_METHOD_DEVICE);
    return;
  } else if (method === "totp") {
    addTotpDevice();
    state.availableSteps = [
      ENTER_PASSWORD,
      CHOOSE_METHOD,
      ADD_NEW_METHOD,
      VERIFY_NEW_METHOD,
    ];
    setCurrentStep(ADD_NEW_METHOD);
    return;
  }
  state.availableSteps = [
    ENTER_PASSWORD,
    CHOOSE_METHOD,
    ADD_NEW_METHOD,
    VERIFY_NEW_METHOD,
  ];
  setCurrentStep(ADD_NEW_METHOD);
};
const getMethodDisplayText = (method) => {
  let methodText = "";
  switch (method) {
    case "call":
      methodText = "phone call";
      break;
    case "sms":
      methodText = "SMS";
      break;
    case "email":
      methodText = "email";
      break;
    case "totp":
      methodText = "authenticator app";
      break;

    default:
      break;
  }
  return `Verify via ${methodText}`;
};
const resetData = () => {
  setCurrentStep(ENTER_PASSWORD);
  /* go back to main page */
  emit("mfa-devices-updated");
  emit("toggleBack", {});
  state.fetching = false;
  state.currentPassword = "";
  state.newPersonalPhone = "";
  state.newPersonalEmail = "";
  state.currentInputPhoneEmail = { display: "", value: "" };
  state.currentMethodId = null;
  state.totpToken = "";
  state.sessionToken = "";
  state.error = false;
  state.errorMessage = "";
  state.currentMethodDisplayText = "";
  state.availableMethods = [];
  state.selectedMethod = "";
  state.verifiedPhoneNumbers = [];
  state.verifiedEmails = [];
  refresh();
};
const getUserVerifiedPhoneNumbers = async () => {
  return MfaService.getVerifiedPhoneNumbers()
    .then((res) => {
      state.verifiedPhoneNumbers = res.data.results.map((phone) => {
        return {
          ...phone,
          formattedPhoneNumber: phone_format(phone.phone_number),
        };
      });
    })
    .catch(() => {
      toast.error("Unable to find verified phone numbers.");
    });
};
const getUserVerifiedEmails = async () => {
  return MfaService.getVerifiedEmails()
    .then((res) => {
      state.verifiedEmails = res.data.results;
    })
    .catch(() => {
      toast.error("Unable to find verified emails.");
    });
};

const addNewMfaDeviceForVerifiedMethod = async (
  methodId,
  isVerified,
  methodType
) => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    await MfaService.addMfaDevice({
      deviceId: navigator.userAgent,
      method: state.selectedMethod,
      methodId,
    });
    if (isVerified) {
      toast.success("Two-factor authentication enabled.");
      UserService.updateAndFetchGetStartedChecklist({
        id: 13,
        status: "completed",
      });
      resetData();
      return;
    }
    /* if the phone number is verified we don't need extra api calls
      ie in case they happen to type in a number that is already verified
      */
    switch (methodType) {
      case "phone": {
        const phoneEndpointRes = await MfaService.requestPhoneVerificationCode({
          id: methodId,
        });
        if (phoneEndpointRes.data.verified) {
          toast.success("Two-factor authentication enabled.");
          resetData();
          return;
        }
        break;
      }
      case "email": {
        const emailEndpointRes = await MfaService.requestEmailVerificationCode({
          id: methodId,
        });
        if (emailEndpointRes.data.verified) {
          toast.success("Two-factor authentication enabled.");
          resetData();
          return;
        }
        break;
      }

      default:
        break;
    }
  } catch {
    state.fetching = false;
    toast.error("Unable to add 2FA method. Please try again later.");
  }
};
const addNewPersonalPhone = async (phoneNumber) => {
  if (!phone(phoneNumber)) {
    state.error = true;
    state.errorMessage = "Please enter a valid phone number.";
    return;
  }
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    const phoneRes = await MfaService.addPersonalPhone({ phoneNumber });
    /* ie if that number is already saved to their account */
    if (phoneRes.data?.verified) {
      await MfaService.addMfaDevice({
        deviceId: navigator.userAgent,
        method: state.selectedMethod,
        methodId: phoneRes.data.id,
      });
      toast.success(
        "Verification successful. Two-factor authentication enabled."
      );
      /* reset data + go back to settings */
      resetData();
      return;
    }
    // otherwise we need to verify the phone number
    const verifyRes = await MfaService.requestPhoneVerificationCode({
      id: phoneRes.data.id,
    });
    state.currentMethodId = phoneRes.data.id;
    state.currentInputPhoneEmail = {
      value: phoneRes.data.phone_number,
      display: phone_format(phoneRes.data.phone_number),
    };
    state.sessionToken = verifyRes.data.session_token;
    state.fetching = false;
    setCurrentStep(VERIFY_NEW_METHOD);
  } catch (e) {
    state.fetching = false;

    const defaultErrorMessage = "Unable to add new phone number.";

    if (e.response?.status >= 500) {
      state.errorMessage = defaultErrorMessage;
      state.error = true;
      return;
    }

    const errors = Object.values(e.response?.data) ||
      e.response?.data || [defaultErrorMessage];
    state.errorMessage = errors.join(", ");
    state.error = true;
  }
};
const addNewPersonalEmail = async (email) => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    const emailRes = await MfaService.addPersonalEmail({ email });
    /* if that email is already saved to their account */
    if (emailRes.data?.verified) {
      await MfaService.addMfaDevice({
        deviceId: navigator.userAgent,
        method: state.selectedMethod,
        methodId: emailRes.data.id,
      });
      toast.success(
        "Verification successful. Two-factor authentication enabled."
      );
      resetData();
      return;
    }
    /* otherwise we need to verify the email at email endpoint */
    const verifyRes = await MfaService.requestEmailVerificationCode({
      id: emailRes.data.id,
    });
    state.currentMethodId = emailRes.data.id;
    state.currentInputPhoneEmail = {
      value: emailRes.data.email,
      display: emailRes.data.email,
    };
    state.sessionToken = verifyRes.data.session_token;
    state.fetching = false;
    setCurrentStep(VERIFY_NEW_METHOD);
  } catch (e) {
    state.fetching = false;
    const errors = e.response?.data?.errors
      ? Object.values(e.response?.data?.errors)
      : e.response?.data
        ? e.response?.data
        : ["Unable to add new email."];
    state.errorMessage = errors.join(", ");
    state.error = true;
  }
};
const resendEmailCode = async () => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    const verifyRes = await MfaService.requestEmailVerificationCode({
      id: state.currentMethodId,
    });
    state.sessionToken = verifyRes.data.session_token;
    state.fetching = false;
  } catch (e) {
    state.errorMessage =
      e.response?.data?.join(", ") ||
      "Something went wrong, please try again later.";
    state.error = true;
    state.fetching = false;
  }
};
const resendPhoneCode = async () => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    const verifyRes = await MfaService.requestPhoneVerificationCode({
      id: state.currentMethodId,
    });
    state.sessionToken = verifyRes.data.session_token;
    state.fetching = false;
  } catch (e) {
    state.errorMessage = e.response?.data?.join(", ");
    state.error = true;
    state.fetching = false;
  }
};
const verifyPhoneTotpCode = async () => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    await MfaService.validatePhoneVerificationCode({
      id: state.currentMethodId,
      phoneNumber: state.currentInputPhoneEmail.value,
      totpToken: state.totpToken,
      sessionToken: state.sessionToken,
    });
    addNewMfaDeviceForVerifiedMethod(state.currentMethodId, true, "phone");
    state.fetching = false;
  } catch {
    state.fetching = false;
    state.errorMessage = "Verification code is incorrect.";
    state.error = true;
  }
};

const addTotpDevice = async () => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    const res = await MfaService.addMfaDevice({
      deviceId: navigator.userAgent,
      method: state.selectedMethod,
      // no need for methodId for TOTP, we only allow one TOTP device
    });
    // decrypted in transit-encryption
    state.totpUrl = res.data.totp.uri;
    state.totpPng = res.data.totp.png;
    // again no methodId for TOTP
    // state.currentMethodId = res.data.id;
    state.sessionToken = res.data.session_token;
    state.fetching = false;
  } catch {
    state.fetching = false;
    state.errorMessage =
      "Unable to add generate TOTP QR code. Please try again later.";
    state.error = true;
  }
};
const verifyAuthAppTotpCode = async () => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    await MfaService.verifyVerificationCode({
      deviceId: navigator.userAgent,
      totpToken: state.totpToken,
      sessionToken: state.sessionToken,
      method: "totp",
    });
    state.fetching = false;
    toast.success("Two-factor authentication enabled.");
    resetData();
  } catch {
    state.fetching = false;
    state.errorMessage = "Verification code is incorrect.";
    state.error = true;
  }
};
const verifyEmailTotpCode = async () => {
  try {
    state.error = false;
    state.errorMessage = "";
    state.fetching = true;
    await MfaService.validateEmailVerificationCode({
      id: state.currentMethodId,
      email: state.currentInputPhoneEmail.value,
      totpToken: state.totpToken,
      sessionToken: state.sessionToken,
    });
    addNewMfaDeviceForVerifiedMethod(state.currentMethodId, true, "email");
    state.fetching = false;
  } catch {
    state.fetching = false;
    state.errorMessage = "Verification code is incorrect.";
    state.error = true;
  }
};
const verifyUserPassword = () => {
  state.error = false;
  state.errorMessage = "";
  state.fetching = true;
  setTimeout(() => {
    verifyPassword();
  }, 100);
};
const verifyPassword = async () => {
  try {
    state.error = false;
    state.errorMessage = "";
    const hash = await password_confirm(state.currentPassword);
    const user = store.getters["authentication/user"];
    const userId = user.id;
    const passwordIsCorrect = await AuthService.confirmPassword(userId, hash);
    state.fetching = false;

    if (passwordIsCorrect) {
      setCurrentStep(CHOOSE_METHOD);
      state.error = false;
      state.errorMessage = "";
    }
  } catch (e) {
    state.fetching = false;
    state.errorMessage =
      e.response?.data?.password?.join(", ") ||
      "Invalid password, please try again.";
    state.error = true;
  }
};
const getAvailableMfaMethods = async () => {
  const baseMethods = ["sms", "email"];
  // tbd, this still has call as a mthd
  await MfaService.getAvailableMfaMethods();
  const posthog = await getPosthog();
  posthog?.onFeatureFlags(() => {
    if (
      posthog?.isFeatureEnabled(PH_EVENT_CLOAKED_AUTH_TOTP_MFA_ENABLED) &&
      !props.userHasTotpActivated
    ) {
      /* Hide TOTP if already enabled ie userHasTotpActivated, can only be enabled once */
      baseMethods.unshift("totp");
      state.availableMethods = baseMethods;
    }
  });
  state.availableMethods = baseMethods;
};
const refresh = () => {
  emit("refresh");
  emit("email-verified", {
    verified: true,
  });
  emit("phone-verified", {
    verified: true,
  });
  window.dispatchEvent(new CustomEvent("cloak:refresh-emails"));
};

const copy = (value) => {
  tools.copyToClipboard(value);
};

watch(
  () => state.currentPassword,
  (newVal, oldValue) => {
    if (oldValue !== newVal) {
      state.error = false;
      state.errorMessage = "";
    }
  },
  { deep: true }
);

watch(
  () => state.newPersonalPhone,
  (newVal, oldValue) => {
    if (oldValue !== newVal) {
      state.error = false;
      state.errorMessage = "";
    }
  },
  { deep: true }
);

watch(
  () => state.newPersonalEmail,
  (newVal, oldValue) => {
    if (oldValue !== newVal) {
      state.error = false;
      state.errorMessage = "";
    }
  },
  { deep: true }
);

watch(
  () => state.currentStep,
  (newVal, oldValue) => {
    if (oldValue !== newVal) {
      state.totpToken = "";
    }
  },
  { deep: true }
);
</script>
<template>
  <PreferencesPanel class="panel-offset">
    <template #header>
      <PreferencesHeader @go-back="toggleBack" />
    </template>

    <div v-if="state.currentStep === ENTER_PASSWORD">
      <div class="mfa-header">
        <PreferencesTitle>Enter your password</PreferencesTitle>
        <PreferencesParagraph>
          For security purposes, please re-enter your password.
        </PreferencesParagraph>
      </div>

      <PreferencesInput
        :value="state.currentPassword"
        label="Password"
        type="password"
        placeholder=""
        :error="!!state.error"
        @input="(event) => (state.currentPassword = event)"
        @save="verifyUserPassword"
      />

      <div
        v-if="state.error"
        class="message"
      >
        <BaseText
          variant="body-small-medium"
          as="p"
        >
          {{ state.errorMessage }}
        </BaseText>
      </div>
      <div class="mfa-button">
        <Button
          :loading="state.fetching"
          :disabled="state.fetching || !state.currentPassword"
          @click="verifyUserPassword"
        >
          Continue
        </Button>
      </div>
    </div>

    <div v-if="state.currentStep === CHOOSE_METHOD">
      <div class="mfa-header">
        <PreferencesTitle>Set up two-factor authentication</PreferencesTitle>
        <PreferencesParagraph>
          Choose a method for two-factor authentication.
        </PreferencesParagraph>
      </div>

      <ValueDisplay
        v-for="availableMethod in state.availableMethods"
        :key="availableMethod"
        :label="`${getMethodDisplayText(availableMethod)}`"
        @click="setSelectedMethod(availableMethod)"
      >
        <template #pre-field>
          <InlineSvg
            v-if="availableMethod === 'email'"
            name="email-outline"
          />
          <InlineSvg
            v-else-if="availableMethod === 'call'"
            name="phone-outline"
          />
          <InlineSvg
            v-else-if="availableMethod === 'sms'"
            name="chat-outline"
          />
          <InlineSvg
            v-else-if="availableMethod === 'totp'"
            name="totp-mfa"
          />
        </template>
      </ValueDisplay>
    </div>

    <div v-if="state.selectedMethod === 'totp'">
      <div v-if="state.currentStep === ADD_NEW_METHOD">
        <PreferencesTitle>Verify with authenticator app</PreferencesTitle>
        <PreferencesParagraph>
          1. Scan the QR code or enter the url in your authenticator app
        </PreferencesParagraph>
        <div class="qr-code">
          <div class="qr-code__code">
            <Spinner v-if="!state.totpPng" />
            <img
              v-else-if="state.totpPng"
              :src="`data:image/png;base64,${state.totpPng}`"
            />
          </div>
          <div class="qr-code__right">
            <div class="qr-code__label">
              <BaseText
                as="div"
                variant="body-small-medium"
              >
                OTP Auth Url
              </BaseText>
              <div>
                <InlineSvg
                  name="copy"
                  style="cursor: pointer"
                  @click="copy(state.totpUrl)"
                />
              </div>
            </div>
            <div class="qr-code__body">
              <BaseText
                v-if="state.totpUrl"
                as="a"
                variant="body-2-semibold"
              >
                {{ state.totpUrl }}
              </BaseText>
            </div>
          </div>
        </div>
        <PreferencesParagraph>
          2. Once you've scanned the code or entered the URL into your app,
          click the button below to enter the code from your authenticator app.
        </PreferencesParagraph>

        <Button @click="setCurrentStep(VERIFY_NEW_METHOD)">
          Enter six-digit code
        </Button>
      </div>

      <div v-if="state.currentStep === VERIFY_NEW_METHOD">
        <div class="mfa-header">
          <PreferencesTitle>Enter verification code</PreferencesTitle>
          <PreferencesParagraph>
            Enter the six-digit code from your authenticator app to continue.
          </PreferencesParagraph>
        </div>
        <BaseInputOtp
          v-bind="attrs"
          v-model="state.totpToken"
          @input="(e) => e.target.value.length === 6 && verifyAuthAppTotpCode()"
        />

        <div
          v-if="state.error"
          class="message"
        >
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            {{ state.errorMessage }}
          </BaseText>
        </div>
        <div class="mfa-button">
          <Button
            :loading="state.fetching"
            :disabled="state.fetching || !state.totpToken"
            @click="() => verifyAuthAppTotpCode()"
          >
            Verify code
          </Button>
        </div>
      </div>
    </div>

    <div
      v-if="state.selectedMethod === 'call' || state.selectedMethod === 'sms'"
    >
      <div v-if="state.currentStep === SELECT_METHOD_DEVICE">
        <div class="mfa-header">
          <PreferencesTitle>Choose a phone number</PreferencesTitle>
        </div>
        <ValueDisplay
          v-for="verifiedPhoneNumber in state.verifiedPhoneNumbers"
          :key="verifiedPhoneNumber.id"
          label="Verified phone number"
          :value="verifiedPhoneNumber?.formattedPhoneNumber"
          @click="
            addNewMfaDeviceForVerifiedMethod(
              verifiedPhoneNumber.id,
              verifiedPhoneNumber.verified,
              state.selectedMethod === 'call' || state.selectedMethod === 'sms'
                ? 'phone'
                : 'email'
            )
          "
        />
        <ValueDisplay
          :label="
            state.verifiedPhoneNumbers?.length > 0
              ? 'Use a different phone number'
              : 'Add a phone number'
          "
          @click="setCurrentStep(ADD_NEW_METHOD)"
        />
      </div>

      <div v-if="state.currentStep === ADD_NEW_METHOD">
        <div class="mfa-header">
          <PreferencesTitle>
            {{ state.currentMethodDisplayText }}
          </PreferencesTitle>
          <PreferencesParagraph>
            Add a phone number to use for two-factor authentication.
          </PreferencesParagraph>
        </div>
        <PreferencesInput
          :value="state.newPersonalPhone"
          label="Phone number"
          type="tel"
          placeholder=""
          :error="state.error"
          @input="(event) => (state.newPersonalPhone = event)"
          @save="() => addNewPersonalPhone(state.newPersonalPhone)"
        />
        <div
          v-if="state.error"
          class="message"
        >
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            {{ state.errorMessage }}
          </BaseText>
        </div>
        <div class="mfa-button">
          <Button
            :loading="state.fetching"
            :disabled="
              state.fetching ||
              !state.newPersonalPhone ||
              !phone(state.newPersonalPhone)
            "
            @click="() => addNewPersonalPhone(state.newPersonalPhone)"
          >
            Continue
          </Button>
        </div>
      </div>

      <div v-if="state.currentStep === VERIFY_NEW_METHOD">
        <div class="mfa-header">
          <PreferencesTitle>Enter verification code</PreferencesTitle>
          <PreferencesParagraph>
            Please enter the code we sent to
            {{ state.currentInputPhoneEmail.display }}
          </PreferencesParagraph>
        </div>
        <div class="resend-btn-wrapper">
          <BaseText
            as="a"
            variant="headline-6-medium"
            class="resend"
            @click="resendPhoneCode"
          >
            Resend code
          </BaseText>
        </div>
        <BaseInputOtp
          v-bind="attrs"
          v-model="state.totpToken"
          @input="(e) => e.target.value.length === 6 && verifyPhoneTotpCode()"
        />
        <div
          v-if="state.error"
          class="message"
        >
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            {{ state.errorMessage }}
          </BaseText>
        </div>
        <div class="mfa-button">
          <Button
            :loading="state.fetching"
            :disabled="state.fetching || !state.totpToken"
            @click="() => verifyPhoneTotpCode()"
          >
            Verify code
          </Button>
        </div>
      </div>
    </div>

    <div v-if="state.selectedMethod === 'email'">
      <div v-if="state.currentStep === SELECT_METHOD_DEVICE">
        <div class="mfa-header">
          <PreferencesTitle>Choose an email address</PreferencesTitle>
          <PreferencesParagraph>
            Add an email address to use with two-factor authentication.
          </PreferencesParagraph>
        </div>
        <ValueDisplay
          v-for="verifiedEmail in state.verifiedEmails"
          :key="verifiedEmail.id"
          label="Verified email address"
          :value="verifiedEmail?.email"
          @click="
            addNewMfaDeviceForVerifiedMethod(
              verifiedEmail.id,
              verifiedEmail.verified,
              state.selectedMethod
            )
          "
        />
        <ValueDisplay
          :label="
            state.verifiedEmails?.length > 0
              ? 'Use a different email address'
              : 'Add an email address'
          "
          @click="setCurrentStep(ADD_NEW_METHOD)"
        />
      </div>

      <div v-if="state.currentStep === ADD_NEW_METHOD">
        <div class="mfa-header">
          <PreferencesTitle>
            {{ state.currentMethodDisplayText }}
          </PreferencesTitle>
          <PreferencesParagraph>
            Add an email address to use with two-factor authentication.
          </PreferencesParagraph>
        </div>
        <PreferencesInput
          :value="state.newPersonalEmail"
          label="Email address"
          type="text"
          placeholder=""
          :error="state.error"
          @input="(event) => (state.newPersonalEmail = event)"
          @save="() => addNewPersonalEmail(state.newPersonalEmail)"
        />
        <div
          v-if="state.error"
          class="message"
        >
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            {{ state.errorMessage }}
          </BaseText>
        </div>
        <div class="mfa-button">
          <Button
            :loading="state.fetching"
            :disabled="state.fetching || !state.newPersonalEmail"
            @click="() => addNewPersonalEmail(state.newPersonalEmail)"
          >
            Continue
          </Button>
        </div>
      </div>

      <div v-if="state.currentStep === VERIFY_NEW_METHOD">
        <div class="mfa-header">
          <PreferencesTitle>Enter verification code</PreferencesTitle>
          <PreferencesParagraph>
            Please enter the code we sent to
            {{ state.currentInputPhoneEmail.display }}
          </PreferencesParagraph>
        </div>
        <div class="resend-btn-wrapper">
          <BaseText
            as="a"
            variant="headline-6-medium"
            class="resend"
            @click="resendEmailCode"
          >
            Resend code
          </BaseText>
        </div>
        <BaseInputOtp
          v-bind="attrs"
          v-model="state.totpToken"
          @input="(e) => e.target.value.length === 6 && verifyEmailTotpCode()"
        />

        <div
          v-if="state.error"
          class="message"
        >
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            {{ state.errorMessage }}
          </BaseText>
        </div>
        <div class="mfa-button">
          <Button
            :loading="state.fetching"
            :disabled="state.fetching || !state.totpToken"
            @click="() => verifyEmailTotpCode()"
          >
            Verify code
          </Button>
        </div>
      </div>
    </div>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.mfa-button {
  padding-top: 32px;
}
.mfa-header {
  padding-bottom: 32px;
  .preferences-title {
    font-size: 24px;
    font-weight: 500;
  }
}
.resend-btn-wrapper {
  margin-bottom: 16px;
  .resend {
    color: $color-primary-100;
    cursor: pointer;
    text-decoration: underline;
  }
}
.qr-code {
  display: flex;
  border-radius: 8px;
  border: 3px solid $color-primary-10;
  padding: 8px;
  margin-top: 16px;
  margin-bottom: 40px;
  max-width: 460px;

  &__code {
    height: 220px;
    width: 220px;
    text-align: center;
    justify-content: center;
    display: flex;

    img {
      height: 220px;
      width: 220px;
    }
    svg {
      margin: auto;
    }
  }
  &__right {
    display: flex;
    flex-direction: column;
    padding: 16px;
    width: 100%;
    max-width: 220px;
    position: relative;
    a {
      font-size: 14px;
      color: $color-primary-100;
      text-decoration: underline;
      font-weight: 500;
      max-width: 100%;
      word-wrap: break-word;
    }
  }
  &__label {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    color: $color-primary-70;
  }
  &__body {
    display: flex;
    padding-top: 16px;
    margin: auto;
    max-width: 100%;
  }
}
.message {
  color: $color-alert;
  margin-top: 5px;
  position: absolute;
}
.onboarding-input-code {
  margin: 32px 0 0 0;
}
</style>
