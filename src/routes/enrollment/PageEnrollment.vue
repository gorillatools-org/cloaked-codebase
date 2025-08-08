<script setup>
import { computed, onBeforeMount, onMounted, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import EnrollmentHeader from "@/features/enrollment/EnrollmentHeader.vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { useToast } from "@/composables/useToast.js";
import { useColorScheme } from "@/composables/useColorScheme.js";
import { useDataDeleteSessionStorage } from "@/features/data-delete/composables/useDataDeleteSessionStorage.js";
import { useDataDeleteOverlay } from "@/routes/DataDeletion/composables/useDataDeleteOverlay.js";
import { useMonitoringAutofill } from "@/features/monitoring/useMonitoringAutofill.js";
import { useBasicMode } from "@/composables/useBasicMode.js";
import { DOWNLOAD_APP_URL } from "@/scripts/constants.js";
import { PH_EVENT_USER_SUBMITTED_DD_SUBMISSION_FORM } from "@/scripts/posthogEvents.js";
import { toApiPayload } from "@/features/enrollment/data-utils.js";
import store from "@/store/index.js";

const route = useRoute();
const router = useRouter();

const request = useLocalStorage("enrollment-request", {
  name: {},
  dob: null,
  addresses: [],
  email_addresses: [],
  phone_numbers: [],
  ssn: null,
  agreesWithTerms: false,
  wasAutofilled: false,
});

const {
  autofillMonitoringData,
  getAutofillDataFromEnrollment,
  getAutofillDataFromSearchResults,
  getAutofillDataFromUserObject,
} = useMonitoringAutofill();

const autofillFormOnce = async () => {
  if (request.value.wasAutofilled) {
    return;
  }

  const dataFromSearchResults = await getAutofillDataFromSearchResults();

  if (dataFromSearchResults) {
    autofillMonitoringData(request, dataFromSearchResults);
    const dataFromUserObject = await getAutofillDataFromUserObject();
    autofillMonitoringData(request, dataFromUserObject);
  } else {
    const dataFromEnrollment = await getAutofillDataFromEnrollment();
    autofillMonitoringData(request, dataFromEnrollment);
  }

  request.value.wasAutofilled = true;
};

onBeforeMount(autofillFormOnce);

const hasRemovalEnrollment = ref(false);

onBeforeMount(() => {
  hasRemovalEnrollment.value = store.getters["dataDelete/hasRemovalEnrollment"];
});

const steps = computed(() =>
  hasRemovalEnrollment.value
    ? [
        { route: "EnrollmentNames", title: "Set up Identity Monitoring" },
        { route: "EnrollmentContacts", title: "Set up Identity Monitoring" },
        {
          route: "EnrollmentAddressesAutocomplete",
          title: "Set up Identity Monitoring",
          children: [
            {
              route: "EnrollmentAddressesManual",
              title: "Set up Identity Monitoring",
            },
          ],
        },
        {
          route: "EnrollmentPersonal",
          title: "Set up Identity Monitoring",
        },
        {
          route: "EnrollmentActivated",
          title: "Set up Identity Monitoring",
        },
      ]
    : [
        { route: "EnrollmentNames", title: "Set up Data Removal" },
        { route: "EnrollmentContacts", title: "Set up Data Removal" },
        {
          route: "EnrollmentAddressesAutocomplete",
          title: "Set up Data Removal",
          children: [
            {
              route: "EnrollmentAddressesManual",
              title: "Set up Data Removal",
            },
          ],
        },
        { route: "EnrollmentConfirm", title: "Confirm Your Information" },
        {
          route: "EnrollmentPersonal",
          title: "Set up Identity Monitoring",
        },
        {
          route: "EnrollmentReady",
          title: "Set up Identity Monitoring",
        },
      ]
);

const currentStepIndex = computed(() =>
  steps.value.findIndex(
    (step) =>
      step.route === route.name ||
      step.children?.some((child) => child.route === route.name)
  )
);

const onNext = () => {
  const isCurrentStepValid = form.value.validateForm?.() ?? true;
  const nextStep = steps.value[currentStepIndex.value + 1];

  if (isCurrentStepValid && nextStep) {
    router.push({ name: nextStep.route });
  }
};

const onBack = () => {
  const currentStep = steps.value[currentStepIndex.value];

  if (currentStep.children?.some((child) => child.route === route.name)) {
    router.push({ name: currentStep.route });
    return;
  }

  const nextStep = steps.value[currentStepIndex.value - 1];

  if (nextStep) {
    router.push({ name: nextStep.route });
  }
};

const transition = ref("slide-left");

onBeforeRouteUpdate((to, from, next) => {
  const toStep = steps.value.findIndex(
    (step) =>
      step.route === to.name ||
      step.children?.some((child) => child.route === to.name)
  );

  const fromStep = steps.value.findIndex(
    (step) =>
      step.route === from.name ||
      step.children?.some((child) => child.route === from.name)
  );

  transition.value = toStep > fromStep ? "slide-left" : "slide-right";
  setTimeout(() => setColorScheme(to.meta.scheme), 200);

  next();
});

const form = ref(null);

const isSubmitting = ref(false);

const toast = useToast();

const onSubmitRemoval = async () => {
  try {
    isSubmitting.value = true;

    await DataDeleteService.createEnrollmentData(toApiPayload(request));

    posthogCapture(PH_EVENT_USER_SUBMITTED_DD_SUBMISSION_FORM);

    onNext();
  } catch {
    toast.error("Error creating your data deletion profile. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const onSubmitMonitoring = async () => {
  const isCurrentStepValid = form.value.validateForm?.() ?? true;

  if (!isCurrentStepValid) {
    return;
  }

  try {
    isSubmitting.value = true;

    await DataDeleteService.updateEnrollmentProfile(toApiPayload(request));

    posthogCapture("user_enrolled_ssn_monitoring");

    onNext();
  } catch {
    toast.error("Error enrolling in identity monitoring. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const onSkipSsn = async () => {
  try {
    request.value.ssn = null;

    isSubmitting.value = true;

    await DataDeleteService.updateEnrollmentProfile(toApiPayload(request));

    posthogCapture("user_skipped_ssn_monitoring");

    const nextStep = steps.value[currentStepIndex.value + 1];

    if (nextStep) {
      router.push({ name: nextStep.route });
    }
  } catch {
    toast.error("Error enrolling in identity monitoring. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const { clearSearchProgressFromSessionStorage } = useDataDeleteSessionStorage();
const { closeDataDeleteOverlay } = useDataDeleteOverlay();
const { isBasicModeEnabled } = useBasicMode();

const onClose = async () => {
  await closeDataDeleteOverlay();

  if (isBasicModeEnabled.value) {
    router.push({ name: "SummaryBasicMode" });
  } else {
    router.push({ name: "Home" });
  }
};

const onDownloadApp = async () => {
  await closeDataDeleteOverlay();
  request.value = null;
  clearSearchProgressFromSessionStorage();
  router.push({ name: "SummaryBasicMode" });
  window.open(DOWNLOAD_APP_URL, "_blank");
  posthogCapture("monitoring_tof_user_clicked_download_cloaked");
};

const onGoToDashboard = async () => {
  await closeDataDeleteOverlay();
  request.value = null;
  clearSearchProgressFromSessionStorage();
  router.push({ name: "SummaryBasicMode" });
  posthogCapture("monitoring_tof_user_clicked_go_to_dashboard");
};

const onGoToMonitoring = async () => {
  await closeDataDeleteOverlay();
  request.value = null;
  clearSearchProgressFromSessionStorage();
  router.push({ name: "MonitoringStatus" });
};

const { colorScheme, setColorScheme } = useColorScheme();
const enterScheme = ref(null);

onMounted(() => {
  enterScheme.value = colorScheme.value;
  setColorScheme(route.meta.scheme);
  if (store.getters["settings/isTrial"]) {
    store.dispatch("subscription/openSubscriptionModal", false);
  }
});
</script>

<template>
  <div
    class="page-enrollment"
    :class="[
      `page-enrollment--enter-scheme-${enterScheme}`,
      { 'page-enrollment--monitoring-only': hasRemovalEnrollment },
    ]"
  >
    <div class="page-enrollment__content">
      <Transition
        :name="transition"
        mode="out-in"
      >
        <EnrollmentHeader
          v-if="
            $route.name !== 'EnrollmentReady' &&
            $route.name !== 'EnrollmentActivated'
          "
          :step="currentStepIndex + 1"
          :steps="steps.map((step) => step.title)"
          @back="onBack"
          @close="onClose"
        />
        <!-- don't remove, it triggers the transition -->
        <div v-else />
      </Transition>
      <router-view>
        <template #default="{ Component }">
          <Transition
            :name="transition"
            mode="out-in"
          >
            <Component
              :is="Component"
              ref="form"
              v-model:first-name="request.name.first"
              v-model:middle-name="request.name.middle"
              v-model:last-name="request.name.last"
              v-model:date-of-birth="request.dob"
              v-model:phone-numbers="request.phone_numbers"
              v-model:email-addresses="request.email_addresses"
              v-model:addresses="request.addresses"
              v-model:ssn="request.ssn"
              v-model:agrees-with-terms="request.agreesWithTerms"
              :is-submitting="isSubmitting"
              class="page-enrollment__card"
              @next="onNext"
              @back="onBack"
              @submit-removal="onSubmitRemoval"
              @submit-monitoring="onSubmitMonitoring"
              @skip-ssn="onSkipSsn"
              @download-app="onDownloadApp"
              @go-to-dashboard="onGoToDashboard"
              @go-to-monitoring="onGoToMonitoring"
            />
          </Transition>
        </template>
      </router-view>
    </div>
  </div>
  <div class="page-enrollment__background" />
</template>

<style scoped lang="scss">
.page-enrollment {
  position: fixed;
  inset: 0;
  z-index: 1000;

  &--monitoring-only {
    :deep(.enrollment-background) {
      display: none;
    }
  }

  &__background {
    position: fixed;
    inset: 0;
    z-index: 998;
    background-color: $color-base-white-100;
    transition: background-color 0.5s ease;
  }

  &__content {
    width: 100%;
    padding: 20px 16px;
    opacity: 0;
    animation: appear-bottom-10 0.5s forwards;

    @media screen and (min-width: $screen-lg) {
      margin: clamp(16px, 50vh - 450px, 250px) auto 0;
      max-width: 440px;
    }

    @at-root .page-enrollment--enter-scheme-dark & {
      animation-delay: 0.3s;
    }
  }

  &__card {
    margin-top: 24px;

    @media screen and (min-width: $screen-lg) {
      margin-top: 32px;
    }
  }
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease-in-out;
}

.slide-left-leave-to,
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-15px);
}

.slide-left-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(15px);
}
</style>
