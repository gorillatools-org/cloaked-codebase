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
  toValue,
  useTemplateRef,
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
import { PH_EVENT_USER_CLICKED_DATA_DELETION_SETUP_ACCOUNT_BUTTON } from "@/scripts/posthogEvents";
import DataDeletePageOtp from "@/features/data-delete/DataDeletePageOtp.vue";
import DataDeletePageOtpBrave from "@/features/data-delete/DataDeletePageOtpBrave.vue";
import DataDeletePageResults from "@/features/data-delete/DataDeletePageResults.vue";
import DataDeletePageEmailResults from "@/features/data-delete/DataDeletePageEmailResults.vue";
import DataDeletePageAdditionalSearch from "@/features/data-delete/DataDeletePageAdditionalSearch.vue";
import DataDeletePageLoader from "@/features/data-delete/DataDeletePageLoader.vue";
import { useRoute } from "vue-router";
import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import { useDisplay } from "@/composables/useDisplay";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_TIERED_PRICING_EXPERIMENT_1 } from "@/scripts/posthogEvents";

const toast = useToast();

const route = useRoute();

useThemeQueryParameter();
usePostHogFunnelTracking();

const SOURCE_STORAGE_KEY = "browser-type";

function persistSource(source) {
  if (!source) return;
  try {
    localStorage.setItem(SOURCE_STORAGE_KEY, source);
  } catch {
    return null;
  }
}

function getPersistedSource() {
  try {
    return localStorage.getItem(SOURCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

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
const isBraveOtp = ref(false);

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
  useArray = false,
}) {
  if (!(firstName && lastName) && !phoneNumber) {
    forceNewSearch();
    return;
  }

  isFetching.value = true;
  const { value: enrollmentV2Enabled } = await fetchFeatureFlag(
    "enrollment_v2_enabled"
  );
  const { data } = await DataDeleteService.getPublicRecords({
    firstName,
    lastName,
    state,
    phoneNumber,
    age,
    email,
    useArray,
    redactAddress: !toValue(enrollmentV2Enabled), // if enrollment v2 is enabled, we don't redact address
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
      useArray,
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

const nativeMobileAppHandoffPayload = computed(() => ({
  userInput: {
    phoneNumber: dataDeleteInputForm.value.phone,
    firstName: dataDeleteInputForm.value.firstName || null,
    lastName: dataDeleteInputForm.value.lastName || null,
    age: dataDeleteInputForm.value.age
      ? parseInt(dataDeleteInputForm.value.age)
      : null,
    // ios expects birthYear
    birthYear: searchResults.value?.[0]?.DOB?.year
      ? parseInt(searchResults.value?.[0]?.DOB?.year)
      : null,
    // android expects birth_year
    birth_year: searchResults.value?.[0]?.DOB?.year
      ? parseInt(searchResults.value?.[0]?.DOB?.year)
      : null,
    email: dataDeleteInputForm.value.email || null,
    stateAbbreviation: dataDeleteInputForm.value.state || null,
  },
  searchResult: searchResults.value?.[0] || null,
  numberOfResults: numTotalResults.value,
}));

const handOffSearchResultsToNativeMobileApp = () => {
  const payload = JSON.stringify(nativeMobileAppHandoffPayload.value);
  window.webkit?.messageHandlers?.searchCompleted?.postMessage(payload);
  window.cloakedAndroid?.onReceiveMessage?.(payload);
};

onBeforeMount(() => {
  clearSearchProgressFromSessionStorage();
  store.dispatch("authentication/setGuestToken", null);
  store.commit("authentication/setUser", null);
});

const storeSearchProgressInSessionStorage = () => {
  saveSearchProgressToSessionStorage();

  posthogCapture(PH_EVENT_USER_CLICKED_DATA_DELETION_SETUP_ACCOUNT_BUTTON, {
    isForcingNewSearch: isForcingNewSearch.value,
  });
};

async function setSetup() {
  handOffSearchResultsToNativeMobileApp();
  storeSearchProgressInSessionStorage();

  // Use PostHog feature flag instead of backend user flags for consistency
  const { value: tieredPricingExperiment } = await fetchFeatureFlag(
    PH_FEATURE_FLAG_TIERED_PRICING_EXPERIMENT_1
  );

  if (tieredPricingExperiment && tieredPricingExperiment !== "control") {
    router.push({
      name: "CheckoutPlans",
      query: route.query,
    });
  } else {
    router.push({
      name: "SubscribeNow",
      query: route.query,
    });
  }
}

function setSearchStep(value) {
  searchStep.value = value;
}

const { sortedRecords, initiateScan } = useDataDeleteBrokerScan();

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
  const sourceFromUrl = route.query?.source;
  const source = sourceFromUrl ?? getPersistedSource();

  if (source) persistSource(source);
  isBraveOtp.value = source === "brave";

  const mountIframePromise = mountIframe(headlessIframe.value.$el);
  const cloudflareToken = await cloudflareCaptcha.value.verify();

  await mountIframePromise;
  await createUser(cloudflareToken);

  const queryToKeep = { phone: route?.query?.phone };
  if (route?.query?.email) {
    queryToKeep.email = route.query.email;
  }
  router.replace({ ...route, query: queryToKeep });
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
</script>

<template>
  <DataDeletePage>
    <DataDeletePageBackground />
    <DataDeletePageAlreadyStarted v-if="statusState.hasAlreadyStartedDD" />
    <template v-else>
      <DataDeletePageOtpBrave
        v-if="step === FUNNEL_STEP.OTP && isBraveOtp"
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
      <DataDeletePageOtp
        v-else-if="step === FUNNEL_STEP.OTP"
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
        class="data-delete__page"
        @force-new-search="forceNewSearch"
        @setup="setSetup"
        @complete="setSetup"
      />

      <DataDeletePageEmailResults
        v-else-if="step === FUNNEL_STEP.EMAIL_RESULTS"
        class="data-delete__page"
        @setup="setSetup"
        @force-new-search="forceNewSearch"
      />
    </template>
    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframe" />
  </DataDeletePage>
</template>
