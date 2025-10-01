<script setup>
import CloakedLogo from "@/assets/images/CloakedLogo.svg";
import { computed, onBeforeMount, ref, watch, nextTick, onMounted } from "vue";
import DataDeleteCounter from "@/features/data-delete/atoms/DataDeleteCounter.vue";
import AppFormError from "@/features/AppFormError.vue";
import Spinner from "@/assets/icons/spinner.svg";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import { useCoolDown } from "@/composables/useCoolDown";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_PHONE_VERIFICATION } from "@/scripts/posthogEvents.js";
import BaseText from "@/library/BaseText.vue";
import router from "@/routes/router";
import { BRAVE_SITE_PRIVACY_POLICY_URL } from "@/scripts/constants";
import store from "@/store";
import SubscriptionService from "@/api/settings/subscription-services";
import UserService from "@/api/actions/user-service";
import { DATA_DELETE_REQUESTED } from "@/scripts/userFlags";
import { useStripeIntentPrefetch } from "@/features/subscribe/composables/useStripeIntentPrefetch.js";
import { useToast } from "@/composables/useToast.js";
import { phone } from "phone";
import { useDisplay } from "@/composables/useDisplay";
import BaseIcon from "@/library/BaseIcon.vue";
import LineProgress from "@/features/ui/LineProgress.vue";
import { useColorScheme } from "@/composables/useColorScheme";

const toast = useToast();
defineOptions({ inheritAttrs: false });

const { prefetchIntents } = useStripeIntentPrefetch();
const { isMobile } = useDisplay();
const { setColorScheme } = useColorScheme();

setColorScheme("light");

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

const isCodeExpired = ref(false);
const hasCodeBeenSent = ref(false);
const progressValue = ref(0);

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

function redirectToApp() {
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
    return searchRecords();
  } catch {
    toast.error("Failed to process your request. Please try again.");
  } finally {
    isDecidingWhereToRedirect.value = false;
  }
}

async function handleRedirectAfterVerification(verifiedUserInfo) {
  isDecidingWhereToRedirect.value = true;

  if (props.verifyCodeError || verifiedUserInfo?.status === "error") {
    verificationCodeInput?.value?.inputRef?.focus();
    return;
  }

  const shouldRegister = !verifiedUserInfo?.existing_user;
  const shouldAutoLogin =
    verifiedUserInfo?.is_passwordless && verifiedUserInfo?.existing_user;
  const shouldRedirectToLoginPage =
    !verifiedUserInfo?.is_passwordless && verifiedUserInfo?.existing_user;

  try {
    if (shouldRegister) {
      await redirectToRegistration();
    } else if (shouldAutoLogin) {
      await redirectToApp();
    } else if (shouldRedirectToLoginPage) {
      await redirectToLogin();
    }
  } catch (error) {
    console.error("Error during redirect:", error);
    toast.error("An error occurred. Please try again.");
  } finally {
    nextTick(() => {
      isDecidingWhereToRedirect.value = false;
    });
  }
}

