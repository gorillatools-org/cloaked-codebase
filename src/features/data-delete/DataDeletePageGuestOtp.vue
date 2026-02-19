<script setup>
// TODO: refactor shared logic using composables
import {
  computed,
  onMounted,
  onBeforeMount,
  ref,
  watch,
  reactive,
  nextTick,
  useTemplateRef,
  provide,
} from "vue";

import store from "@/store";
import DataDeleteService from "@/api/actions/data-delete-service";
import DataDeletePageBackground from "@/features/data-delete/DataDeletePageBackground.vue";
import DataDeletePage from "@/features/data-delete/DataDeletePage.vue";
import DataDeletePageAlreadyStarted from "@/features/data-delete/DataDeletePageAlreadyStarted.vue";
import CloudflareCaptcha from "@/features/headless-signup/CloudflareCaptcha.vue";
import HeadlessSignup from "@/features/headless-signup/HeadlessSignup.vue";
import UserService from "@/api/actions/user-service";
import { posthogCapture } from "@/scripts/posthog.js";
import { useThemeQueryParameter } from "@/composables/useThemeQueryParameter";
import { usePostHogFunnelTracking } from "@/composables/usePosthogFunnelTracking";
import { useDataDeleteInput } from "@/features/data-delete/composables/useDataDeleteInput";
import { useDataDeleteFormatting } from "@/features/data-delete/composables/useDataDeleteFormatting";
import { useDataDeleteSessionStorage } from "@/features/data-delete/composables/useDataDeleteSessionStorage";
import { useDataDeleteBrokerScan } from "@/features/data-delete/composables/useDataDeleteBrokerScan";
import { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser";
import { useFunnel } from "@/features/subscribe/composables/useFunnel";
import { FUNNEL_STEP } from "./utils";
import {
  PH_EVENT_USER_CLICKED_DATA_DELETION_SETUP_ACCOUNT_BUTTON,
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT,
  PH_FEATURE_FLAG_SCAN_NETWORK_VISUALIZATION,
} from "@/scripts/posthogEvents";
import DataDeletePageOtp from "@/features/data-delete/DataDeletePageOtp.vue";
import DataDeletePageResults from "@/features/data-delete/DataDeletePageResults.vue";
import DataDeletePageEmailResults from "@/features/data-delete/DataDeletePageEmailResults.vue";
import DataDeletePageAdditionalSearch from "@/features/data-delete/DataDeletePageAdditionalSearch.vue";
import DataDeletePageLoader from "@/features/data-delete/DataDeletePageLoader.vue";
import DataDeleteProtectionPlans from "@/features/data-delete/DataDeleteProtectionPlans.vue";
import DataDeleteProtectionPlansSurvey from "@/features/data-delete/DataDeleteProtectionPlansSurvey.vue";
import { useCustomerIo } from "@/features/data-delete/composables/useCustomerIo";
import { useRoute } from "vue-router";
import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import { useDisplay } from "@/composables/useDisplay";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { networkVisualizationFlagKey } from "@/features/data-delete/injectionKeys";

const toast = useToast();

const route = useRoute();
const { identify } = useCustomerIo();

useThemeQueryParameter();
usePostHogFunnelTracking();

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const {
  hasLoadedFeatureFlag: hasLoadedScanNetworkVisualizationFlag,
  featureFlag: scanNetworkVisualizationFlag,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_SCAN_NETWORK_VISUALIZATION);

const checkoutIntermediatePlansScreenEnabled = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "intermediate-checkout-screen"
);

const checkoutIntermediateQuestionScreenEnabled = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "intermediate-question-screen"
);

const hasCheckoutPageV2 = computed(
  () => hasLoadedFeatureFlag.value && featureFlag.value === "checkout-page-v2"
);

const isNetworkVisualizationEnabled = computed(() => {
  return (
    hasLoadedScanNetworkVisualizationFlag.value &&
    (scanNetworkVisualizationFlag.value === "network-visualization" ||
      scanNetworkVisualizationFlag.value ===
        "network-visualization-relation-only")
  );
});

const { dataDeleteInputForm } = useDataDeleteInput();
const { formattedPhoneNumber, formattedUserName } =
  useDataDeleteFormatting(dataDeleteInputForm);

const initialStep = route.query?.email
  ? FUNNEL_STEP.EMAIL_RESULTS
  : FUNNEL_STEP.OTP;

const { step, setStep } = useFunnel(initialStep);

const hasSearchError = ref(false);
const searchStep = ref("initial");
const searchResults = ref([]);
const numTotalResults = ref(0);
const verifiedUserInfo = ref(null);

