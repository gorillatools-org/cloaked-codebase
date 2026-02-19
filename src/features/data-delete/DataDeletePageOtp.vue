<script setup>
import CloakedLogo from "@/assets/icons/cloaked-logo-full.svg";
import { computed, onBeforeMount, ref, watch, nextTick } from "vue";
import DataDeleteCounter from "@/features/data-delete/atoms/DataDeleteCounter.vue";
import AppFormError from "@/features/AppFormError.vue";
import Spinner from "@/assets/icons/spinner.svg";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import { useCoolDown } from "@/composables/useCoolDown";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_PHONE_VERIFICATION } from "@/scripts/posthogEvents.js";
import BaseText from "@/library/BaseText.vue";
import router from "@/routes/router";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import store from "@/store";
import SubscriptionService from "@/api/settings/subscription-services";
import UserService from "@/api/actions/user-service";
import { DATA_DELETE_REQUESTED } from "@/scripts/userFlags";
import { useStripeIntentPrefetch } from "@/features/subscribe/composables/useStripeIntentPrefetch.js";
import { useToast } from "@/composables/useToast.js";
import { phone } from "phone";
import { useDisplay } from "@/composables/useDisplay";

const toast = useToast();
defineOptions({ inheritAttrs: false });

const { prefetchIntents } = useStripeIntentPrefetch();

const { isMobile } = useDisplay();

const props = defineProps({
  headlessUser: {
    type: [Object, null],
    default: null,
  },
  formattedPhone: {
    type: String,
    default: null,
  },
  isFetching: {
    type: Boolean,
    default: false,
  },
  isVerifyingCode: {
    type: Boolean,
    default: false,
  },
  verifyCodeError: {
    type: String,
    default: null,
  },
  verifiedUserInfo: {
    type: Object,
    default: null,
  },
  loginUserError: {
    type: String,
    default: null,
  },
});

const isDecidingWhereToRedirect = ref(false);

const emit = defineEmits([
  "searchPublicRecords",
  "verifyCode",
  "createUser",
  "loginPasswordlessUser",
]);

const searchRecords = () =>
  emit("searchPublicRecords", { phoneNumber: props.formattedPhone });

const verificationCodeInput = ref(null);
const verificationCode = ref("");

function redirectToLogin() {
  toast.success(
    "Looks like you already have a Cloaked account - we'll need you to enter your password."
  );
  if (isMobile.value) {
    nextTick(() => {
      toast.success(
        "If you're looking to access the Cloaked mobile app, open the app and tap log in. Then, input your phone number to proceed."
      );
    });
  }
  router.push({ name: "login" });
}

function redirectToApp(verificationCode) {
  toast.success(
    "Looks like you already have a Cloaked account - signing in now."
  );
  if (isMobile.value) {
    nextTick(() => {
      toast.success(
        "If you're looking to access the Cloaked mobile app, open the app and tap log in."
      );
    });
  }
  emit("loginPasswordlessUser", {
    phone: props.formattedPhone,
    code: verificationCode.value,
  });
}

async function redirectToRegistration() {
  try {
    await store.dispatch("subscription/init");
    await SubscriptionService.getSubscription();
    await UserService.setFlag({
      name: DATA_DELETE_REQUESTED,
      value: true,
    });
    await prefetchIntents();
    return searchRecords(); // This navigates user to search results page
  } catch {
    toast.error("Failed to process your request. Please try again.");
  } finally {
    isDecidingWhereToRedirect.value = false;
  }
}

async function handleRedirectAfterVerification(verifiedUserInfo) {
  isDecidingWhereToRedirect.value = true;
  if (props.verifyCodeError || verifiedUserInfo?.status === "error") {
    return verificationCodeInput?.value?.inputRef?.focus();
  }
  const shouldRegister = !verifiedUserInfo?.existing_user;
  const shouldAutoLogin =
    verifiedUserInfo?.is_passwordless && verifiedUserInfo?.existing_user;
  const shouldRedirectToLoginPage =
    !verifiedUserInfo?.is_passwordless && verifiedUserInfo?.existing_user;

  if (shouldRegister) {
    await redirectToRegistration();
  } else if (shouldAutoLogin) {
    await redirectToApp(verificationCode);
  } else if (shouldRedirectToLoginPage) {
    await redirectToLogin();
  }
  nextTick(() => {
    isDecidingWhereToRedirect.value = false;
  });
}

