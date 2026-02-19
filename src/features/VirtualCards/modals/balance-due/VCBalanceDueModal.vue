<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import store from "@/store";
import { onMounted, ref, computed, useTemplateRef } from "vue";
import VCCloseModalButton from "../VCCloseModalButton.vue";
import Button from "@/features/Button.vue";
import VCBaseAmountInput from "@/features/VirtualCards/base/VCBaseAmountInput.vue";
import VCBaseCircularLoader from "@/features/VirtualCards/VCBaseCircularLoader.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import { useToast } from "@/composables/useToast";
import VCFundingSourceDropdown from "@/features/VirtualCards/VCFundingSourceDropdown.vue";
import useOutstandingBalance from "@/features/VirtualCards/composables/useOutstandingBalance";
import { formatCurrency } from "../../utils/currency-utils";
import { capitalizeFirstLetter } from "@/scripts/format";
import CardsServices from "@/api/actions/cards-services";
import { posthogCapture } from "@/scripts/posthog";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";

const toast = useToast();

const {
  fundingSources,
  defaultFundingSource,
  openAddModal,
  newestFundingSource,
} = useFundingSource();

const {
  formattedOutstandingBalance,
  outstandingBalance,
  refresh: refreshOutstandingBalance,
} = useOutstandingBalance();
const amountInputRef =
  useTemplateRef<typeof VCBaseAmountInput>("amountInputRef");

const selectedFundingSourceId = ref<string | null>(null);
const paymentStatus = ref<"loading" | "success" | "error" | null>(null);
const amount = ref(
  outstandingBalance.value ? outstandingBalance.value / 100 : 0
);

const isPartialAmount = computed(() => {
  return amount.value < outstandingBalance.value / 100;
});

const isPayNowButtonDisabled = computed(() => {
  return (
    amount.value <= 0 ||
    !selectedFundingSourceId.value ||
    amountInputRef.value?.hasError
  );
});

const selectedFundingSource = computed(() => {
  return fundingSources.value?.find(
    (source) => source.id === selectedFundingSourceId.value
  );
});

const statusTitle = computed(() => {
  if (paymentStatus.value === "loading") return "Processing payment...";
  if (paymentStatus.value === "success") return "Payment Successful";
  if (paymentStatus.value === "error")
    return "Sorry, we couldn't process your payment";

  return "";
});

const statusDescription = computed(() => {
  if (paymentStatus.value === "success") {
    const fundingSourceNickname = selectedFundingSource.value?.nickname
      ? `(${selectedFundingSource.value?.nickname})`
      : "";
    return `Paid <strong>${formatCurrency(amount.value, false)}</strong> from <strong>${capitalizeFirstLetter(selectedFundingSource.value?.card_brand)} ${fundingSourceNickname} •••• ${selectedFundingSource.value?.pan_last_four}</strong>.`;
  }

  if (paymentStatus.value === "error") {
    return "Please try again or add a new payment method.";
  }

  return "";
});

const isPaymentProcessing = computed(() => {
  return paymentStatus.value === "loading";
});

onMounted(() => {
  selectInitialFundingSourceOrFail();
});

const selectInitialFundingSourceOrFail = () => {
  selectedFundingSourceId.value =
    defaultFundingSource.value?.id ?? fundingSources.value?.[0]?.id ?? null;

  if (!selectedFundingSourceId.value) {
    toast.error("Add a funding source to pay your balance due");
    closeModal();
  }
};
const closeModal = () => {
  if (paymentStatus.value === "loading") return;
  store.dispatch("closeModal");
};

const linkNewFundingSource = () => {
  posthogCapture(
    "pay_wallet_balance_due_payment_modal_link_new_funding_source_tapped"
  );
  openAddModal(() => {
    selectedFundingSourceId.value = newestFundingSource.value?.id ?? null;
  });
};

const pay = () => {
  paymentStatus.value = "loading";

  const amountInCents = amount.value * 100;
  CardsServices.payBalanceDue(
    amountInCents,
    selectedFundingSourceId.value ?? undefined
  )
    .then(() => {
      posthogCapture("pay_wallet_balance_due_payment_success");

      setTimeout(() => {
        paymentStatus.value = "success";
        refreshOutstandingBalance();
      }, 1000); // UX purpose
    })
    .catch((error) => {
      if (error.response?.data?.detail || error.response?.data?.error) {
        toast.error(
          error.response?.data?.detail ?? error.response?.data?.error
        );
      }

      posthogCapture("pay_wallet_balance_due_payment_failed");

      setTimeout(() => {
        paymentStatus.value = "error";
        refreshOutstandingBalance();
      }, 1000); // UX purpose
    });
};

