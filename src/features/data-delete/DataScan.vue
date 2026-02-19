<script setup>
import {
  computed,
  onMounted,
  onBeforeMount,
  ref,
  reactive,
  nextTick,
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
import { useRoute } from "vue-router";
import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import { useDisplay } from "@/composables/useDisplay";
import { emailCheck } from "@/scripts/regex";

const toast = useToast();
const route = useRoute();
const { isMobile } = useDisplay();

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

  if (route.query.email) {
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
  if (!emailCheck(email.value)) {
    console.error("Invalid email address");
    return;
  }

  try {
    const { data } = await DataDeleteService.getBreachScanReport(email.value);
    breachData.value = { ...data };
    hasBreachLoaded.value = true;
  } catch {
    hasBreachLoaded.value = true;
  }
};

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
  store.dispatch("authentication/setGuestToken", null);
  store.commit("authentication/setUser", null);
});

const headlessIframe = useTemplateRef("headlessIframe");
const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");

onMounted(async () => {
  const mountIframePromise = mountIframe(headlessIframe.value.$el);
  const cloudflareToken = await cloudflareCaptcha.value.verify();
  await mountIframePromise;
  await createUser(cloudflareToken);

  const queryToKeep = {
    phone: route?.query?.phone,
    email: route?.query?.email,
  };
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

function setSetup() {
  router.push({
    name: "SubscribeNow",
    query: route.query,
  });
}

function handleLoaderComplete() {
  setStep(FUNNEL_STEP.RESULTS);
}

function handleLoaderSetStep() {
  if (hasBreachLoaded.value) {
    setStep(FUNNEL_STEP.RESULTS);
  } else {
    setStep(FUNNEL_STEP.LOADING_RESULTS);
  }
}
</script>

<template>
  <DataDeletePage class="data-scan__page">
    <DataDeletePageBackground />
    <DataDeletePageAlreadyStarted v-if="statusState.hasAlreadyStartedDD" />

    <template v-else>
      <DataScanOtp
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

    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframe" />
  </DataDeletePage>
</template>

<style lang="scss" scoped>
.data-scan {
  &__page {
    align-items: center;

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
  }
}
</style>
