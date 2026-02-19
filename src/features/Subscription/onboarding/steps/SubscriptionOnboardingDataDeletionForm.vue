<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeleteAgreementModal from "@/features/data-delete/DataDeleteAgreementModal.vue";
import { ref, watch } from "vue";
import { useFormattedName } from "@/features/enrollment/composables";
import VirtualCardsProfileForm from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";
import SubscriptionSSNInput from "@/features/Subscription/onboarding/SubscriptionSSNInput.vue";
import type { ProfileFormData } from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";
import moment from "moment";
import type { AddressAutocomplete } from "@/features/VirtualCards/VirtualCardsAddressInput.vue";
import store from "@/store";

export type DataDeletionFormData = {
  name: {
    first: string;
    last: string;
  };
  dob: string;
  addresses: AddressAutocomplete[];
  email_addresses: string[];
  phone_numbers: string[];
  ssn: string;
};

const emit = defineEmits<{
  (e: "submit", payload: DataDeletionFormData): void;
}>();

const props = defineProps<{
  formData: ProfileFormData & { ssn: string };
  isSubmitting: boolean;
}>();

const formRef = ref<InstanceType<typeof VirtualCardsProfileForm> | null>(null);
const ssnRef = ref<InstanceType<typeof SubscriptionSSNInput> | null>(null);
const ssnValue = ref(props.formData.ssn || "");
const isAgreementModalOpen = ref(false);
const isInputFocused = ref(false);

let formattedName = useFormattedName(
  props.formData.firstName,
  "",
  props.formData.lastName
);

function onInputFocus() {
  isInputFocused.value = true;
}

function onInputBlur() {
  isInputFocused.value = false;
}

function showDoLaterConfirmation() {
  store.dispatch("openModal", {
    header: "Do you want to continue without adding real time alerts?",
    paragraphs: [
      "We monitor your SSN in real-time for usage across a variety of high-risk actions, including loan applications, employment and healthcare records, tax filings, online documents signings and payment platforms.",
      "You'll receive instant alerts in the mobile app if your information is compromised.",
    ],
    button: {
      text: "Do this later",
      onClick: () => {
        submit();
      },
    },
    cancelText: "Back",
    cancelIcon: "arrowturnup-left",
  });
}

function handleContinue() {
  const isProfileValid = formRef.value?.submit();
  const isSsnValid = ssnRef.value?.submit();

  if (!isProfileValid || !isSsnValid) return;

  if (!ssnValue.value) {
    showDoLaterConfirmation();
    return;
  }

  submit();
}

function submit() {
  if (formRef.value) {
    const values = formRef.value.getValues();

    const rawPayload: DataDeletionFormData = {
      name: {
        first: values.firstName,
        last: values.lastName,
      },
      dob: moment(values.dob, "MM/DD/YYYY").format("MM-DD-YYYY"),
      addresses: [values.address],
      email_addresses: [values.email],
      phone_numbers: [values.phone],
      ssn: ssnValue.value.replace(/ /g, ""),
    };

    emit("submit", rawPayload);
  }
}

function openAgreementModal() {
  isAgreementModalOpen.value = true;
  const values = formRef.value?.getValues();
  formattedName = useFormattedName(values?.firstName, "", values?.lastName);
}

watch(
  [() => props.formData, () => formRef.value],
  ([formData, formInstance]) => {
    if (!formData || !formInstance) return;
    formInstance.setValues({ ...formData });
  },
  {
    immediate: true,
  }
);
</script>
<template>
  <div
    class="subs-onboarding-deletion-form"
    :class="{ 'subs-onboarding-deletion-form--input-focused': isInputFocused }"
  >
    <div class="subs-onboarding-deletion-form__wrapper">
      <header class="subs-onboarding-deletion-form__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="shield-tick-filled-1"
        />
        <BaseText
          variant="headline-2-semibold"
          class="subs-onboarding-deletion-form__title"
        >
          Complete Your Profile
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="subs-onboarding-deletion-form__description"
        >
          Turn on Data Removal and Identity Monitoring to take your information
          off data broker sites and scan the dark web.
        </BaseText>
      </header>
      <div class="subs-onboarding-deletion-form__content">
        <div class="subs-onboarding-deletion-form__form-container">
          <VirtualCardsProfileForm
            ref="formRef"
            class="subs-onboarding-deletion-form__form"
            :is-loading="false"
            :us-only="false"
            :show-suite-field="true"
            scroll-container-id="subs-onboarding-layout-content"
            @input-focus="onInputFocus"
            @input-blur="onInputBlur"
          >
            <template #additional-fields>
              <SubscriptionSSNInput
                ref="ssnRef"
                v-model="ssnValue"
                style="margin-top: 16px"
                label="Social Security Number (optional)"
                :required="false"
                @input-focus="onInputFocus"
                @input-blur="onInputBlur"
              />
            </template>
          </VirtualCardsProfileForm>
          <div class="subs-onboarding-deletion-form__agreements-container">
            <BaseText
              variant="body-2-semibold"
              class="subs-onboarding-deletion-form__agreements-text"
            >
              By submitting, you agree to Cloaked's
              <br />
              <span
                class="subs-onboarding-deletion-form__agreements-link"
                @click="openAgreementModal"
              >
                data enrollment agreement.
              </span>
            </BaseText>
          </div>
        </div>
      </div>

      <footer class="subs-onboarding-deletion-form__footer">
        <BaseButton
          variant="primary"
          class="subs-onboarding-deletion-form__footer-button"
          :disabled="isSubmitting"
          :loading="isSubmitting"
          @click="handleContinue"
        >
          Submit Profile
        </BaseButton>

        <BaseText
          variant="caption-semibold"
          class="subs-onboarding-deletion-form__footer-description"
        >
          Your information is always encrypted and secure
          <BaseIcon
            name="shield-user"
            class="subs-onboarding-deletion-form__footer-description-icon"
          />
        </BaseText>
      </footer>
    </div>
    <DataDeleteAgreementModal
      :value="isAgreementModalOpen"
      :name="formattedName"
      @close="isAgreementModalOpen = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.subs-onboarding-deletion-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  width: 100%;

  &__wrapper {
    width: 100%;

    @media screen and (min-width: $screen-md) {
      width: 440px;
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

  &__form {
    &-container {
      border-radius: 24px;
      padding: 16px;
      background: $color-base-white-80;
      border: 1px solid $color-base-black-10;
      box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);

      @media screen and (min-width: $screen-md) {
        padding: 24px;
      }
    }
  }

  &__agreements {
    &-container {
      margin-top: 16px;
      text-align: center;
    }

    &-text {
      color: $color-primary-70;
      text-align: center;
    }

    &-link {
      color: $color-primary-100;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: sticky;
    bottom: 0;
    width: 100%;
    padding: 12px 0;
    background: $color-base-white-100;
    z-index: 9;

    .subs-onboarding-deletion-form--input-focused & {
      position: unset;

      @media screen and (min-width: $screen-md) {
        position: sticky;
      }
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