const handleStatusButtonClick = () => {
  if (paymentStatus.value === "success") {
    closeModal();
    return;
  }

  paymentStatus.value = null;
};

const setAmountToFullBalance = () => {
  posthogCapture(
    "pay_wallet_balance_due_payment_modal_pay_in_full_helper_tapped"
  );
  amount.value = outstandingBalance.value / 100;
};
</script>

<template>
  <ModalTemplate
    :show="true"
    :prevent-close="isPaymentProcessing"
    :prevent-escape-on-input-focus="true"
    :width="520"
    without-header-padding
    without-body-padding
    class="vc-manage-card-modal"
    @close="closeModal"
  >
    <template #body>
      <VCCloseModalButton
        class="vc-manage-card-modal__header-close-button"
        :disabled="isPaymentProcessing"
        @close="closeModal"
      />
      <transition
        name="content-fade"
        mode="out-in"
      >
        <div
          v-if="paymentStatus === null"
          key="content"
        >
          <header class="vc-manage-card-modal__header">
            <BaseText
              as="h3"
              variant="headline-3-bold"
              class="vc-manage-card-modal__header-title"
            >
              Balance Due
            </BaseText>
          </header>
          <div class="vc-manage-card-modal__body">
            <div class="vc-manage-card-modal__subheader-container">
              <BaseText
                as="h4"
                variant="headline-2-semibold"
              >
                {{ formattedOutstandingBalance }}
              </BaseText>
            </div>
            <div class="vc-manage-card-modal__amount-container">
              <BaseText
                as="label"
                variant="body-2-semibold"
                class="vc-manage-card-modal__amount-label"
                for="payment-amount-input"
              >
                Payment Amount
              </BaseText>
              <VCBaseAmountInput
                id="payment-amount-input"
                ref="amountInputRef"
                v-model="amount"
                class="vc-manage-card-modal__amount-input"
                :border-radius="30"
                background-color="white-100"
                before-icon="money"
                :state="isPartialAmount ? 'yield' : 'default'"
                :support-text="
                  isPartialAmount
                    ? 'Paying less than your full balance may limit your ability to create new cards.'
                    : ''
                "
                :placeholder="formattedOutstandingBalance"
                :max="outstandingBalance / 100"
                :min="0.5"
              >
                <template #after="{ errorMessage }">
                  <button
                    v-if="errorMessage"
                    class="vc-manage-card-modal__pay-in-full-btn"
                    @click="setAmountToFullBalance"
                  >
                    Pay in full
                  </button>
                </template>
              </VCBaseAmountInput>
            </div>
            <div class="vc-manage-card-modal__funding-source-container">
              <BaseText
                as="p"
                variant="body-2-semibold"
                class="vc-manage-card-modal__funding-source-label"
              >
                {{
                  fundingSources?.length && fundingSources?.length > 1
                    ? "Select Funding Source"
                    : "Funding Source"
                }}
              </BaseText>
              <VCFundingSourceDropdown
                v-if="fundingSources?.length && fundingSources?.length > 1"
                v-model="selectedFundingSourceId"
              />
              <FundingSourceListItem
                v-else-if="selectedFundingSource"
                style="pointer-events: none"
                :funding-source="selectedFundingSource"
                :is-selected="false"
                :is-select-mode="false"
              />
            </div>
          </div>
          <footer class="vc-manage-card-modal__footer">
            <Button
              class="vc-manage-card-modal__btn"
              type="secondary"
              @click="linkNewFundingSource"
            >
              Link new funding source
            </Button>
            <Button
              class="vc-manage-card-modal__btn"
              type="primary"
              :disabled="isPayNowButtonDisabled"
              @click="pay"
            >
              Pay now
            </Button>
          </footer>
        </div>
        <div
          v-else
          key="status"
          class="vc-manage-card-modal__status"
          :class="`vc-manage-card-modal__status--${paymentStatus}`"
        >
          <div class="vc-manage-card-modal__status-loader">
            <div class="vc-manage-card-modal__status-indicator">
              <VCBaseCircularLoader :status="paymentStatus" />
            </div>
            <BaseText
              as="p"
              variant="body-2-semibold"
              class="vc-manage-card-modal__status-loading-text"
            >
              Processing payment...
            </BaseText>
          </div>
          <div class="vc-manage-card-modal__status-content">
            <BaseText
              as="p"
              variant="headline-3-bold"
              class="vc-manage-card-modal__status-title"
            >
              {{ statusTitle }}
            </BaseText>
            <!-- eslint-disable vue/no-v-html -->
            <!-- eslint-disable vue/no-v-text-v-html-on-component -->
            <BaseText
              as="p"
              variant="headline-5-bold"
              class="vc-manage-card-modal__status-description"
              v-html="statusDescription"
            />
            <!-- eslint-enable vue/no-v-text-v-html-on-component -->
            <!-- eslint-enable vue/no-v-html -->
            <div class="vc-manage-card-modal__status-action-buttons">
              <Button
                class="vc-manage-card-modal__btn"
                type="primary"
                @click="handleStatusButtonClick"
              >
                {{ paymentStatus === "success" ? "Done" : "Try again" }}
              </Button>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 32px;
