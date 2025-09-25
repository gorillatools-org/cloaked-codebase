<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  toRef,
  useTemplateRef,
  toValue,
  watch,
  type WatchHandle,
} from "vue";
import AppModal from "@/features/ui/AppModal.vue";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import Spinner from "@/assets/icons/spinner.svg";
import { useUserPhoneVerification } from "@/features/data-delete/composables/useUserPhoneVerification";
import { formatPhone } from "@/scripts/format";

const props = defineProps<{ phone: string }>();

const {
  existingPhone,
  isPhoneVerified,
  isFetchingPhones,
  fetchPhonesError,
  fetchPhones,
  isAddingNewPhone,
  addNewPhoneError,
  addNewPhone,
  isSendingVerificationCode,
  sendVerificationCodeError,
  sendVerificationCode,
  isVerifyingCode,
  verifyCodeError,
  verifyCode,
} = useUserPhoneVerification(
  toRef(() => props.phone),
  { context: "data-deletion" }
);

// hack to only mount modal once #modals is in the DOM (bug in AppModal)
const mounted = ref<boolean>(false);
onMounted(() => (mounted.value = true));

const codeInput = useTemplateRef<{ inputRef: HTMLInputElement }>("codeInput");
const code = ref("");

const isModalOpen = ref<boolean>(false);

watch(isModalOpen, (isModalOpen) => {
  if (!isModalOpen) {
    fetchPhonesError.value = null;
    addNewPhoneError.value = null;
    sendVerificationCodeError.value = null;
    verifyCodeError.value = null;
    code.value = "";
  }
});

const onModalClose = (callback: () => void) =>
  watch(isModalOpen, (isModalOpen) => {
    if (!isModalOpen) {
      callback();
    }
  });

const onCodeVerified = (callback: () => void) =>
  watch(code, async (code) => {
    if (code?.length === 6) {
      await verifyCode(code);

      if (toValue(isPhoneVerified)) {
        isModalOpen.value = false;
        callback();
      } else {
        codeInput.value?.inputRef.focus();
      }
    }
  });

const verifyPhone = async (): Promise<boolean> => {
  let unwatchModal: WatchHandle | null = null;
  let unwatchCode: WatchHandle | null = null;

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    await fetchPhones();

    if (toValue(isPhoneVerified)) {
      return resolve(true);
    }

    unwatchModal = onModalClose(() => resolve(false));
    isModalOpen.value = true;

    if (!toValue(existingPhone)) {
      await addNewPhone();
    }

    if (!addNewPhoneError.value) {
      await sendVerificationCode();
    }

    if (!sendVerificationCodeError.value) {
      codeInput.value?.inputRef.focus();
      unwatchCode = onCodeVerified(() => resolve(true));
    }
  }).then((result) => {
    unwatchModal && unwatchModal();
    unwatchCode && unwatchCode();

    return !!result;
  });
};

const error = computed(
  () =>
    verifyCodeError.value ||
    sendVerificationCodeError.value ||
    addNewPhoneError.value ||
    fetchPhonesError.value
);

defineExpose({ verifyPhone });
</script>

<template>
  <AppModal
    v-if="mounted"
    :value="isModalOpen"
    @input="isModalOpen = $event"
  >
    <BaseSheet
      elevation="md"
      spacing-x="lg"
      spacing-y="lg"
      class="checkout-signup-verification"
    >
      <CheckoutTitle>Verification</CheckoutTitle>
      <CheckoutParagraph variant="body-3-regular">
        We need to verify it's really you. Enter the code we sent to
        <span class="checkout-signup-verification__phone">
          {{ formatPhone(phone) }}.
        </span>
      </CheckoutParagraph>
      <BaseInputOtp
        ref="codeInput"
        v-model="code"
        :disabled="
          isFetchingPhones ||
          isAddingNewPhone ||
          isSendingVerificationCode ||
          isVerifyingCode
        "
        class="checkout-signup-verification__input"
      />
      <BaseInputFeedback
        v-if="error"
        variant="error"
        :message="error"
        class="checkout-signup-verification__feedback"
      />
      <BaseText
        v-if="isVerifyingCode"
        variant="body-small-medium"
        class="checkout-signup-verification__feedback"
      >
        Verifying code
        <Spinner class="checkout-signup-verification__spinner" />
      </BaseText>
      <BaseText
        v-else-if="
          isFetchingPhones || isAddingNewPhone || isSendingVerificationCode
        "
        variant="body-small-medium"
        class="checkout-signup-verification__feedback"
      >
        Sending code
        <Spinner class="checkout-signup-verification__spinner" />
      </BaseText>
    </BaseSheet>
  </AppModal>
</template>

<style lang="scss" scoped>
.checkout-signup-verification {
  width: calc(100vw - 32px);
  max-width: 420px;
  transition: transform 0.3s ease-in-out;

  &:focus-within {
    transform: translateY(-150px);

    @media (min-width: $screen-sm) {
      transform: translateY(0);
    }
  }

  &__phone {
    white-space: nowrap;
  }

  &__input {
    margin: 16px 0 0;
  }

  &__feedback {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 16px;
  }

  &__spinner {
    width: 14px;
    height: 14px;
  }
}
</style>
