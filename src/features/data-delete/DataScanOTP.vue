<script setup>
import { computed, onBeforeMount, ref, watch, nextTick, onMounted } from "vue";
import AppFormError from "@/features/AppFormError.vue";
import Spinner from "@/assets/icons/spinner.svg";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import { useCoolDown } from "@/composables/useCoolDown";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_USER_ENTERED_DATA_SCAN,
  PH_EVENT_USER_VIEWED_DATA_DELETION_PHONE_VERIFICATION,
} from "@/scripts/posthogEvents.js";
import BaseText from "@/library/BaseText.vue";
import router from "@/routes/router";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import store from "@/store";
import SubscriptionService from "@/api/settings/subscription-services";
import UserService from "@/api/actions/user-service";
import { DATA_DELETE_REQUESTED } from "@/scripts/userFlags";
import { useStripeIntentPrefetch } from "@/features/subscribe/composables/useStripeIntentPrefetch.js";
import { useToast } from "@/composables/useToast.js";
import DataDeleteCounter from "@/features/data-delete/atoms/DataDeleteCounter.vue";
import { phone } from "phone";
import { useDisplay } from "@/composables/useDisplay";
import BaseIcon from "@/library/BaseIcon.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT } from "@/scripts/posthogEvents";
import { formatPhone } from "@/scripts/format";
import InlineSvg from "@/features/InlineSvg.vue";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const toast = useToast();
defineOptions({ inheritAttrs: false });

const { prefetchIntents } = useStripeIntentPrefetch();

const { isMobile, isDesktop } = useDisplay();

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
const verificationCodeSuccess = ref(false);

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
    verificationCodeSuccess.value = true; // Show Success check icon
    setTimeout(() => {
      return searchRecords(); // This navigates user to search results page
    }, 500);
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

onBeforeMount(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_PHONE_VERIFICATION);
});

onMounted(() => {
  posthogCapture(PH_EVENT_USER_ENTERED_DATA_SCAN);
});

const isPhoneNumberValid = computed(() => {
  return !!phone(props.formattedPhone).phoneNumber;
});