watch(
  () => props.verifiedUserInfo,
  async (verifiedUserInfo, oldValue) => {
    if (!!verifiedUserInfo && !oldValue) {
      handleRedirectAfterVerification(verifiedUserInfo);
    }
  }
);

watch(
  () => verificationCode.value,
  (code) => {
    if (code?.length === 6) {
      emit("verifyCode", {
        phone_number: props.formattedPhone,
        code,
      });
    }
  }
);

const { start, timeRemaining, isCoolingDown } = useCoolDown(30 * 1000);

const sendVerificationCodeAndCoolDown = async () => {
  if (!isCoolingDown.value) {
    emit("createUser");
    start();
    verificationCodeInput?.value?.inputRef?.focus();
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

const exposures = computed(() => {
  const numberFromQuery = props.formattedPhone?.slice(2, 12) ?? "";

  const number = new Array(10)
    .fill("5")
    .reduce(
      (result, digit, index) =>
        result +
        (!isNaN(numberFromQuery[index]) ? numberFromQuery[index] : digit),
      ""
    );

  const digits = number.split("");
  const digitsFirstHalf = digits.filter((digit, index) => index % 2 === 0);
  const digitsSecondHalf = digits.filter((digit, index) => index % 2 === 1);

  const sum =
    digitsFirstHalf.reduce((sum, digit) => sum + parseInt(digit), 0) +
    digitsSecondHalf.reduce(
      (sum, digit) => sum + Math.abs(9 - parseInt(digit)),
      0
    );

  const exposureFactor = sum / (9 * 10);
  return 800 + Math.ceil(199 * exposureFactor);
});

onBeforeMount(() =>
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_PHONE_VERIFICATION)
);

const isPhoneNumberValid = computed(() => {
  return !!phone(props.formattedPhone).phoneNumber;
});

const isInputOTPDisabled = computed(
  () =>
    !props.headlessUser ||
    props.isVerifyingCode ||
    props.isFetching ||
    isDecidingWhereToRedirect.value ||
    !isPhoneNumberValid.value
);

const userError = computed(() => {
  if (props.loginUserError) {
    return props.loginUserError;
  }
  if (props.verifyCodeError) {
    return props.verifyCodeError;
  }
  if (!isPhoneNumberValid.value) {
    return "Couldn't verify this phone number.";
  }
  return null;
});

function linkToLogin() {
  router.push({ name: "login" });
  posthogCapture("user_clicked_data_deletion_otp_sign_in");
}

function linkToDownloadMobile() {
  window.open(DOWNLOAD_APP_URL, "_blank");
  posthogCapture("user_clicked_data_deletion_otp_download_app");
}

function linkToSubscribe() {
  router.push({ name: "SubscribeNow" });
  posthogCapture("user_clicked_data_deletion_otp_sign_up");
}

watch(
  () => isInputOTPDisabled.value,
  (newVal, oldVal) => {
    if (!newVal && oldVal) {
      nextTick(() => {
        verificationCodeInput?.value?.inputRef?.focus();
      });
    } else if (newVal && !oldVal) {
      nextTick(() => {
        verificationCodeInput?.value?.inputRef?.blur();
      });
    }
  }
);
</script>

<template>
  <div class="data-delete__page">
    <div class="data-delete-otp">
      <CloakedLogo class="data-delete-otp__logo" />
      <DataDeleteCounter
        class="data-delete-otp__counter"
        :delay="1000"
        :duration="45000"
        :ends-at="exposures"
      />
      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="data-delete-otp__title"
      >
        exposures uncovered
      </BaseText>
      <BaseText
        as="p"
        variant="headline-6-medium"
        class="data-delete__text data-delete-otp__text"
      >
        Before revealing any sensitive data, please verify you are this phone
        number's owner. We've sent you a text message with a secure code.
      </BaseText>
      <BaseInputOtp
        ref="verificationCodeInput"
        v-model="verificationCode"
        class="data-delete-otp__input"
        :disabled="isInputOTPDisabled"
      />
      <AppFormError
        v-if="userError"
        class="data-delete-otp__error"
      >
        {{ userError }}
      </AppFormError>
      <button
        v-if="userError ? props.verifyCodeError : true"
        class="data-delete-otp__resend"
        :disabled="
          !props.headlessUser ||
          props.isVerifyingCode ||
          verificationCodeCoolDown ||
          props.isFetching
        "
        @click="sendVerificationCodeAndCoolDown"
      >
        <template v-if="isDecidingWhereToRedirect || isFetching">
          Gathering data
          <Spinner />
        </template>
        <template v-else-if="props.isVerifyingCode">
          Verifying code
          <Spinner />
        </template>
        <template v-else-if="!props.headlessUser">
          Sending code
          <Spinner />
        </template>
        <template v-else-if="verificationCodeCoolDown">
          Resend in {{ verificationCodeCoolDown }}
        </template>
        <template v-else>
          <span class="data-delete-otp__resend-text">Resend code</span>
        </template>
      </button>
    </div>
    <div class="data-delete-otp__login">
      <BaseText
        as="div"
        variant="body-small-medium"
        class="data-delete-otp__login-text"
      >
        {{ "Already have an account? Sign in" }}
        <BaseText
          variant="body-small-medium"
          underline
          class="data-delete-otp__link"
          @click="linkToLogin"
        >
          {{ isMobile ? "here" : "here." }}
        </BaseText>

        <BaseText
          v-if="isMobile"
          variant="body-small-medium"
        >
          {{ " on desktop or" }}
          <BaseText
            variant="body-small-medium"
            underline
            class="data-delete-otp__link"
            @click="linkToDownloadMobile"
          >
            {{ "download our mobile app." }}
          </BaseText>
        </BaseText>
      </BaseText>

      <BaseText
        as="div"
        variant="body-small-medium"
        class="data-delete-otp__login-text"
      >
        {{ "Scan not working? Create a new account" }}
        <BaseText
          variant="body-small-medium"
          class="data-delete-otp__link"
          underline
          @click="linkToSubscribe"
        >
          {{ "here." }}
        </BaseText>
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.data-delete-otp {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: 100%;

  @media all and (min-width: $screen-xl) {
    margin: auto;
    border-radius: 24px;
    max-width: 600px;
    padding: 35px 60px 40px;
    @at-root .data-delete__page {
      margin: auto;
    }

    @at-root .theme-dark & {
      background: rgb(0 0 0 / 60%);
    }

    @at-root .theme-light & {
      background: $color-primary-1;
      border: 1px solid $color-primary-10;
      box-shadow: 5px 5px 30px 0 rgba($color-primary-1-dark, 0.05);
    }
  }

  &__logo {
    margin-bottom: 24px;
    height: 26px;
    width: 101px;

    @media all and (min-width: $screen-xl) {
      position: fixed;
      top: 32px;
      left: 32px;
      height: 26px * 1.5;
      width: 101px * 1.5;
    }
  }

  &__counter {
    opacity: 0;
    animation: appear-bottom-5 0.3s forwards ease-out;
  }

  &__title {
    text-align: center;
    margin-top: 8px;
    opacity: 0;
    animation: appear-bottom-5 0.4s 0.1s forwards ease-out;

    @media all and (min-width: $screen-xl) {
      margin-top: 16px;
      max-width: 400px;
    }
  }

  &__text {
    max-width: 500px;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.2s forwards ease-out;
    text-align: center;
  }

  &__input {
    max-width: 300px;
    margin: 32px auto 0;
    animation: appear-bottom-5 0.4s 0.5s forwards ease-out;
  }

  &__button {
    background-color: transparent;
    border: none;
    margin-top: 20px;
    color: $color-primary-100;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

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

  &__resend {
    @extend .data-delete-otp__button;

    opacity: 0;
    animation: appear-bottom-5 0.3s 0.65s forwards ease-out;
  }

  &__resend-text {
    text-decoration: underline;
  }

  &__error {
    margin-top: 12px;
    text-align: center;
    max-width: 300px;
  }

  &__login {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 40px auto;
    padding-left: 40px;
    padding-right: 40px;
    gap: 8px;
    &-text {
      text-align: center;
      max-width: 500px;
    }
  }
  &__link {
    // padding-left: 2px;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
