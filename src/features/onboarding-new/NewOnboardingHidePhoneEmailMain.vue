<script setup>
import { computed, onMounted, ref, watch } from "vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiInfoList from "@/features/onboarding-new/UiInfoList.vue";
import UiInfoTile from "@/features/onboarding-new/UiInfoTile.vue";
import IdentityCard from "@/features/onboarding-new/IdentityCard.vue";
import { COMPLETED_DD_ONBOARDING_PHONE_EMAIL } from "@/scripts/userFlags";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_1ST_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_1ST_SCREEN_GET_STARTED,
  PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_2ND_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_2ND_SCREEN_COPIED_PHONE_NUMBER,
  PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_2ND_SCREEN_COPIED_EMAIL,
  PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_2ND_SCREEN_CONTINUE,
  PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_3RD_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_3RD_SCREEN_CONTINUE,
  PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_4TH_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_4TH_SCREEN_CONTINUE_SETUP,
  PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_4TH_SCREEN_DO_LATER,
} from "@/scripts/posthogEvents";
import UserService from "@/api/actions/user-service";
import IdentityService from "@/api/actions/identity-service";
import { getUserCountry } from "@/scripts/countries/countries";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import InboxView from "@/assets/images/onboarding-new/inbox-stores-all-cloaked.png";
import CloakPower from "@/assets/images/onboarding-new/3-stack.png";

import router from "@/routes/router";
import { useRoute } from "vue-router";

const route = useRoute();

const toast = useToast();

const step = computed(() => {
  return route.query.step ? parseInt(route.query.step) : 1;
});

const fields = ref([
  {
    type: "phone",
    id: 2,
  },
  {
    type: "email",
    id: 1,
  },
]);

const identityDetails = ref({});
const isLoading = ref(false);
const userCountry = computed(() =>
  getUserCountry(store.state.authentication?.user)
);

onMounted(() => {
  posthogCapture(PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_1ST_SCREEN);
});

function quit() {
  posthogCapture(
    PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_4TH_SCREEN_DO_LATER
  );
  router.push({ name: "NewOnboardingExit" });
}

function next(posthogEvent) {
  if (isLoading.value) return;
  if (posthogEvent) {
    posthogCapture(posthogEvent);
  }
  router.push({ query: { step: step.value + 1 } });
}
function navToOnboarding(posthogEvent) {
  if (posthogEvent) {
    posthogCapture(posthogEvent);
  }
  router.push({ name: "NewOnboardingGetStarted" });
}

const createNewIdentity = async () => {
  try {
    /* Trigger identity creation when page 2 is mounted */
    const identityRes = await IdentityService.createIdentity(
      {
        nickname: "New identity",
        website_url: NO_URL_IDENTITY_DOMAIN,
        email: true,
        phone: true,
      },
      true
    );

    identityDetails.value = identityRes.data;

    const email = identityRes?.data?.cloaked_email?.email;
    const phone = identityRes?.data?.cloaked_phone?.phone_number;

    fields.value = [
      {
        type: "phone",
        id: 2,
        value: phone,
        method: () => {
          posthogCapture(
            PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_2ND_SCREEN_COPIED_PHONE_NUMBER
          );
        },
      },
      {
        type: "email",
        id: 1,
        value: email,
        method: () => {
          posthogCapture(
            PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_2ND_SCREEN_COPIED_EMAIL
          );
        },
      },
    ];

    return identityRes.data;
  } catch {
    isLoading.value = false;
    toast.error("Error creating identity, please try again later");
  }
};

