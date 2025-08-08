<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import DeleteFlowConfirmation from "@/features/data-delete/DeleteFlowConfirmation.vue";
import DeleteFlowMainForm from "@/features/data-delete/DeleteFlowMainForm.vue";
import DeleteFlowAddMoreInfo from "@/features/data-delete/DeleteFlowAddMoreInfo.vue";
import DeleteFlowSecondaryInfo from "@/features/data-delete/DeleteFlowSecondaryInfo.vue";
import DeleteFlowIntroduction from "@/features/data-delete/DeleteFlowIntroduction.vue";
import { useDataDeleteSessionStorage } from "@/features/data-delete/composables/useDataDeleteSessionStorage.js";
import { format } from "@/scripts/format.js";
import AtomGradientPageWrapper from "@/library/AtomGradientPageWrapper.vue";
import {
  PH_EVENT_USER_AGREED_TO_DATA_DELETION_AGENCY_AGREEMENT,
  PH_EVENT_USER_SUBMITTED_DD_SUBMISSION_FORM,
} from "@/scripts/posthogEvents.js";
import { posthogCapture } from "@/scripts/posthog.js";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { useToast } from "@/composables/useToast.js";
import router from "@/routes/router";
import { useColorScheme } from "@/composables/useColorScheme.js";
import {
  COUNTRY_VALUE_ABREV_MAP,
  countryConfig,
} from "@/scripts/countries/countries.js";
import { formatPhoneStringBasic } from "@/scripts/format.js";
import {
  DATA_DELETE_REQUESTED,
  HAS_EXITED_DELETE_FLOW,
} from "@/scripts/userFlags.js";
import UserService from "@/api/actions/user-service.js";
import DeleteFlowTermsFooter from "@/features/data-delete/atoms/DeleteFlowTermsFooter.vue";
import { FROM_SUBSCRIBE_NOW } from "@/scripts/userFlags.js";
import store from "@/store";
import BaseButton from "@/library/BaseButton.vue";
import BulkPlanCard from "@/features/subscribe/BulkPlanCard.vue";
import AtomGradientBoxWrapper from "@/library/AtomGradientBoxWrapper.vue";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import { useBasicMode } from "@/composables/useBasicMode";

const { freeSpots } = useInvites();
const toast = useToast();
const { readSearchProgressFromSessionStorage } = useDataDeleteSessionStorage();
const local = readSearchProgressFromSessionStorage();

const { isBasicModeEnabled } = useBasicMode();

const request = ref({
  name: {},
  other_names: [],
  addresses: [],
  email_addresses: [],
  phone_numbers: [],
});

const isLoading = ref(false);

const { activePlan } = usePlans();
const planType = usePlanType(activePlan);

const isOwner = computed(() => {
  return store.getters["settings/getSubscription"].owner;
});

const isBulkPlan = computed(
  () =>
    (planType.value === "Couple" || planType.value === "Family") &&
    !!freeSpots.value &&
    isOwner.value
);

onMounted(() => {
  // forcing dark mode cus light mode was not designed
  const { setColorScheme } = useColorScheme();
  setColorScheme("dark");

  const storedRequest = JSON.parse(
    sessionStorage.getItem("DATA_DELETE_REQUEST")
  );

  if (storedRequest) {
    request.value = storedRequest;
  } else {
    request.value = {
      name: {
        first: local?.firstName || null,
        last: local?.lastName || null,
        middle: local?.middleName || null,
        prefix: local?.prefix || null,
        suffix: local?.suffix || null,
      },
      other_names: [],
      birth_year: local?.DOB?.year || null,
      addresses: [],
      email_addresses: local?.emails || [],
      phone_numbers: format.formatPhoneStringBasic(local?.phone)
        ? [format.formatPhoneStringBasic(local?.phone)]
        : [],
    };
  }

  if (hasAcceptedTerms.value) {
    changesSaved.value = true;
  }

  if (store.getters["settings/isTrial"]) {
    store.dispatch("subscription/openSubscriptionModal", false);
  }
});

const hasAcceptedTerms = ref(
  sessionStorage.getItem("DATA_DELETE_TERMS_AGREE") === "true"
);
const isAddingMoreInfo = ref(false);
const changesSaved = ref(false);