$ease-fade: cubic-bezier(0.22, 1, 0.36, 1);

.vc-manage-card-modal {
  &__header {
    padding-top: 32px;
    padding-bottom: 8px;
    padding-inline: $base-padding;

    &-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1;
    }
  }

  &__body {
    padding-top: 24px;
    padding-inline: $base-padding;
  }

  &__subheader-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__amount {
    &-container {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  &__funding-source {
    &-container {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  &__pay-in-full-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 12px;
    width: auto;
    height: 32px;
    cursor: pointer;
    border: 1px solid $color-base-black-15;
    border-radius: 999px;
    background-color: $color-base-white-100;
    transition: background-color 0.1s ease-in;

    &:hover {
      background-color: $color-primary-5;
    }

    &-icon {
      font-size: 15px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 24px;
    padding-inline: $base-padding;
    padding-bottom: $base-padding;
  }

  &__btn {
    font-size: 14px;
    font-weight: 600;
  }

  &__status {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: $base-padding;
    position: relative;
    min-height: 300px;
    transition: min-height 0.3s $ease-fade;
    transition-delay: 1.3s;

    &--success,
    &--error {
      min-height: 100px;
    }

    &-title {
      max-width: 95%;
    }

    &-description {
      font-weight: 400;
    }

    &-action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 60px;

      & > * {
        opacity: 0;
        filter: blur(5px);
        visibility: hidden;
        transform: translateY(10px);
        transition:
          opacity 0.4s $ease-fade,
          transform 0.4s $ease-fade,
          visibility 0s 0.4s,
          filter 0.4s $ease-fade;
      }

      @for $i from 1 through 3 {
        & > *:nth-child(#{$i}) {
          transition-delay: #{1.5 + ($i - 1) * 0.05}s;
        }
      }
    }

    &--success &-content > *,
    &--error &-content > * {
      opacity: 1;
      visibility: visible;
      filter: blur(0);
      transform: translateY(0);
    }

    &-action-btn {
      align-self: flex-end;
      width: 70px;
    }

    &-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      position: absolute;
      top: calc(50% + 12px); // Sum with text height
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &--success &-loader,
    &--error &-loader {
      transform: translate(0, 0);
      top: 10px;
      left: -20px;
      transition:
        transform 0.4s $ease-fade,
        top 0.4s $ease-fade,
        left 0.4s $ease-fade;
      transition-delay: 1.3s;
    }

    &-indicator {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      transform-origin: center;
      transition: transform 0.5s $ease-fade;
      transition-delay: 1.3s;

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        min-width: 120px;
        min-height: 120px;
        border-radius: 50%;
        transform-origin: center;
        transform: translate(-50%, -50%) scale(0);
        background-color: transparent;
        transition:
          background-color 0.7s ease-out,
          transform 0.7s ease-out;
        transition-delay: 0.13s;
      }
    }

    &-loading-text {
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition:
        opacity 0.4s $ease-fade,
        transform 0.4s $ease-fade,
        visibility 0s 0.4s;
    }

    &--loading &-loading-text {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    &--success &-indicator,
    &--error &-indicator {
      transform: scale(0.4);

      &::after {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    &--success &-indicator::after {
      background-color: $color-status-success-15;
    }

    &--error &-indicator::after {
      background-color: $color-status-error-15;
    }
  }
}

.content-fade-enter-active,
.content-fade-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out,
    max-height 0.2s ease-out;
}

.content-fade-enter-from,
.content-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(10px);
  max-height: 300px;
}

.content-fade-enter-to,
.content-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
  max-height: 500px;
}
</style>
