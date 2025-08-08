<script setup>
import { computed, nextTick, reactive } from "vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import AuthService from "@/api/actions/auth-service";
import { authDecrypt, password_confirm } from "@/scripts/actions/encryption";
import { createPDF } from "@/scripts/tools.js";
import UserService from "@/api/actions/user-service";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";

const toast = useToast();

const state = reactive({
  error: false,
  fetching: false,
  downloaded: false,
  currentPassword: "",
});

const disabled = computed(() =>
  shouldSkipPassword.value
    ? false
    : state.currentPassword.length < 2 || state.fetching
);

const supportEmail = computed(() => {
  const supportCloak = store.state.localdb.db_cloaks.find(
    (c) => c.protected && c.nickname.match(/team|support/i)
  );
  return supportCloak && supportCloak.email;
});

const accountUsername = computed(() => store.state.authentication?.username);

const shouldSkipPassword = computed(
  () => store.state.authentication?.user?.encryption_status === 1
);

const reset = () => {
  state.downloaded = false;
  state.currentPassword = "";
};

const getRecoveryKey = () => {
  if (shouldSkipPassword.value) {
    createPDF(
      store.state.encryption.secret_key,
      supportEmail.value,
      accountUsername.value
    );
  } else if (state.currentPassword && !state.fetching) {
    state.fetching = true;
    nextTick(() => {
      setTimeout(() => {
        downloadRecoveryKey();
      }, 50);
    });
  }
};

const downloadRecoveryKey = async () => {
  try {
    const hash = await password_confirm(state.currentPassword);
    const user = store.getters["authentication/user"];
    const userId = user.id;
    const check = await AuthService.confirmPassword(userId, hash);
    state.fetching = false;
    if (check) {
      downloadPassphrase();
    } else {
      throw "error";
    }
  } catch {
    state.fetching = false;
    toast.error(
      "Can't download recovery kit because of invalid password, please try again."
    );
  }
};

const downloadPassphrase = () => {
  AuthService.passPhrase()
    .then(({ data }) => {
      const { results } = data;
      if (results && results[0]) {
        authDecrypt(results[0].key).then((key) => {
          createPDF(key, supportEmail.value, accountUsername.value);
          state.downloaded = true;
        });
        UserService.updateAndFetchGetStartedChecklist({
          id: 6,
          status: "completed",
        });
      } else {
        throw "error";
      }
    })
    .catch(() => {
      throw "error";
    });
};
</script>
<template>
  <div class="recovery-container">
    <div v-if="!state.downloaded">
      <PreferencesTitle>Download your recovery kit</PreferencesTitle>
      <PreferencesParagraph>
        This can be used to make sure it's really you signing in, reach you if
        there's suspicious activity in your account, or recover a lost password.
      </PreferencesParagraph>
      <div class="input-container">
        <PreferencesInput
          v-if="!shouldSkipPassword"
          :value="state.currentPassword"
          label="Master Password"
          type="password"
          placeholder=""
          :error="state.error"
          @input="(event) => (state.currentPassword = event)"
          @save="getRecoveryKey"
        />
        <div>
          <button
            class="download-button"
            :class="{ disabled }"
            @click="getRecoveryKey"
          >
            Download recovery kit
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="recovery-container"
    >
      <PreferencesTitle>Successfully downloaded recovery kit</PreferencesTitle>
      <PreferencesParagraph>
        Make sure your recovery kit is safe, so write it down, or keep it in
        multiple secret spots so you never lose it.
      </PreferencesParagraph>
      <div class="recovery-container">
        <div class="action-buttons">
          <button
            class="download-again-button"
            :class="{ disabled }"
            @click="getRecoveryKey"
          >
            Download again
          </button>
          <button
            class="done-button"
            :class="{ disabled }"
            @click="reset"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.recovery-container {
  .input-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 15px;
    margin: 15px 0;
  }

  .action-buttons {
    margin: 15px 0;
    display: flex;
    gap: 10px;
  }

  .download-button,
  .download-again-button,
  .done-button {
    gap: 8px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    padding: 13px 26px;
    border-radius: 32px;
    color: $color-primary-1;
    background: $color-primary-100;

    &.disabled {
      opacity: 0.5;
    }
  }

  .download-again-button {
    background: $color-success;
  }
}
</style>
