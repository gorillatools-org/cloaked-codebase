<script setup>
import { computed, reactive, onMounted, nextTick, ref } from "vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import moment from "moment";
import { humanize } from "@/scripts/timestamp_format";
import router from "@/routes/router";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import PreferencesCheckParagraph from "@/routes/modals/preferences/PreferencesCheckParagraph.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";

import {
  SUBSCRIPTION_STORES_FORMATTED,
  STRIPE_MANAGE_URL,
  SUPPORT_EMAIL,
} from "@/scripts/constants";

import ExportData from "@/routes/modals/preferences/ExportData.vue";

import UserService from "@/api/actions/user-service.js";
import Button from "@/features/Button.vue";
import { password_confirm } from "@/scripts/actions/encryption.js";
import AuthService from "@/api/actions/auth-service.js";
import SubscriptionService from "@/api/settings/subscription-services.js";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseInputOtp from "@/library/BaseInputOtp.vue";
import BaseText from "@/library/BaseText.vue";
const isSubscribed = computed(() => store.getters["settings/isSubscribed"]);
const isStoreManual = computed(() => store.getters["settings/isStoreManual"]);
const isStoreUnknown = computed(() => store.getters["settings/isStoreUnknown"]);
const userSubscription = computed(
  () => store.getters["settings/getSubscription"]
);
const isStoreStripe = computed(() => store.getters["settings/isStoreStripe"]);
const subStore = computed(() => store.getters["settings/getStore"]);
const isRestrictedPlan = computed(() => store.getters["settings/isCancelled"]);
const isLegacy = computed(() => store.getters["settings/isLegacy"]);
const isNew = computed(() => store.getters["settings/isTrial"]);

const hasCancelledRenewal = computed(
  () => !!userSubscription.value?.canceled_at
);

const emit = defineEmits(["toggleBack", "refreshUser"]);

const toast = useToast();

const CancelSubScriptionMessage = {
  stripe:
    "Your subscription is managed by Stripe. You will first need to cancel your subscription via Stripe then come back to this screen to delete your account.",
  app_store:
    "Your subscription is managed by the Apple App Store. You will first need to cancel your subscription from iOS Settings then come back to this screen to delete your account.",
  play_store:
    "Your subscription is managed by your Google account. Please open Cloaked from your Android device or Google to cancel your subscription then come back to this screen to delete your account.",
  paypal:
    "Your subscription is managed by your PayPal account. You will first need to cancel your subscription via Paypal then come back to this screen to delete your account.",
  unknown: "You do not have a subscription.",
  manual_upgrade: "You do not have a subscription.",
};

const state = reactive({
  step: 0,
  steps: ["password", "confirmation", "before-export", "export"],
  understandsDataWillBeDeleted: false,
  understandsAccessToServicesWillBeLost: false,
  understandsDataCannotBeRetrieved: false,
  loadingDelete: false,
  password: "",
  invalidPassword: false,
  loadingPassword: false,
  deletionDate: null,
  sendingOTPCode: false,
  otpCodeSent: false,
  otpResponseData: null,
});

function sendOTPCode() {
  state.sendingOTPCode = true;
  UserService.requestDeleteAccountOTP()
    .then((response) => {
      state.otpResponseData = response?.data?.detail;
      state.sendingOTPCode = false;
      state.otpCodeSent = true;
      state.step = 1;
      toast.success("OTP code sent successfully");
    })
    .catch(() => {
      state.sendingOTPCode = false;
      toast.error("Failed to send OTP code");
    });
}

onMounted(() => {
  SubscriptionService.getStripeInfo();
});

const href = computed(() => {
  let stripeUrl = STRIPE_MANAGE_URL;
  SubscriptionService.getStripeInfo();

  if (stripeEmail.value) {
    stripeUrl += `?prefilled_email=${stripeEmail.value}`;
  }
  return stripeUrl;
});
const stripeEmail = computed(() => {
  const stripeUserData = store.getters["settings/getStripe"];
  return stripeUserData?.email || null;
});

