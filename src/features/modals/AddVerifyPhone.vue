<script setup>
import store from "@/store";
import { phone } from "@/scripts/validation";
import { phone_package, phone_format } from "@/scripts/format";
import ModalTemplate from "@/features/ModalTemplate.vue";
import OnboardingInputPhone from "@/features/onboarding/OnboardingInputPhone";
import PhoneService from "@/api/actions/phone-service";
import { getUserCountry } from "@/scripts/countries/countries";
import { useToast } from "@/composables/useToast.js";
import BaseInputOtp from "@/library/BaseInputOtp.vue";

import { computed, onMounted, reactive, watch, ref, useAttrs } from "vue";
import Button from "@/features/Button.vue";

const toast = useToast();
const emit = defineEmits(["cancel", "phone-verified", "phone-created"]);
const attrs = useAttrs();

const verificationCode = ref("");

const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
  alert: {
    type: Boolean,
    default: false,
  },
  setPrimary: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
});

const state = reactive({
  phoneDirty: false,
  confirming: false,
  token: null,
  code: "",
  codeError: null,
  country: getUserCountry(store.state.authentication?.user),
  verifying: null,
  verified: false,
  saving: null,
  savingPhone: false,
  phone: "",
  phoneError: null,
  phoneVerified: false,
  loading: true,
});

const phoneInputRef = ref(null);
const verifyRef = ref(null);

onMounted(() => {
  phoneInputRef.value?.$el?.querySelector("input")?.focus();
});

watch(
  () => state.phone,
  () => {
    state.phoneVerified = false;
  },
  { deep: true }
);

const validPhone = computed(() => {
  if (state.phone) {
    return phone(state.phone, state.country);
  }
  return false;
});

const validCode = computed(() => {
  if (verificationCode.value) {
    return verificationCode.value?.match(/[0-9]{6}/i);
  }
  return false;
});

const formattedPhoneNumber = computed(() => {
  return phone_format(state.phone, state.country);
});

function setPhone({ value, country }) {
  if (phone(value, country)) {
    const formatted = phone_package(value, country);
    state.phone = formatted.phone_number || value;
    state.country = country;
  } else {
    state.phone = "";
    state.country = "us";
  }
}

function handleCancel() {
  emit("cancel");
  handleClose();
}

function handleClose() {
  store.dispatch("closeModal");
}

async function savePhone() {
  if (validPhone.value && !state.savingPhone) {
    state.phoneError = null;
    state.savingPhone = true;
    const phone_payload = phone_package(state.phone, state.country);

    const payload = {
      ...phone_payload,
      primary: !!props.setPrimary,
      collection_name: "phone",
      user: store.state.authentication?.user?.url,
      collection: store.getters["authentication/collection"]("phone"),
    };

    try {
      const { data: phone } = await PhoneService.addPhone(payload);
      state.phoneDirty = false;
      if (!phone.verified) {
        confirmContact(phone);
      } else {
        await PhoneService.makePrimary(phone.id);
        emit("phone-created", { ...phone, primary: true });
        handleClose();
        toast.success("Phone number added.");
      }
    } catch (err) {
      state.savingPhone = false;
      const { response } = err;
      const { data } = response;
      let errors = data.errors || data;
      if (errors.phone_number) {
        errors = errors.phone_number;
      }
      if (Array.isArray(errors)) {
        state.phoneError = errors.join("\n");
      } else {
        state.phoneError = errors;
      }
    }
  }
}

function confirmContact(phone) {
  state.saving = phone;
  state.loading = true;
  state.confirming = true;
  PhoneService.sendVerificationCode(phone.id)
    .then((verify_response) => {
      toast.success("Verification code sent.");
      if (!verify_response.data.verified) {
        state.loading = false;
        state.token = verify_response.data.session_token;
        setTimeout(() => {
          if (verifyRef.value) {
            verifyRef?.value?.$el.focus();
          }
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

  PhoneService.sendVerificationCode(state.saving.id)
    .then((verify_response) => {
      toast.success("Verification code sent.");
      if (!verify_response.data.verified) {
        state.token = verify_response.data.session_token;
      }
      state.loading = false;
      setTimeout(() => {
        if (verifyRef.value) {
          verifyRef.value.$el?.focus();
        }
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
      await PhoneService.verifyVerificationCode(state.saving.id, {
        security_code: verificationCode.value,
        phone_number: state.saving.phone_number,
        session_token: state.token,
      });

      await PhoneService.makePrimary(state.saving.id);

      state.verifying = false;
      state.verified = true;
      handleClose();
      emit("phone-verified", {
        ...state.saving,
        verified: true,
      });
      toast.success("Verification successful.");
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
    class="add-verify-phone-modal"
    :show="true"
    @close="handleCancel"
  >
    <template #header>
      <div v-if="!state.confirming">
        <h1>{{ title || "Add a phone number" }}</h1>
      </div>

      <div v-else>
        <h1>Verify your phone number</h1>
      </div>
    </template>

    <template #body>
      <div v-if="!state.confirming">
        <OnboardingInputPhone
          ref="phoneInputRef"
          :value="state.phone"
          placeholder="Phone number"
          @input="setPhone"
        />
      </div>
      <div
        v-else
        class="subheader"
      >
        Enter the 6-digit code sent to
        <strong>{{ formattedPhoneNumber }}</strong>
        <br />
        <BaseInputOtp
          ref="verifyRef"
          v-bind="attrs"
          v-model="verificationCode"
          class="otp-input"
          @keydown.enter="verify"
        />
      </div>
      <div
        v-if="state.phoneError || state.codeError"
        class="input_error"
      >
        {{ state.phoneError || state.codeError }}
      </div>
    </template>

    <template #footer>
      <template v-if="!state.confirming">
        <Button
          type="secondary"
          @click="handleCancel"
        >
          Cancel
        </Button>

        <Button
          :disabled="!validPhone"
          @click="savePhone"
        >
          Continue
        </Button>
      </template>

      <template v-else>
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
.add-verify-phone-modal {
  .content {
    max-width: 512px !important;
  }

  .modal-body {
    overflow: unset !important;
  }

  .ui-input {
    position: relative;
    background-color: $color-primary-10;
  }

  .vue-tel-input {
    box-shadow: none;
    border: none;
    width: 100%;

    .vti__input {
      background: none;
      color: $color-primary-100;
    }

    .vti__dropdown {
      position: unset;
      background: $color-primary-5;
    }

    .vti__dropdown-list {
      left: 0;
      top: 100%;
      transform: translateY(6px);
      width: 100%;
      z-index: 100;
      box-shadow:
        -22.9px -8.90123px 26.7037px rgb(1 2 24 / 5%),
        13.3518px 12.35px 26.7037px rgb(1 2 24 / 16%);
      border-radius: 8px;
      border: 1px solid $color-primary-5;
      background: $color-background;

      .vti__dropdown-item {
        color: $color-primary-100 !important;
      }
    }

    .vti__dropdown-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: $color-primary-100;
      font-size: 12px;
      line-height: 18px;

      strong {
        font-weight: 600;
      }
    }
  }

  .vue-tel-input:focus-within {
    box-shadow: none;
    border: none;
  }

  .ui-confirm-code {
    margin-top: 32px;
  }

  .error {
    font-size: 12px;
    color: red;
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
    color: $color-primary-100;
    .otp-input {
      margin-top: 12px;
    }
  }
}
</style>
