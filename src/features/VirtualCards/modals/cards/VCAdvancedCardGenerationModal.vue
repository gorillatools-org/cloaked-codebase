<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import store from "@/store";
import VCBaseCardToggle from "@/features/VirtualCards/base/card/VCBaseCardToggle.vue";
import VCBaseCardDropdownSelect from "@/features/VirtualCards/base/card/VCBaseCardDropdownSelect.vue";
import { computed, ref, watch, useTemplateRef, markRaw, onMounted } from "vue";
import type { DropdownSelectOption } from "@/features/VirtualCards/base/VCBaseDropdownSelect.vue";
import type {
  VirtualCardExpiresAt,
  VirtualCardPeriod,
} from "@/types/Wallet/virtual-card";
import VCMerchantDropdown, {
  type MerchantDropdownModel,
} from "@/features/VirtualCards/VCMerchantDropdown.vue";
import VCCloseModalButton from "@/features/VirtualCards/modals/VCCloseModalButton.vue";
import {
  EXPIRATION_DESCRIPTIONS,
  CARD_PERIOD_DESCRIPTION_TO_TYPE,
  CARD_PERIOD_TO_CARD_TYPE,
  CARD_PERIOD_TYPE_TO_API_TYPE,
} from "@/features/VirtualCards/constants/virtual-card-constants";
import Button from "@/features/Button.vue";
import VCBaseAmountInput from "@/features/VirtualCards/base/VCBaseAmountInput.vue";
import VCBaseAlert from "@/features/VirtualCards/base/VCBaseAlert.vue";
import VCBaseDropdownSelect from "@/features/VirtualCards/base/VCBaseDropdownSelect.vue";
import VCBaseTabs, {
  type TabItem,
} from "@/features/VirtualCards/base/VCBaseTabs.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";
import FundingSourceSelectModal, {
  type FundingSourceSelectPayload,
} from "@/features/modals/Wallet/FundingSourceSelectModal.vue";
import useVirtualCardGenerate, {
  type GenerateCardParams,
} from "@/features/VirtualCards/composables/useVirtualCardGenerate";
import { useToast } from "@/composables/useToast.js";
import { convertExpiresAtTypeToDate } from "@/features/VirtualCards/utils/expiration-utils";
import { posthogCapture } from "@/scripts/posthog.js";

type Props = {
  initialPeriod: VirtualCardPeriod;
  initialAmount: number;
  initialTab: AdvancedCardGenerationTabName;
  identityId?: number;
};

export type AdvancedCardGenerationTabName = "controls" | "funding";

const DEFAULT_FIXED_USES = 5;
const MIN_AMOUNT = 0.5;

const emit = defineEmits(["close", "newCardIssued"]);
const props = defineProps<Props>();

const cardBorderConfig = {
  borderRadius: 30,
};

const tabs: TabItem[] = [
  { id: "controls", label: "Controls" },
  { id: "funding", label: "Funding" },
];

const { fundingSources, defaultFundingSource } = useFundingSource();
const { generateCard } = useVirtualCardGenerate();
const toast = useToast();
const isCreatingCard = ref(false);
const selectedTab = ref<AdvancedCardGenerationTabName>(
  props.initialTab || "controls"
);

const selectedMerchant = ref<MerchantDropdownModel>("");
const amount = ref<number | undefined>(
  props.initialAmount ? props.initialAmount / 100 : 25
);
const period = ref<VirtualCardPeriod>(props.initialPeriod || "monthly");
const fixedUses = ref<number>(DEFAULT_FIXED_USES);
const deactivateOption = ref<VirtualCardExpiresAt>("when_card_expires");
const isCardLocked = ref(false);
const isMerchantLocked = ref(false);
const selectedFundingSourceId = ref<string | undefined>();

onMounted(() => {
  posthogCapture("pay_wallet_create_new_card_modal_viewed", {
    period: period.value,
    amount: amount.value,
    selectedTab: selectedTab.value,
  });
});

const fixedUseInputRef =
  useTemplateRef<typeof VCBaseAmountInput>("fixedUseInputRef");

