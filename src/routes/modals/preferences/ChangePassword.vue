<script setup>
import { uniq } from "lodash-es";

import UserService from "@/api/actions/user-service";

import { password } from "@/scripts/validation";
import { change_password, sanity_check } from "@/scripts/actions/encryption";
import PasswordStrength from "@/features/password/PasswordStrength";

import { reactive, computed, watch, nextTick } from "vue";

import store from "@/store";

import { useToast } from "@/composables/useToast.js";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import Button from "@/features/Button.vue";
import BaseText from "@/library/BaseText.vue";

const toast = useToast();

let timeout;

const emit = defineEmits(["toggleBack"]);

const state = reactive({
  saved: false,
  clicked: false,
  passwordStrenghCheck: false,
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  confirmPasswordError: false,
  newPasswordError: "",
  loading: false,
  fieldErrors: {},
});

watch(
  () => state.newPassword,
  () => {
    state.newPasswordError = "";
    state.confirmPasswordError = false;
  },
  { deep: true }
);

watch(
  () => state.confirmPassword,
  () => {
    state.confirmPasswordError = false;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      if (state.newPassword !== state.confirmPassword) {
        state.confirmPasswordError = true;
      }
    }, 500);
  },
  { deep: true }
);

const disabled = computed(() => {
  const all_are_set =
    state.currentPassword && state.newPassword && state.confirmPassword;
  const no_errors = !state.confirmPasswordError && !state.newPasswordError;
  const password_confirmed = state.newPassword === state.confirmPassword;
  const password_strong_enough = state.passwordStrenghCheck;
  if (
    all_are_set &&
    no_errors &&
    password_confirmed &&
    password_strong_enough
  ) {
    return false;
  }
  return true;
});

const passwordsMatch = computed(() => {
  return state.confirmPassword === state.newPassword;
});

const showPasswordsMatchError = computed(() => {
  if (state.confirmPassword && state.newPassword) {
    return !passwordsMatch.value;
  }

  return false;
});

const loading = computed(() => {
  return state.loading;
});

function setCheck(value) {
  state.passwordStrenghCheck = value;
}

function check(field, value) {
  delete state.fieldErrors[field];

  if (!value) {
    return;
  }

  const errorMessage =
    "Password must only include letters, numbers, and symbols from 8 to 20 characters";

  if (!password(value)) {
    state.fieldErrors[field] = errorMessage;
  }
}

function checkPassword({ name, value }) {
  check(name, value);
}

function handleChangePassword() {
  if (state.loading) return;
  state.loading = true;
  nextTick(() => {
    const userIsV2User =
      store.state.authentication?.user?.encryption_status === 3;
    if (userIsV2User) {
      changePasswordV2();
    } else {
      changePasswordV1();
    }
  });
}
async function changePasswordV2() {
  const { encryptedPrivateKey, passwordAuthKey, currentPassword } =
    await change_password(
      state.currentPassword,
      state.newPassword,
      store.state.authentication.encryption.account_salt,
      store.state.authentication.encryption.private_key
    );
  const check = await sanity_check(
    store.state.authentication.encryption.account_salt,
    state.newPassword,
    store.state.authentication.encryption.private_key,
    encryptedPrivateKey
  );
  if (check) {
    const payload = {
      current_password: currentPassword,
      new_password: passwordAuthKey,
      encrypted_private_key: encryptedPrivateKey,
    };

    UserService.changeUserPassword(payload)
      .then(() => {
        emit("toggleBack");
        state.saved = true;
        state.clicked = false;
        state.currentPassword = "";
        state.newPassword = "";
        state.confirmPassword = "";
        toast.success("Password saved.");
        state.loading = false;
      })
      .catch((err) => {
        const obj_array = err.response.data.errors
          ? err.response.data.errors
          : err.response.data;
        let errs = [];
        Object.keys(obj_array).map((k) => {
          if (Array.isArray(obj_array[k])) {
            errs = [...errs, ...obj_array[k]];
          } else {
            errs.push(obj_array[k]);
          }
        });
        toast.error(uniq(errs).join(" "));
        state.loading = false;
      });
  } else {
    toast.error("Could not change your password, please try again");
  }
}
function changePasswordV1() {
  const payload = {
    current_password: state.currentPassword,
    password1: state.newPassword,
    password2: state.confirmPassword,
  };

  UserService.changeUserPassword(payload)
    .then(() => {
      emit("toggleBack");
      state.saved = true;
      state.clicked = false;
      state.currentPassword = "";
      state.newPassword = "";
      state.confirmPassword = "";
      toast.success("Password saved.");
      state.loading = false;
    })
    .catch((err) => {
      const obj_array = err.response.data.errors
        ? err.response.data.errors
        : err.response.data;
      let errs = [];
      Object.keys(obj_array).map((k) => {
        if (Array.isArray(obj_array[k])) {
          errs = [...errs, ...obj_array[k]];
        } else {
          errs.push(obj_array[k]);
        }
      });
      toast.error(uniq(errs).join(" "));
      state.loading = false;
    });
}
</script>

<template>
  <PreferencesPanel class="change-password">
    <template #header>
      <PreferencesHeader @go-back="emit('toggleBack')" />
    </template>

    <PreferencesTitle>Change password</PreferencesTitle>
    <div class="change-password-inputs">
      <PreferencesInput
        :value="state.currentPassword"
        label="Current Password"
        type="password"
        placeholder=""
        :disabled="loading"
        @input="(event) => (state.currentPassword = event)"
        @save="handleChangePassword"
      />

      <PreferencesInput
        :value="state.newPassword"
        label="New Password"
        type="password"
        placeholder=""
        :disabled="loading"
        :error="state.fieldErrors.newPassword"
        @input="(event) => (state.newPassword = event)"
        @blur="checkPassword({ name: 'newPassword', value: newPassword })"
        @save="handleChangePassword"
      />
      <PreferencesParagraph>
        <PasswordStrength
          :password="state.newPassword"
          @password-strength-check="setCheck"
        />
      </PreferencesParagraph>
      <PreferencesInput
        class="confirm-input"
        :value="state.confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder=""
        :error="showPasswordsMatchError || state.fieldErrors.confirmPassword"
        :disabled="loading"
        @input="(event) => (state.confirmPassword = event)"
        @blur="
          checkPassword({
            name: 'confirmPassword',
            value: state.confirmPassword,
          })
        "
        @save="handleChangePassword"
      />
      <PreferencesParagraph>
        <BaseText
          v-if="state.newPassword && state.confirmPasswordError"
          as="div"
          variant="body-3-semibold"
          class="match_error"
        >
          Passwords do not match
        </BaseText>
      </PreferencesParagraph>
    </div>
    <template #footer>
      <PreferencesFooter>
        <Button
          :loading="loading"
          :disabled="loading || disabled"
          @click="handleChangePassword"
        >
          {{ loading ? "Saving" : "Save" }}
        </Button>
      </PreferencesFooter>
    </template>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.change-password-inputs {
  margin-top: 24px;
}
.match_error {
  min-height: 25px;
  color: $color-alert;
}
.confirm-input {
  margin-top: 8px;
}
</style>
