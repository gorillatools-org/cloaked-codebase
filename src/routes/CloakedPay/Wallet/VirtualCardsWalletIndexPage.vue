<script setup lang="ts">
import VCWalletProtectionSummaryTile from "@/features/VirtualCards/Wallet/page-components/index/VCWalletProtectionSummaryTile.vue";
import { useWalletRouterViewContext } from "@/features/VirtualCards/composables/pages-context/useWalletRouterViewContext";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import VCWalletActivityHeaderActions from "@/features/VirtualCards/Wallet/page-components/index/activity/VCWalletActivityHeaderActions.vue";
import VCWalletTransactionsList from "@/features/VirtualCards/Wallet/VCWalletTransactionsList.vue";
import VCWalletSummaryBreakdownList from "@/features/VirtualCards/Wallet/page-components/summary/VCWalletSummaryBreakdownList.vue";
import VCWalletPurchasesChart from "@/features/VirtualCards/Wallet/page-components/index/VCWalletPurchasesChart.vue";
import useVirtualCards from "@/features/VirtualCards/composables/useVirtualCards";

const { setSlot, setNavigation, routerViewScrollContainer } =
  useWalletRouterViewContext();

const { cardsList } = useVirtualCards();
const route = useRoute();

const section = computed<"summary" | "activity">(() => {
  if (route.name === "VirtualCardsWalletSummary") {
    return "summary";
  }

  return "activity";
});

watch(
  [section, () => route.name],
  () => {
    if (section.value === "summary") {
      setSlot("header-actions", undefined);
      setNavigation({
        title: "Summary",
        showBackButton: true,
        backTo: "/virtual-cards/wallet",
      });
      return;
    }

    setNavigation({ title: "Activity" });
    setSlot("header-actions", VCWalletActivityHeaderActions);
  },
  { immediate: true }
);
</script>

<template>
  <div class="vc-wallet-page">
    <div class="vc-wallet-page__actions">
      <VCWalletProtectionSummaryTile />
      <VCWalletPurchasesChart />
    </div>

    <div
      v-if="routerViewScrollContainer"
      class="vc-wallet-page__body"
    >
      <transition
        name="fade"
        mode="out-in"
      >
        <VCWalletTransactionsList
          v-if="section === 'activity'"
          key="activity"
          :show-empty-carousel="(cardsList?.length || 0) < 2"
          :scroll-container="routerViewScrollContainer"
        />
        <VCWalletSummaryBreakdownList
          v-else
          key="summary"
        />
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vc-wallet-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;

  &__actions {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
    width: 100%;

    @media (width >=1200px) {
      grid-gap: 24px;
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__body {
    margin-top: 24px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.16s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.16s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
