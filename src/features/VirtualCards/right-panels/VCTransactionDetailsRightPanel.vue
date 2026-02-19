<script setup lang="ts">
import { watch, computed, markRaw, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useVCTransactionDetailsStore } from "../store/useVCTransactionDetailsStore";
import { useToast } from "@/composables/useToast.js";
import VCBaseRightPanel from "../base/VCBaseRightPanel.vue";
import useWalletTransaction from "../composables/useWalletTransaction";
import VCBaseCardInfo from "../base/card/VCBaseCardInfo.vue";
import VCBaseCardAction from "../base/card/VCBaseCardAction.vue";
import BaseText from "@/library/BaseText.vue";
import VCBaseCopyText from "../base/VCBaseCopyText.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import moment from "moment";
import { capitalizeFirstLetter } from "@/scripts/format";
import { CARD_LABEL_BY_PROVIDER_TYPE } from "@/scripts/constants";
import store from "@/store";
import VCTransactionNoteModal from "../modals/transactions/VCTransactionNoteModal.vue";

const transactionDetailsStore = useVCTransactionDetailsStore();
const { isRightPanelOpen, transactionId } = storeToRefs(
  transactionDetailsStore
);
const { closeRightPanel } = transactionDetailsStore;

const rightPanelRef =
  useTemplateRef<InstanceType<typeof VCBaseRightPanel>>("rightPanelRef");
const toast = useToast();

const {
  transaction,
  transactionFundingSource,
  transactionIdentity,
  amountFormatted,
  statusDescription,
  statusTagColor,
  statusTagTooltip,
  identityDisplayName,
  merchantIdentity,
  effectiveStatus,
} = useWalletTransaction(() => transactionId.value);

const borderConfig = {
  borderRadius: 30,
};

const fundingSourceDescription = computed(() => {
  if (!transactionFundingSource.value) {
    return "Unknown";
  }

  const fundingSourceProvider = transactionFundingSource.value.provider;
  const panLastFour = transactionFundingSource.value.pan_last_four || "Unknown";
  const cardBrand = capitalizeFirstLetter(
    transactionFundingSource.value.card_brand || "Unknown"
  );

  const fundingSourceType = fundingSourceProvider
    ? CARD_LABEL_BY_PROVIDER_TYPE[fundingSourceProvider] || "Unknown"
    : "Unknown";

  return `${cardBrand} •••• ${panLastFour} • ${fundingSourceType}`;
});

const dateFormattedDetailed = computed(() => {
  if (!transaction.value?.created_at) {
    return "";
  }

  return moment(transaction.value.created_at).format("MMMM DD, YYYY, h:mm A");
});

const merchantDescription = computed(() => {
  const parts = [
    transaction.value?.merchant_name,
    transaction.value?.merchant_city,
    transaction.value?.merchant_state,
    transaction.value?.merchant_country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Unknown";
});

function openNoteModal() {
  if (!transactionId.value) return;

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(VCTransactionNoteModal),
      props: {
        transactionId: transactionId.value,
        maxlength: 255,
      },
    },
  });
}

watch(
  () => isRightPanelOpen.value,
  () => {
    if (isRightPanelOpen.value && !transactionId.value) {
      toast.error("Unable to open transaction details. Transaction not found.");
      closeRightPanel();
    }
  },
  { immediate: true }
);
</script>

