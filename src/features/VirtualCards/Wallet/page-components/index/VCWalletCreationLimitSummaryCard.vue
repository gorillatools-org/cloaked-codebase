<script setup lang="ts">
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import NumberFlow, { continuous } from "@number-flow/vue";
import useCreationLimit from "@/features/VirtualCards/composables/useCreationLimit";
import { computed } from "vue";
import { useVirtualCardsWalletPageStore } from "@/features/VirtualCards/store/useVirtualCardsWalletPageStore";
import { storeToRefs } from "pinia";
import Button from "@/features/Button.vue";
import useVirtualCards from "@/features/VirtualCards/composables/useVirtualCards";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { posthogCapture } from "@/scripts/posthog";
import { useWindowSize } from "@vueuse/core";

type Props = {
  detailed?: boolean;
  showViewDetails?: boolean;
};

type SummaryState = "limit-reached" | "low-limit" | "detailed" | "default";

const emit = defineEmits(["viewDetails", "freeUpSpace"]);
const props = withDefaults(defineProps<Props>(), {
  detailed: true,
  showViewDetails: false,
});

const { width } = useWindowSize();

const { cardsList } = useVirtualCards();
const {
  remainingLimit,
  isNearLimit,
  isReachedLimit,
  currencyFormatConfig,
  limit,
  limitConsumed,
} = useCreationLimit();

const virtualCardsApplication = useVirtualCardsWalletPageStore();
const { shouldAnimateOnMount } = storeToRefs(virtualCardsApplication);

const isMediumScreen = computed(() => width.value < 1650);

const remainingLimitValue = computed(() =>
  shouldAnimateOnMount.value ? 0 : remainingLimit.value / 100
);
const limitConsumedValue = computed(() =>
  shouldAnimateOnMount.value ? 0 : (limitConsumed.value ?? 0) / 100
);
const limitValue = computed(() =>
  shouldAnimateOnMount.value ? 0 : (limit.value ?? 0) / 100
);

const remainingPercent = computed(() => {
  if (limitValue.value === 0) return 0;
  return (limitConsumedValue.value / limitValue.value) * 100;
});

const cardsCreated = computed(() => cardsList.value?.length ?? 0);

const showProgress = computed(() => {
  return state.value === "default" || state.value === "detailed";
});

const detailsList = computed(() => {
  return [
    {
      label: "Card Limits",
      valuePrefix: "up to ",
      value: limitValue.value,
      description: "per card",
    },
    {
      label: "Account Limits",
      valuePrefix: "up to ",
      value: limitValue.value,
      description: "across all cards",
    },
  ];
});

const state = computed<SummaryState>(() => {
  if (props.detailed) {
    return "detailed";
  }

  if (isReachedLimit.value) {
    return "limit-reached";
  } else if (isNearLimit.value) {
    return "low-limit";
  } else {
    return "default";
  }
});

const handleCardClick = () => {
  posthogCapture("dashboard_pay_wallet_summary_card_clicked");
};

const handleViewDetailsClick = () => {
  posthogCapture("dashboard_pay_wallet_summary_card_view_details_clicked");
  emit("viewDetails");
};

