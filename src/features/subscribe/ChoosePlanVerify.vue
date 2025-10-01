<script setup>
import { computed, ref, toRef, watch } from "vue";
import ButtonPlans from "@/features/subscribe/ButtonPlans.vue";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import AppFormError from "@/features/AppFormError.vue";
import Spinner from "@/assets/icons/spinner.svg";
import { formatPhone } from "@/scripts/format";
import { useUserPhoneVerification } from "@/features/data-delete/composables/useUserPhoneVerification";
import { useCoolDown } from "@/composables/useCoolDown";
import { toValue } from "@vueuse/core/index";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const props = defineProps({
  phone: {
    type: String,
    default: null,
  },
});

const isModalOpen = ref(false);

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

const verificationError = computed(
  () =>
    verifyCodeError.value ||
    sendVerificationCodeError.value ||
    addNewPhoneError.value ||
    fetchPhonesError.value
);

watch(
  isModalOpen,
  async (isModalOpen) => {
    if (isModalOpen) {
      await fetchPhones();

      if (toValue(isPhoneVerified)) {
        return;
      }

      if (toValue(existingPhone)) {
        await sendVerificationCode();
        verificationCodeInput.value.inputRef.focus();
        return;
      }

      await addNewPhone(props.phone);

      if (!addNewPhoneError.value) {
        await sendVerificationCode();
        verificationCodeInput.value.inputRef.focus();
      }
    }
  },
  { immediate: true }
);

const verificationCodeInput = ref(null);
const verificationCode = ref("");

watch(
  () => verificationCode.value,
  async (code) => {
    if (code?.length === 6) {
      await verifyCode(code);

      if (toValue(isPhoneVerified)) {
        isModalOpen.value = false;
        const newEvent = new CustomEvent("cloak:phone-signup-verified");
        window.dispatchEvent(newEvent);
      } else {
        verificationCodeInput.value.inputRef.focus();
      }
    }
  }
);

const { start, timeRemaining, isCoolingDown } = useCoolDown(30 * 1000);

const sendVerificationCodeAndCoolDown = async () => {
  if (!isCoolingDown.value) {
    await sendVerificationCode();
    start();
    verificationCodeInput.value.inputRef.focus();
  }
};

const verificationCodeCoolDown = computed(() => {
  const secondsRemaining = Math.ceil(timeRemaining.value / 1000);

  if (secondsRemaining === 0) {
    return null;
  }

  return secondsRemaining === 1
    ? `${secondsRemaining} second`
    : `${secondsRemaining} seconds`;
});

const { isMobile } = useDisplay();
</script>

<template>
  <div class="choose-plan-verify">
    <ButtonPlans
      :full-width="!isMobile"
      size="lg"
      class="choose-plan-verify__cta"
      @click="isModalOpen = true"
    >
      Verify number to subscribe
    </ButtonPlans>
    <AppModal
      :value="isModalOpen"
      @input="isModalOpen = $event"
    >
      <AppModalContent class="choose-plan-verify__content">
        <AppModalTitle>Verification</AppModalTitle>
        <template v-if="isPhoneVerified">
          <AppModalParagraph>
            Phone number {{ formatPhone(phone) }} is already verified.
          </AppModalParagraph>
          <AppModalFooter />
        </template>
        <template v-else>
          <AppModalParagraph>
            We need to verify it's really you. Enter the code we sent to
            {{ formatPhone(phone) }}.
          </AppModalParagraph>
          <AppModalFooter class="choose-plan-verify__footer">
            <BaseInputOtp
              ref="verificationCodeInput"
              v-model="verificationCode"
            />
            <AppFormError
              v-if="verificationError"
              class="data-delete-otp__error"
            >
              {{ verificationError }}
            </AppFormError>
            <BaseText
              v-if="!fetchPhonesError && !addNewPhoneError"
              as="button"
              variant="body-2-semibold"
              underline
              class="choose-plan-verify__resend"
              :disabled="
                isFetchingPhones ||
                isAddingNewPhone ||
                isSendingVerificationCode ||
                isVerifyingCode ||
                verificationCodeCoolDown
              "
              @click="sendVerificationCodeAndCoolDown"
            >
              <template v-if="isVerifyingCode">
                Verifying code
                <Spinner />
              </template>
              <template
                v-else-if="
                  isFetchingPhones ||
                  isAddingNewPhone ||
                  isSendingVerificationCode
                "
              >
                Sending code
                <Spinner />
              </template>
              <template v-else-if="verificationCodeCoolDown">
                Resend in {{ verificationCodeCoolDown }}
              </template>
              <template v-else>Resend code</template>
            </BaseText>
          </AppModalFooter>
        </template>
      </AppModalContent>
    </AppModal>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.choose-plan-verify {
  width: 100%;

  &__content {
    max-width: calc(100vw - 32px);
    transition: transform 0.3s ease-in-out;

    &:has(input:focus) {
      @media (max-width: $screen-sm) {
        transform: translateY(-150px);
        transition: transform 0.3s ease-in-out;
      }
    }
  }

  &__cta {
    width: 100%;
  }

  &__footer {
    flex-direction: column;
    align-items: center;
  }

  &__resend {
    background-color: transparent;
    border: none;
    margin-top: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.65s forwards ease-out;

    &:hover {
      opacity: 0.9;

      &:disabled {
        opacity: 1;
      }
    }

    &:disabled {
      cursor: not-allowed;
      text-decoration: none;
    }
  }
}
</style>