const isInputOTPDisabled = computed(
  () =>
    !props.headlessUser ||
    props.isVerifyingCode ||
    props.isFetching ||
    isDecidingWhereToRedirect.value ||
    verificationCodeSuccess.value ||
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
  <div class="data-delete__page data-delete__page--scan-otp">
    <div class="data-scan-otp">
      <InlineSvg
        name="cloaked-logo-full"
        class="data-scan-otp__cloaked-logo"
      />
      <template
        v-if="
          hasLoadedFeatureFlag && featureFlag !== 'spycloud-otp-remove-counter'
        "
      >
        <DataDeleteCounter
          class="data-scan-otp__counter"
          :delay="1000"
          :duration="45000"
          :ends-at="exposures"
        />
        <BaseText
          as="h1"
          :variant="isDesktop ? 'headline-4-medium' : 'headline-6-medium'"
          class="data-scan-otp__exposures"
        >
          exposures uncovered
        </BaseText>
      </template>
      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="data-scan-otp__title"
      >
        Enter your
        <br />
        verification code
      </BaseText>

      <BaseText
        as="p"
        variant="headline-4-medium"
        class="data-delete__text data-scan-otp__text"
      >
        Code sent to
      </BaseText>
      <BaseText
        as="p"
        variant="headline-4-medium"
        class="data-delete__text data-scan-otp__text-number"
      >
        {{ formatPhone(formattedPhone) }}
      </BaseText>

      <BaseInputOtp
        ref="verificationCodeInput"
        v-model="verificationCode"
        class="data-scan-otp__input"
        :disabled="isInputOTPDisabled"
      />

      <AppFormError
        v-if="userError"
        class="data-scan-otp__error"
      >
        {{ userError }}
      </AppFormError>

      <div
        v-if="userError ? props.verifyCodeError : true"
        class="data-scan-otp__resend"
      >
        <template v-if="verificationCodeSuccess">
          Successfully verified!
          <div>
            <BaseIcon
              name="tick-circle-filled"
              class="verifying-check"
            />
          </div>
        </template>
        <template v-else-if="isDecidingWhereToRedirect || isFetching">
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
          <div class="data-scan-otp__resend-content">
            <span>Not receiving the code?</span>
            <button
              class="data-scan-otp__resend-button"
              :disabled="props.isFetching"
              @click="sendVerificationCodeAndCoolDown"
            >
              Resend
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
  <div class="data-scan-otp__login">
    <BaseText
      as="div"
      variant="body-3-regular"
      class="data-scan-otp__login-text"
    >
      {{ "Already have an account? Sign in" }}
      <BaseText
        variant="body-3-regular"
        underline
        class="data-scan-otp__link"
        @click="linkToLogin"
      >
        {{ isMobile ? "here" : "here." }}
      </BaseText>

      <BaseText
        v-if="isMobile"
        variant="body-3-regular"
      >
        {{ " on desktop or" }}
        <BaseText
          variant="body-3-regular"
          underline
          class="data-scan-otp__link"
          @click="linkToDownloadMobile"
        >
          {{ "download our mobile app." }}
        </BaseText>
      </BaseText>
    </BaseText>

    <BaseText
      as="div"
      variant="body-3-regular"
      class="data-scan-otp__login-text"
    >
      {{ "Scan not working? Create a new account" }}
      <BaseText
        variant="body-3-regular"
        class="data-scan-otp__link"
        underline
        @click="linkToSubscribe"
      >
        {{ "here." }}
      </BaseText>
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
.verifying-check {
  color: $color-safe-zone-green;
  font-size: 30px;
  opacity: 0;
  animation: verifying-check-in 0.25s ease-out forwards;
}

@keyframes verifying-check-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.data-scan-otp {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
  background: transparent !important;

  &__cloaked-logo {
    width: 128px;
    margin: 50px auto 32px;
    z-index: 2;
    display: none;

    @media all and (min-width: $screen-xl) {
      display: block;
    }
  }

  @media screen and (min-width: $screen-sm) {
    width: 600px;
  }

  @media all and (min-width: $screen-xl) {
    margin: auto;
    border-radius: 24px;
    padding: 12px 60px 40px;

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

    @media all and (min-width: $screen-xl) {
      position: fixed;
      top: 32px;
      left: 32px;
      height: 26px * 1.5;
      width: 101px * 1.5;
    }
  }

  &__counter {
    @media screen and (min-width: $screen-sm) {
      margin-top: 32px;
    }
  }

  &__exposures {
    margin-top: 12px;
    margin-bottom: 16px;
    opacity: 0.8;

    @media all and (min-width: $screen-xl) {
      margin-top: 12px;
      margin-bottom: 24px;
    }
  }

  &__title {
    margin-top: 16px;
    opacity: 0;
    animation: appear-bottom-5 0.4s 0.1s forwards ease-out;
    vertical-align: middle;
    text-align: center;

    @media all and (min-width: $screen-xl) {
      margin-top: 20px;
      max-width: 400px;
    }
  }

  &__text {
    max-width: 500px;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.2s forwards ease-out;
    text-align: center;
    margin-top: 12px;
  }

  &__text-number {
    text-align: center;
    margin-top: 0;
    font-weight: 700;
  }

  &__input {
    max-width: 300px;
    margin: 28px auto 0;
    animation: appear-bottom-5 0.4s 0.5s forwards ease-out;
  }

  @mixin data-scan-otp-button {
    background-color: transparent;
    border: none;
    margin-top: 20px;
    color: $color-primary-100;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    &:disabled {
      cursor: not-allowed;
      text-decoration: none;
    }

    &:hover {
      opacity: 0.9;

      &:disabled {
        opacity: 1;
      }
    }
  }

  &__button {
    @include data-scan-otp-button;
  }

  &__resend {
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.65s forwards ease-out;
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__resend-content {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__resend-button {
    @include data-scan-otp-button;

    padding: 0;
    margin-top: 0;
    font-size: inherit;
    text-decoration: underline;
  }

  &__error {
    margin-top: 12px;
    text-align: center;
    max-width: 300px;
  }

  &__login {
    z-index: 2;
    width: 100%;
    max-width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: auto;
    margin-bottom: 48px;
    padding-left: 40px;
    padding-right: 40px;
    gap: 8px;
    display: none;

    &-text {
      text-align: center;
      max-width: 500px;
    }

    @media all and (min-width: $screen-xl) {
      display: flex;
    }
  }

  &__link {
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

.data-delete__page--scan-otp {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
</style>
