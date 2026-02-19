<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import { constants } from "@/scripts/constants";
import type { FundingSourceType } from "@/types/Wallet/funding-source";
import { posthogCapture } from "@/scripts/posthog";

const emit = defineEmits<{
  (e: "continue"): void;
}>();

const tooltipTitle = `Available funding source methods vary by jurisdiction. By adding a Funding Source, you agree that Cloaked will confirm sufficient funds when generating a new card.

You may see a [Cloaked temporary check] on your funding source transaction history for a limited time.

We will not charge your funding source until a transaction has been completed. AutoPay is currently enabled for your account. You can turn it off anytime in Settings. 
`;

const {
  getProviderIcon,
  fundingSources,
  enabledFundingSourceTypes,
  openAddPopup,
  refetchFundingSources,
} = useFundingSource();

const loadingOption = ref<FundingSourceType | null>();
const isLeaving = ref(false);

onMounted(() => {
  window.addEventListener("focus", refetchFundingSources);
});

onUnmounted(() => {
  window.removeEventListener("focus", refetchFundingSources);
});

const linkOptions: {
  id: string;
  label: string;
  icon: BaseIconName;
  enabled: boolean;
  onClick: () => void;
}[] = [
  {
    id: constants.CARD_TYPE.CREDIT_CARD,
    label: "Credit card",
    icon: getProviderIcon(constants.CARD_TYPE.CREDIT_CARD),
    enabled: enabledFundingSourceTypes.value.credit_card,
    onClick: () => {
      handleOptionClick(constants.CARD_TYPE.CREDIT_CARD);
      posthogCapture("pay_post_kyc_onboarding_link_funding_credit_card_tapped");
    },
  },
  {
    id: constants.CARD_TYPE.DEBIT_CARD,
    label: "Debit card",
    icon: getProviderIcon(constants.CARD_TYPE.DEBIT_CARD),
    enabled: enabledFundingSourceTypes.value.debit_card,
    onClick: () => {
      handleOptionClick(constants.CARD_TYPE.DEBIT_CARD);
      posthogCapture("pay_post_kyc_onboarding_link_funding_debit_card_tapped");
    },
  },
  {
    id: "ach",
    label: "Bank account",
    icon: getProviderIcon("ach"),
    enabled: enabledFundingSourceTypes.value.ach,
    onClick: () => {
      handleOptionClick("ach");
      posthogCapture(
        "pay_post_kyc_onboarding_link_funding_bank_account_tapped"
      );
    },
  },
];

const enabledLinkOptions = computed(() => {
  return linkOptions.filter((option) => option.enabled);
});
const handleOptionClick = (type: FundingSourceType) => {
  if (loadingOption.value) return;

  loadingOption.value = type;
  const addPromise = openAddPopup(type, refetchFundingSources);
  if (addPromise) {
    addPromise.finally(() => {
      loadingOption.value = null;
    });
  } else {
    loadingOption.value = null;
  }
};

const onAddSuccess = () => {
  loadingOption.value = null;
  isLeaving.value = true;
  setTimeout(() => {
    emit("continue");
  }, 400);
};

