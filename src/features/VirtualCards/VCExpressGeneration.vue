<script setup lang="ts">
import VCBaseCard from "./base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { ref, computed, useTemplateRef, watch, markRaw } from "vue";
import VCBaseTabs, { type TabItem } from "./base/VCBaseTabs.vue";
import VCBaseAmountInput from "./base/VCBaseAmountInput.vue";
import Button from "@/features/Button.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import useVirtualCardGenerate, {
  type GenerateCardParams,
} from "@/features/VirtualCards/composables/useVirtualCardGenerate";
import { useToast } from "@/composables/useToast.js";
import { posthogCapture } from "@/scripts/posthog";
import store from "@/store";
import type { VirtualCardPeriod } from "@/types/Wallet/virtual-card";
import {
  CARD_PERIOD_TYPE_TO_API_TYPE,
  CARD_PERIOD_TO_CARD_TYPE,
} from "./constants/virtual-card-constants";

import useOutstandingBalance from "@/features/VirtualCards/composables/useOutstandingBalance";
import VCBalanceDueModal from "@/features/VirtualCards/modals/balance-due/VCBalanceDueModal.vue";
import { capitalizeFirstLetter } from "@/scripts/format";
import { useWalletPageContext } from "./composables/pages-context/useWalletPageContext";

type Period = Extract<VirtualCardPeriod, "monthly" | "one-time">;

const emit = defineEmits<{
  (e: "newCardIssued", cardId: string): void;
  (e: "showAdvancedModal", payload: { period: Period; amount?: number }): void;
}>();

const {
  openAddModal: openAddFundingSourceModal,
  openListModal: openListFundingSourceModal,
  getProviderIcon,
  getCardBrandImgURL,
  defaultFundingSource,
  fundingSources,
} = useFundingSource();

const { hasCollectionStatus } = useOutstandingBalance();
const { generateCard } = useVirtualCardGenerate();
const { showAdvancedCardGenerationModal } = useWalletPageContext();

const toast = useToast();

const isFocused = ref(false);
const isCreating = ref(false);
const amount = ref<number>();
const tab = ref<Period>("monthly");
const createError = ref<string>();
const amountInputRef =
  useTemplateRef<typeof VCBaseAmountInput>("amountInputRef");

const items: TabItem[] = [
  { id: "monthly", label: "Monthly" },
  { id: "one-time", label: "One-Time" },
];

const allowedToCreateCard = computed(() => {
  return !hasCollectionStatus.value;
});

const cardBorderConfig = computed(() => ({
  focused: isFocused.value,
  loading: isCreating.value,
  borderRadius: 24,
  enableSpotlight: allowedToCreateCard.value,
}));

const cardSettings = computed(() => {
  return store.state.cards?.cardSettings;
});

const fundingSourceDisplayName = computed(() => {
  return (
    capitalizeFirstLetter(defaultFundingSource.value?.card_brand ?? "") +
    " •••• " +
    defaultFundingSource.value?.pan_last_four
  );
});

const fundingSourceFallbackIconName = computed(() => {
  if (!defaultFundingSource.value) {
    return "wallet";
  }

  return getProviderIcon(defaultFundingSource.value?.provider ?? "");
});

const fundingSourceBrandImgURL = computed(() => {
  return getCardBrandImgURL(defaultFundingSource.value?.card_brand ?? "");
});

const createCard = () => {
  if (!amount.value) return;

  if (!allowedToCreateCard.value) {
    openBalanceDueModal();
    return;
  }

  // No funding sources, open add funding source modal
  if ((fundingSources.value?.length ?? 0) === 0) {
    openAddFundingSourceModal(() => {
      createCard();
    });
    return;
  }

  if (!defaultFundingSource.value) {
    openListFundingSourceModal();
    toast.error("Please select a default funding source");
    return;
  }

  const payload: GenerateCardParams = {
    type: CARD_PERIOD_TO_CARD_TYPE[tab.value],
    funding_source: defaultFundingSource.value.id,
    transaction_period_limit: amount.value * 100, // Convert to cents
    transaction_period: CARD_PERIOD_TYPE_TO_API_TYPE[tab.value],
  };

  clearErrors();
  isCreating.value = true;

  generateCard(payload)
    .then(({ cardId }) => {
      emit("newCardIssued", cardId);
      posthogCapture("pay_wallet_add_new_card_express_create_success", payload);
    })
    .catch((error) => {
      createError.value = error.message;
      posthogCapture("pay_wallet_add_new_card_express_create_failed", payload);
    })
    .finally(() => {
      amountInputRef?.value?.focus();
      isCreating.value = false;
    });
};

const clearErrors = () => {
  createError.value = "";
};

const handleMoreOptionsClick = () => {
  if (!allowedToCreateCard.value) {
    openBalanceDueModal();
    return;
  }

  clearErrors();
  emit("showAdvancedModal", {
    period: tab.value,
    amount: amount.value ? amount.value * 100 : undefined,
  });
};

const handleFundingSourceClick = () => {
  posthogCapture(
    defaultFundingSource.value
      ? "pay_wallet_express_card_generation_funding_source_tapped"
      : "pay_wallet_express_card_generation_no_funding_sources_added_tapped"
  );

  showAdvancedCardGenerationModal({
    period: tab.value,
    amount: amount.value ? amount.value * 100 : undefined,
    selectedTab: "funding",
  });
};

const openBalanceDueModal = () => {
  posthogCapture(
    "pay_wallet_balance_due_payment_opened_by_express_card_generation_modal_viewed"
  );
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(VCBalanceDueModal),
    },
  });
};

watch(
  () => cardSettings.value?.spending_limit,
  () => {
    if (cardSettings.value?.spending_limit) {
      amount.value = cardSettings.value?.spending_limit / 100;
    }
  },
  { immediate: true }
);

