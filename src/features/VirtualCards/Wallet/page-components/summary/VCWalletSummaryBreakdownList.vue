<script setup lang="ts">
import type { TransactionsSummaryType } from "@/routes/CloakedPay/Wallet/VirtualCardsWalletSummaryTransactionsPage.vue";
import VCWalletSummaryBreakdownCard, {
  type SummaryBreakdownProps,
} from "./VCWalletSummaryBreakdownCard.vue";
import { useRouter } from "vue-router";

type Breakdown = SummaryBreakdownProps & { id: TransactionsSummaryType };

const router = useRouter();

const breakdownList: Breakdown[] = [
  {
    id: "payments",
    label: "Payments",
    value: 102400.36,
    tooltip:
      "These are payments made to Cloaked when a balance is due from unpaid transactions.",
  },
  {
    id: "refunds",
    label: "Refunds",
    value: 23300.33,
    tooltip: "These are payments debited back to your funding source.",
    valueColor: "positive",
  },
  {
    id: "blocked",
    label: "Blocked",
    value: 5100.28,
    tooltip:
      "These are transactions that were attempted outside of the security parameters of a card. For example after it has been canceled or expired.",
  },
];

const handleClick = (breakdown: Breakdown) => {
  if (breakdown.value === 0) return;
  router.push(`/virtual-cards/wallet/summary/${breakdown.id}`);
};
</script>

<template>
  <div class="vc-wallet-summary-breakdown-list">
    <VCWalletSummaryBreakdownCard
      v-for="breakdown in breakdownList"
      :key="breakdown.label"
      :clickable="breakdown.value > 0"
      :border="{ borderRadius: 24 }"
      v-bind="breakdown"
      @click="handleClick(breakdown)"
    />
  </div>
</template>

<style lang="scss" scoped>
.vc-wallet-summary-breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
