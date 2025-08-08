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
import DataDeletePageResults from "@/features/data-delete/DataDeletePageResults.vue";
import DataDeletePageAdditionalSearch from "@/features/data-delete/DataDeletePageAdditionalSearch.vue";
import DataDeletePageLoader from "@/features/data-delete/DataDeletePageLoader.vue";
import { useRoute } from "vue-router";
import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import { isMobileDevice } from "@/scripts/regex";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";

const toast = useToast();

const route = useRoute();

useThemeQueryParameter();
usePostHogFunnelTracking();

const { dataDeleteInputForm } = useDataDeleteInput();
const { formattedPhoneNumber, formattedUserName } =
  useDataDeleteFormatting(dataDeleteInputForm);

const { step, setStep } = useFunnel(FUNNEL_STEP.OTP);

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
  const { data } = await DataDeleteService.getPublicRecords({
    firstName,
    lastName,
    state,
    phoneNumber,
    age,
    email,
    useArray,
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

const { featureFlag: splitCheckoutVariant } = usePostHogFeatureFlag(
  "split-checkout-5-28-25"
);

function setSetup() {
  handOffSearchResultsToNativeMobileApp();
  storeSearchProgressInSessionStorage();

  if (splitCheckoutVariant.value === "split-checkout") {
    router.push({
      name: "SubscribePlan",
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

onMounted(async () => {
  const mountIframePromise = mountHeadlessIframe();
  const cloudflareToken = await cloudflareCaptcha.value.verify();

  await mountIframePromise;
  await createUser(cloudflareToken);

  router.replace({ ...route, query: { phone: route?.query?.phone } });
});

const {
  createHeadlessUserError,
  createHeadlessUser,
  fetchHeadlessUser,
  headlessIframeRef,
  mountHeadlessIframe,
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

const cloudflareCaptcha = ref(null);

const createUser = async (cloudflareToken) => {
  const initUserResponse = await createHeadlessUser(
    cloudflareToken,
    formattedPhoneNumber
  );

  if (initUserResponse?.username_exists) {
    toast.success(
      "Looks like you already have a Cloaked account - we'll need you to enter your password."
    );
    if (isMobileDevice) {
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
      <DataDeletePageOtp
        v-if="step === FUNNEL_STEP.OTP"
        class="data-delete__page"
        :headlessUser="headlessUser"
        :formattedPhone="formattedPhoneNumber"
        :is-fetching="isFetching"
        :isVerifyingCode="isVerifyingCode"
        :verifyCodeError="verifyCodeError"
        :verifiedUserInfo="verifiedUserInfo"
        :loginUserError="loginUserError"
        @verifyCode="verifyOTPCode"
        @searchPublicRecords="searchPublicRecords"
        @createUser="createUser"
        @loginPasswordlessUser="loginPasswordlessUser"
      />
      <DataDeletePageLoader
        v-else-if="step === FUNNEL_STEP.LOADER"
        :searchComplete="searchComplete"
        :userName="formattedUserName"
        class="data-delete__page"
        @setStep="setStep(FUNNEL_STEP.RESULTS)"
      />
      <DataDeletePageResults
        v-else-if="step === FUNNEL_STEP.RESULTS"
        :phone="dataDeleteInputForm.phone"
        :numTotalResults="numTotalResults"
        :searchResults="searchResults"
        :hasError="hasSearchError"
        :isForcingNewSearch="isForcingNewSearch"
        :records="sortedRecords"
        class="data-delete__page"
        @force-new-search="forceNewSearch"
        @setup="setSetup"
        @complete="setSetup"
      />
      <DataDeletePageAdditionalSearch
        v-else-if="step === FUNNEL_STEP.NOT_YOU"
        :value="dataDeleteInputForm"
        :is-fetching="isFetching"
        :searchStep="searchStep"
        :isForcingNewSearch="isForcingNewSearch"
        class="data-delete__page"
        @input="dataDeleteInputForm = $event"
        @setSearchStep="setSearchStep"
        @searchPublicRecords="searchPublicRecords"
      />
    </template>
    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframeRef" />
  </DataDeletePage>
</template>