watch(fundingSources, () => {
  if (fundingSources.value?.length) {
    onAddSuccess();
  }
});
</script>
<template>
  <div
    class="pay-onboarding-fs-setup-step-2"
    :class="{
      'pay-onboarding-fs-setup-step-2--leaving': isLeaving,
    }"
  >
    <BaseMedallion
      size="lg"
      color="primary-adaptative"
      icon="shield-tick"
    />
    <BaseText
      variant="headline-2-semibold"
      class="pay-onboarding-fs-setup-step-2__title"
    >
      Link your funding source
    </BaseText>
    <BaseText
      variant="headline-6-medium"
      class="pay-onboarding-fs-setup-step-2__description"
    >
      Protect your
      <UiTooltip
        class="pay-onboarding-fs-setup-step-2__description-tooltip"
        :max-width="300"
        is-multiline
        :title="tooltipTitle"
      >
        <span class="pay-onboarding-fs-setup-step-2__description--underline">
          <!-- eslint-disable-next-line -->
          card or bank account<BaseIcon
            class="pay-onboarding-fs-setup-step-2__description-icon"
            name="info"
          />
          <!-- eslint-enable-next-line -->
        </span>
      </UiTooltip>
    </BaseText>

    <ul class="pay-onboarding-fs-setup-step-2__options">
      <li
        v-for="option in enabledLinkOptions"
        :key="option.id"
        class="pay-onboarding-fs-setup-step-2__option"
        :class="{
          'pay-onboarding-fs-setup-step-2__option--disabled':
            !!loadingOption && loadingOption !== option.id,
          'pay-onboarding-fs-setup-step-2__option--loading':
            loadingOption === option.id,
        }"
        role="button"
        :aria-label="`Add ${option.label} as funding source`"
        tabindex="0"
        @click="option.onClick()"
        @keydown.enter="option.onClick()"
        @keydown.space.prevent="option.onClick()"
      >
        <template v-if="loadingOption === option.id">
          <div class="pay-onboarding-fs-setup-step-2__option-icon-container">
            <span
              class="pay-onboarding-fs-setup-step-2__option-loader-icon"
            ></span>
          </div>
        </template>
        <template v-else>
          <div class="pay-onboarding-fs-setup-step-2__option-icon-container">
            <BaseIcon
              :name="option.icon"
              class="pay-onboarding-fs-setup-step-2__option-icon"
            />
          </div>
        </template>
        <div class="pay-onboarding-fs-setup-step-2__option-label-container">
          <BaseText
            as="p"
            variant="headline-5-bold"
            class="pay-onboarding-fs-setup-step-2__option-label"
          >
            {{ option.label }}
          </BaseText>
          <BaseIcon
            name="chevron-right"
            class="pay-onboarding-fs-setup-step-2__option-label-chevron"
          />
        </div>
      </li>
    </ul>
  </div>
</template>
<style scoped lang="scss">
$component-name: "pay-onboarding-fs-setup-step-2";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;

  @media all and (min-width: $screen-sm) {
    padding-bottom: 30px;
  }

  &__title {
    text-align: center;

    @media all and (width < $screen-sm) {
      font-size: 29px;
    }
  }

  &__description {
    text-align: center;

    &--underline {
      text-decoration: underline;
    }

    &-icon {
      margin-left: 4px;
      transform: translateY(2px);
    }
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;
  }

  &__option {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 330px;
    border-radius: 30px;
    background-color: $color-primary-5;
    padding: 16px;
    cursor: pointer;
    transition:
      border-color 0.15s ease-out,
      opacity 0.15s ease-out;
    opacity: 0;
    animation: option-fade-in 0.2s ease-out forwards;

    &:nth-child(1) {
      animation-delay: 0.1s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }

    .#{$component-name}--leaving & {
      opacity: 1;
      animation: option-fade-out 0.2s ease-out forwards;

      &:nth-child(1) {
        animation-delay: 0.3s;
      }

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.1s;
      }
    }

    @at-root .theme-dark & {
      border: 1px solid rgba($color-base-black-100-dark, 0.15);

      &--loading,
      &:hover {
        border-color: rgba($color-base-black-100-dark, 0.3);
      }
    }

    @at-root .theme-light & {
      border: 1px solid rgba($color-base-black-100-light, 0.15);

      &--loading,
      &:hover {
        border-color: rgba($color-base-black-100-light, 0.3);
      }
    }

    &--disabled {
      opacity: 0.5 !important;
      pointer-events: none;
      cursor: default;
    }

    &-label {
      &-container {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      &-chevron {
        font-size: 16px;
        font-weight: 600;
      }
    }

    &-icon {
      font-size: 23px;

      &-container {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: $color-primary-5;

        @at-root .theme-dark & {
          border: 1px solid rgba($color-base-black-100-dark, 0.1);
          background: rgba($color-base-black-100-dark, 0.1);
        }

        @at-root .theme-light & {
          border: 1px solid rgba($color-base-black-100-light, 0.1);
          background: rgba($color-base-black-100-light, 0.1);
        }
      }
    }

    &-loader-container {
      width: 24px;
      height: 24px;
    }

    &-loader-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid $color-primary-100;
      border-top: 2px solid transparent;
      animation: spin 0.6s linear infinite;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes option-fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes option-fade-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
