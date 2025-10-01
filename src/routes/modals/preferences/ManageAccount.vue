<script setup>
import moment from "moment";
import { get } from "lodash-es";
import ValueDisplay from "@/features/ui/value-display";
import { logout } from "@/scripts/actions/auth";
import { password_confirm } from "@/scripts/actions/encryption";
import AuthService from "@/api/actions/auth-service";
import UserService from "@/api/actions/user-service";
import store from "@/store";

import { computed, reactive, watch, ref } from "vue";

import { useToast } from "@/composables/useToast.js";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import PreferencesCheckParagraph from "@/routes/modals/preferences/PreferencesCheckParagraph.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import Button from "@/features/Button.vue";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import BaseText from "@/library/BaseText.vue";

const toast = useToast();

const emit = defineEmits(["toggleBack", "refreshUser"]);

const options = {
  RESTORE: "RESTORE",
  DELETE: "DELETE",
};

const state = reactive({
  step: 0,
  loadingRestore: false,
  loadingDelete: false,
  selectedOption: null,
  userUnderstands: false,
  password: "",
  invalidPassword: false,
  loadingPassword: false,
  otpResponseData: null,
});
const user = computed(() => store.state.authentication?.user);
const preferencesStep = computed(() => store.state.ui.preference.step);

const isPasswordless = computed(() => {
  return store.getters["authentication/user"]?.is_passwordless;
});

const verificationCode = ref("");

const deleteDateLabel = computed(() => {
  const deleteDate = get(user.value, "deletion_date");
  let then = moment().add(30, "days");

  if (deleteDate) {
    then = moment(deleteDate);
  }

  return then.format("LL");
});

const steps = computed(() => {
  const steps = {
    [options.RESTORE]: ["manage", "restore"],
    [options.DELETE]: ["manage", "delete-verification", "delete-confirmation"],
  };

  if (!state.selectedOption || !steps[state.selectedOption]) {
    return ["manage"];
  }

  return steps[state.selectedOption];
});

const currentStep = computed(() => {
  return steps.value[state.step];
});

watch(
  preferencesStep,
  () => {
    if (preferencesStep.value === "restore") {
      state.selectedOption = options.RESTORE;
      state.step = steps.value.findIndex((item) => item === "restore");
    }
    if (preferencesStep.value === "manage") {
      state.selectedOption = null;
      state.step = 0;
    }
  },
  {
    immediate: true,
  }
);

function insertUser(data) {
  store.commit("authentication/setUser", data);
  emit("refreshUser");
}

function nextStep(skipToStep) {
  let next = state.step + 1;
  if (skipToStep) {
    next = skipToStep;
  }
  const maxStep = steps.value.length - 1;

  if (next >= maxStep) {
    next = maxStep;
  }

  state.step = next;
}

function handleDelete() {
  state.loadingDelete = true;

  const userId = user.value.id;
  const payload = {
    state: "pending_deletion",
    immediate_delete: true,
  };

  if (isPasswordless.value) {
    payload.otp_code = verificationCode.value;
    payload.otp_session_token = state.otpResponseData.otp_session_token;
    payload.number_hash = state.otpResponseData.number_hash;
  }

  UserService.deleteUserAccount({ userId, payload })
    .then(logout)
    .catch(() => {
      toast.error("Error deleting account");
    })
    .finally(() => {
      state.loadingDelete = false;
    });
}

function handleRestore() {
  state.loadingRestore = true;

  const userId = user?.value?.id;
  const payload = {
    state: "active",
    immediate_delete: false,
  };

  UserService.deleteUserAccount({ userId, payload })
    .then(({ data }) => {
      insertUser(data);
      store.dispatch("subscription/restoreSubscription");
      toast.success("Account restored");
      emit("toggleBack");
    })
    .catch(() => {
      toast.error("Error restoring account");
    })
    .finally(() => {
      state.loadingRestore = false;
    });
}

function setOption(option, skipToStep) {
  state.selectedOption = option;
  nextStep(skipToStep);
}

function handleGoBack() {
  if (state.step > 0) {
    state.step = state.step - 1;
  } else {
    emit("toggleBack");
  }
}

async function validatePassword() {
  const userId = user.value.id;
  let password = state.password;
  if (store.state.authentication?.user?.encryption_status === 3) {
    password = await password_confirm(password);
  }
  state.loadingPassword = true;
  AuthService.confirmPassword(userId, password)
    .then(() => {
      state.invalidPassword = false;
      nextStep();
    })
    .catch(() => {
      state.invalidPassword = true;
      toast.error("Invalid password, please try again");
    })
    .finally(() => {
      state.loadingPassword = false;
    });
}

function sendOTPCode() {
  UserService.requestDeleteAccountOTP()
    .then((response) => {
      state.otpResponseData = response?.data?.detail;
      toast.success("OTP code sent successfully");
    })
    .catch(() => {
      toast.error("Failed to send OTP code");
    });
}

