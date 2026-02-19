<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import { ref, onMounted, watch } from "vue";
import { useVirtualCardsApplicationStore } from "@/features/VirtualCards/store/useVirtualCardsApplicationStore";
import VirtualCardsProfileForm from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";
import { posthogCapture } from "@/scripts/posthog";
import { useDevice } from "@/composables/useDevice";

const emit = defineEmits<{
  (e: "continue"): void;
}>();

const tooltipTitle = `Why Cloaked asks for your information

  To help the government fight the funding of terrorism and money laundering activities, federal law requires our banking partner(s) obtain, verify, and record information that identifies each person who opens an account.
  
  What this means for you: When you open a Cloaked Pay account, we will ask for your name, address, date of birth, and other information that will allow us to identify you. We may also ask to see identifying documentation.
  `;

const formRef = ref<InstanceType<typeof VirtualCardsProfileForm> | null>(null);
const formRootRef = ref<HTMLElement | null>(null);
const isInputFocused = ref(false);
const { isMobile } = useDevice();

onMounted(() => {
  posthogCapture("pay_kyc_details_form_screenview");
});

const virtualCardsApplication = useVirtualCardsApplicationStore();

function handleContinue() {
  const isFormValid = formRef.value?.submit();
  if (!isFormValid) return;

  const values = formRef.value!.getValues();
  virtualCardsApplication.detailsFormData.firstName = values.firstName;
  virtualCardsApplication.detailsFormData.lastName = values.lastName;
  virtualCardsApplication.detailsFormData.dob = values.dob;
  virtualCardsApplication.detailsFormData.address = values.address;
  virtualCardsApplication.detailsFormData.phone = values.phone;
  virtualCardsApplication.detailsFormData.email = values.email;

  emit("continue");
}

watch(
  [virtualCardsApplication.detailsFormData, formRef],
  ([formData, formRef]) => {
    if (!formData || !formRef) return;
    formRef.setValues({ ...formData });
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div
    ref="formRootRef"
    class="vc-application-details-form"
  >
    <div class="vc-application-details-form__wrapper">
      <header class="vc-application-details-form__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="name-card-filled"
        />
        <BaseText
          variant="headline-2-semibold"
          class="vc-application-details-form__title"
        >
          Verify your identity
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="vc-application-details-form__description"
        >
          We've auto-populated details from your encrypted profile.
          <UiTooltip
            :max-width="isMobile ? 250 : 400"
            align-x="center"
            position="bottom"
            is-multiline
            :title="tooltipTitle"
          >
            <BaseIcon
              class="vc-application-details-form__description-icon"
              name="info"
            />
          </UiTooltip>
        </BaseText>
      </header>

      <div class="vc-application-details-form__content">
        <VirtualCardsProfileForm
          ref="formRef"
          class="vc-application-details-form__form"
          scroll-container-id="vc-application-flow-content"
          :is-loading="virtualCardsApplication.isAutofillLoading"
          :allowed-search-countries="['us']"
          dob-support-text="You must be 18 years or older to use Virtual Cards."
          name-support-text="Enter your legal name from your government-issued ID."
          @submit="handleContinue"
          @input-focus="isInputFocused = true"
          @input-blur="isInputFocused = false"
        />
      </div>

      <Teleport
        to="body"
        :disabled="!isMobile || (isMobile && isInputFocused)"
      >
        <footer
          class="vc-application-details-form__footer"
          :class="{
            'vc-application-details-form__footer--mobile-static':
              isMobile && isInputFocused,
          }"
        >
          <BaseButton
            variant="primary"
            class="vc-application-details-form__footer-cta"
            @click="handleContinue"
          >
            Continue
          </BaseButton>
          <BaseText
            variant="caption-semibold"
            class="vc-application-details-form__footer-description"
          >
            Your information is always encrypted and secure
            <BaseIcon
              name="shield-user"
              class="vc-application-details-form__footer-description-icon"
            />
          </BaseText>
        </footer>
      </Teleport>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-application-details-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  width: 100%;

  &__wrapper {
    max-width: 430px;
    padding-bottom: 50px;

    @media (min-width: $screen-md) {
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

  &__description {
    align-items: center;
    gap: 4px;
    text-align: center;
    margin-top: 8px;
    color: $color-primary-70;

    &-icon {
      transform: translateY(1px);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 30px;
  }

  &__form {
    width: 100%;

    @media (min-width: $screen-md) {
      max-width: 90%;
    }

    :deep(.base-input__input),
    :deep(.base-select__select) {
      border: 1.5px solid $color-overlay-neutral-15;
      height: 56px;
      border-radius: 12px;

      &:focus {
        border-color: $color-neutral-1000;
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    bottom: 0;
    width: 100%;
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
      width: 100%;
      padding: 12px 0;
    }

    &::before {
      content: "";
      display: block;
      height: 35px;
      position: absolute;
      z-index: 9;
      width: 100%;
      max-width: 90%;
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

    &--mobile-static {
      position: unset;
      padding: unset;
    }

    &-cta {
      width: 100%;
      max-width: 430px;

      @media (min-width: $screen-md) {
        width: 85%;
      }
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
