<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from "vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import SubscriptionSSNInput from "@/features/Subscription/onboarding/SubscriptionSSNInput.vue";
import { useVirtualCardsApplicationStore } from "@/features/VirtualCards/store/useVirtualCardsApplicationStore";
import { posthogCapture } from "@/scripts/posthog.js";
import { useDevice } from "@/composables/useDevice";

const emit = defineEmits<{ (e: "continue"): void }>();

const tooltipTitle =
  "If you do not have a SSN, you may use an ITIN (Individual Taxpayer Identification Number) to apply for Cloaked Pay.";

const { isMobile } = useDevice();
const virtualCardsApplication = useVirtualCardsApplicationStore();
const ssnInputRef =
  useTemplateRef<InstanceType<typeof SubscriptionSSNInput>>("ssnInputRef");

const ssnValue = computed({
  get: () => virtualCardsApplication.detailsFormData.ssn,
  set: (value) => {
    virtualCardsApplication.detailsFormData.ssn = value;
  },
});

onMounted(() => {
  posthogCapture("pay_kyc_ssn_form_screenview");
  ssnInputRef.value?.focus();
});

function handleContinue() {
  const isValid = ssnInputRef.value?.submit();
  if (isValid) {
    posthogCapture("pay_kyc_ssn_form_continue_tapped");
    emit("continue");
  }
}
</script>

<template>
  <div class="vc-application-ssn-form">
    <div class="vc-application-ssn-form__wrapper">
      <header class="vc-application-ssn-form__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="shield-lock-filled"
        />
        <BaseText
          variant="headline-2-semibold"
          class="vc-application-ssn-form__title"
        >
          Social Security number
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="vc-application-ssn-form__description"
        >
          Our bank partner requires your SSN to verify your identity, as
          mandated by law. Cloaked will never store or share it.
        </BaseText>
        <BaseText
          variant="body-small-semibold"
          class="vc-application-ssn-form__footer-description"
        >
          Don't have an SSN?
          <UiTooltip
            :max-width="isMobile ? 220 : 300"
            align-x="center"
            is-multiline
            :title="tooltipTitle"
          >
            <BaseIcon
              class="vc-application-ssn-form__footer-description-icon"
              name="info"
            />
          </UiTooltip>
        </BaseText>
      </header>

      <div class="vc-application-ssn-form__content">
        <div class="vc-application-ssn-form__form">
          <SubscriptionSSNInput
            ref="ssnInputRef"
            v-model="ssnValue"
            required
            @keydown.enter="handleContinue"
          />
        </div>
      </div>

      <Teleport
        to="body"
        :disabled="!isMobile"
      >
        <footer class="vc-application-ssn-form__footer">
          <BaseButton
            variant="secondary"
            class="vc-application-ssn-form__footer-cta"
            @click="handleContinue"
          >
            Save and continue
          </BaseButton>
          <BaseText
            variant="caption-semibold"
            class="vc-application-ssn-form__footer-security"
          >
            Your information is always encrypted and secure
            <BaseIcon
              name="shield-user"
              class="vc-application-ssn-form__footer-security-icon"
            />
          </BaseText>
        </footer>
      </Teleport>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-application-ssn-form";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  width: 100%;

  &__wrapper {
    max-width: 430px;
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
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-align: center;
    margin-top: 8px;
    color: $color-primary-70;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__form {
    width: 100%;
    margin-top: 24px;

    @media (min-width: $screen-md) {
      width: 90%;
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
    gap: 13px;

    @at-root body:has(.theme-dark) & {
      background: $color-primary-5-dark;
    }

    @media screen and (min-width: $screen-md) {
      position: relative;
      margin-top: 24px;
      gap: 24px;
      padding: 0;
      background: transparent;
      z-index: auto;
    }

    &-description {
      display: inline-flex;
      align-items: center;
      text-align: center;
      gap: 4px;
      color: $color-primary-70;
      margin-top: 16px;

      &-icon {
        font-size: 16px;
        font-weight: 400;
        margin-top: -4px;
      }
    }

    &-cta {
      width: 100%;
      max-width: 430px;

      @media (min-width: $screen-md) {
        width: 80%;
      }
    }

    &-security {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-align: center;
      font-weight: 500;

      &-icon {
        font-size: 19px;
      }
    }
  }
}
</style>