const isCreateBtnDisabled = computed(() => {
  if (isFixedPeriod.value && fixedUses.value < 1) {
    return true;
  }

  return (
    isCreatingCard.value ||
    !amount.value ||
    amount.value < MIN_AMOUNT ||
    !selectedFundingSourceId.value
  );
});

const isFixedPeriod = computed(() => {
  return period.value === "fixed";
});

const periodOptions = computed<DropdownSelectOption[]>(() => {
  return Object.keys(CARD_PERIOD_DESCRIPTION_TO_TYPE).map((key: string) => {
    return {
      label: key,
      value: CARD_PERIOD_DESCRIPTION_TO_TYPE[key],
    };
  });
});

const deactivateOptions = computed<DropdownSelectOption[]>(() => {
  return Object.keys(EXPIRATION_DESCRIPTIONS).map((key: string) => {
    const value = key as VirtualCardExpiresAt;
    return {
      label: EXPIRATION_DESCRIPTIONS[value],
      value: value,
      visible: value !== "custom",
    };
  });
});

const selectedFundingSourceObject = computed(() => {
  return fundingSources.value?.find(
    (source) => source.id === selectedFundingSourceId.value
  );
});

const canUpdateFundingSource = computed(() => {
  return fundingSources.value && fundingSources.value?.length > 1;
});

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};

const handleCreateCard = async () => {
  if (
    !amount.value ||
    isCreateBtnDisabled.value ||
    !selectedFundingSourceId.value
  )
    return;

  const expiresAtDate =
    deactivateOption.value === "custom" ||
    deactivateOption.value === "when_card_expires"
      ? undefined
      : convertExpiresAtTypeToDate(deactivateOption.value).toISOString();

  const payload: GenerateCardParams = {
    website_url:
      typeof selectedMerchant.value === "object"
        ? selectedMerchant.value?.base_domain
        : undefined,
    nickname:
      typeof selectedMerchant.value === "string"
        ? selectedMerchant.value
        : selectedMerchant.value?.name || undefined,
    type: CARD_PERIOD_TO_CARD_TYPE[period.value],
    funding_source: selectedFundingSourceId.value,
    transaction_period: CARD_PERIOD_TYPE_TO_API_TYPE[period.value],
    transaction_period_limit: amount.value * 100, // Convert to cents
    transaction_period_max_transactions: isFixedPeriod.value
      ? fixedUses.value
      : undefined,
    is_locked: isCardLocked.value,
    is_merchant_locked: isMerchantLocked.value,
    expires_at: expiresAtDate,
    identity_id: props.identityId,
  };

  isCreatingCard.value = true;
  generateCard(payload)
    .then((res) => {
      toast.success("Card created successfully");
      emit("newCardIssued", res.cardId);
      posthogCapture("pay_wallet_create_new_card_modal_success", payload);
      closeModal();
    })
    .catch((error) => {
      toast.error(error.message || "Failed to create card");
      posthogCapture("pay_wallet_create_new_card_modal_failed", payload);
    })
    .finally(() => {
      isCreatingCard.value = false;
    });
};

const openSelectFundingSourceModal = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(FundingSourceSelectModal),
      props: {
        title: "Select funding source",
        description: "",
        currentFundingSource: selectedFundingSourceObject.value,
        filterBySameType: false,
        closeOnSelect: true,
        onSelect: ({
          fundingSource,
          isCurrentFundingSource,
        }: FundingSourceSelectPayload) => {
          if (!isCurrentFundingSource) {
            selectedFundingSourceId.value = fundingSource.id;
          }
        },
      },
    },
  });
};

watch(period, async () => {
  if (isFixedPeriod.value) {
    fixedUses.value = DEFAULT_FIXED_USES;

    setTimeout(() => {
      fixedUseInputRef.value?.focus();
    }, 170); // Wait for the input transition
  }
});

watch(
  fundingSources,
  () => {
    if (!selectedFundingSourceId.value) {
      selectedFundingSourceId.value =
        defaultFundingSource.value?.id || fundingSources.value?.[0]?.id;
    }
  },
  { immediate: true }
);

watch(isMerchantLocked, (isLocked) => {
  posthogCapture("pay_wallet_create_new_card_modal_merchant_lock_toggled", {
    is_merchant_locked: isLocked,
  });
});

