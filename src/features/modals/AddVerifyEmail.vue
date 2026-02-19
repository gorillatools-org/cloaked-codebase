<script setup>
import store from "@/store";
import { email } from "@/scripts/validation";
import ModalTemplate from "@/features/ModalTemplate.vue";
import OnboardingInputEmail from "@/features/onboarding/OnboardingInputEmail";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import EmailService from "@/api/actions/email-service";
import { useToast } from "@/composables/useToast.js";

import { computed, reactive, watch, ref, onMounted } from "vue";
import Button from "@/features/Button.vue";

const toast = useToast();

const emit = defineEmits(["cancel", "email-verified", "email-created"]);

const props = defineProps({
  setPrimary: {
    type: Boolean,
    default: false,
  },
  isMigration: {
    type: Boolean,
    default: false,
  },
  logout: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
});

const state = reactive({
  emailDirty: false,
  email: "",
  emailError: null,
  emailVerified: false,
  confirming: false,
  token: null,
  codeError: null,
  verifying: null,
  verified: false,
  savingEmail: false,
  saving: null,
  loading: true,
  logoutStep: false,
});

const emailInputRef = ref(null);
const verifyRef = ref(null);
const verificationCode = ref("");

watch(
  () => state.email,
  () => {
    state.emailVerified = false;
  },
  { deep: true }
);

onMounted(() => {
  emailInputRef.value?.$el?.querySelector("input")?.focus();
});

const validEmail = computed(() => {
  if (state.email) {
    return email(state.email);
  }
  return false;
});

const validCode = computed(() => {
  if (verificationCode.value) {
    return verificationCode.value?.match(/[0-9]{6}/i);
  }
  return false;
});

function handleEmailInput($event) {
  state.email = $event.target.value;
}

function handleCancel() {
  emit("cancel");
  handleClose();
}

function handleClose() {
  if (!props.isMigration) {
    store.dispatch("closeModal");
  }
}

async function saveEmail() {
  if (validEmail.value && !state.savingEmail) {
    state.emailError = null;
    state.savingEmail = true;

    const payload = {
      email: state.email.toLowerCase(),
      primary: !!props.setPrimary,
      collection_name: "email",
      collection: store.getters["authentication/collection"]("email"),
      user: store.state.authentication?.user?.url,
    };

    try {
      const { data: email } = await EmailService.addEmail(payload);
      state.emailDirty = false;
      if (!email.verified) {
        confirmContact(email);
      } else {
        await EmailService.makePrimary(email.id);
        emit("email-created", { ...email, primary: true });
        if (props.isMigration && props.logout) {
          state.logoutStep = true;
          return;
        }
        handleClose();
        toast.success("Email address added.");
      }
    } catch (err) {
      state.savingEmail = false;
      const { response } = err;
      const { data } = response;
      let errors = data.errors || data;
      if (errors?.non_field_errors?.length > 0) {
        errors = errors.non_field_errors
          .map((errorMessage) => errorMessage)
          .join("\n");
      }
      if (errors.email) {
        errors = errors.email;
      }
      if (Array.isArray(errors)) {
        state.emailError = errors.join("\n");
      } else {
        state.emailError = errors;
      }
    }
  }
}

function confirmContact(email) {
  state.saving = email;
  state.loading = true;
  state.confirming = true;
  EmailService.sendVerificationCode(email.id)
    .then((verify_response) => {
      toast.success("Verification code sent.");
      if (!verify_response.data.verified) {
        state.loading = false;
        state.token = verify_response.data.session_token;
        setTimeout(() => {
          verifyRef.value?.$el?.focus();
        }, 100);
      }
    })
    .catch(() => {
      toast.error("Error resending verification code.");
    });
}

function resend() {
  state.loading = true;
  state.codeError = null;
  verificationCode.value = "";
  EmailService.sendVerificationCode(state.saving.id)
    .then((verify_response) => {
      toast.success("Verification code sent.");
      if (!verify_response.data.verified) {
        state.token = verify_response.data.session_token;
      }
      state.loading = false;
      setTimeout(() => {
        verifyRef.value?.$el?.focus();
      }, 100);
    })
    .catch(() => {
      toast.error("Error resending verification code.");
    });
}