const {
  clearSearchProgressFromSessionStorage,
  saveSearchProgressToSessionStorage,
} = useDataDeleteSessionStorage(dataDeleteInputForm, searchResults);

const statusState = reactive({
  hasAlreadyStartedDD: false,
});

const { isMobile } = useDisplay();

async function searchPublicRecords({
  firstName,
  lastName,
  state,
  phoneNumber,
  age,
  email,
}) {
  if (!(firstName && lastName) && !phoneNumber) {
    forceNewSearch();
    return;
  }

  isFetching.value = true;
  const { data } = await DataDeleteService.getPublicRecords({
    firstName,
    lastName,
    state,
    phoneNumber,
    age,
    email,
    redactAddress: false,
  });

  if (data.in_progress) {
    statusState.hasAlreadyStartedDD = true;
    return;
  }

  if (data.hasError) {
    hasSearchError.value = true;
    setStep(FUNNEL_STEP.RESULTS);
    return;
  }

  // for security reasons data.results always contains at most 1 result
  numTotalResults.value = data.numTotalResults ?? 0;

  if (data?.results?.length) {
    setStep(FUNNEL_STEP.LOADER);
    searchComplete.value = true;
    searchResults.value = data.results;
  } else {
    searchAlternateOptions({
      firstName,
      lastName,
      state,
      phoneNumber,
      age,
    });
  }

  isFetching.value = false;
}

const searchAlternateOptions = ({ firstName, lastName, state, age }) => {
  setStep(FUNNEL_STEP.NOT_YOU);
  if (!firstName && !lastName) {
    searchStep.value = "name";
  } else if (!age) {
    searchStep.value = "age";
  } else if (!state) {
    searchStep.value = "state";
  } else {
    setStep(FUNNEL_STEP.LOADER);
    searchComplete.value = true;
  }
};

const searchComplete = ref(false);
const isFetching = ref(false);
const isForcingNewSearch = ref(false);

function forceNewSearch() {
  isForcingNewSearch.value = true;
  searchComplete.value = false;
  searchResults.value = [];
  dataDeleteInputForm.value = {};
  searchAlternateOptions(dataDeleteInputForm.value);
}

const clearCheckoutDataScanBreachBanner = () => {
  localStorage.removeItem("checkoutScanBreachesCount");
  localStorage.removeItem("checkoutScanBreachesThreatLevel");
};

onBeforeMount(() => {
  clearSearchProgressFromSessionStorage();
  clearCheckoutDataScanBreachBanner();
  store.dispatch("authentication/setGuestToken", null);
  store.commit("authentication/setUser", null);
});

const storeSearchProgressInSessionStorage = () => {
  saveSearchProgressToSessionStorage();

  posthogCapture(PH_EVENT_USER_CLICKED_DATA_DELETION_SETUP_ACCOUNT_BUTTON, {
    isForcingNewSearch: isForcingNewSearch.value,
  });
};

async function goToCheckout() {
  storeSearchProgressInSessionStorage();

  if (hasCheckoutPageV2.value) {
    router.push({
      name: "CheckoutCombined",
      query: route.query,
    });
  } else {
    router.push({
      name: "SubscribeNow",
      query: route.query,
    });
  }
}

async function setSetup() {
  if (checkoutIntermediatePlansScreenEnabled.value) {
    setStep(FUNNEL_STEP.PRE_CHECKOUT_PROTECTION_PLANS);
  } else if (checkoutIntermediateQuestionScreenEnabled.value) {
    setStep(FUNNEL_STEP.INTERMEDIATE_QUESTION_SCREEN);
  } else {
    goToCheckout();
  }
}

function setSearchStep(value) {
  searchStep.value = value;
}

const {
  sortedRecords,
  progress: scanProgress,
  initiateScan,
} = useDataDeleteBrokerScan();

const scanPayload = computed(() => {
  const person = searchResults.value[0];
  const searchLocation = person.locations.find(
    (location) => location.city && location.state
  );

  return {
    firstName: person.firstName,
    lastName: person.lastName,
    age: person.age,
    city: searchLocation.city,
    state: searchLocation.state.abbreviation,
    phone: formattedPhoneNumber,
  };
});

const isValidScanPayload = computed(() =>
  ["firstName", "lastName", "age", "city", "state"].every(
    (field) => !!scanPayload.value[field]
  )
);

watch(searchResults, () => {
  if (searchResults.value?.length && isValidScanPayload.value) {
    initiateScan(scanPayload.value);
  }
});