watch(
  () => props.verifiedUserInfo,
  async (verifiedUserInfo, oldValue) => {
    if (!!verifiedUserInfo && !oldValue) {
      await handleRedirectAfterVerification(verifiedUserInfo);
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
const { start: startExpiryTimer, timeRemaining: expiryTimeRemaining } =
  useCoolDown(5 * 60 * 1000);

const sendVerificationCodeAndCoolDown = async () => {
  if (!isCoolingDown.value) {
    hasCodeBeenSent.value = false;
    isCodeExpired.value = false;

    emit("createUser");
    start();
    verificationCodeInput?.value?.inputRef?.focus();

    // Restart the expiry timer immediately for resend
    startExpiryTimer();
    hasCodeBeenSent.value = true;
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

function getTimeParts(timeZone = "America/New_York") {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = fmt.formatToParts(now);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
    dayOfWeek: now
      .toLocaleDateString("en-US", { timeZone, weekday: "short" })
      .toLowerCase(),
  };
}

const verifiedUsers = computed(() => {
  const { hour, minute, second, dayOfWeek } = getTimeParts();

  const dayNum = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(
    dayOfWeek
  );

  const progress = (hour * 3600 + minute * 60 + second) / 86400;

  const curve = 0.3 + 0.7 * Math.sin(((hour - 6) * Math.PI) / 12);

  const maxUsers = [6000, 9500, 10200, 9800, 9000, 7500, 6500][dayNum] || 8000;

  const weekendFactor = dayNum === 0 || dayNum === 6 ? 0.6 : 1.0;

  const base = progress * maxUsers * Math.max(curve, 0.1) * weekendFactor;
  const floor = 400 * progress;

  return Math.floor(Math.max(base, floor));
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
  window.open(BRAVE_SITE_PRIVACY_POLICY_URL, "_blank");
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

watch(
  () => Boolean(props.headlessUser),
  (val) => {
    if (val && !hasCodeBeenSent.value) {
      hasCodeBeenSent.value = true;
      isCodeExpired.value = false;
      startExpiryTimer();
    } else if (!val) {
      hasCodeBeenSent.value = false;
      isCodeExpired.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => timeRemaining.value,
  (newVal, oldVal) => {
    if (oldVal > 0 && newVal === 0 && isCoolingDown.value === false) {
      if (props.headlessUser) {
        hasCodeBeenSent.value = true;
        isCodeExpired.value = false;
      }
    }
  }
);

watch(
  () => expiryTimeRemaining.value,
  (newVal) => {
    if (newVal === 0) {
      isCodeExpired.value = true;
    }
  }
);

watch(
  () => isDecidingWhereToRedirect.value,
  (newVal) => {
    if (newVal) {
      progressValue.value = 1.0;
    }
  }
);

const shouldShowExpiryText = computed(() => {
  return (
    Boolean(props.headlessUser) && hasCodeBeenSent.value && !isCodeExpired.value
  );
});

const formattedExpiryTime = computed(() => {
  const totalSeconds = Math.ceil(expiryTimeRemaining.value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

onMounted(() => {
  setTimeout(() => {
    progressValue.value = 0.75;
  }, 500);
});
</script>

<template>
  <div class="data-delete__page">
    <div class="data-delete-otp-brave">
      <CloakedLogo class="data-delete-otp-brave__cloaked-logo" />
      <div class="data-delete-otp-brave__verified-users">
        <BaseText
          variant="headline-6-medium"
          class="data-delete-otp-brave__verified-users-text"
        >
          <DataDeleteCounter
            class="data-delete-otp-brave__verified-users-counter"
            :delay="200"
            :duration="4500"
            :ends-at="verifiedUsers"
          />
          users protected today
        </BaseText>
      </div>
      <div class="data-delete-otp-brave__progress-wrapper">
        <BaseText variant="body-small-semibold">
          Results at 75% Complete
        </BaseText>
        <LineProgress
          :progress="progressValue"
          class="data-delete-otp-brave__progress"
        />
      </div>
      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="data-delete-otp-brave__title"
      >
        Verify your number to reveal results
      </BaseText>
      <BaseInputOtp
        ref="verificationCodeInput"
        v-model="verificationCode"
        class="data-delete-otp-brave__input"
        :disabled="isInputOTPDisabled"
      />
      <BaseText
        as="p"
        variant="headline-6-medium"
        class="data-delete__text data-delete-otp-brave__text"
      >
        We've texted you a secure 6-digit verification code.
        <span v-if="shouldShowExpiryText">
          Code expires in
          <span class="data-delete-otp-brave__expiry-counter">
            {{ formattedExpiryTime }}
          </span>
        </span>
        <span v-else-if="isCodeExpired">Code expired!</span>
      </BaseText>
      <AppFormError
        v-if="userError"
        class="data-delete-otp-brave__error"
      >
        {{ userError }}
      </AppFormError>
      <button
        v-if="userError ? props.verifyCodeError : true"
        class="data-delete-otp-brave__resend"
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
          Not receiving the code?&nbsp;
          <span class="data-delete-otp-brave__resend-text">Resend code</span>
        </template>
      </button>
      <div class="data-delete-otp-brave__encription-badge">
        <BaseIcon name="lock-filled" />
        <BaseText variant="caption-bold">
          Verification is Encrypted and Secure
        </BaseText>
      </div>
    </div>
    <div class="data-delete-otp-brave__copyright">
      <BaseText
        as="div"
        variant="body-small-medium"
        class="data-delete-otp-brave__copyright-text"
      >
        {{ "© Cloaked Inc. 2025 • " }}
        <BaseText
          variant="body-small-medium"
          underline
          class="data-delete-otp-brave__link"
          @click="linkToLogin"
        >
          Privacy Policy
        </BaseText>
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.data-delete__page {
  width: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;

  @at-root .theme-light & {
    background-color: $color-primary-1;
  }
}

.data-delete-otp-brave {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  flex: 1;

  @media all and (min-width: $screen-xl) {
    margin: auto;
    border-radius: 24px;
    max-width: 600px;
    padding: 35px 60px 40px;
    flex: initial;
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
    height: 18px;
    width: 15.33px;
  }

  &__cloaked-logo {
    display: none;

    @media all and (min-width: $screen-md) {
      margin-bottom: 24px;
      display: block;
    }

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
    opacity: 0;
    animation: appear-bottom-5 0.4s 0.1s forwards ease-out;

    @media all and (min-width: $screen-xl) {
      max-width: 400px;
    }
  }

  &__text {
    max-width: 500px;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.2s forwards ease-out;
    text-align: center;
    margin-top: 12px;
    padding: 0 15px;

    @media all and (min-width: $screen-xl) {
      margin-top: 16px;
      max-width: 400px;
      padding: 0;
    }
  }

  &__expiry-counter {
    color: inherit;
    -webkit-text-fill-color: inherit;
    min-width: 42px;
    text-align: left;
    display: inline-block;
  }

  &__input {
    max-width: 320px;
    margin: 20px auto 12px;
    animation: appear-bottom-5 0.4s 0.5s forwards ease-out;

    :deep(.base-input-otp__placeholder) {
      background-color: $color-primary-1;
      backdrop-filter: blur(26px);
    }

    :deep(.base-input-otp__input) {
      opacity: initial;
      border: 0;
      z-index: 0;
      background-color: transparent;
      transform: translateY(-20px);
      color: transparent;

      &:focus {
        outline: none;
      }
    }

    @media all and (min-width: $screen-sm) {
      max-width: 335px;
      :deep(.base-input-otp__input) {
        z-index: 1;
      }
    }
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
    @extend .data-delete-otp-brave__button;

    opacity: 0;
    animation: appear-bottom-5 0.3s 0.65s forwards ease-out;
  }

  &__resend-text {
    text-decoration: underline;
    margin-left: -6px;
  }

  &__error {
    margin-top: 12px;
    text-align: center;
    max-width: 300px;
  }

  &__link {
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }

  &__verified-users {
    display: flex;
    align-items: center;
    background: linear-gradient(
      199deg,
      #8dbbff 0.98%,
      #ff4949 58.26%,
      #ff7a00 100%
    );
    gap: 10px;
    padding: 7px 16px;
    border-radius: 24px;

    &-text {
      color: $white;
      font-size: 14px;

      @media screen and (min-width: 360px) {
        font-size: 16px;
      }
    }

    &-counter {
      width: auto !important;
      height: auto !important;
      display: inline-flex;
      gap: 0;

      :deep(span) {
        width: auto;
        height: auto;
        font-size: inherit;
        line-height: inherit;
        background-color: transparent;
        color: inherit;
        display: inline;
        min-width: 10px;
        text-align: center;
      }

      &:after {
        content: "+";
        color: $white;
        font-size: 16px;
        line-height: 24px;
        font-weight: 600;
      }
    }
  }

  &__progress {
    &-wrapper {
      position: relative;
      width: 150px;
      padding: 0;
      text-align: center;
      margin: 32px 0 24px;
    }

    height: 6px;
    border-radius: 20px;
    width: inherit;

    :deep(.progress-line__indicator) {
      transition: stroke-dasharray 500ms ease-out 1s;
      stroke: $color-status-success;
      stroke-width: 10px;
      border-radius: 20px;
    }
    :deep(.progress-line__background) {
      stroke-width: 10px;
      border-radius: 20px;
    }
  }

  &__encription-badge {
    display: flex;
    gap: 6px;
    padding: 8px 10px;
    background-color: $color-primary-10;
    border-radius: 10px;
    align-items: center;
    width: fit-content;
    margin: 24px auto 0;
  }

  &__copyright {
    width: max-content;
    margin-top: 10px;
  }
}
</style>
