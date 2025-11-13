<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import { useWalletRouterViewContext } from "@/features/VirtualCards/composables/pages-context/useWalletRouterViewContext";
import VCWalletSummaryTransactionItem from "@/features/VirtualCards/Wallet/page-components/summary/VCWalletSummaryTransactionItem.vue";

export type TransactionsSummaryType = "payments" | "refunds" | "blocked";

const validTypes: TransactionsSummaryType[] = [
  "payments",
  "refunds",
  "blocked",
];
const route = useRoute();
const router = useRouter();
const { setNavigation } = useWalletRouterViewContext();

onMounted(() => {
  if (!type.value || !validTypes.includes(type.value)) {
    router.push("/virtual-cards/wallet/summary");
    return;
  }

  setNavigation({
    title: type.value,
    showBackButton: true,
    backTo: "/virtual-cards/wallet/summary",
  });
});

const type = computed(() => {
  return route.params.type as TransactionsSummaryType | undefined;
});
</script>

<template>
  <div class="vc-wallet-summary-trans-page">
    <div class="vc-wallet-summary-trans-page__list">
      <VCWalletSummaryTransactionItem
        v-for="(_, index) in 12"
        :key="index"
        :value="50000"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vc-wallet-summary-trans-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