<template>
  <VCBaseRightPanel
    ref="rightPanelRef"
    :width="550"
    :is-open="isRightPanelOpen"
    :on-close="closeRightPanel"
    :header="{
      title: 'Transaction details',
      showCloseButton: true,
    }"
  >
    <div
      class="vc-transaction-details-right-panel"
      :class="[
        `vc-transaction-details-right-panel--${effectiveStatus?.toLowerCase()}`,
        {
          'vc-transaction-details-right-panel--grayed':
            transaction?.is_card_canceled,
        },
      ]"
    >
      <!-- Transaction Header -->
      <div class="vc-transaction-details-right-panel__header">
        <div
          class="vc-transaction-details-right-panel__header-merchant-container"
        >
          <div
            class="vc-transaction-details-right-panel__header-merchant-icon-container"
          >
            <IdentityIcon
              :identity="merchantIdentity"
              :override="{ width: '22px', height: '22px' }"
              class="vc-transaction-details-right-panel__header-merchant-icon"
            />
          </div>
          <BaseText
            variant="body-2-semibold"
            class="vc-transaction-details-right-panel__header-merchant-name"
          >
            {{ transaction?.merchant_name || "Unknown Merchant" }}
          </BaseText>
        </div>
        <BaseText
          variant="headline-1-medium"
          class="vc-transaction-details-right-panel__header-amount"
        >
          {{ amountFormatted }}
        </BaseText>
        <BaseProgressTag
          v-if="statusDescription"
          :color="statusTagColor"
          class="vc-transaction-details-right-panel__header-status"
        >
          {{ statusDescription }}
          <template #right>
            <UiTooltip
              v-if="statusTagTooltip"
              :title="statusTagTooltip"
              position="bottom"
              align-x="center"
              :max-width="340"
              :is-multiline="true"
            >
              <BaseIcon
                name="info"
                class="vc-transaction-details-right-panel__info-icon"
              />
            </UiTooltip>
          </template>
        </BaseProgressTag>
        <BaseText
          variant="body-2-semibold"
          class="vc-transaction-details-right-panel__header-date"
        >
          {{ dateFormattedDetailed }}
        </BaseText>
      </div>

      <!-- Information Cards -->
      <div class="vc-transaction-details-right-panel__info-cards">
        <VCBaseCardInfo
          title="Card Used"
          icon="wallet"
          :border="borderConfig"
        >
          <template #description>
            <div
              class="vc-transaction-details-right-panel__card-used-description-container"
            >
              <IdentityIcon
                v-if="transactionIdentity"
                :identity="transactionIdentity"
                :override="{ width: '22px', height: '22px' }"
                class="vc-transaction-details-right-panel__card-used-description-icon"
              />
              <BaseText
                class="vc-transaction-details-right-panel__card-used-description-text"
                variant="body-small-medium"
              >
                {{ identityDisplayName || "Unknown Identity" }}
                {{
                  transaction?.card_pan_last_four
                    ? ` •••• ${transaction?.card_pan_last_four}`
                    : ""
                }}
              </BaseText>
            </div>
          </template>
        </VCBaseCardInfo>

        <VCBaseCardInfo
          title="Funding Source"
          :description="fundingSourceDescription"
          icon="bank"
          :border="borderConfig"
        />

        <VCBaseCardInfo
          title="Description"
          :description="merchantDescription"
          icon="document"
          :border="borderConfig"
        />

        <VCBaseCardInfo
          title="Category"
          :description="
            transaction?.merchant_category_name || 'Unknown Category'
          "
          icon="square-grid"
          :border="borderConfig"
        />

        <VCBaseCardAction
          title="Notes"
          :description="transaction?.note || 'Add a note'"
          icon="edit"
          :border="borderConfig"
          @click="openNoteModal"
        />
      </div>

      <!-- Footer -->
      <div class="vc-transaction-details-right-panel__footer">
        <BaseText
          as="span"
          variant="body-2-semibold"
          class="vc-transaction-details-right-panel__footer-label"
        >
          Transaction ID
        </BaseText>
        <VCBaseCopyText
          :value="transaction?.id || ''"
          class="vc-transaction-details-right-panel__footer-id"
        />
      </div>
    </div>
  </VCBaseRightPanel>
</template>

<style scoped lang="scss">
.vc-transaction-details-right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border-radius: 30px;

    &-merchant {
      &-container {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      &-icon {
        &-container {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: $color-primary-70;
        }
      }

      &-name {
        color: $color-primary-100;
        text-transform: capitalize;
      }
    }

    &-amount {
      font-size: 48px;
      font-weight: 500;
      line-height: 1;
      color: $color-primary-100;

      .vc-transaction-details-right-panel--declined & {
        color: $color-status-error;
      }

      .vc-transaction-details-right-panel--refunded & {
        color: $color-safe-zone-green;
      }
    }

    &-status {
      margin-top: 0;
    }
  }

  &__info-icon {
    width: 16px;
    height: 16px;
    color: inherit;
  }

  &__info-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;
  }

  &__card-used-description {
    &-container {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    &-icon {
      flex-shrink: 0;

      .vc-transaction-details-right-panel--grayed & {
        filter: grayscale(100%);
      }
    }

    &-text {
      color: $color-primary-50;
      margin-top: 4px;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: auto;
    padding-top: 24px;

    &-label {
      text-align: center;
      color: $color-primary-100;
    }

    &-id {
      margin-left: -4px;
    }
  }
}
</style>
