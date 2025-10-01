<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import VirtualCardsProfileForm from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";
import { ref, watch } from "vue";
import type { ProfileFormData } from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";
import SubscriptionSSNInput from "@/features/Subscription/onboarding/SubscriptionSSNInput.vue";

const emit = defineEmits<{
  (e: "continue", payload: { formData: ProfileFormData; ssn: string }): void;
}>();

const props = defineProps<{
  formData: ProfileFormData & { ssn: string };
}>();
const formRef = ref<InstanceType<typeof VirtualCardsProfileForm> | null>(null);
const ssnRef = ref<InstanceType<typeof SubscriptionSSNInput> | null>(null);
const ssnValue = ref<string>(props.formData.ssn || "");
const isInputFocused = ref(false);

function onInputFocus() {
  isInputFocused.value = true;
}

function onInputBlur() {
  isInputFocused.value = false;
}

function handleContinue() {
  const isSsnValid = ssnRef.value?.submit();
  const isProfileValid = formRef.value?.submit(isSsnValid);
  if (!isProfileValid || !isSsnValid) return;

  const values = formRef.value!.getValues();

  emit("continue", { formData: values, ssn: ssnValue.value });
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
    class="subs-onboarding-pay-form"
    :class="{ 'subs-onboarding-pay-form--input-focused': isInputFocused }"
  >
    <div class="subs-onboarding-pay-form__wrapper">
      <header class="subs-onboarding-pay-form__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="shield-lock-filled"
        />
        <BaseText
          variant="headline-2-semibold"
          class="subs-onboarding-pay-form__title"
        >
          Cloaked Pay Application
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="subs-onboarding-pay-form__description"
        >
          Enter your information as it appears on your government-issued ID. We
          filled in what we could from your scan.
        </BaseText>
      </header>
      <div class="subs-onboarding-pay-form__content">
        <div class="subs-onboarding-pay-form__form-container">
          <div class="subs-onboarding-pay-form__ssn-container">
            <div class="subs-onboarding-pay-form__ssn-content">
              <div class="subs-onboarding-pay-form__ssn-texts-container">
                <BaseText
                  variant="headline-6-bold"
                  class="subs-onboarding-pay-form__ssn-title"
                >
                  Social Security Number (SSN)
                </BaseText>
                <BaseText
                  variant="body-3-regular"
                  class="subs-onboarding-pay-form__ssn-title"
                >
                  Our bank partner requires your SSN to verify your identity, as
                  mandated by law. Cloaked will never store or share it.
                </BaseText>
              </div>
              <BaseIcon
                class="subs-onboarding-pay-form__ssn-icon"
                name="shield-lock-filled"
              />
            </div>
            <div class="subs-onboarding-pay-form__ssn-input-container">
              <SubscriptionSSNInput
                ref="ssnRef"
                v-model="ssnValue"
                :required="true"
                @input-focus="onInputFocus"
                @input-blur="onInputBlur"
              />
            </div>
          </div>
          <VirtualCardsProfileForm
            ref="formRef"
            class="subs-onboarding-pay-form__form"
            :is-loading="false"
            :allowed-search-countries="['us']"
            scroll-container-id="subs-onboarding-layout-content"
            dob-support-text="You must be 18 years or older to use Virtual Cards."
            name-support-text="Enter your legal name from your government-issued ID."
            @input-focus="onInputFocus"
            @input-blur="onInputBlur"
          />
        </div>
      </div>

      <footer class="subs-onboarding-pay-form__footer">
        <BaseButton
          variant="primary"
          class="subs-onboarding-pay-form__footer-button"
          @click="handleContinue"
        >
          Save and continue
        </BaseButton>
        <BaseText
          variant="caption-semibold"
          class="subs-onboarding-pay-form__footer-description"
        >
          Your information is always encrypted and secure
          <BaseIcon
            name="shield-user"
            class="subs-onboarding-pay-form__footer-description-icon"
          />
        </BaseText>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.subs-onboarding-pay-form {
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
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24px;
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

  &__ssn {
    &-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      border: 1px solid $color-spam-protection;
      background-color: $color-spam-protection-30;
      border-radius: 12px;
      padding: 16px;
    }

    &-content {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    &-texts-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &-icon {
      font-size: 36px;
      color: $color-spam-protection;
    }

    &-input-container {
      width: 100%;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    bottom: 0;
    left: 0;
    width: 100%;
    position: sticky;
    padding: 12px 0;
    background: $color-base-white-100;
    z-index: 9;

    .subs-onboarding-pay-form--input-focused & {
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