const headlessIframe = useTemplateRef("headlessIframe");
const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");

onMounted(async () => {
  // for enterprise scans
  if (route.query?.email_address) {
    identify({
      email: route.query.email_address,
      phone: route.query.phone,
    });
  }

  const mountIframePromise = mountIframe(headlessIframe.value.$el);
  const cloudflareToken = await cloudflareCaptcha.value.verify();

  await mountIframePromise;
  await createUser(cloudflareToken);
});

const {
  createHeadlessUserError,
  createHeadlessUser,
  fetchHeadlessUser,
  mountIframe,
  headlessUser,
  verifyCode,
  isVerifyingCode,
  verifyCodeError,
  handleLoginPasswordlessUser,
  loginUserError,
} = useHeadlessUser();

async function verifyOTPCode({ phone_number, code }) {
  verifiedUserInfo.value = await verifyCode({ phone_number, code });
  return verifiedUserInfo.value;
}

const createUser = async (cloudflareToken) => {
  const initUserResponse = await createHeadlessUser({
    captcha: cloudflareToken,
    phone_number: formattedPhoneNumber,
  });

  if (initUserResponse?.username_exists) {
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
    return router.push({ name: "login" });
  } else if (!createHeadlessUserError.value) {
    fetchHeadlessUser();
  }
};

async function loginPasswordlessUser({ phone, code }) {
  await handleLoginPasswordlessUser({ phone, code });
  await UserService.getFlags();
}

provide(networkVisualizationFlagKey, {
  canShowNetwork: isNetworkVisualizationEnabled,
  hasLoaded: hasLoadedScanNetworkVisualizationFlag,
  flag: scanNetworkVisualizationFlag,
});
</script>

<template>
  <DataDeletePage>
    <DataDeletePageBackground />
    <DataDeletePageAlreadyStarted v-if="statusState.hasAlreadyStartedDD" />
    <template v-else>
      <DataDeletePageOtp
        v-if="step === FUNNEL_STEP.OTP"
        class="data-delete__page"
        :headless-user="headlessUser"
        :formatted-phone="formattedPhoneNumber"
        :is-fetching="isFetching"
        :is-verifying-code="isVerifyingCode"
        :verify-code-error="verifyCodeError"
        :verified-user-info="verifiedUserInfo"
        :login-user-error="loginUserError"
        @verify-code="verifyOTPCode"
        @search-public-records="searchPublicRecords"
        @create-user="createUser"
        @login-passwordless-user="loginPasswordlessUser"
      />

      <DataDeletePageLoader
        v-else-if="step === FUNNEL_STEP.LOADER"
        :search-complete="searchComplete"
        :user-name="formattedUserName"
        class="data-delete__page"
        @set-step="setStep(FUNNEL_STEP.RESULTS)"
      />

      <DataDeletePageAdditionalSearch
        v-else-if="step === FUNNEL_STEP.NOT_YOU"
        :value="dataDeleteInputForm"
        :is-fetching="isFetching"
        :search-step="searchStep"
        :is-forcing-new-search="isForcingNewSearch"
        class="data-delete__page"
        @input="dataDeleteInputForm = $event"
        @set-search-step="setSearchStep"
        @search-public-records="searchPublicRecords"
      />

      <DataDeletePageResults
        v-else-if="step === FUNNEL_STEP.RESULTS"
        :phone="dataDeleteInputForm.phone"
        :num-total-results="numTotalResults"
        :search-results="searchResults"
        :has-error="hasSearchError"
        :is-forcing-new-search="isForcingNewSearch"
        :records="sortedRecords"
        :scan-progress="scanProgress"
        class="data-delete__page"
        @force-new-search="forceNewSearch"
        @setup="setSetup"
        @complete="setSetup"
      />

      <DataDeletePageEmailResults
        v-else-if="step === FUNNEL_STEP.EMAIL_RESULTS"
        :is-forcing-new-search="isForcingNewSearch"
        class="data-delete__page"
        @setup="goToCheckout"
        @force-new-search="forceNewSearch"
      />

      <DataDeleteProtectionPlans
        v-else-if="step === FUNNEL_STEP.PRE_CHECKOUT_PROTECTION_PLANS"
        class="data-delete__page"
        @checkout="goToCheckout"
      />

      <DataDeleteProtectionPlansSurvey
        v-else-if="step === FUNNEL_STEP.INTERMEDIATE_QUESTION_SCREEN"
        class="data-delete__page"
        @next="goToCheckout"
        @skip="goToCheckout"
      />
    </template>
    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframe" />
  </DataDeletePage>
</template>
