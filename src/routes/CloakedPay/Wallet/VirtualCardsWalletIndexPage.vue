<script setup lang="ts">
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION,
  PH_VIRTUAL_CARDS_FEATURE_FLAG_SUMMARY_VIEW_DETAILS,
} from "@/features/VirtualCards/constants/posthog-feature-flag";
import VCWalletCreationLimitSummaryCard from "@/features/VirtualCards/Wallet/page-components/index/VCWalletCreationLimitSummaryCard.vue";
import CreateCard from "@/features/Wallet/WalletSettings/CreateCardButton.vue";
import { useWalletPageContext } from "@/features/VirtualCards/composables/pages-context/useWalletPageContext";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import DefaultFundingSource from "@/features/Wallet/WalletSettings/DefaultFundingSourceButton.vue";
import CardInformationButton from "@/features/Wallet/WalletSettings/CardInformationButton.vue";
import VCWalletActivityHeaderActions from "@/features/VirtualCards/Wallet/page-components/index/activity/VCWalletActivityHeaderActions.vue";
import VCWalletTransactionsList from "@/features/VirtualCards/Wallet/VCWalletTransactionsList.vue";
import VCWalletSummaryBreakdownList from "@/features/VirtualCards/Wallet/page-components/summary/VCWalletSummaryBreakdownList.vue";
import VCFreeUpCreationLimitModal from "@/features/VirtualCards/modals/cards/VCFreeUpCreationLimitModal.vue";
import store from "@/store";
import { markRaw } from "vue";
import VCWalletPurchasesChart from "@/features/VirtualCards/Wallet/page-components/index/VCWalletPurchasesChart.vue";

const { featureFlag: isExpressCardGenerationEnabled } = usePostHogFeatureFlag(
  PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION
);

const { featureFlag: isSummaryViewDetailsEnabled } = usePostHogFeatureFlag(
  PH_VIRTUAL_CARDS_FEATURE_FLAG_SUMMARY_VIEW_DETAILS
);

const { handleNewCardIssued, setSlot, setNavigation } = useWalletPageContext();
const route = useRoute();
const router = useRouter();

const section = computed<"summary" | "activity">(() => {
  if (route.name === "VirtualCardsWalletSummary") {
    return "summary";
  }

  return "activity";
});

const viewDetails = () => {
  if (section.value === "summary") {
    router.push(`/virtual-cards/wallet`);
    return;
  }

  router.push(`/virtual-cards/wallet/summary`);
};

const freeUpSpace = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(VCFreeUpCreationLimitModal),
    },
  });
};

watch(
  section,
  () => {
    if (section.value === "summary") {
      setSlot("header-actions", undefined);
      setNavigation({
        title: "Activity",
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
    <div
      class="vc-wallet-page__actions"
      :class="{
        'vc-wallet-page__actions--with-chart': isExpressCardGenerationEnabled,
      }"
    >
      <VCWalletCreationLimitSummaryCard
        v-if="isExpressCardGenerationEnabled"
        :detailed="section === 'summary'"
        :show-view-details="isSummaryViewDetailsEnabled ?? false"
        @view-details="viewDetails"
        @free-up-space="freeUpSpace"
      />
      <!-- TODO: Remove this when Express Card Generation is enabled -->
      <CreateCard
        v-else
        @new-card-issued="handleNewCardIssued"
      />
      <template v-if="isExpressCardGenerationEnabled">
        <VCWalletPurchasesChart />
      </template>
      <template v-else>
        <DefaultFundingSource v-if="section === 'activity'" />
        <CardInformationButton v-if="section === 'activity'" />
      </template>
    </div>

    <div class="vc-wallet-page__body">
      <transition
        name="fade"
        mode="out-in"
      >
        <VCWalletTransactionsList
          v-if="section === 'activity'"
          key="activity"
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
      grid-template-columns: repeat(3, 1fr);
    }

    &--with-chart {
      grid-gap: 24px;

      @media (width >=1200px) {
        grid-template-columns: repeat(2, 1fr);
      }
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