const handleFreeUpSpaceClick = () => {
  posthogCapture(
    "dashboard_pay_wallet_summary_card_free_up_space_button_clicked"
  );
  emit("freeUpSpace");
};
</script>
<template>
  <VCBaseCard
    class="vc-wallet-cl-summary-card"
    :class="[
      `vc-wallet-cl-summary-card--${state}`,
      { 'vc-wallet-cl-summary-card--detailed': detailed },
    ]"
    :border="{ borderRadius: 24 }"
    @click="handleCardClick"
  >
    <!-- Header -->
    <div class="vc-wallet-cl-summary-card__wrapper">
      <header class="vc-wallet-cl-summary-card__header">
        <transition
          name="text"
          mode="out-in"
        >
          <div
            v-if="state !== 'detailed'"
            class="vc-wallet-cl-summary-card__header-title-container"
          >
            <BaseText variant="headline-5-bold">Summary</BaseText>
            <UiTooltip title="Cards Created">
              <BaseIcon
                class="vc-wallet-cl-summary-card__header-title-icon"
                name="info"
              />
            </UiTooltip>
          </div>
          <div
            v-else-if="state === 'detailed'"
            class="vc-wallet-cl-summary-card__header-title-container"
          >
            <BaseText variant="headline-5-bold">Cards Created</BaseText>

            <UiTooltip title="Cards Created">
              <BaseIcon
                class="vc-wallet-cl-summary-card__header-title-icon"
                name="info"
              />
            </UiTooltip>
          </div>
        </transition>
        <transition
          name="text"
          mode="out-in"
        >
          <BaseText
            v-if="state !== 'detailed' && showViewDetails"
            class="vc-wallet-cl-summary-card__header-details-link"
            variant="body-small-semibold"
            @click.stop="handleViewDetailsClick"
          >
            View Details
          </BaseText>
          <BaseText
            v-else-if="state === 'detailed'"
            variant="body-2-semibold"
          >
            <NumberFlow
              :format="currencyFormatConfig"
              :value="limitConsumedValue"
              :plugins="[continuous]"
            />
          </BaseText>
        </transition>
      </header>

      <!-- Body -->
      <div class="vc-wallet-cl-summary-card__body">
        <div class="vc-wallet-cl-summary-card__limit-container">
          <div class="vc-wallet-cl-summary-card__limit-amount-container">
            <transition
              name="fade"
              mode="out-in"
            >
              <div
                :key="state"
                class="vc-wallet-cl-summary-card__transition-content"
              >
                <BaseText
                  v-if="state === 'default'"
                  class="vc-wallet-cl-summary-card__limit-amount-text"
                  :variant="
                    isMediumScreen ? 'headline-6-medium' : 'headline-4-medium'
                  "
                >
                  You have
                  <NumberFlow
                    :format="currencyFormatConfig"
                    :value="remainingLimitValue"
                    class="vc-wallet-cl-summary-card__limit-amount-value"
                    :plugins="[continuous]"
                  />
                  available to create new cards.
                </BaseText>
                <BaseText
                  v-if="state === 'detailed'"
                  class="vc-wallet-cl-summary-card__limit-amount-text vc-wallet-cl-summary-card__limit-amount-text--detailed"
                  variant="headline-6-medium"
                >
                  You've created
                  <NumberFlow
                    :value="cardsCreated"
                    class="vc-wallet-cl-summary-card__limit-amount-value vc-wallet-cl-summary-card__limit-amount-value--no-hightlight"
                    :plugins="[continuous]"
                  />
                  cards totaling
                  <NumberFlow
                    :format="currencyFormatConfig"
                    :value="limitConsumedValue"
                    class="vc-wallet-cl-summary-card__limit-amount-value vc-wallet-cl-summary-card__limit-amount-value--no-hightlight"
                    :plugins="[continuous]"
                  />
                </BaseText>
                <BaseText
                  v-if="state === 'low-limit'"
                  class="vc-wallet-cl-summary-card__limit-amount-text"
                  :variant="
                    isMediumScreen ? 'headline-6-medium' : 'headline-4-medium'
                  "
                >
                  You only have
                  <NumberFlow
                    :format="currencyFormatConfig"
                    :value="remainingLimitValue"
                    class="vc-wallet-cl-summary-card__limit-amount-value vc-wallet-cl-summary-card__limit-amount-value--low"
                    :plugins="[continuous]"
                  />
                  available to create new cards.
                </BaseText>
                <BaseText
                  v-if="state === 'limit-reached'"
                  class="vc-wallet-cl-summary-card__limit-amount-text"
                  style="font-weight: 500"
                  :variant="
                    isMediumScreen ? 'body-2-semibold' : 'headline-5-bold'
                  "
                >
                  You've reached your card creation limit. Free up space to
                  create more cards.
                </BaseText>
              </div>
            </transition>
          </div>
          <div class="vc-wallet-cl-summary-card__action-container">
            <transition
              name="fade"
              mode="out-in"
            >
              <div :key="showProgress ? 'progress' : 'button'">
                <div
                  v-if="showProgress"
                  class="vc-wallet-cl-summary-card__limit-progress-container"
                >
                  <div
                    class="vc-wallet-cl-summary-card__limit-progress-bar"
                    :style="{
                      '--vc-creation-limit-progress-percent':
                        remainingPercent + '%',
                    }"
                  ></div>
                  <div
                    class="vc-wallet-cl-summary-card__limit-progress-labels-container"
                  >
                    <NumberFlow
                      class="vc-wallet-cl-summary-card__limit-progress-label"
                      :format="currencyFormatConfig"
                      :value="limitConsumedValue"
                      suffix=" in use"
                      :plugins="[continuous]"
                    />
                    <NumberFlow
                      class="vc-wallet-cl-summary-card__limit-progress-label"
                      :format="currencyFormatConfig"
                      :value="limitValue"
                      suffix=" limit"
                      :plugins="[continuous]"
                    />
                  </div>
                </div>
                <Button
                  v-else
                  type="danger"
                  full-width
                  class="vc-wallet-cl-summary-card__free-up-btn"
                  @click.stop="handleFreeUpSpaceClick"
                >
                  Free Up Space
                </Button>
              </div>
            </transition>
          </div>
          <div class="vc-wallet-cl-summary-card__details">
            <div class="vc-wallet-cl-summary-card__details-container">
              <div
                v-for="detail in detailsList"
                :key="detail.label"
                class="vc-wallet-cl-summary-card__details-row"
              >
                <BaseText variant="body-2-semibold">
                  {{ detail.label }}
                </BaseText>
                <div
                  class="vc-wallet-cl-summary-card__details-row-value-container"
                >
                  <NumberFlow
                    class="vc-wallet-cl-summary-card__details-row-value"
                    :prefix="detail.valuePrefix"
                    :format="currencyFormatConfig"
                    :value="detail.value"
                    :plugins="[continuous]"
                  />
                  <BaseText
                    variant="body-small-semibold"
                    class="vc-wallet-cl-summary-card__details-row-value-description"
                  >
                    {{ detail.description }}
                  </BaseText>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VCBaseCard>