watch(isCardLocked, (isLocked) => {
  posthogCapture("pay_wallet_create_new_card_modal_lock_toggled", {
    is_locked: isLocked,
  });
});

watch(deactivateOption, (option) => {
  posthogCapture(
    "pay_wallet_create_new_card_modal_deactivate_option_selected",
    {
      deactivate_option: option,
    }
  );
});

// Pre-populate merchant dropdown if identity is available and merchant is not already set
watch(
  () => props.identityId,
  () => {
    const identity = store.state.localdb?.db_cloaks?.find(
      (item: any) => item.id === props.identityId
    );

    if (identity) {
      selectedMerchant.value = {
        name: identity.nickname || identity.website_name || "",
        base_domain: identity.website_url,
        logo_url: identity.logo_url || null,
        cloak_brand_color: identity.cloak_brand_color || null,
      };
    }
  },
  { immediate: true }
);
</script>

<template>
  <ModalTemplate
    :show="true"
    :prevent-escape-on-input-focus="true"
    width="520px"
    without-header-padding
    without-body-padding
    class="vc-advanced-cg-modal"
    :class="{ 'vc-advanced-cg-modal--creating': isCreatingCard }"
    @close="closeModal"
  >
    <template #header>
      <header class="vc-advanced-cg-modal__header">
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="vc-advanced-cg-modal__header-title"
        >
          Create New Card
        </BaseText>
        <VCCloseModalButton
          class="vc-advanced-cg-modal__header-close-button"
          @close="closeModal"
        />
      </header>
    </template>
    <template #body>
      <div class="vc-advanced-cg-modal__body">
        <div class="select-merchant-dropdown">
          <VCMerchantDropdown
            v-model="selectedMerchant"
            :disabled="!!props.identityId"
          />
        </div>
        <div class="vc-advanced-cg-modal__amount-container">
          <VCBaseAmountInput
            v-model="amount"
            before-icon="money"
            placeholder="$25"
            :border-radius="cardBorderConfig.borderRadius"
            :min="MIN_AMOUNT"
            container-class="vc-advanced-cg-modal__amount-input-container"
            background-color="white-100"
          >
            <template #after>
              <VCBaseDropdownSelect
                v-model="period"
                open-width="140px"
                :options="periodOptions"
              />
            </template>
          </VCBaseAmountInput>
          <Transition name="uses-input-fade">
            <div
              v-if="isFixedPeriod"
              class="vc-advanced-cg-modal__uses-input-container"
            >
              <VCBaseAmountInput
                ref="fixedUseInputRef"
                v-model="fixedUses"
                :min="1"
                :min-error-message="'Uses must be at least one'"
                before-icon="square-grid"
                placeholder="5"
                type="integer"
                :border-radius="cardBorderConfig.borderRadius"
                background-color="white-100"
              >
                <template #after>
                  <BaseText
                    class="vc-advanced-cg-modal__uses-input-after-text"
                    variant="headline-6-bold"
                  >
                    Uses
                  </BaseText>
                </template>
              </VCBaseAmountInput>
            </div>
          </Transition>
        </div>

        <VCBaseTabs
          v-model="selectedTab"
          background-color="primary-10"
          :items="tabs"
          :full-width="true"
          :height="40"
        >
          <template #panel-controls>
            <div
              v-if="selectedTab === 'controls'"
              class="vc-advanced-cg-modal__tab-content"
            >
              <VCBaseCardDropdownSelect
                v-model="deactivateOption"
                :border="cardBorderConfig"
                :options="deactivateOptions"
                title="Deactivate Card"
                icon="shield-tick"
              />
              <VCBaseCardToggle
                v-model="isMerchantLocked"
                :border="cardBorderConfig"
                title="Merchant Locking"
                description="Auto-lock to the first merchant after use"
                icon="lock"
              />
              <VCBaseCardToggle
                v-model="isCardLocked"
                :border="cardBorderConfig"
                title="Lock Card"
                description="Block all transactions while the card is locked"
                icon="card-lock"
              />
            </div>
          </template>
          <template #panel-funding>
            <div
              v-if="selectedTab === 'funding'"
              class="vc-advanced-cg-modal__tab-content"
            >
              <FundingSourceListItem
                v-if="selectedFundingSourceObject"
                border-radius="30px"
                :show-actions="false"
                :no-effects="true"
                :funding-source="selectedFundingSourceObject"
                class="vc-advanced-cg-modal__funding-source"
              >
                <template
                  v-if="canUpdateFundingSource"
                  #actions
                >
                  <Button
                    type="primary"
                    size="sm"
                    class="vc-advanced-cg-modal__funding-source-change-btn"
                    :disabled="isCreatingCard"
                    @click="openSelectFundingSourceModal"
                  >
                    Change
                  </Button>
                </template>
              </FundingSourceListItem>
            </div>
          </template>
        </VCBaseTabs>
      </div>
      <div class="vc-advanced-cg-modal__alert-container">
        <VCBaseAlert
          :icon="null"
          icon-position="right"
          center-content
          description="A temporary pre-authorization will be placed for the amount of the card created"
        />
      </div>
    </template>
    <template #footer>
      <footer class="vc-advanced-cg-modal__footer">
        <Button
          type="primary"
          class="vc-advanced-cg-modal__footer-create-btn"
          :disabled="isCreateBtnDisabled"
          @click="handleCreateCard"
        >
          <template
            v-if="isCreatingCard"
            #icon
          >
            <span class="vc-advanced-cg-modal__footer-create-btn-loader" />
          </template>
          <span>Create</span>
        </Button>
      </footer>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 32px;

