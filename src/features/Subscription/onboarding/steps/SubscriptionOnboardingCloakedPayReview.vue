<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { computed } from "vue";
import VirtualCardsProfileDataList from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileDataList.vue";
import type { VirtualCardsProfileDataItem } from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileDataList.vue";
import moment from "moment";
import { displayAddress } from "@/features/enrollment/composables";
import type { ProfileFormData } from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";

const emit = defineEmits<{
  (e: "continue"): void;
  (e: "submit"): void;
  (e: "edit-details"): void;
}>();

const props = defineProps<{
  formData: ProfileFormData & { ssn: string; agreementsAccepted: boolean };
}>();

const isAgreementsAccepted = computed(() => {
  return props.formData?.agreementsAccepted ?? false;
});

const dataList = computed<VirtualCardsProfileDataItem[]>(() => {
  const data = props.formData;
  if (!data) return [];
  return [
    {
      label: "Name",
      value: `${data.firstName} ${data.lastName}`,
    },
    {
      label: "Date of birth",
      value: moment(data.dob, "MM/DD/YYYY").isValid()
        ? moment(data.dob, "MM/DD/YYYY").format("MMMM D, YYYY")
        : data.dob,
    },
    {
      label: "Street address",
      value: displayAddress(data.address),
    },
    { label: "Phone number", value: data.phone },
    { label: "Email address", value: data.email },
    {
      label: "SSN",
      value: data.ssn,
      secretValue: "••• •• •••",
      secret: true,
    },
  ];
});

const handleContinueCtaClick = () => {
  if (isAgreementsAccepted.value) {
    emit("submit");
    return;
  }

  emit("continue");
};

const handleEditDetailsCtaClick = () => {
  emit("edit-details");
};
</script>
<template>
  <div class="subs-onboarding-pay-review">
    <div class="subs-onboarding-pay-review__wrapper">
      <header class="subs-onboarding-pay-review__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="list"
        />
        <BaseText
          variant="headline-2-semibold"
          class="subs-onboarding-pay-review__title"
        >
          Review Your Application
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="subs-onboarding-pay-review__description"
        >
          Check your information below before finishing your Cloaked Pay
          application.
        </BaseText>
      </header>
      <div class="subs-onboarding-pay-review__content">
        <VirtualCardsProfileDataList :items="dataList" />
      </div>
      <footer class="subs-onboarding-pay-review__footer">
        <BaseButton
          variant="primary"
          class="subs-onboarding-pay-review__footer-button"
          @click="handleContinueCtaClick"
        >
          {{ isAgreementsAccepted ? "Submit application" : "Continue" }}
        </BaseButton>
        <BaseButton
          variant="outline"
          class="subs-onboarding-pay-review__footer-button"
          style="margin-top: 8px"
          @click="handleEditDetailsCtaClick"
        >
          Edit your details
        </BaseButton>
        <BaseText
          variant="caption-semibold"
          class="subs-onboarding-pay-review__footer-description"
        >
          Your information is always encrypted and secure
          <BaseIcon
            name="shield-user"
            class="subs-onboarding-pay-review__footer-description-icon"
          />
        </BaseText>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.subs-onboarding-pay-review {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  width: 100%;

  &__wrapper {
    width: 100%;

    @media screen and (min-width: $screen-md) {
      width: 430px;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__title {
    text-align: center;
  }

  &__description {
    display: inline-flex;
    align-items: center;
    text-align: center;
    color: $color-primary-70;
  }

  &__content {
    margin-top: 24px;
    width: 100%;
    padding-bottom: 24px;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 12px 0;
    background: $color-base-white-100;

    @media screen and (min-width: $screen-md) {
      position: sticky;
      bottom: 0;
      z-index: 9;
    }

    &::before {
      content: "";
      display: block;
      height: 35px;
      position: absolute;
      z-index: 9;
      width: 100%;
      top: -30px;
      background: linear-gradient(
        to bottom,
        rgba($color-base-white-100-light, 0),
        rgba($color-base-white-100-light, 1)
      );
      pointer-events: none;

      @at-root .theme-dark & {
        background: linear-gradient(
          to bottom,
          rgba($color-base-white-100-dark, 0),
          rgba($color-base-white-100-dark, 1)
        );
      }
    }

    &-button {
      width: 100%;
    }

    &-description {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 13px;
      text-align: center;
      font-weight: 500;

      &-icon {
        font-size: 19px;
      }
    }
  }
}
</style>
