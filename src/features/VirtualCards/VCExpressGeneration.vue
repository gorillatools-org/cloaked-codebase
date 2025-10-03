<script setup lang="ts">
import VCBaseCard from "./base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { ref, computed, useTemplateRef, watch } from "vue";
import VCBaseTabs, { type TabItem } from "./base/VCBaseTabs.vue";
import VCBaseAmountInput from "./base/VCBaseAmountInput.vue";
import Button from "@/features/Button.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import useVirtualCardGenerate, {
  type GenerateCardParams,
} from "@/composables/Wallet/useVirtualCardGenerate";
import { useToast } from "@/composables/useToast.js";
import { posthogCapture } from "@/scripts/posthog";
import store from "@/store";

const emit = defineEmits<{
  (e: "newCardIssued", cardId: string): void;
  (
    e: "showAdvancedModal",
    payload: { period: "monthly" | "one-time"; amount?: number }
  ): void;
}>();

const {
  openAddModal: openAddFundingSourceModal,
  openListModal: openListFundingSourceModal,
  defaultFundingSource,
  fundingSources,
} = useFundingSource();

const { generateCard } = useVirtualCardGenerate();
const toast = useToast();

const isFocused = ref(false);
const isCreating = ref(false);
const amount = ref<number>();
const tab = ref<"monthly" | "one-time">("monthly");
const createError = ref<string>();
const amountInputRef =
  useTemplateRef<typeof VCBaseAmountInput>("amountInputRef");

const items: TabItem[] = [
  { id: "monthly", label: "Monthly" },
  { id: "one-time", label: "One-Time" },
];

const cardBorderConfig = computed(() => ({
  focused: isFocused.value,
  loading: isCreating.value,
  borderRadius: 24,
  enableSpotlight: true,
}));

const cardSettings = computed(() => {
  return store.state.cards?.cardSettings;
});

const createCard = () => {
  if (!amount.value) return;

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
    type: tab.value === "monthly" ? "MULTI_USE" : "SINGLE_USE",
    funding_source: defaultFundingSource.value.id,
    transaction_period_limit: amount.value * 100, // Convert to cents
    transaction_period: tab.value === "monthly" ? "monthly" : "forever",
  };

  clearErrors();
  isCreating.value = true;

  generateCard(payload)
    .then(({ cardId }) => {
      emit("newCardIssued", cardId);
      posthogCapture(
        "dashboard_pay_wallet_add_new_card_express_create_success",
        { period: tab.value }
      );
    })
    .catch((error) => {
      createError.value = error.message;
      posthogCapture(
        "dashboard_pay_wallet_add_new_card_express_create_failed",
        { period: tab.value }
      );
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
  clearErrors();
  emit("showAdvancedModal", {
    period: tab.value,
    amount: amount.value ? amount.value * 100 : undefined,
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
    class="vc-express-generation"
    :border="cardBorderConfig"
  >
    <div class="vc-express-generation__content">
      <BaseText variant="headline-5-bold">Create New Card</BaseText>
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
          variant="secondary"
          size="lg"
          class="vc-express-generation__create-button"
          :disabled="!amount || isCreating"
          @click="createCard"
        >
          Create
        </Button>
      </footer>
    </div>
  </VCBaseCard>
</template>

<style scoped lang="scss">
.vc-express-generation {
  width: 100%;
  margin: 10px 0;
  overflow: hidden;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
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
}
</style>
