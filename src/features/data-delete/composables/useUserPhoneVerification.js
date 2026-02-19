import { computed, ref } from "vue";
import { toValue } from "@vueuse/core/index";
import { phone_package } from "@/scripts/format";
import PhoneService from "@/api/actions/phone-service";
import { posthogCapture } from "@/scripts/posthog";
import { useUserPhoneNumbers } from "@/features/data-delete/composables/useUserPhoneNumbers";
import { phone as isValidPhone } from "@/scripts/validation";

const PH_ERROR_PHONE_NUMBERS_FETCH_FAILED =
  "user_received_existing_phone_numbers_fetch_error";
const PH_ERROR_PHONE_NUMBER_ALREADY_IN_USE =
  "user_received_phone_number_already_in_use_error";
const PH_ERROR_VERIFICATION_MESSAGE_FAILED =
  "user_received_otp_message_send_error";
const PH_ERROR_INVALID_OTP_CODE = "user_received_invalid_otp_error";

export const useUserPhoneVerification = (phone, { context } = {}) => {
  const { phoneNumbers, fetch: fetchPhoneNumbers } = useUserPhoneNumbers();

  const phoneNumber = computed(() =>
    isValidPhone(toValue(phone))
      ? phone_package(toValue(phone), "US")?.phone_number
      : null
  );

  const existingPhone = computed(
    () =>
      phoneNumbers.value.find(
        (phone) => phone.phone_number === toValue(phoneNumber)
      ) ?? null
  );

  const isPhoneVerified = computed(() => {
    return !!existingPhone.value?.verified;
  });

  const isFetchingPhones = ref(false);
  const fetchPhonesError = ref(null);

  const isAddingNewPhone = ref(false);
  const addNewPhoneError = ref(null);

  const isSendingVerificationCode = ref(false);
  const sendVerificationCodeError = ref(null);

  const isVerifyingCode = ref(false);
  const verifyCodeError = ref(null);

  const verificationCodeSession = ref(null);

  const fetchPhones = async () => {
    try {
      isFetchingPhones.value = true;
      fetchPhonesError.value = null;

      await fetchPhoneNumbers();
    } catch {
      fetchPhonesError.value = "Something went wrong. Please try again.";
      posthogCapture(PH_ERROR_PHONE_NUMBERS_FETCH_FAILED);
    } finally {
      isFetchingPhones.value = false;
    }
  };

  const addNewPhone = async () => {
    try {
      isAddingNewPhone.value = true;
      addNewPhoneError.value = null;

      await PhoneService.createPhone({ phone: toValue(phoneNumber) });
      await fetchPhones();
    } catch {
      addNewPhoneError.value = "Couldn't verify this phone number.";
      posthogCapture(PH_ERROR_PHONE_NUMBER_ALREADY_IN_USE);
    } finally {
      isAddingNewPhone.value = false;
    }
  };

  const sendVerificationCode = async () => {
    try {
      isSendingVerificationCode.value = true;
      sendVerificationCodeError.value = null;

      const { data } = await PhoneService.sendVerificationCode(
        existingPhone.value.id,
        context
      );

      verificationCodeSession.value = data;
    } catch {
      sendVerificationCodeError.value =
        "Failed to send verification code. Please try again.";
      posthogCapture(PH_ERROR_VERIFICATION_MESSAGE_FAILED);
    } finally {
      isSendingVerificationCode.value = false;
    }
  };

  const verifyCode = async (code) => {
    try {
      isVerifyingCode.value = true;
      verifyCodeError.value = null;

      await PhoneService.verifyVerificationCode(
        existingPhone.value.id,
        {
          ...verificationCodeSession.value,
          security_code: code,
        },
        context
      );

      await fetchPhones();

      return true;
    } catch {
      verifyCodeError.value = "Invalid code. Please try again.";
      posthogCapture(PH_ERROR_INVALID_OTP_CODE);
    } finally {
      isVerifyingCode.value = false;
    }
  };

  return {
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
  };
};