const annualOrMonthly = computed(() => {
  if (
    userSubscription?.value?.product_identifier
      ?.toLowerCase()
      .includes("annual") ||
    userSubscription?.value?.product_plan_title
      ?.toLowerCase()
      .includes("annual")
  ) {
    return "annual";
  } else if (
    userSubscription?.value?.product_identifier
      ?.toLowerCase()
      .includes("monthly") ||
    userSubscription?.value?.product_plan_title
      ?.toLowerCase()
      .includes("monthly")
  ) {
    return "monthly";
  }
  return "";
});

const subExpirationDate = computed(() => {
  if (userSubscription?.value?.expires_date) {
    return moment(userSubscription.value.expires_date).format("MMMM Do, YYYY");
  }
  return null;
});

const deleteDateLabel = computed(() => {
  if (state.deletionDate) {
    return moment(state.deletionDate).format("MMMM Do, YYYY");
  }
  return null;
});

const deletesIn = computed(() => {
  if (state.deletionDate) {
    return humanize(moment(state.deletionDate));
  }
  return "";
});

const currentStep = computed(() => state.steps[state.step]);

const toggleBack = () => {
  emit("toggleBack", {});
};

const user = computed(
  () => store.state.authentication?.user || store.state.user
);

function insertUser(data) {
  store.commit("authentication/setUser", data);
  emit("refreshUser");
}

const nextStep = () => {
  let next = state.step + 1;
  const maxStep = state.steps.length - 1;

  if (next >= maxStep) {
    next = maxStep;
  }

  state.step = next;
};

const handleDelete = async () => {
  const userId = user.value.id;

  const payload = {
    state: "pending_deletion",
    immediate_delete: false,
  };

  if (isPasswordless.value) {
    payload.otp_code = verificationCode.value;
    payload.otp_session_token = state.otpResponseData.otp_session_token;
    payload.number_hash = state.otpResponseData.number_hash;
  }

  state.loadingDelete = true;
  try {
    const res = await UserService.deleteUserAccount({ userId, payload });
    const { data } = res;
    insertUser(data);
    state.deletionDate = data.deletion_date;
    nextStep();
  } catch (e) {
    if (
      e?.response?.data?.errors?.non_field_errors?.includes("invalid-otp-code")
    ) {
      toast.error("Invalid OTP code. Please try again.");
    } else {
      toast.error("Error scheduling delete action.");
    }
  } finally {
    state.loadingDelete = false;
  }
};

const handleLater = () => {
  toggleBack();
};

const handleExportData = () => {
  nextStep();
};

const handleGoBack = () => {
  if (state.steps[state.step] === "before-export") {
    toggleBack();
  } else if (state.step > 0) {
    state.step = state.step - 1;
  } else {
    toggleBack();
  }
};

const validatePassword = async () => {
  state.loadingPassword = true;
  const hash = await password_confirm(state.password);
  AuthService.confirmPassword(user.value.id, hash)
    .then(() => {
      state.invalidPassword = false;
      if (store.state.authentication?.user?.state === "pending_deletion") {
        nextStep();
      }
      nextStep();
      state.password = "";
    })
    .catch(() => {
      state.invalidPassword = true;
      state.password = "";
      toast.error("Invalid password, please try again");
    })
    .finally(() => {
      state.loadingPassword = false;
      state.password = "";
    });
};

const storeName = computed(() => {
  return SUBSCRIPTION_STORES_FORMATTED?.[subStore.value] || null;
});

function upgradeModal() {
  store.dispatch("subscription/openSubscriptionModal");
}
function openRestoreAccount() {
  if (router.currentRoute.name !== "settings.account") {
    router.push({
      name: "settings.account",
    });
  }

  nextTick(() => {
    store.commit("openPreference", {
      selected: "account",
      right: "manage-account",
      step: "restore",
    });
  });
}

const isPasswordless = computed(() => {
  return store.getters["authentication/user"]?.is_passwordless;
});