function updateRequest(updatedRequest) {
  request.value = updatedRequest;
  sessionStorage.setItem("DATA_DELETE_REQUEST", JSON.stringify(updatedRequest));
}

function handleAgree() {
  hasAcceptedTerms.value = true;
  sessionStorage.setItem("DATA_DELETE_TERMS_AGREE", "true");
  posthogCapture(PH_EVENT_USER_AGREED_TO_DATA_DELETION_AGENCY_AGREEMENT);
}

function formatAddresses() {
  const formattedAddresses = [...request.value.addresses].map((address) => {
    let country = address.country;
    if (country.length !== 2 && COUNTRY_VALUE_ABREV_MAP[country]) {
      country = COUNTRY_VALUE_ABREV_MAP[country];
    }
    let state = address.state;
    if (state.length !== 2) {
      const stateList = countryConfig[country]?.addressLevelOneList;
      const stateAbbreviation = stateList?.find(
        (state) =>
          state.label === address.state || state.value === address.state
      )?.value;
      if (stateAbbreviation) {
        state = stateAbbreviation;
      }
    }
    return {
      ...address,
      country: country,
      state: state,
    };
  });

  request.value.addresses = formattedAddresses;
}

function createEnrollment() {
  isLoading.value = true;

  formatAddresses();

  nextTick(() => {
    const formattedRequest = {
      ...request.value,
      first_name: request?.value?.name?.first || undefined,
      last_name: request?.value?.name?.last || undefined,
      city: request?.value?.addresses?.[0]?.city || undefined,
      name: {
        first: request?.value?.name?.first || undefined,
        last: request?.value?.name?.last || undefined,
        middle: request?.value?.name?.middle || undefined,
        prefix: request?.value?.name?.prefix || undefined,
        suffix: request?.value?.name?.suffix || undefined,
      },
      state: request?.value?.addresses?.[0]?.state || undefined,
      phone_numbers: request.value.phone_numbers.map((num) =>
        formatPhoneStringBasic(num)
      ),
      other_names: request?.value?.other_names?.length
        ? request?.value?.other_names.map((name) => ({
            first: name?.first || undefined,
            last: name?.last || undefined,
            middle: name?.middle || undefined,
            prefix: name?.prefix || undefined,
            suffix: name?.suffix || undefined,
          }))
        : [],
    };

    DataDeleteService.createEnrollmentData(formattedRequest)
      .then(() => {
        return UserService.setFlag({
          name: HAS_EXITED_DELETE_FLOW,
          value: true,
        }).then(() => {
          router.push({ name: "SummaryBasicMode" });
          sessionStorage.removeItem("DATA_DELETE_REQUEST");
          sessionStorage.removeItem("DATA_DELETE_TERMS_AGREE");
          isLoading.value = false;
          posthogCapture(PH_EVENT_USER_SUBMITTED_DD_SUBMISSION_FORM);
          return;
        });
      })
      .catch(() => {
        toast.error(
          "Error creating your data deletion profile. Please try again."
        );
        isLoading.value = false;
      });
  });
}

function handleDone() {
  changesSaved.value = true;
  isAddingMoreInfo.value = false;
  document.body.classList.remove("overflow-hidden");
}

const mainForm = ref(null);

const isFromSubscribeNow = computed(() => {
  return store.getters.getFlag(FROM_SUBSCRIBE_NOW);
});

function openAddMoreInfo() {
  document.body.classList.add("overflow-hidden");
  isAddingMoreInfo.value = true;
}

function enrollLater() {
  isLoading.value = true;
  sessionStorage.removeItem("DATA_DELETE_TERMS_AGREE");

  UserService.setFlag({
    name: DATA_DELETE_REQUESTED,
    value: false,
  }).then(() => {
    if (isBasicModeEnabled.value) {
      router.push({ name: "SummaryBasicMode" });
    } else {
      router.push({ name: "Home" });
    }
    isLoading.value = false;
  });
}
</script>

