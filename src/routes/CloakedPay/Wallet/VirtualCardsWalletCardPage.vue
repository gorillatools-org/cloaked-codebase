<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, watch } from "vue";
import { useToast } from "@/composables/useToast.js";
import useVirtualCards from "@/features/VirtualCards/composables/useVirtualCards";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";
import VCWalletTransactionsList from "@/features/VirtualCards/Wallet/VCWalletTransactionsList.vue";
import { useWalletRouterViewContext } from "@/features/VirtualCards/composables/pages-context/useWalletRouterViewContext";
import VCWalletCardPageHeader from "@/features/VirtualCards/Wallet/page-components/card/VCWalletCardPageHeader.vue";
import VCWalletCardLimitTile from "@/features/VirtualCards/Wallet/page-components/card/VCWalletCardLimitTile.vue";
import VCWalletCardTile from "@/features/VirtualCards/Wallet/page-components/card/VCWalletCardTile.vue";
import VCWalletCardSkeletonTile from "@/features/VirtualCards/Wallet/page-components/card/VCWalletCardSkeletonTile.vue";
import { posthogCapture } from "@/scripts/posthog";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { setSlot, setNavigation, routerViewScrollContainer } =
  useWalletRouterViewContext();
const { card, isCanceled, getCardInformation } = useVirtualCard(
  () => cardId.value
);

const { cardsList } = useVirtualCards();

const cardId = computed<string>(() => {
  if (!route.params.id) {
    return "";
  }
  return route.params.id as string;
});

const isLoadingCard = computed(() => {
  return cardId.value && (!cardsList.value || !card.value);
});

onMounted(() => {
  setNavigation({
    backTo: "/virtual-cards/wallet",
    showBackButton: true,
    preserveWhileSameViewKey: true,
  });

  setSlot(
    "header-actions",
    VCWalletCardPageHeader,
    {
      cardId,
    },
    true
  );
});

watch(
  () => [cardId.value, cardsList.value],
  ([newCardId, oldCardId]) => {
    if (cardId.value && !!cardsList.value && !card.value) {
      router.push("/virtual-cards/wallet");
      toast.error("Card not found");
      return;
    }

    if (cardId.value && !!cardsList.value && !!card.value) {
      if (!isCanceled.value) {
        getCardInformation().then(() => {
          posthogCapture("pay_wallet_card_viewed");
        });
      } else {
        posthogCapture("pay_wallet_card_canceled_viewed");
      }
    }

    if (newCardId && !!cardsList.value && newCardId !== oldCardId) {
      routerViewScrollContainer.value.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="vc-wallet-card-page">
    <div class="vc-wallet-card-page__tiles">
      <VCWalletCardSkeletonTile v-if="isLoadingCard" />
      <VCWalletCardTile
        v-else
        :card-id="cardId"
      />
      <VCWalletCardLimitTile :card-id="cardId" />
    </div>
  </div>
  <VCWalletTransactionsList
    :card-id="cardId"
    :scroll-container="routerViewScrollContainer"
    :show-empty-carousel="false"
  />
</template>

<style lang="scss" scoped>
.vc-wallet-card-page {
  width: 100%;
  margin-bottom: 48px;
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;

  &__buttons {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
    width: 100%;

    @media (width >=1200px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__tiles {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
    width: 100%;

    @media (width >= 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (width >= $screen-xxl) {
      grid-gap: 32px;
    }
  }
}
</style>
