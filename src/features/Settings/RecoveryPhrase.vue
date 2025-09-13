<script setup>
import { computed, nextTick, reactive } from "vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import AuthService from "@/api/actions/auth-service";
import { authDecrypt, password_confirm } from "@/scripts/actions/encryption";
import { createPDF } from "@/scripts/tools.js";
import UserService from "@/api/actions/user-service";
import BaseText from "@/library/BaseText.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseButton from "@/library/BaseButton.vue";

const toast = useToast();

const state = reactive({
  error: null,
  fetching: false,
  downloaded: false,
  currentPassword: "",
});

const disabled = computed(() =>
  shouldSkipPassword.value
    ? false
    : state.currentPassword.length < 1 || state.fetching
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
  <div
    v-if="!state.downloaded"
    class="recovery-phase"
  >
    <div class="recovery-phase__title">
      <BaseText
        variant="headline-3-bold"
        as="h2"
      >
        Download your recovery kit
      </BaseText>
      <BaseText
        variant="body-3-regular"
        as="p"
      >
        This can be used to make sure it's really you signing in, reach you if
        there's suspicious activity in your account, or recover a lost password.
      </BaseText>
    </div>

    <div class="recovery-phase__form">
      <BaseInput
        v-if="!shouldSkipPassword"
        v-model="state.currentPassword"
        title="Master Password"
        secret
        placeholder=""
        :error="state.error"
        class="recovery-phase__input"
        @save="getRecoveryKey"
      />
      <BaseButton
        :disabled="disabled"
        :loading="state.fetching"
        class="recovery-phase__button"
        @click="getRecoveryKey"
      >
        Download recovery kit
      </BaseButton>
    </div>
  </div>

  <div
    v-else
    class="recovery-phase"
  >
    <div class="recovery-phase__title">
      <BaseText
        variant="headline-3-bold"
        as="h2"
      >
        Successfully downloaded recovery kit
      </BaseText>
      <BaseText
        variant="body-3-regular"
        as="p"
      >
        Make sure your recovery kit is safe, so write it down, or keep it in
        multiple secret spots so you never lose it.
      </BaseText>
    </div>
    <div class="recovery-phase__actions">
      <BaseButton
        class="download-again-button"
        icon="download"
        variant="secondary"
        @click="getRecoveryKey"
      >
        Download again
      </BaseButton>
      <BaseButton
        class="done-button"
        :class="{ disabled }"
        @click="reset"
      >
        Done
      </BaseButton>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.recovery-phase {
  margin-top: 30px;

  &__title {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__form {
    margin-top: 15px;
  }

  &__button {
    margin-top: 15px;
  }

  &__actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }
}
</style>
