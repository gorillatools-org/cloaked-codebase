<script setup lang="ts">
import { inject, onBeforeMount, ref } from "vue";
import ChatOnboarding from "@/features/chat-onboarding/ChatOnboarding.vue";
import DataDeletePageBackground from "@/features/data-delete/DataDeletePageBackground.vue";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { useMonitoringAutofill } from "@/features/monitoring/useMonitoringAutofill";
import { toApiPayload } from "@/features/enrollment/data-utils";
import DataDeleteService from "@/api/actions/data-delete-service";
import type { EnrollmentRequest } from "@/routes/enrollmentV2/PageExposureStatusEnrollExposures.vue";
import type {
  ChatOnboardingFeatureFlag,
  ChatScript,
  Profile,
} from "@/features/chat-onboarding/types.ts";
import store from "@/store";
import EmailService from "@/api/actions/email-service";
import {
  accountRecoveryInjectionKey,
  checkoutSessionInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import { posthogCapture } from "@/scripts/posthog";
import { isEqual } from "lodash-es";
import { PH_EVENT_ENROLLMENT_DATA_AUTOFILL_ACCURACY } from "@/scripts/posthogEvents";
import { initiateEncryption } from "@/scripts/actions/encryption";

const script = ref<ChatScript>([]);

const accountRecovery = inject(accountRecoveryInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);

onBeforeMount(() => initiateEncryption());

const getFreshProfile = (): Profile => ({
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  address: null,
  dateOfBirth: null,
  ssn: null,
});

const {
  combineAutofillData,
  getAutofillDataFromEnrollment,
  getAutofillDataFromSearchResultsV2,
  getAutofillDataFromUserObject,
} = useMonitoringAutofill();

type AutofillData = Partial<{
  name: {
    first: string;
    middle: string;
    last: string;
  };
  dob: string;
  email_addresses: string[];
  phone_numbers: string[];
  addresses: {
    address1: string;
    city: string;
    state: string;
    postal_code: string;
  }[];
}>;

const profile = ref<Profile>(getFreshProfile());
const autofill = ref<Profile>(getFreshProfile());
const isReady = ref(false);

onBeforeMount(async () => {
  const { payload }: ChatOnboardingFeatureFlag = await fetchFeatureFlag(
    "post_checkout_chatbot_experience"
  );

  script.value = (payload ?? []).filter((interaction) => {
    if (
      !accountRecovery?.value.username &&
      interaction.type === "usernameReminder"
    ) {
      return false;
    }

    if (
      checkoutSession?.poaAgreementAccepted &&
      interaction.type === "removalConsent"
    ) {
      return false;
    }

    return true;
  });
});

onBeforeMount(async () => {
  let newProfile: AutofillData = {};

  const dataFromSearchResults = await getAutofillDataFromSearchResultsV2();
  newProfile = await combineAutofillData(newProfile, dataFromSearchResults);

  const dataFromUserObject = await getAutofillDataFromUserObject();
  newProfile = await combineAutofillData(newProfile, dataFromUserObject);

  const dataFromEnrollment = await getAutofillDataFromEnrollment();
  newProfile = await combineAutofillData(newProfile, dataFromEnrollment);

  autofill.value = {
    firstName: newProfile.name?.first ?? null,
    lastName: newProfile.name?.last ?? null,
    email: newProfile.email_addresses?.[0] ?? null,
    phone: newProfile.phone_numbers?.[0] ?? null,
    dateOfBirth: newProfile.dob ?? null,
    address: null, // ignore address autofill for now
    ssn: null,
  };

  profile.value = { ...autofill.value };
  isReady.value = true;
});

onBeforeMount(() => posthogCapture("user_viewed_chat_onboarding"));

const captureAutofillAccuracy = () => {
  const autofilled = {
    firstName: !!autofill.value.firstName,
    lastName: !!autofill.value.lastName,
    dob: !!autofill.value.dateOfBirth,
    ssn: !!autofill.value.ssn,
    email: !!autofill.value.email,
    phone: !!autofill.value.phone,
    addresses: false, // address autofill is not implemented
  };

  const updated = {
    firstName:
      (autofill.value.firstName ?? "") !== (profile.value.firstName ?? ""),
    lastName:
      (autofill.value.lastName ?? "") !== (profile.value.lastName ?? ""),
    dob:
      (autofill.value.dateOfBirth ?? "") !== (profile.value.dateOfBirth ?? ""),
    ssn: (autofill.value.ssn ?? "") !== (profile.value.ssn ?? ""),
    email: (autofill.value.email ?? "") !== (profile.value.email ?? ""),
    phone: (autofill.value.phone ?? "") !== (profile.value.phone ?? ""),
    addresses: !isEqual(autofill.value.address, profile.value.address),
  };

  posthogCapture(PH_EVENT_ENROLLMENT_DATA_AUTOFILL_ACCURACY, {
    autofilled,
    updated,
  });
};

const onEnroll = async () => {
  const rawPayload: EnrollmentRequest = {
    name: {
      first: profile.value.firstName || undefined,
      last: profile.value.lastName || undefined,
    },
    dob: profile.value.dateOfBirth || undefined,
    addresses: profile.value.address ? [profile.value.address] : undefined,
    email_addresses: profile.value.email ? [profile.value.email] : undefined,
    phone_numbers: profile.value.phone ? [profile.value.phone] : undefined,
    ssn: profile.value.ssn || undefined,
  };

  try {
    await DataDeleteService.createEnrollmentData(toApiPayload(rawPayload));
    posthogCapture("user_finished_chat_onboarding_enrollment", {
      enrolled: true,
    });
  } catch (error) {
    posthogCapture("user_finished_chat_onboarding_enrollment", {
      enrolled: false,
    });
    // letting API silently fail in this flow
    console.error(error);
  }

  captureAutofillAccuracy();
};

const onComplete = () => posthogCapture("user_finished_chat_onboarding");

const onEmailConfirmed = async (email: string) => {
  try {
    await EmailService.addEmail({
      email,
      primary: true,
      collection_name: "email",
      collection: store.getters["authentication/collection"]("email"),
      user: store.state.authentication?.user?.url,
    });
  } catch (error) {
    // letting API silently fail in this flow
    console.error(error);
  }
};
</script>

<template>
  <div class="chat-onboarding-page">
    <ChatOnboarding
      v-if="script.length > 0"
      v-model:profile="profile"
      :autofill="autofill"
      :script="script"
      :is-ready="isReady"
      class="chat-onboarding-page__chat"
      @enroll="onEnroll"
      @complete="onComplete"
      @email-confirmed="onEmailConfirmed"
    />
    <DataDeletePageBackground />
  </div>
</template>

<style lang="scss" scoped>
.chat-onboarding-page {
  margin: 0 auto;
  width: 100%;

  &__chat {
    position: relative;
    z-index: 2;
  }
}
</style>
