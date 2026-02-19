<script setup lang="ts">
import { toRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import useWalletTransaction from "../composables/useWalletTransaction";
import VCBaseCard from "../base/card/VCBaseCard.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";

type Props = {
  transactionId?: string;
  focused?: boolean;
};

const props = defineProps<Props>();

const {
  transaction,
  merchantIdentity,
  dateFormatted,
  amountFormatted,
  statusDescription,
  identityDisplayName,
  effectiveStatus,
} = useWalletTransaction(toRef(() => props.transactionId));
</script>
<template>
  <VCBaseCard
    :class="[
      'vc-wallet-transaction-item',
      `vc-wallet-transaction-item--${effectiveStatus?.toLowerCase()}`,
    ]"
    :border="{ borderRadius: 16, focused: props.focused }"
    clickable
  >
    <div class="vc-wallet-transaction-item__body">
      <div class="vc-wallet-transaction-item__identity-container">
        <IdentityIcon
          :override="{ width: '40px', height: '40px' }"
          :identity="merchantIdentity"
          class="vc-wallet-transaction-item__identity-icon"
        />
        <div class="vc-wallet-transaction-item__identity-infos">
          <BaseText
            variant="headline-6-bold"
            class="vc-wallet-transaction-item__merchant-name"
          >
            {{ transaction?.merchant_name }}
          </BaseText>
          <BaseText
            variant="body-3-regular"
            class="vc-wallet-transaction-item__date"
          >
            {{ identityDisplayName }} • {{ dateFormatted }}
          </BaseText>
        </div>
      </div>
      <div class="vc-wallet-transaction-item__value-container">
        <BaseText
          variant="headline-6-bold"
          class="vc-wallet-transaction-item__amount"
        >
          {{ amountFormatted }}
        </BaseText>
        <BaseText
          variant="body-3-regular"
          class="vc-wallet-transaction-item__status"
        >
          {{ statusDescription }}
        </BaseText>
      </div>
    </div>
  </VCBaseCard>
</template>

<style lang="scss" scoped>
.vc-wallet-transaction-item {
  &__body {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
  }

  &__identity {
    &-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &-infos {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
  }

  &__merchant-name {
    text-transform: capitalize;
  }

  &__date {
    color: $color-primary-50;
  }

  &__value-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
    gap: 8px;
  }

  &__amount {
    color: $color-primary-100;

    .vc-wallet-transaction-item--declined & {
      color: $color-status-error;
    }

    .vc-wallet-transaction-item--refunded & {
      color: $color-safe-zone-green;
    }
  }

  &__status {
    color: $color-primary-50;
  }
}
</style>
