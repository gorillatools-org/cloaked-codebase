<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted, watch, markRaw, useTemplateRef } from "vue";
import store from "@/store";
import CardsServices from "@/api/actions/cards-services";
import RightPanel from "@/features/Wallet/RightPanel.vue";
import ListStatements from "@/features/modals/Wallet/ListStatements.vue";
import router from "@/routes/router";
import { posthogCapture } from "@/scripts/posthog.js";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import VCBannerFundingSourcesExpired from "@/features/VirtualCards/VCBannerFundingSourcesExpired.vue";
import FundingSourceCardUpdateModal from "@/features/modals/Wallet/FundingSourceCardUpdateModal.vue";
import VCWalletLayoutRouteView from "@/features/VirtualCards/Wallet/page-components/layout/VCWalletLayoutRouteView.vue";
import VCWalletLayoutAside from "@/features/VirtualCards/Wallet/page-components/layout/VCWalletLayoutAside.vue";
import useOutstandingBalance from "@/features/VirtualCards/composables/useOutstandingBalance";
import VCBannerBalanceDue from "@/features/VirtualCards/VCBannerBalanceDue.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION } from "@/features/VirtualCards/constants/posthog-feature-flag";

const route = useRoute();

const { featureFlag: isExpressCardGenerationEnabled } = usePostHogFeatureFlag(
  PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION
);

const { hasExpiredFundingSources } = useFundingSource();

const { hasCollectionStatus, outstandingBalance } = useOutstandingBalance();

const asideRef =
  useTemplateRef<InstanceType<typeof VCWalletLayoutAside>>("asideRef");

onMounted(() => {
  posthogCapture("dashboard_pay_wallet_home");
});

function getStatementsAndCheckStatementsQuery() {
  CardsServices.getStatements().then(() => {
    if (route.query?.statements === null) {
      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(ListStatements),
          props: {
            isVisible: true,
          },
        },
      });
    }
  });
}

function handleNewCardIssued() {
  void asideRef.value?.switchToActiveAndFetchCards(true);
}

const openUpdateFundingSourceModal = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(FundingSourceCardUpdateModal),
      props: {
        onClose: () => {
          router.push({ name: "VirtualCardsWalletIndex" });
        },
      },
    },
  });
};

watch(
  () => route.query.statements,
  () => {
    if (route.query.statements === null) {
      getStatementsAndCheckStatementsQuery();
    }
  },
  { immediate: true }
);

watch(
  () => route.name,
  (name) => {
    if (name === "VirtualCardsWalletFundingSourceUpdate") {
      openUpdateFundingSourceModal();
    }
  },
  { immediate: true }
);
</script>

<template>
  <section class="vc-wallet-layout-page">
    <transition
      name="banner"
      mode="out-in"
    >
      <div
        v-if="
          hasExpiredFundingSources ||
          ((hasCollectionStatus || !!outstandingBalance) &&
            !!isExpressCardGenerationEnabled)
        "
        class="vc-wallet-layout-page__banner-container"
      >
        <VCBannerBalanceDue
          v-if="
            (hasCollectionStatus || !!outstandingBalance) &&
            !!isExpressCardGenerationEnabled
          "
        />
        <VCBannerFundingSourcesExpired v-else-if="hasExpiredFundingSources" />
      </div>
    </transition>
    <div class="vc-wallet-layout-page__content">
      <aside class="vc-wallet-layout-page__aside-container">
        <VCWalletLayoutAside
          ref="asideRef"
          @new-card-issued="handleNewCardIssued"
        />
      </aside>
      <main class="vc-wallet-layout-page__router-view">
        <div class="vc-wallet-layout-page__router-view-container">
          <VCWalletLayoutRouteView @new-card-issued="handleNewCardIssued" />
        </div>
      </main>
      <RightPanel />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@mixin custom-scrollbar() {
  $width: 8px;
  $thumb: rgba($color-primary-50-light, 0.5);
  $thumb-hover: $color-primary-70;
  $track: transparent;

  --scroll-thumb-base: transparent;
  --scroll-thumb-visible: #{$thumb};
  --scroll-thumb-strong: #{$thumb-hover};

  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  scrollbar-gutter: stable both-edges;

  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }

  &::-webkit-scrollbar-track {
    background: $track;
    border-radius: 20px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--scroll-thumb-base);
    border-radius: 20px;
    transition: background-color 0.2s ease-in-out;
  }

  &::-webkit-scrollbar-thumb:active {
    background-color: var(--scroll-thumb-strong);
  }

  &::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }
}

.vc-wallet-layout-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;

  &__banner-container {
    width: 100%;
    padding-right: 8px;
    padding-bottom: 8px;
    flex-shrink: 0;
  }

  &__content {
    display: flex;
    gap: 8px;
    flex: 1;
    min-height: 0;
    padding-bottom: 8px;
  }

  &__aside-container {
    height: 100%;
    width: 380px;
    background-color: $color-primary-5;
    border-radius: 20px;

    @media all and (width > 1280px) {
      width: 410px;
    }

    @media all and (min-width: $screen-xxxl) {
      width: 450px;
    }
  }

  &__router-view {
    flex: 1;
    min-width: 0;
    background-color: $color-primary-5;
    border-radius: 20px;
    padding-left: 18px;
    padding-right: 5px;
    overflow-y: hidden;

    &-container {
      @include custom-scrollbar;

      padding-top: 24px;
      padding-bottom: 24px;
      padding-right: calc(18px - 5px);
      overflow-y: auto;
      max-height: 100%;

      &:hover,
      &:focus-within {
        --scroll-thumb-base: var(--scroll-thumb-visible);

        scrollbar-color: var(--scroll-thumb-base) transparent;
      }

      &:not(:hover, :focus-within) {
        scrollbar-color: transparent transparent;
      }

      &::-webkit-scrollbar-thumb:hover {
        background-color: var(--scroll-thumb-strong) !important;
      }
    }
  }
}

.banner-enter-active,
.banner-leave-active {
  transition:
    transform 300ms ease-out,
    opacity 300ms ease-out,
    filter 300ms ease-out,
    max-height 270ms ease-out;
}

.banner-enter-from,
.banner-leave-to {
  filter: blur(2px);
  transform: translateY(8px) scale(0.95);
  opacity: 0.2;
  max-height: 0;
}

.banner-enter-to,
.banner-leave-from {
  filter: blur(0);
  transform: translateY(0) scale(1);
  opacity: 1;
  max-height: 200px;
}
</style>