<template>
  <AtomGradientPageWrapper
    class="page-wrapper"
    :class="{ 'no-scroll': isAddingMoreInfo }"
  >
    <DeleteFlowAddMoreInfo
      v-if="isAddingMoreInfo"
      :request="request"
      @updateRequest="updateRequest"
      @done="handleDone"
    />
    <DeleteFlowIntroduction v-if="isFromSubscribeNow && !changesSaved" />
    <DeleteFlowConfirmation
      v-else
      :request="request"
      :hasAcceptedTerms="hasAcceptedTerms"
      :changesSaved="changesSaved"
      @handleScrollTo="mainForm?.scrollToField"
      @edit="changesSaved = false"
    />
    <DeleteFlowMainForm
      v-if="!changesSaved"
      ref="mainForm"
      v-model:first-name="request.name.first"
      v-model:middle-name="request.name.middle"
      v-model:last-name="request.name.last"
      v-model:birth-year="request.birth_year"
      v-model:address="request.addresses[0]"
      v-model:phone="request.phone_numbers[0]"
      v-model:email="request.email_addresses[0]"
      @submit="changesSaved = true"
    />
    <DeleteFlowSecondaryInfo
      v-if="changesSaved"
      :request="request"
      @enroll="createEnrollment"
      @addMoreInfo="openAddMoreInfo"
    />
    <div
      v-if="changesSaved && hasAcceptedTerms && isBulkPlan"
      class="bulk-plan-box-content-wrapper"
    >
      <AtomGradientBoxWrapper class="bulk-plan-box-wrapper">
        <BulkPlanCard neverCenter />
      </AtomGradientBoxWrapper>
    </div>
    <DeleteFlowTermsFooter
      v-if="changesSaved && !hasAcceptedTerms"
      :request="request"
      @agree="handleAgree"
    />

    <div
      v-else-if="!isAddingMoreInfo"
      class="sticky-footer"
    >
      <div
        class="sticky-footer-inner"
        :class="{ 'space-between': !changesSaved && isFromSubscribeNow }"
      >
        <BaseButton
          v-if="!changesSaved && isFromSubscribeNow"
          size="lg"
          variant="secondary"
          :loading="isLoading"
          @click="enrollLater"
        >
          Enroll later
        </BaseButton>
        <BaseButton
          v-if="!changesSaved"
          size="lg"
          :fullWidth="!isFromSubscribeNow"
          variant="primary"
          icon="checkmark"
          class="continue-button"
          @click="mainForm.onSubmit()"
        >
          Continue
        </BaseButton>
        <BaseButton
          v-else-if="changesSaved && hasAcceptedTerms"
          variant="primary"
          size="lg"
          class="verify-button"
          fullWidth
          :loading="isLoading"
          icon="checkmark"
          @click="createEnrollment"
        >
          Remove my info
        </BaseButton>
      </div>
    </div>
  </AtomGradientPageWrapper>
</template>

<style scoped lang="scss">
.bulk-plan-box-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 9 24px;
  .bulk-plan-box-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin: 0 24px;
    &:deep(.gradient-box-wrapper) {
      overflow: auto;
    }
    &:deep(.bulk-plan-card-wrapper) {
      padding: 0;
      background: none;
      backdrop-filter: none;
      box-shadow: none;
      border: none;
    }
    &:deep(.bulk-plan-card-wrapper__title) {
      font-size: 18px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
    }
  }
}

.no-scroll {
  overflow: hidden !important;
}
.page-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  min-height: 100dvh;
  z-index: 100 !important;
  background-color: $color-base-white-100;
  padding-bottom: 120px;
  padding-top: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;

  .sticky-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    gap: 16px;
    width: 100%;
    align-items: center;
    padding: 18px 24px;

    .sticky-footer-inner {
      display: flex;
      justify-content: center;
      gap: 16px;
      width: 100%;
      max-width: 550px;

      align-items: center;
      .button {
        max-width: 550px;

        svg {
          height: 15px;
        }
      }

      .verify-button {
        max-width: 550px;
        background: linear-gradient(46deg, #0085ff 1.19%, #67dbfc 100%);
        color: $white;
      }

      .continue-button {
        &:active {
          transform: scale(0.98);
        }
      }

      &.space-between {
        justify-content: space-between;
      }
    }
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 110%;
      background: linear-gradient(
        180deg,
        rgba($color-base-white-100-dark, 0) 0%,
        rgba($color-base-white-100-dark, 0.9) 100%
      );
      z-index: -1;
    }
  }
}
</style>