async function verify() {
  if (verificationCode.value && !state.verifying && !state.verified) {
    state.codeError = null;
    state.verifying = true;

    try {
      await EmailService.verifyVerificationCode(state.saving.id, {
        security_code: verificationCode.value,
        email: state.saving.email,
        session_token: state.token,
      });

      await EmailService.makePrimary(state.saving.id);
      toast.success("Verification successful.");
      if (props.isMigration && props.logout) {
        state.logoutStep = true;
        return;
      }
      state.verifying = false;
      state.verified = true;
      window.dispatchEvent(new CustomEvent("cloak:refresh-emails"));
      handleClose();
      const newEmail = {
        ...state.saving,
        verified: true,
        primary: true,
      };

      store.dispatch("settings/saveNewPersonalEmail", newEmail);
      emit("email-verified", {
        ...state.saving,
        verified: true,
      });
    } catch {
      toast.error("Error with verification.");
      state.verifying = false;
      state.verified = false;
      state.codeError = "Verification code is incorrect.";
    }
  }
}
</script>

<template>
  <ModalTemplate
    class="add-verify-email-mail"
    :show="true"
    @close="handleCancel"
  >
    <template #header>
      <div v-if="props.isMigration && state.logoutStep">
        <h1>Sign in to continue</h1>
      </div>
      <div v-else-if="!state.confirming">
        <h1>{{ props.title || "Add an email address" }}</h1>
      </div>
      <div v-else>
        <h1>Verify your email address</h1>
      </div>
    </template>

    <template #body>
      <div
        v-if="props.isMigration && state.logoutStep"
        class="subheader"
      >
        In order to finish your security upgrade, we need to log you out of your
        Cloaked account. Please sign in again to complete the upgrade.
      </div>
      <div
        v-else-if="!state.confirming"
        class="subheader"
      >
        <OnboardingInputEmail
          ref="emailInputRef"
          :value="state.email"
          placeholder="Email"
          @input="handleEmailInput"
          @keydown.enter="saveEmail"
        />
      </div>
      <div
        v-else
        class="subheader"
      >
        Enter the 6-digit code sent to
        <strong>{{ state.email }}</strong>
        <br />
        <BaseInputOtp
          ref="verifyRef"
          v-model="verificationCode"
          class="otp-input"
          @keydown.enter="verify"
        />
      </div>
      <div
        v-if="state.emailError || state.codeError"
        class="input_error"
      >
        {{ state.emailError || state.codeError }}
      </div>
    </template>
    <template #footer>
      <template v-if="props.isMigration && state.logoutStep">
        <Button @click="props.logout">Continue</Button>
      </template>
      <template v-else-if="!state.confirming">
        <Button
          v-if="!props.isMigration"
          type="secondary"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button
          :disabled="!validEmail"
          @click="saveEmail"
        >
          Continue
        </Button>
      </template>
      <template v-else>
        <Button
          v-if="props.isMigration"
          type="secondary"
          @click="
            state.confirming = false;
            savingEmail = false;
          "
        >
          Back
        </Button>
        <Button
          type="secondary"
          @click="resend"
        >
          <span
            v-if="state.loading"
            class="spin-loader"
          />
          Resend code
        </Button>

        <Button
          :disabled="!validCode"
          @click="verify"
        >
          Verify
        </Button>
      </template>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.add-verify-email-mail {
  color: $color-primary-100;

  .content {
    max-width: 512px !important;
  }

  .onboarding-input-email {
    width: 100% !important;
    border-radius: 10px;
    background-color: $color-primary-5;
  }

  .ui-confirm-code {
    margin-top: 32px;
  }

  .input_error {
    font-size: 12px;
    color: $color-alert;
    border: 1px solid $color-alert;
    border-radius: 10px;
    padding: 10px;
    margin: 20px 0 5px;
    background-color: #f82f2810;
  }
  .subheader {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    .otp-input {
      margin-top: 12px;
    }
  }
}
</style>
