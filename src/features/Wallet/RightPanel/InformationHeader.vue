<script setup lang="ts">
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import type { Transaction } from "@/types/Wallet/transaction";
import useWalletTransaction from "@/features/VirtualCards/composables/useWalletTransaction";

type Props = {
  transaction: Transaction;
};

const props = defineProps<Props>();

const { transactionIdentity, amountFormatted, statusDescription } =
  useWalletTransaction(() => props.transaction.id);
</script>

<template>
  <div
    v-if="transaction"
    class="information"
  >
    <IdentityIcon
      :identity="transactionIdentity"
      class="identity-icon"
    />
    <h1
      v-if="statusDescription"
      :class="statusDescription"
    >
      {{ amountFormatted }}
    </h1>
    <p v-if="transactionIdentity?.website_url">
      {{ transactionIdentity?.website_url }}
    </p>
    <div
      v-if="statusDescription"
      class="button"
      :class="transaction?.status"
    >
      {{ statusDescription }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.information {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-flow: column wrap;
  align-items: center;
  margin-bottom: 24px;

  .identity-icon {
    width: 60px !important;
    height: 60px !important;
    border-radius: 50%;
    margin-bottom: 12px;
  }

  h1 {
    color: $color-primary-100;
    font-size: 32px;
    font-style: normal;
    font-weight: 600;
    line-height: 40px; /* 125% */

    &.refunded {
      &::before {
        content: "+ ";
      }

      color: $color-success;
    }

    &.pending {
      color: $color-primary-50;
    }

    &.declined {
      color: $color-alert;
      text-decoration: line-through;
    }
  }

  p {
    color: $color-primary-100;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
  }

  .button {
    margin-top: 12px;
    padding: 8px 16px;
    color: $color-primary-1;
    background-color: $color-primary-100;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    border-radius: 30px;

    &.pending {
      background-color: $color-primary-10;
      color: $color-primary-100;
    }

    &.refunded {
      background-color: $color-success;
      color: $white;
    }

    &.declined {
      background-color: $color-alert;
      color: $white;
    }
  }
}
</style>