</template>
<style lang="scss" scoped>
$ease: cubic-bezier(0.22, 1, 0.36, 1);

.vc-wallet-cl-summary-card {
  &__wrapper {
    display: flex;
    flex-direction: column;
    padding: 22px 16px;
    container-type: inline-size;
    container-name: wallet-summary-card;
    min-height: 205px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-details-link {
      text-decoration: underline;
      cursor: pointer;
      transition: opacity 0.16s $ease;

      &:hover {
        opacity: 0.8;
      }
    }

    &-title {
      &-container {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      &-icon {
        font-size: 18px;
      }
    }
  }

  &__limit {
    &-amount {
      &-container {
        display: flex;
        align-items: center;
        margin-top: 22px;
        height: 54px;
        transition:
          margin-top 0.26s $ease,
          height 0.26s $ease;

        .vc-wallet-cl-summary-card--detailed & {
          margin-top: 36px;
          height: 20px;
        }
      }

      &-text {
        display: block;
        color: $color-primary-70;
        max-width: 90%;
        font-size: clamp(16px, 5.1cqw, 22px);

        &--detailed {
          max-width: 100%;
          font-size: clamp(14px, 5.1cqw, 15px);
        }
      }

      &-value {
        font-weight: 700;
        color: $color-safe-zone-blue;

        &--low {
          color: $color-status-error !important;
        }

        &--no-hightlight {
          color: inherit;
          font-weight: inherit;
        }
      }
    }

    &-progress {
      &-bar {
        height: 8px;
        width: 100%;
        border-radius: 10px;
        background-color: $color-safe-zone-blue;
        overflow: hidden;

        &::before {
          content: "";
          display: block;
          height: inherit;
          width: var(--vc-creation-limit-progress-percent);
          border-radius: 10px 0 0 10px;
          background-color: $color-primary-100;
          transition: width 0.8s cubic-bezier(0.86, 0, 0.07, 1);
        }
      }

      &-labels-container {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
      }

      &-label {
        color: $color-primary-70;
        font-size: 13px;
        font-weight: 500;
        line-height: 18px;
      }
    }
  }

  &__action-container {
    margin-top: 21px;
    max-height: 40px;
    min-height: 40px;
    transition: margin-top 0.26s $ease;

    .vc-wallet-cl-summary-card--detailed & {
      margin-top: 16px;
    }
  }

  &__free-up-btn {
    font-size: 14px;
    font-weight: 600;
    height: 44px;
  }

  &__details {
    padding-top: 0;
    max-height: 0;
    overflow: hidden;
    opacity: 0.1;
    transform: translateY(-5px);
    filter: blur(1px);
    transition:
      max-height 0.28s ease-out,
      padding-top 0.22s ease-out,
      opacity 0.24s ease-out,
      transform 0.28s ease-out,
      filter 0.38s ease-out;

    .vc-wallet-cl-summary-card--detailed & {
      max-height: 200px;
      padding-top: 31px;
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
    }

    &-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-top: 1px solid $color-base-black-10;
      padding-top: 16px;
    }

    &-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &-value-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      &-value {
        font-size: 13px;
        font-weight: 600;
        line-height: 18px;

        &-description {
          color: $color-primary-50;
        }
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.16s $ease,
    transform 0.16s $ease,
    filter 0.16s $ease;
  transform-origin: center;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(2px) scale(0.93);
}

/* ENTER: fade in and rise slightly */
.text-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.text-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.text-enter-active {
  transition:
    opacity 140ms ease-out,
    transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* LEAVE: fade out and lift a touch for directionality */
.text-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.text-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.text-leave-active {
  transition:
    opacity 100ms ease-in,
    transform 100ms ease-in;
}
</style>