defineExpose({
  clearErrors,
});
</script>

<template>
  <VCBaseCard
    :class="[
      'vc-express-generation',
      { 'vc-express-generation--not-allowed': !allowedToCreateCard },
    ]"
    :border="cardBorderConfig"
  >
    <div class="vc-express-generation__wrapper">
      <div class="vc-express-generation__content">
        <header class="vc-express-generation__header">
          <BaseText variant="headline-5-bold">New Card</BaseText>
          <div
            class="vc-express-generation__funding-source"
            :class="{
              'vc-express-generation__funding-source--no-funding-source':
                !defaultFundingSource,
            }"
            @click="handleFundingSourceClick"
          >
            <div class="vc-express-generation__funding-source-brand-container">
              <img
                v-if="defaultFundingSource && fundingSourceBrandImgURL"
                :src="fundingSourceBrandImgURL"
                alt="brand"
                class="vc-express-generation__funding-source-brand-img"
              />
              <BaseIcon
                v-else
                :name="
                  defaultFundingSource ? fundingSourceFallbackIconName : 'plus'
                "
                class="vc-express-generation__funding-source-brand-img-fallback"
              />
            </div>
            <BaseText
              class="vc-express-generation__funding-source-name"
              variant="caption-semibold"
            >
              {{
                defaultFundingSource
                  ? fundingSourceDisplayName
                  : "Add funding source"
              }}
            </BaseText>
          </div>
        </header>
        <div class="vc-express-generation__input-container">
          <VCBaseAmountInput
            ref="amountInputRef"
            v-model="amount"
            class="vc-express-generation__amount-input"
            placeholder="$25"
            :input-error="!!createError"
            :error-message="createError"
            :readonly="isCreating"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @input="clearErrors"
            @keydown.enter="createCard"
          >
            <template #after>
              <VCBaseTabs
                v-model="tab"
                :full-width="false"
                :items="items"
                :height="35"
                :width="190"
                @select="
                  clearErrors();
                  amountInputRef?.focus();
                "
              ></VCBaseTabs>
            </template>
          </VCBaseAmountInput>
        </div>
        <footer class="vc-express-generation__footer">
          <div
            class="vc-express-generation__advanced-container"
            role="button"
            tabindex="0"
            @click="handleMoreOptionsClick"
            @keydown.enter="handleMoreOptionsClick"
            @keydown.space.prevent="handleMoreOptionsClick"
          >
            <BaseIcon
              name="plus"
              class="vc-express-generation__advanced-icon"
            />
            <BaseText variant="body-3-semibold">More options</BaseText>
          </div>
          <Button
            size="lg"
            class="vc-express-generation__create-button"
            :disabled="!amount || isCreating"
            @click="createCard"
          >
            Create
          </Button>
        </footer>
        <!-- Not allowed to create card -->
        <div
          v-if="!allowedToCreateCard"
          class="vc-express-generation__not-allowed-container"
        >
          <BaseIcon
            name="lock-filled"
            class="vc-express-generation__not-allowed-icon"
          />
          <BaseText
            variant="headline-5-bold"
            class="vc-express-generation__not-allowed-title"
          >
            Card creation is disabled
          </BaseText>
          <Button
            type="danger"
            class="vc-express-generation__not-allowed-pay-button"
            @click="openBalanceDueModal"
          >
            Pay full balance to unlock
          </Button>
        </div>
      </div>
    </div>
  </VCBaseCard>
</template>

<style scoped lang="scss">
.vc-express-generation {
  width: 100%;
  overflow: hidden;

  &__wrapper {
    position: relative;
    min-height: 206px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 17px;
    overflow: hidden;
  }

  :deep(
    .vc-express-generation__amount-input:not(
        .vc-express-generation__amount-input--error
      ):focus
  ) {
    outline: 1px solid $color-primary-50;
  }

  :deep(
    .vc-express-generation__amount-input:not(
        .vc-express-generation__amount-input--error,
        :focus
      ):hover
  ) {
    border: 1px solid $color-primary-30;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 34px;
  }

  &__funding-source {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px 8px 4px 4px;
    border: 1px solid $color-background;
    border-radius: 999px;
    background-color: $color-background;
    cursor: pointer;
    transition:
      border 0.12s ease-in-out,
      background-color 0.12s ease-in-out;

    &--no-funding-source {
      gap: 6px;
    }

    &:hover {
      border: 1px solid $color-primary-20;
      background-color: $color-primary-10;
    }

    &-name {
      color: $color-primary-50;
      line-height: 0;
    }

    &-brand {
      &-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 19px;
        height: 19px;
        border-radius: 50%;
        overflow: hidden;
        background-color: $color-white;
      }

      &-img {
        &-fallback {
          font-size: 14px;
          margin-top: -1px;
          color: $color-primary-100-light;
        }
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__advanced {
    &-container {
      display: flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.12s ease-in-out;

      &:hover {
        cursor: pointer;
      }
    }

    &-icon {
      transition: transform 0.2s ease-out;

      .vc-express-generation__advanced-container:hover & {
        transform: scale(1.2);
      }
    }
  }

  &__create-button {
    width: 88px;
    font-size: 13px;
    font-weight: 500;

    &:disabled {
      color: $color-primary-70;
    }
  }

  &__not-allowed {
    &-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: absolute;
      gap: 16px;
      top: 8px;
      left: 8px;
      width: calc(100% - 15px);
      height: calc(100% - 15px);
      padding: 16px;
      background-color: transparent;
      backdrop-filter: blur(8px);
      z-index: 1;
    }

    &-icon {
      font-size: 24px;
    }

    &-pay-button {
      display: inline-block;
      font-weight: 600;
      font-size: 14px;
      width: max-content;
    }
  }
}
</style>
