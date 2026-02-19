<script setup>
import store from "@/store";
import EmailService from "@/api/actions/email-service";
import PhoneService from "@/api/actions/phone-service";
import {
  computed,
  onMounted,
  reactive,
  useAttrs,
  ref,
  watch,
  nextTick,
} from "vue";
import { useToast } from "@/composables/useToast.js";
import ModalTemplate from "@/features/ModalTemplate.vue";
import Button from "@/features/Button.vue";
import BaseInputOtp from "@/library/BaseInputOtp.vue";

const props = defineProps({
  params: { type: Object, default: null },
});
const attrs = useAttrs();
const state = reactive({
  loading: false,
  token: null,
});

const codeInput = ref(null);

onMounted(() => {
  resend();
});

defineEmits(["toggle"]);

const verificationCode = ref("");
const toast = useToast();

const type = computed(() => {
  return props.params.type;
});
const displayType = computed(() => {
  return props.params.type === "email" ? "email address" : "phone number";
});
const contact = computed(() => {
  return props.params.contact;
});
const id = computed(() => {
  return props.params.id;
});

function confirm() {
  props.params.confirm();
}

function close() {
  store.dispatch("closeModal");
}

async function resend() {
  try {
    state.loading = true;
    verificationCode.value = "";
    if (type.value === "email") {
      const { data } = await EmailService.sendVerificationCode(id.value);
      if (!data.verified) {
        state.token = data.session_token;
      }
    } else {
      const { data } = await PhoneService.sendVerificationCode(id.value);
      if (!data.verified) {
        state.token = data.session_token;
      }
    }
    setTimeout(() => {
      state.loading = false;
    }, 1000);
  } catch {
    state.loading = false;
    toast.error("Something went wrong, please try again");
  }
}

const verify = async () => {
  const payloadKey = type.value === "email" ? "email" : "phone_number";
  try {
    let confirm;
    if (payloadKey === "phone_number") {
      confirm = await PhoneService.verifyVerificationCode(id.value, {
        security_code: verificationCode.value,
        [payloadKey]: contact.value,
        session_token: state.token,
      });
    } else {
      confirm = await EmailService.verifyVerificationCode(id.value, {
        security_code: verificationCode.value,
        [payloadKey]: contact.value,
        session_token: state.token,
      });
    }

    await confirm;
    props.params.confirm(this);
    store.dispatch("closeModal");
    window.dispatchEvent(new CustomEvent("cloak:refresh-emails"));
  } catch {
    state.loading = false;
    toast.error("Incorrect code, please try again");
    return;
  }
};

defineExpose({
  close,
  confirm,
  resend,
  verify,
});

watch(
  () => state.loading,
  (newVal, oldVal) => {
    if (!newVal && oldVal) {
      nextTick(() => {
        codeInput?.value?.inputRef?.focus();
      });
    } else if (newVal && !oldVal) {
      nextTick(() => {
        codeInput?.value?.inputRef?.blur();
      });
    }
  }
);
</script>
<template>
  <ModalTemplate
    :show="true"
    show-close-in-header
    width="512px"
    @close="close"
  >
    <template #header>
      <h1>Verify your {{ displayType }}</h1>
    </template>
    <template #body>
      <p class="verification-cta">
        Enter the 6-digit code sent to
        <strong>{{ contact }}</strong>
      </p>

      <div>
        <BaseInputOtp
          v-bind="attrs"
          ref="codeInput"
          v-model="verificationCode"
          :disabled="state.loading"
          @keydown.enter="verify"
        />
      </div>
    </template>
    <template #footer>
      <Button
        :loading="state.loading"
        :disabled="state.loading"
        type="secondary"
        @click="resend"
      >
        Resend code
      </Button>

      <Button
        :disabled="verificationCode.length !== 6"
        @click="verify"
      >
        Verify
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.content .modal-body p.verification-cta {
  font-size: 16px;
  margin-bottom: 16px;
}

.error {
  font-size: 12px;
  color: red;
  margin-top: -5px;
}

.error svg {
  position: relative;
  top: 2px;
  margin-right: 6px;
}
</style>
