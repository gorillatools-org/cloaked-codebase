<script setup lang="ts">
import { reactive, computed } from "vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { useVirtualCardsApplicationStore } from "@/features/VirtualCards/store/useVirtualCardsApplicationStore";
import { storeToRefs } from "pinia";
import moment from "moment";
import { onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import VirtualCardsProfileDataList from "../VirtualCardsProfileDataList.vue";
import type { VirtualCardsProfileDataItem } from "../VirtualCardsProfileDataList.vue";
import { displayAddress } from "@/features/enrollment/composables";
import { useDevice } from "@/composables/useDevice";

const emit = defineEmits<{
  (e: "continue"): void;
  (e: "edit-details"): void;
}>();

const virtualCardsApplication = useVirtualCardsApplicationStore();
const { detailsFormData } = storeToRefs(virtualCardsApplication);
const { isMobile } = useDevice();

onMounted(() => {
  posthogCapture("pay_kyc_review_profile_screenview");
});

const dataList = reactive<VirtualCardsProfileDataItem[]>([
  {
    label: "Name",
    value:
      detailsFormData.value.firstName + " " + detailsFormData.value.lastName,
  },
  {
    label: "Date of birth",
    value: moment(detailsFormData.value.dob, "MM/DD/YYYY").isValid()
      ? moment(detailsFormData.value.dob, "MM/DD/YYYY").format("MMMM D, YYYY")
      : detailsFormData.value.dob,
  },
  {
    label: "Street address",
    value: displayAddress(detailsFormData.value.address),
  },
  { label: "Phone number", value: detailsFormData.value.phone },
  { label: "Email address", value: detailsFormData.value.email },
  {
    label: "SSN",
    value: detailsFormData.value.ssn,
    secretValue: "••• •• •••",
    secret: true,
  },
]);

const isAgreementsAccepted = computed(() => {
  return detailsFormData.value.agreementsAccepted;
});

const handleContinueCtaClick = () => {
  if (isAgreementsAccepted.value) {
    posthogCapture("pay_kyc_review_profile_submit_tapped");
  } else {
    posthogCapture("pay_kyc_review_profile_continue_tapped");
  }

  emit("continue");
};

const handleEditDetailsCtaClick = () => {
  posthogCapture("pay_kyc_review_profile_edit_tapped");
  emit("edit-details");
};
</script>

<template>
  <div class="vc-application-profile">
    <div class="vc-application-profile__wrapper">
      <header class="vc-application-profile__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="list"
        />
        <BaseText
          variant="headline-2-semibold"
          class="vc-application-profile__title"
        >
          Review your profile
        </BaseText>
      </header>
      <div class="vc-application-profile__content">
        <VirtualCardsProfileDataList :items="dataList" />
      </div>
      <Teleport
        to="body"
        :disabled="!isMobile"
      >
        <footer class="vc-application-profile__footer">
          <BaseButton
            variant="primary"
            :icon="isAgreementsAccepted ? 'send' : 'arrow-right'"
            class="vc-application-profile__button"
            @click="handleContinueCtaClick"
          >
            {{ isAgreementsAccepted ? "Submit verification" : "Continue" }}
          </BaseButton>
          <BaseButton
            variant="outline"
            class="vc-application-profile__button"
            @click="handleEditDetailsCtaClick"
          >
            Edit your details
          </BaseButton>
        </footer>
      </Teleport>
    </div>
  </div>
</template>

<style scoped lang="scss">
$component-name: "vc-application-profile";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;

  &__wrapper {
    width: 100%;
    padding-bottom: 70px;

    @media (min-width: $screen-md) {
      width: 345px;
      padding-bottom: 0;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    text-align: center;
    margin-top: 13px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 30px;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    position: fixed;
    bottom: 0;
    padding: 12px 20px;
    padding-bottom: 30px;
    background: $color-primary-5-light;
    z-index: 9;

    @at-root body:has(.theme-dark) & {
      background: $color-primary-5-dark;
    }

    @media screen and (min-width: $screen-md) {
      position: sticky;
      bottom: -10px;
      padding: 12px 0;
    }

    &::before {
      content: "";
      display: block;
      height: 35px;
      position: absolute;
      z-index: 9;
      width: 100%;
      max-width: 345px;
      top: -30px;
      background: linear-gradient(
        to bottom,
        rgba($color-primary-5-light, 0),
        rgba($color-primary-5-light, 1)
      );
      pointer-events: none;

      @at-root body:has(.theme-dark) & {
        background: linear-gradient(
          to bottom,
          rgba($color-primary-5-dark, 0),
          rgba($color-primary-5-dark, 1)
        );
      }
    }
  }

  &__button {
    width: 100%;
    max-width: 345px;
  }
}
</style>
