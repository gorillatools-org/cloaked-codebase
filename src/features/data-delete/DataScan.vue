<script setup>
import {
  computed,
  onBeforeMount,
  ref,
  reactive,
  nextTick,
  useTemplateRef,
  provide,
} from "vue";

import store from "@/store";
import DataDeleteService from "@/api/actions/data-delete-service";
import DataDeletePageBackground from "@/features/data-delete/DataDeletePageBackground.vue";
import DataDeletePage from "@/features/data-delete/DataDeletePage.vue";
import DataScanPageLoader from "@/features/data-delete/DataScanPageLoader.vue";
import DataDeletePageAlreadyStarted from "@/features/data-delete/DataDeletePageAlreadyStarted.vue";
import CloudflareCaptcha from "@/features/headless-signup/CloudflareCaptcha.vue";
import HeadlessSignup from "@/features/headless-signup/HeadlessSignup.vue";
import UserService from "@/api/actions/user-service";
import { useDataDeleteInput } from "@/features/data-delete/composables/useDataDeleteInput";
import { useDataDeleteFormatting } from "@/features/data-delete/composables/useDataDeleteFormatting";
import { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser";
import { useFunnel } from "@/features/subscribe/composables/useFunnel";
import { FUNNEL_STEP } from "./utils";
import DataScanOtp from "@/features/data-delete/DataScanOTP.vue";
import DataScanResults from "@/features/data-delete/DataScanResults.vue";
import DataDeletePageAdditionalSearch from "@/features/data-delete/DataDeletePageAdditionalSearch.vue";
import DataDeletePageLoader from "@/features/data-delete/DataDeletePageLoader.vue";
import DataScanLoader from "@/features/data-delete/atoms/DataScanLoader.vue";
import DataScanAppDownload from "@/features/data-delete/DataScanAppDownload.vue";
import { useRoute } from "vue-router";
import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import { useDisplay } from "@/composables/useDisplay";
import { useThemeQueryParameter } from "@/composables/useThemeQueryParameter";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT,
  PH_FEATURE_FLAG_SCAN_NETWORK_VISUALIZATION,
  PH_FEATURE_FLAG_DATA_SCAN_APP_DOWNLOAD,
  PH_EVENT_USER_VIEWED_DATA_SCAN_SPYCLOUD_DATA,
  PH_EVENT_VIEWED_DATA_SCAN_OTP_VERIFICATION_FAILED,
  PH_FEATURE_FLAG_SCAN_OTP_HEADER,
} from "@/scripts/posthogEvents.js";
import { networkVisualizationFlagKey } from "@/features/data-delete/injectionKeys";
import { posthogCapture } from "@/scripts/posthog.js";
import { useDataDeleteSessionStorage } from "@/features/data-delete/composables/useDataDeleteSessionStorage";
import DataScanCommunityCouter from "@/features/data-delete/experiment-components/DataScanCommunityCouter.vue";
import DataScanYouShouldKnowTips from "@/features/data-delete/experiment-components/DataScanYouShouldKnowTips.vue";
import DataScanScamTicker from "@/features/data-delete/experiment-components/DataScanScamTicker.vue";
import { useFeatureFlag } from "@/posthog/useFeatureFlag";
import { watchImmediate } from "@vueuse/core";

const toast = useToast();
const route = useRoute();
const { isMobile } = useDisplay();
useThemeQueryParameter();

const {
  hasLoadedFeatureFlag: hasLoadedScanNetworkVisualizationFlag,
  featureFlag: scanNetworkVisualizationFlag,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_SCAN_NETWORK_VISUALIZATION);

const {
  hasLoadedFeatureFlag: hasLoadedScanOtpHeaderFlag,
  featureFlag: scanOtpHeaderFlag,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_SCAN_OTP_HEADER);

const backgroundGradientOffFlag = useFeatureFlag("background-gradient-off");

const mobileCheckoutFlag = useFeatureFlag("mobile-checkout");

const showGradientBackground = computed(() => {
  return (
    backgroundGradientOffFlag.loaded &&
    (!backgroundGradientOffFlag.value ||
      backgroundGradientOffFlag.value === "control")
  );
});

const isNetworkVisualizationEnabled = computed(() => {
  return (
    hasLoadedScanNetworkVisualizationFlag.value &&
    (scanNetworkVisualizationFlag.value === "network-visualization" ||
      scanNetworkVisualizationFlag.value ===
        "network-visualization-relation-only")
  );
});

const {
  hasLoadedFeatureFlag: hasLoadedDataScanAppDownloadFlag,
  featureFlag: dataScanAppDownloadFlag,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_DATA_SCAN_APP_DOWNLOAD);

const isAppDownloadVariant = computed(() => {
  if (!isMobile.value) {
    return false;
  }
  return (
    hasLoadedDataScanAppDownloadFlag.value &&
    dataScanAppDownloadFlag.value === "app-download"
  );
});

const { dataDeleteInputForm } = useDataDeleteInput();

const { formattedPhoneNumber, formattedUserName } =
  useDataDeleteFormatting(dataDeleteInputForm);

const { step, setStep } = useFunnel(FUNNEL_STEP.OTP);