const verificationCode = ref("");
</script>
<template>
  <PreferencesPanel class="delete-account">
    <template #header>
      <PreferencesHeader @go-back="handleGoBack" />
    </template>

    <template v-if="currentStep === 'password'">
      <div
        v-if="
          (isSubscribed || isLegacy || isNew) &&
          Object.keys(SUBSCRIPTION_STORES_FORMATTED).includes(subStore)
        "
      >
        <PreferencesTitle v-if="hasCancelledRenewal">
          Your subscription has been cancelled
        </PreferencesTitle>
        <PreferencesTitle
          v-else-if="!isStoreManual && !isStoreUnknown && !isLegacy && !isNew"
        >
          You have an active {{ annualOrMonthly }} subscription
          <br />
          ({{ storeName }})
        </PreferencesTitle>

        <PreferencesTitle v-else>
          You do not have an active subscription
        </PreferencesTitle>
        <PreferencesParagraph v-if="hasCancelledRenewal">
          Your subscription is managed by {{ storeName }}. Your subscription has
          been successfully cancelled and you have access to Cloaked until
          {{ subExpirationDate }}. You can now delete your account.
        </PreferencesParagraph>
        <PreferencesParagraph
          v-else-if="!isStoreManual && !isStoreUnknown && !isLegacy && !isNew"
        >
          {{ CancelSubScriptionMessage[subStore] }}
          <br />
          <a
            v-if="isStoreStripe"
            class="manage-link"
            :href="href"
            target="_blank"
          >
            Manage subscription
            <InlineSvg name="link" />
          </a>
        </PreferencesParagraph>
        <PreferencesParagraph v-else-if="isNew">
          <span>
            <a @click="upgradeModal">
              <u>Click here activate your subscription</u>
            </a>
          </span>
        </PreferencesParagraph>
        <PreferencesParagraph v-else>
          You are a legacy user.
        </PreferencesParagraph>
      </div>
      <div v-else-if="isRestrictedPlan">
        <PreferencesTitle>Your subscription is inactive</PreferencesTitle>
        <PreferencesParagraph>
          <span>
            <a @click="upgradeModal">
              <u>Click here to restore subscription</u>
            </a>
          </span>
        </PreferencesParagraph>
      </div>
      <div v-else>
        <PreferencesTitle>Could not load plan</PreferencesTitle>
        <PreferencesParagraph>
          We are unable to fetch your subscription information at this time.
          Ensure that you have canceled your subscription before deleting your
          account. If you need help, please contact customer support at:
          {{ SUPPORT_EMAIL }}
        </PreferencesParagraph>
      </div>

      <br />
      <PreferencesTitle
        :class="[
          !hasCancelledRenewal &&
          !isStoreManual &&
          !isStoreUnknown &&
          !isRestrictedPlan
            ? `delete-account__disabled`
            : '',
        ]"
      >
        Continue to delete account
      </PreferencesTitle>
      <PreferencesParagraph
        v-if="!isPasswordless"
        :class="[
          !hasCancelledRenewal &&
          !isStoreManual &&
          !isStoreUnknown &&
          !isRestrictedPlan
            ? `delete-account__disabled`
            : '',
        ]"
      >
        To continue deleting your account, enter your account password.
      </PreferencesParagraph>

      <Button
        v-if="isPasswordless && !state.otpCodeSent"
        type="danger"
        :loading="state.sendingOTPCode"
        :disabled="state.sendingOTPCode || !hasCancelledRenewal"
        @click="sendOTPCode"
      >
        Delete Account
      </Button>

      <PreferencesInput
        v-if="!isPasswordless"
        :value="state.password"
        :class="[
          (!hasCancelledRenewal &&
            !isStoreManual &&
            !isStoreUnknown &&
            !isRestrictedPlan) ||
          (!Object.keys(SUBSCRIPTION_STORES_FORMATTED).includes(subStore) &&
            !isNew &&
            !isRestrictedPlan)
            ? `delete-account__disabled`
            : '',
        ]"
        label="Password"
        type="password"
        placeholder="Your Password"
        :error="state.invalidPassword"
        :disabled="
          state.loadingPassword ||
          (!hasCancelledRenewal &&
            !isStoreManual &&
            !isStoreUnknown &&
            !isRestrictedPlan)
        "
        @input="(event) => (state.password = event)"
        @save="validatePassword"
      />
    </template>

    <template v-if="currentStep === 'confirmation'">
      <PreferencesTitle>Confirm account deletion</PreferencesTitle>

      <div
        v-if="isPasswordless && state.otpCodeSent"
        class="passwordless-delete"
      >
        <BaseText
          as="div"
          variant="headline-6-medium"
        >
          Enter the code sent to {{ state.otpResponseData?.number_masked }}
        </BaseText>
        <BaseInputOtp
          v-if="isPasswordless && state.otpCodeSent"
          ref="verificationCodeInput"
          v-model="verificationCode"
        />
        <BaseText
          as="div"
          variant="body-small-medium"
          class="passwordless-text-resend"
          @click="sendOTPCode"
        >
          Resend Code
        </BaseText>
      </div>

      <PreferencesCheckParagraph
        class="disclaimer-row delete-account__check"
        :value="state.understandsDataWillBeDeleted"
        @input="(event) => (state.understandsDataWillBeDeleted = event)"
      >
        I understand that my account will be permanently deleted and all data
        associated with my Cloaked identities.
      </PreferencesCheckParagraph>

      <PreferencesCheckParagraph
        class="disclaimer-row delete-account__check"
        :value="state.understandsCancelBilling"
        @input="(event) => (state.understandsCancelBilling = event)"
      >
        If you have an active subscription, you will continue to be billed even
        after your account is deleted until canceled.
      </PreferencesCheckParagraph>
    </template>

    <template v-if="currentStep === 'before-export' && deleteDateLabel">
      <PreferencesTitle>
        Your account will be deleted on {{ deleteDateLabel }}
      </PreferencesTitle>
      <PreferencesParagraph>
        Your account will be deleted
        <strong>{{ deletesIn }}</strong>
        , until then you'll have access to your Cloaked account and be able to
        restore your account.
        <br />
        <span>
          <a @click="openRestoreAccount">
            <u>Click here to restore your account</u>
          </a>
        </span>
      </PreferencesParagraph>

      <PreferencesTitle>Your data is important to us</PreferencesTitle>

      <PreferencesParagraph>
        We value your data and privacy. We strongly encourage you to export your
        data so that you can retain access to it after your account is deleted
        on
        <strong>{{ deleteDateLabel }}</strong>
        . After that date, it will be permanently deleted and Cloaked will be
        unable to retrieve it.
      </PreferencesParagraph>

      <PreferencesParagraph>
        Click the button below to begin exporting.
      </PreferencesParagraph>
    </template>
    <template v-if="currentStep === 'before-export' && !deleteDateLabel">
      <PreferencesParagraph>
        Currently we are unable to get this information. Please contact customer
        support at: {{ SUPPORT_EMAIL }}
      </PreferencesParagraph>
    </template>

    <template v-if="currentStep === 'export'">
      <ExportData
        view-step="export"
        nav-disabled
        @toggle-back="toggleBack"
      />
    </template>

    <template #footer>
      <PreferencesFooter v-if="currentStep === 'password' && !isPasswordless">
        <Button
          :class="[
            isSubscribed &&
            !isStoreManual &&
            !isStoreUnknown &&
            !isRestrictedPlan
              ? `delete-account__disabled`
              : '',
          ]"
          :loading="state.loadingPassword"
          :disabled="state.loadingPassword || !state.password"
          @click="validatePassword"
        >
          Continue
        </Button>
      </PreferencesFooter>

      <PreferencesFooter v-if="currentStep === 'confirmation'">
        <Button
          type="danger"
          :disabled="
            !state.understandsDataWillBeDeleted ||
            !state.understandsCancelBilling ||
            state.loadingPassword ||
            (isPasswordless && verificationCode?.length !== 6)
          "
          @click="handleDelete"
        >
          Delete my account
        </Button>
      </PreferencesFooter>

      <PreferencesFooter v-if="currentStep === 'before-export'">
        <Button
          type="secondary"
          @click="handleLater"
        >
          I'll do this later
        </Button>
        <Button @click="handleExportData">Export account data</Button>
      </PreferencesFooter>
    </template>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.delete-account {
  .preferences-input {
    margin-top: 37px;
  }

  & &__check {
    align-items: center;
    gap: 24px;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid $color-primary-20;

    &:hover {
      opacity: 0.9;
    }
  }
  a {
    cursor: pointer;
    color: $color-primary-100;

    &.manage-link {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-direction: row;
      justify-content: flex-start;
      margin-top: 8px;
    }

    &:hover {
      opacity: 0.8;
    }
  }
  &__disabled {
    color: $color-primary-100;
    opacity: 0.4;
  }
}

.passwordless-delete {
  color: $color-primary-100;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
  max-width: 400px;
  .passwordless-text-resend {
    color: $color-primary-100;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 8px;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