function requestPermDelete() {
  if (isPasswordless.value) {
    sendOTPCode();
    setOption(options.DELETE, 2);
  } else {
    setOption(options.DELETE);
  }
}
</script>

<template>
  <PreferencesPanel class="manage-account">
    <template #header>
      <PreferencesHeader @go-back="handleGoBack" />
    </template>

    <template v-if="currentStep === 'manage'">
      <PreferencesTitle>Manage account</PreferencesTitle>
      <PreferencesParagraph>
        Your account is scheduled to be deleted on
        <strong>{{ deleteDateLabel }}</strong>
        . You can restore your account at any time before this date to continue
        using Cloaked.
      </PreferencesParagraph>

      <PreferencesParagraph>
        You can also delete your account now instead of waiting until
        <strong>{{ deleteDateLabel }}</strong>
        .
      </PreferencesParagraph>

      <div class="manage-account__options">
        <ValueDisplay
          label="Restore my account"
          dark-label
          @click="setOption(options.RESTORE)"
        />

        <ValueDisplay
          label="Permanently delete my account now"
          danger
          @click="requestPermDelete"
        />
      </div>
    </template>

    <template v-if="currentStep === 'restore'">
      <PreferencesTitle>Restore account</PreferencesTitle>
      <PreferencesParagraph>
        This will cancel the account deletion process and restore your Cloaked
        account. You won't lose any of your account data and will be able to
        continue using Cloaked.
      </PreferencesParagraph>
    </template>

    <template v-if="currentStep === 'delete-verification'">
      <PreferencesTitle>Delete account now</PreferencesTitle>
      <PreferencesParagraph>
        To continue, enter your account password.
      </PreferencesParagraph>

      <PreferencesInput
        :value="state.password"
        label="Password"
        type="password"
        placeholder="Your Password"
        :error="state.invalidPassword"
        :disabled="state.loadingPassword"
        @input="(event) => (state.password = event)"
        @save="validatePassword"
      />
    </template>

    <template v-if="currentStep === 'delete-confirmation'">
      <PreferencesTitle>Delete account now</PreferencesTitle>
      <PreferencesParagraph>
        This will permanently delete all data associated with your Cloaked
        identities including email addresses, phone numbers, passwords,
        usernames, and notes.
      </PreferencesParagraph>

      <PreferencesParagraph>
        You will no longer be able to send and receive emails, texts, and calls
        from any of your Cloaked identities. This may also affect your ability
        to log in to websites associated with your Cloaked identities.
      </PreferencesParagraph>

      <PreferencesParagraph>
        <strong>This action cannot be undone.</strong>
        You will automatically lose access to your Cloaked account.
      </PreferencesParagraph>

      <PreferencesCheckParagraph
        class="disclaimer-row"
        :value="state.userUnderstands"
        @input="(event) => (state.userUnderstands = event)"
      >
        I understand my account, my identities, and all of my data will be
        permanently deleted and cannot be retrieved.
      </PreferencesCheckParagraph>
      <div
        v-if="isPasswordless"
        class="passwordless-delete"
      >
        <BaseText variant="headline-6-medium">
          Enter the code sent to {{ state.otpResponseData?.number_masked }}
        </BaseText>
        <BaseInputOtp
          v-if="isPasswordless"
          ref="verificationCodeInput"
          v-model="verificationCode"
        />
        <BaseText
          variant="body-small-medium"
          as="div"
          class="passwordless-text-resend"
          @click="sendOTPCode"
        >
          Resend Code
        </BaseText>
      </div>
    </template>

    <template #footer>
      <PreferencesFooter v-if="currentStep === 'restore'">
        <Button
          :loading="state.loadingRestore"
          :disabled="state.loadingRestore"
          @click="handleRestore"
        >
          Restore my account
        </Button>
      </PreferencesFooter>

      <PreferencesFooter v-if="currentStep === 'delete-verification'">
        <Button
          :disabled="!state.password || state.loadingPassword"
          @click="validatePassword"
        >
          Continue
        </Button>
      </PreferencesFooter>

      <PreferencesFooter v-if="currentStep === 'delete-confirmation'">
        <Button
          type="danger"
          :disabled="
            !state.userUnderstands ||
            state.loadingDelete ||
            (isPasswordless && verificationCode.length !== 6)
          "
          @click="handleDelete"
        >
          Delete account now
        </Button>
      </PreferencesFooter>
    </template>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.manage-account {
  display: flex;
  flex-direction: column;

  &__body {
    flex: 1 1 auto;
    overflow-y: auto;
  }

  &__options {
    margin-top: 24px;
  }

  .preferences-input {
    margin-top: 37px;
  }
}
.passwordless-delete {
  color: $color-primary-100;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
  max-width: 400px;
  .passwordless-text-resend {
    color: $color-primary-100;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 8px;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