const hasSearchError = ref(false);
const searchStep = ref("initial");
const searchResults = ref([]);
const numTotalResults = ref(0);
const verifiedUserInfo = ref(null);

const statusState = reactive({
  hasAlreadyStartedDD: false,
});

const searchComplete = ref(false);
const isFetching = ref(false);
const isForcingNewSearch = ref(false);

const email = ref(route.query.email || "");
const breachData = ref(null);
const hasBreachLoaded = ref(false);
const hasScanAppDownloadLoaded = ref(false);

const {
  clearSearchProgressFromSessionStorage,
  saveSearchProgressToSessionStorage,
} = useDataDeleteSessionStorage(dataDeleteInputForm, searchResults);

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

  if (route.query.email || formattedPhoneNumber) {
    // TODO: make in sync with loader (and use async)
    loadBreachData();
  }

  const { data } = await DataDeleteService.getPublicRecords({
    firstName,
    lastName,
    state,
    phoneNumber,
    age,
    email,
    // keep addresses redacted by default
    redactAddress: true,
  });

  if (data.in_progress) {
    statusState.hasAlreadyStartedDD = true;
    isFetching.value = false;
    return;
  }

  if (data.hasError) {
    hasSearchError.value = true;
    if (hasBreachLoaded.value) {
      setStep(FUNNEL_STEP.RESULTS);
    }
    isFetching.value = false;
    return;
  }

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

const loadBreachData = async () => {
  try {
    const { data } = await DataDeleteService.getBreachScanReport(
      email.value,
      formattedPhoneNumber
    );

    breachData.value = { ...data };
    hasBreachLoaded.value = true;

    posthogCapture(PH_EVENT_USER_VIEWED_DATA_SCAN_SPYCLOUD_DATA, {
      resultsCount:
        (data.passwords?.length ?? 0) +
        (data.mortgages?.length ?? 0) +
        (data.properties?.length ?? 0) +
        (data.registered_vehicles?.length ?? 0) +
        (data.finances?.length ?? 0) +
        (data.contacts?.length ?? 0),
    });
  } catch {
    hasBreachLoaded.value = true;
  }
};

const showCloakedLogo = computed(() => {
  if (
    !hasLoadedScanOtpHeaderFlag.value ||
    scanOtpHeaderFlag.value === "community-counter" ||
    scanOtpHeaderFlag.value === "tips" ||
    scanOtpHeaderFlag.value === "scam-ticker"
  ) {
    return false;
  }

  return true;
});

const totalBreachesCount = computed(() => {
  const bestMatch = searchResults.value?.[0];
  const data = breachData.value;

  const hasSSN = bestMatch?.ssn ? 1 : 0;
  const hasDOB = bestMatch?.DOB?.year ? 1 : 0;
  const hasName = bestMatch?.name ? 1 : 0;

  return (
    (bestMatch?.locations?.length ?? 0) +
    (bestMatch?.phones?.length ?? 0) +
    1 + // scanned phone number
    (bestMatch?.relatives?.length ?? 0) +
    hasSSN +
    hasDOB +
    hasName +
    (data?.mortgages?.length ?? 0) +
    (data?.properties?.length ?? 0) +
    (data?.passwords?.length ?? 0) +
    (data?.registered_vehicles?.length ?? 0)
  );
});

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

function forceNewSearch() {
  isForcingNewSearch.value = true;
  searchComplete.value = false;
  searchResults.value = [];
  dataDeleteInputForm.value = {};
  searchAlternateOptions(dataDeleteInputForm.value);
}

onBeforeMount(() => {
  clearSearchProgressFromSessionStorage();
  store.dispatch("authentication/setGuestToken", null);
  store.commit("authentication/setUser", null);
});

const headlessIframe = useTemplateRef("headlessIframe");
const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");

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

  // If the user is not verified, something went wrong
  if (!verifiedUserInfo.value) {
    posthogCapture(PH_EVENT_VIEWED_DATA_SCAN_OTP_VERIFICATION_FAILED);
  }

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

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const hasCheckoutPageV2 = computed(
  () => hasLoadedFeatureFlag.value && featureFlag.value === "checkout-page-v2"
);