watch(
  () => step.value,
  (value) => {
    switch (value) {
      case 2:
        isLoading.value = true;
        setTimeout(async () => {
          await createNewIdentity();
          isLoading.value = false;
          next();
        }, 3000);
        break;
      case 3:
        isLoading.value = false;
        posthogCapture(PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_2ND_SCREEN);
        if (!Object.keys(identityDetails.value).length) {
          // NOTE: if user refreshes page and identityDetails does not exist,
          // go back to step 2
          router.push({ query: { step: 2 } });
        }
        break;
      case 4:
        posthogCapture(PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_3RD_SCREEN);
        break;
      case 5:
        UserService.setNewOnboardingFlag(
          COMPLETED_DD_ONBOARDING_PHONE_EMAIL,
          true
        );
        posthogCapture(PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_4TH_SCREEN);
        break;
      default:
        break;
    }
  },
  { immediate: true }
);
</script>
<template>
  <UiPageWrapper
    v-if="step === 1"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_1ST_SCREEN"
  >
    <UiHeader>
      <h2>Hide your phone number and email from online threats</h2>
      <p>
        Sharing your real phone number and email everywhere can lead to spam,
        scams, and unwanted contact.
      </p>
      <p>
        When you use Cloaked info, your real number and email can't be exposed.
      </p>
    </UiHeader>
    <img
      :src="CloakPower"
      class="cloak-power"
      alt="Use Cloaked to create masked emails and phone numbers"
    />

    <UiButton
      gradient
      imgName="arrow-right"
      class="button"
      :disabled="isLoading"
      :loading="isLoading"
      @click="
        next(
          PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_1ST_SCREEN_GET_STARTED
        )
      "
    >
      Get started
    </UiButton>
  </UiPageWrapper>

  <UiPageWrapper
    v-else-if="step === 2"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_1ST_SCREEN"
  >
    <UiHeader>
      <h2>Generating your new information...</h2>
      <p>
        When you use Cloaked information, it's encrypted and can't be traced to
        you.
      </p>
    </UiHeader>

    <!-- Don't pass in identity here so it doesn't show until page 3, manual isLoading attr -->
    <IdentityCard
      class="status-box"
      :fields="fields"
      :isLoading="true"
      :country="userCountry"
    />

    <UiButton
      gradient
      imgName="arrow-right"
      class="button"
      :disabled="isLoading"
      :loading="isLoading"
      @click="next"
    >
      Continue
    </UiButton>
  </UiPageWrapper>

  <UiPageWrapper
    v-else-if="step === 3"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_2ND_SCREEN"
  >
    <UiHeader>
      <h2>Your new information is ready to use</h2>
      <p>
        This new information works for as long as you want. Use it just like
        you'd use your personal phone number or email others.
      </p>
      <p>
        You can set it to forward to your personal number or email by going to
        settings.
      </p>
    </UiHeader>
    <IdentityCard
      class="status-box"
      :fields="fields"
      :isLoading="isLoading"
      :identity="identityDetails"
      :country="userCountry"
    />

    <UiButton
      gradient
      imgName="arrow-right"
      class="button"
      :disabled="isLoading"
      :loading="isLoading"
      @click="
        next(
          PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_2ND_SCREEN_CONTINUE,
          { client_platform: 'dashboard' }
        )
      "
    >
      Continue
    </UiButton>
  </UiPageWrapper>

  <UiPageWrapper
    v-else-if="step === 4"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_3RD_SCREEN"
  >
    <UiHeader>
      <h2>Your inbox stores messages to your Cloaked numbers and emails</h2>
      <p>
        When you receive a message or call to a Cloaked identity, it will
        automatically go to your inbox. You can sort by account or view
        everything at once.
      </p>
    </UiHeader>

    <img
      :src="InboxView"
      alt="Inbox view"
      class="inbox-view"
    />

    <UiButton
      gradient
      imgName="arrow-right"
      class="button"
      :disabled="isLoading"
      @click="
        next(
          PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_3RD_SCREEN_CONTINUE
        )
      "
    >
      Continue
    </UiButton>
  </UiPageWrapper>

  <UiPageWrapper
    v-else-if="step === 5"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_GENERATE_NEW_INFO_4TH_SCREEN"
  >
    <UiHeader>
      <h2>How to use Cloaked information</h2>
      <p>
        Here's just a few of the ways you can use your new Cloaked information.
        Give it a try!
      </p>
    </UiHeader>

    <UiInfoList class="mini-ui-tiles">
      <UiInfoTile
        color="color-brand-1-100-light"
        icon="onboarding-new/shopping-cart"
      >
        Online shopping
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-3-100"
        icon="onboarding-new/people"
      >
        Meet people
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-6-100"
        icon="onboarding-new/briefcase"
      >
        Small business
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-5-100"
        icon="onboarding-new/shipping-box"
      >
        Online subscriptions
      </UiInfoTile>
      <UiInfoTile
        color="color-in-progress"
        icon="key-filled"
      >
        Creating login info
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-4-100"
        icon="onboarding-new/airplane"
      >
        Travel
      </UiInfoTile>
    </UiInfoList>

    <div class="button action-buttons">
      <UiButton
        :disabled="isLoading"
        @click="quit"
      >
        I'll do more later
      </UiButton>
      <UiButton
        gradient
        imgName="arrow-right"
        :disabled="isLoading"
        @click="
          navToOnboarding(
            PH_EVENT_ONBOARDING_USER_CLICKED_GENERATE_NEW_INFO_4TH_SCREEN_CONTINUE_SETUP
          )
        "
      >
        Continue setup
      </UiButton>
    </div>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
  height: 100%;
  align-self: center;
  text-align: center;
}

.subtitle {
  max-width: 500px;
}

.button {
  margin-top: 32px;
  bottom: 5%;
  position: fixed;
  min-width: 240px;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;

  @media screen and (max-width: $screen-lg) {
    flex-direction: column;
  }
}

.mini-ui-tiles {
  margin-top: 32px;
}

.status-box {
  max-width: 400px;
}

.inbox-view {
  width: 90%;
  max-width: 843px;
  height: auto;
  margin-top: 58px;
  background: rgba($color-primary-100-light, 0.05);

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.05);
  }
}

.cloak-power {
  max-width: 290px;
  max-height: 325px;
  padding-top: 26px;
}
</style>
