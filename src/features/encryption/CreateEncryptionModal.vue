<script setup>
import { ref, watch } from "vue";
import AppModal from "@/features/ui/AppModal.vue";
import CreateEncryptionModalPrompt from "@/features/encryption/CreateEncryptionModalPrompt.vue";
import CreateEncryptionModalPassword from "@/features/encryption/CreateEncryptionModalPassword.vue";
import CreateEncryptionModalRecovery from "@/features/encryption/CreateEncryptionModalRecovery.vue";
import UserService from "@/api/actions/user-service";
import store from "@/store";

const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
  context: {
    type: String,
    default: "default",
    validator: (value) => ["default", "advanced-mode"].includes(value),
  },
});

const emit = defineEmits(["input"]);

const step = ref("prompt");
const authPayload = ref(null);
const account = ref({
  username: null,
  password: null,
  recovery: null,
});

watch(
  () => props.value,
  (newValue) => {
    if (!newValue) {
      step.value = "prompt";
      authPayload.value = null;
    }
  }
);

const onSetupPassword = () => {
  step.value = "password";
};

const onShowRecovery = async (data) => {
  account.value.username = data.raw_username;
  account.value.password = data.raw_password;
  account.value.recovery = data.raw_recovery_code;
  step.value = "recovery";

  authPayload.value = data;
};

const onDone = async () => {
  store.commit("authentication/setPayload", { payload: authPayload.value });

  await Promise.allSettled([
    store.dispatch("authentication/getUser"),
    UserService.getFlags(),
  ]);

  emit("input", false);
};
</script>

<template>
  <AppModal
    :value="value"
    :has-outside-click-close="step !== 'recovery'"
    @input="$emit('input', $event)"
  >
    <Transition
      name="modal-content"
      mode="out-in"
    >
      <CreateEncryptionModalPrompt
        v-if="step === 'prompt'"
        key="prompt"
        :context="context"
        @input="$emit('input', $event)"
        @continue="onSetupPassword"
      />
      <CreateEncryptionModalPassword
        v-else-if="step === 'password'"
        key="password"
        @input="$emit('input', $event)"
        @continue="onShowRecovery"
      />
      <CreateEncryptionModalRecovery
        v-else-if="step === 'recovery'"
        key="recovery"
        :account="account"
        @input="$emit('input', $event)"
        @done="onDone"
      />
    </Transition>
  </AppModal>
</template>

<style lang="scss" scoped>
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