function setSetup() {
  saveSearchProgressToSessionStorage();

  if (
    isMobile.value &&
    mobileCheckoutFlag.loaded &&
    mobileCheckoutFlag.value === "mobile-checkout"
  ) {
    router.push({
      name: "CheckoutMobile",
      query: route.query,
    });
    return;
  }

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

function handleLoaderComplete() {
  setStep(FUNNEL_STEP.RESULTS);
}

function handleLoaderSetStep() {
  if (hasBreachLoaded.value || isNetworkVisualizationEnabled.value) {
    setStep(FUNNEL_STEP.RESULTS);
  } else {
    setStep(FUNNEL_STEP.LOADING_RESULTS);
  }
}

function onAppDownloadLoaderComplete() {
  hasScanAppDownloadLoaded.value = true;
}

watchImmediate(
  () => [hasLoadedDataScanAppDownloadFlag.value, isAppDownloadVariant.value],
  async () => {
    // Only init the user if not in the app download variant
    // TODO: Move this back to onMounted once we finish the pre-scan app download experiment
    if (hasLoadedDataScanAppDownloadFlag.value && !isAppDownloadVariant.value) {
      const mountIframePromise = mountIframe(headlessIframe.value.$el);
      const cloudflareToken = await cloudflareCaptcha.value.verify();

      await mountIframePromise;
      await createUser(cloudflareToken);
      localStorage.removeItem("data-delete-relatives");
    }
  }
);

provide(networkVisualizationFlagKey, {
  canShowNetwork: isNetworkVisualizationEnabled,
  hasLoaded: hasLoadedScanNetworkVisualizationFlag,
  flag: scanNetworkVisualizationFlag,
});
</script>

<template>
  <DataDeletePage class="data-scan__page">
    <template v-if="hasLoadedDataScanAppDownloadFlag">
      <!-- App Download Variant (mobile only) -->
      <template v-if="isAppDownloadVariant">
        <Transition
          class="data-scan__app-download-screen"
          name="fade-loader"
          mode="out-in"
        >
          <DataScanPageLoader
            v-if="!hasScanAppDownloadLoaded"
            key="loader"
            @complete="onAppDownloadLoaderComplete"
          />
          <DataScanAppDownload
            v-else
            key="app-download"
            :phone-number="formattedPhoneNumber"
          />
        </Transition>
      </template>

      <!-- Normal Flow -->
      <template v-else>
        <DataDeletePageBackground v-if="showGradientBackground" />
        <DataDeletePageAlreadyStarted v-if="statusState.hasAlreadyStartedDD" />

        <template v-else>
          <template
            v-if="hasLoadedScanOtpHeaderFlag && step === FUNNEL_STEP.OTP"
          >
            <DataScanCommunityCouter
              v-if="scanOtpHeaderFlag === 'community-counter'"
            />
            <DataScanYouShouldKnowTips
              v-else-if="scanOtpHeaderFlag === 'tips'"
              class="data-scan__otp-tips-header"
            />
            <DataScanScamTicker
              v-else-if="scanOtpHeaderFlag === 'scam-ticker'"
              class="data-scan__otp-tips-header"
            />
          </template>

          <DataScanOtp
            v-if="step === FUNNEL_STEP.OTP"
            class="data-delete__page"
            :headless-user="headlessUser"
            :show-data-delete-counter="
              hasLoadedScanOtpHeaderFlag &&
              (scanOtpHeaderFlag === 'control' || !scanOtpHeaderFlag)
            "
            :show-cloaked-logo="showCloakedLogo"
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
            @set-step="handleLoaderSetStep"
          />

          <DataDeletePageAdditionalSearch
            v-else-if="step === FUNNEL_STEP.NOT_YOU"
            :value="dataDeleteInputForm"
            :is-fetching="isFetching"
            :search-step="searchStep"
            :is-forcing-new-search="isForcingNewSearch"
            class="data-delete__page"
            @input="dataDeleteInputForm = $event"
            @set-search-step="(v) => (searchStep = v)"
            @search-public-records="searchPublicRecords"
          />

          <DataScanLoader
            v-else-if="step === FUNNEL_STEP.LOADING_RESULTS"
            @complete="handleLoaderComplete"
          />

          <DataScanResults
            v-else-if="step === FUNNEL_STEP.RESULTS"
            :phone="dataDeleteInputForm.phone"
            :num-total-results="numTotalResults"
            :search-results="searchResults"
            :has-error="hasSearchError"
            :is-forcing-new-search="isForcingNewSearch"
            :breach-data="breachData"
            :total-breaches-count="totalBreachesCount"
            class="data-delete__page"
            @force-new-search="forceNewSearch"
            @setup="setSetup"
            @complete="setSetup"
          />
        </template>
      </template>
    </template>

    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframe" />
  </DataDeletePage>
</template>

<style lang="scss" scoped>
.data-scan {
  &__page {
    align-items: center;
    background-color: $color-primary-1;

    :deep(.data-delete-search-page) {
      align-items: initial;
    }

    :deep(.data-delete__page) {
      padding-top: 0;
      padding-inline: 16px;
      margin: 24px 0 0;

      @media screen and (min-width: $screen-sm) {
        margin-top: 32px;
        padding-inline: 22px;
      }
    }

    :deep(.data-delete-additional-search) {
      margin-top: clamp(40px, 5vh, 150px);
      padding: 40px 22px 25px;
    }

    :deep(.email-breaches-header) {
      max-width: 1014px;
      margin: 0 auto;
    }

    :deep(.email-breaches-header__logo) {
      padding-top: 32px;
    }

    // TODO: remove this once we finish the data-scan-otp-header experiment
    &:has(.data-scan__otp-tips-header) :deep(.data-delete__page) {
      margin-top: 10px;
      transition: all 0.3s ease-in-out;
    }
  }
}

.fade-loader-enter-active,
.fade-loader-leave-active {
  transition: opacity 300ms ease-in-out;
}

.fade-loader-enter-from,
.fade-loader-leave-to {
  opacity: 0;
}
</style>