.vc-advanced-cg-modal {
  &--creating {
    pointer-events: none;
  }

  &__header {
    padding-top: 32px;
    padding-bottom: 8px;
    padding-inline: $base-padding;

    &-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 24px;
    padding-inline: $base-padding;
  }

  &__tab-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  &__amount-input-container {
    z-index: 3;
  }

  &__uses-input {
    &-container {
      margin-top: 6px;
    }

    &-after-text {
      font-weight: 500;
      color: $color-primary-50;
    }
  }

  &__amount {
    &-container {
      padding-bottom: 16px;
    }
  }

  &__alert-container {
    margin-top: 24px;
    padding-inline: $base-padding;
  }

  &__funding-source {
    padding-inline: 20px;

    &-change-btn {
      font-size: 13px;
      font-weight: 600;
      color: $color-base-white-100;
      background-color: $color-primary-100;
      transition:
        border 0.12s ease-in,
        background-color 0.12s ease-in;

      @at-root .theme-light & {
        background-color: $color-base-black-0-dark;
        color: $color-primary-100-light;
        border: 1px solid $color-base-black-15-light;

        &:hover {
          border: 1px solid $color-base-black-30-light;
          background-color: $color-base-black-5-light;
        }
      }

      @at-root .theme-dark & {
        background-color: $color-base-black-0-light;
        color: $color-primary-100-dark;
        border: 1px solid $color-base-black-15-dark;

        &:hover {
          border: 1px solid $color-base-black-30-dark;
          background-color: $color-base-black-5-dark;
        }
      }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;

    &-card-id-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-create-btn {
      width: 110px;
      font-size: 14px;
      font-weight: 600;

      &-loader {
        width: 1em;
        height: 1em;
        border-radius: 50%;
        background: linear-gradient(currentcolor 40%, transparent 70%);
        mask: radial-gradient(closest-side, transparent 70%, black 70%);
        animation: loader 0.4s linear infinite;
      }
    }

    @keyframes loader {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    &-card-id-text {
      margin-left: -4px;
    }
  }
}

.uses-input-fade-enter-active,
.uses-input-fade-leave-active {
  transition:
    opacity 0.16s ease-out,
    transform 0.12s ease-out,
    filter 0.16s ease-out,
    max-height 0.16s ease-out;
  overflow: hidden;
}

.uses-input-fade-enter-from {
  opacity: 0.2;
  transform: translateY(-5px);
  transform-origin: top;
  max-height: 0;
  filter: blur(3px);
}

.uses-input-fade-leave-to {
  opacity: 0.2;
  transform: translateY(-5px);
  transform-origin: top;
  max-height: 0;
  filter: blur(3px);
}

.uses-input-fade-enter-to,
.uses-input-fade-leave-from {
  max-height: 100px;
  filter: blur(0);
}
</style>
