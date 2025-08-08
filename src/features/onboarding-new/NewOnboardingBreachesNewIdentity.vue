<script setup>
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiButtonRow from "@/features/onboarding-new/UiButtonRow.vue";
import IdentityCard from "@/features/onboarding-new/IdentityCard.vue";
import { ref, onMounted, computed } from "vue";
import IdentityService from "@/api/actions/identity-service";
import { useToast } from "@/composables/useToast.js";
import { createPassword } from "@/scripts/actions/crypto";
import { DEFAULT_PASSWORD_SETTINGS } from "@/scripts/constants";
import store from "@/store";
import { getUserCountry } from "@/scripts/countries/countries";
import router from "@/routes/router";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_ONBOARDING_FLOW_BREACHES_4TH_SCREEN,
  PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_FIX_MORE,
  PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_REPLACE_CONTINUE,
  PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_COPY_PASSWORD,
  PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_COPY_EMAIL,
} from "@/scripts/posthogEvents";
import UserService from "@/api/actions/user-service";
import { COMPLETED_DD_ONBOARDING_DATA_BREACHES } from "@/scripts/userFlags";

const toast = useToast();

defineEmits(["next"]);
const props = defineProps({
  breach: {
    type: Object,
    required: true,
  },
});

const fields = ref([
  {
    type: "email",
    id: 1,
  },
  {
    type: "password",
    id: 2,
  },
]);

const identity = ref({
  website_url: props?.breach?.domain,
  nickname: props?.breach?.name,
  website: {
    logo_url: props.breach?.logo_url,
    icon_image_url: props.breach?.logo_url,
    logo_image_url: props.breach?.logo_url,
    logo_svg_url: props.breach?.logo_url,
    icon_svg_url: props.breach?.logo_url,
  },
});
const isLoading = ref(true);

const userCountry = computed(() =>
  getUserCountry(store.state.authentication?.user)
);

onMounted(() => {
  if (props.breach) {
    createNewIdentity();
    posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_4TH_SCREEN);
  }
});

async function createNewIdentity() {
  try {
    /* Trigger identity creation when page 2 is mounted */
    const identityRes = await IdentityService.createIdentity(
      {
        nickname: props.breach?.name,
        website_url: props.breach?.domain,
        email: true,
      },
      true
    );

    identity.value = identityRes.data;

    const email = identityRes?.data?.cloaked_email?.email;

    const userAccountVersion =
      store.state.authentication?.user?.account_version;
    const newPassword = createPassword(DEFAULT_PASSWORD_SETTINGS);
    const passwordPayload = {
      encrypted: false,
      encrypted_version: userAccountVersion,
      autofill_password: newPassword,
    };

    fields.value = [
      {
        type: "email",
        id: 1,
        value: email,
        method: () => {
          posthogCapture(PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_COPY_EMAIL);
        },
      },
      {
        type: "password",
        id: 2,
        value: newPassword,
        method: () => {
          posthogCapture(
            PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_COPY_PASSWORD
          );
        },
      },
    ];
    IdentityService.patchAutofill(identityRes.data.id, passwordPayload);

    isLoading.value = false;
    UserService.setNewOnboardingFlag(
      COMPLETED_DD_ONBOARDING_DATA_BREACHES,
      true
    );
    return identityRes.data;
  } catch {
    isLoading.value = false;
    toast.error("Error creating identity, please try again later");
  }
}

function navToExposureList() {
  router.push({ name: "NewOnboardingBreaches", query: { step: "2" } });
  posthogCapture(PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_FIX_MORE);
}

function navToExitScreen() {
  router.push({ name: "NewOnboardingExit" });
}

function navToGetStarted() {
  router.push({ name: "NewOnboardingGetStarted" });
  posthogCapture(PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_REPLACE_CONTINUE);
}
</script>
<template>
  <UiPageWrapper
    v-if="isLoading"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_4TH_SCREEN"
  >
    <UiHeader>
      <h2>Generating new info for {{ breach?.name }}...</h2>
      <p>
        Did you know that every phone number and email address we generate comes
        with an encrypted inbox?
      </p>
    </UiHeader>
    <div class="identity-wrapper">
      <IdentityCard
        class="status-box"
        :fields="fields"
        :isLoading="isLoading"
        :identity="identity"
        :country="userCountry"
      />
    </div>
    <UiButtonRow>
      <UiButton
        width="217px"
        disabled
      >
        I'll do more later
      </UiButton>
      <UiButton
        width="217px"
        gradient
        imgName="arrow-right"
        disabled
      >
        Continue setup
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>

  <UiPageWrapper
    v-else
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_4TH_SCREEN"
  >
    <UiHeader>
      <h2>Go to {{ breach?.name }} and replace your information</h2>
      <p>
        To secure your account, you'll need to go to the
        {{ breach?.name }} website and update your information.
      </p>
    </UiHeader>
    <div class="identity-wrapper">
      <IdentityCard
        class="status-box"
        :fields="fields"
        :isLoading="isLoading"
        :identity="identity"
        :country="userCountry"
      />
    </div>
    <UiButtonRow>
      <div class="flex-col">
        <div class="button-row-wrapper">
          <UiButton
            width="217px"
            @click="navToExitScreen"
          >
            I'll do more later
          </UiButton>
          <UiButton
            width="217px"
            gradient
            imgName="arrow-right"
            @click="navToGetStarted"
          >
            Continue setup
          </UiButton>
        </div>
        <div
          class="do-more-button"
          @click="navToExposureList"
        >
          Fix more exposures
        </div>
      </div>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.status-box {
  max-width: 400px;
}

.flex-col {
  color: $color-primary-100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;

  .do-more-button {
    color: $color-primary-100;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    text-align: center;
    transition: opacity 0.3s;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
      transition: opacity 0.3s;
    }
  }
}

.identity-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.button-row-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
}
</style>
