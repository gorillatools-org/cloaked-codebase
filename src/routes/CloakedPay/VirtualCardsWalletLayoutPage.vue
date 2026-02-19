<script setup lang="ts">
import { useRoute } from "vue-router";
import {
  onMounted,
  watch,
  markRaw,
  useTemplateRef,
  provide,
  computed,
} from "vue";
import store from "@/store";
import { WalletPageKey } from "@/features/VirtualCards/composables/pages-context/useWalletPageContext";
import CardsServices from "@/api/actions/cards-services";
import RightPanel from "@/features/Wallet/RightPanel.vue";
import VCWalletStatementsModal from "@/features/VirtualCards/modals/VCWalletStatementsModal.vue";
import router from "@/routes/router";
import { posthogCapture } from "@/scripts/posthog.js";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import VCBannerFundingSourcesExpired from "@/features/VirtualCards/VCBannerFundingSourcesExpired.vue";
import FundingSourceCardUpdateModal from "@/features/modals/Wallet/FundingSourceCardUpdateModal.vue";
import VCWalletLayoutRouteView from "@/features/VirtualCards/Wallet/page-components/layout/VCWalletLayoutRouteView.vue";
import VCWalletLayoutAside from "@/features/VirtualCards/Wallet/page-components/layout/VCWalletLayoutAside.vue";
import useOutstandingBalance from "@/features/VirtualCards/composables/useOutstandingBalance";
import VCBannerBalanceDue from "@/features/VirtualCards/VCBannerBalanceDue.vue";
import RightPanelTransactionDetails from "@/features/VirtualCards/right-panels/VCTransactionDetailsRightPanel.vue";
import VCAdvancedCardGenerationModal from "@/features/VirtualCards/modals/cards/VCAdvancedCardGenerationModal.vue";
import type { AdvancedCardGenerationTabName } from "@/features/VirtualCards/modals/cards/VCAdvancedCardGenerationModal.vue";

const route = useRoute();

const { hasExpiredFundingSources } = useFundingSource();
const { hasCollectionStatus, outstandingBalance } = useOutstandingBalance();
const { fundingSources, openAddModal: openAddFundingSourceModal } =
  useFundingSource();

const asideRef =
  useTemplateRef<InstanceType<typeof VCWalletLayoutAside>>("asideRef");

const scrollContainer = useTemplateRef<HTMLDivElement>("scrollContainer");

const information = computed(() => {
  return store.state.cards?.cardInformation;
});

const user = computed(() => {
  return store.state.authentication?.user;
});

onMounted(() => {
  posthogCapture("pay_wallet_home");

  // Get card information (cardholder details, address, etc) if not already loaded
  if (!information.value && !!user.value) {
    void CardsServices.kycRetreive();
  }
});

function getStatementsAndCheckStatementsQuery() {
  CardsServices.getStatements().then(() => {
    if (route.query?.statements === null) {
      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(VCWalletStatementsModal),
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

function handleShowAdvancedModal(options?: {
  period?: string;
  amount?: number;
  selectedTab?: AdvancedCardGenerationTabName;
}) {
  if (!fundingSources.value?.length) {
    openAddFundingSourceModal(() => {
      openAdvancedModal(options);
    });
    return;
  }

  openAdvancedModal(options);
}

const openAdvancedModal = (options?: {
  period?: string;
  amount?: number;
  selectedTab?: AdvancedCardGenerationTabName;
}) => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(VCAdvancedCardGenerationModal),
      props: {
        isVisible: true,
        initialPeriod: options?.period,
        initialAmount: options?.amount,
        initialTab: options?.selectedTab,
        onNewCardIssued: () => {
          handleNewCardIssued();
        },
      },
    },
  });
};

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

provide(WalletPageKey, {
  showAdvancedCardGenerationModal: handleShowAdvancedModal,
});
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
          hasCollectionStatus ||
          !!outstandingBalance
        "
        class="vc-wallet-layout-page__banner-container"
      >
        <VCBannerBalanceDue
          v-if="hasCollectionStatus || !!outstandingBalance"
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
        <div
          ref="scrollContainer"
          class="vc-wallet-layout-page__router-view-container"
        >
          <VCWalletLayoutRouteView
            :scroll-container="scrollContainer!"
            @new-card-issued="handleNewCardIssued"
          />
        </div>
      </main>
      <RightPanelTransactionDetails />
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
    flex-direction: column;

    @container wallet-page (min-width: 600px) {
      flex-direction: column;
      padding-bottom: 8px;
    }

    @container wallet-page (min-width: 730px) {
      flex-direction: row;
      overflow: hidden;
    }
  }

  &__aside-container {
    height: auto;
    width: 100%;
    background-color: $color-primary-5;
    border-radius: 20px;
    flex-shrink: 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    @container wallet-page (min-width: 500px) {
      max-height: 50%;
    }

    @container wallet-page (min-width: 600px) {
      max-height: 50%;
      flex-direction: row;
    }

    @container wallet-page (min-width: 730px) {
      overflow: auto;
      height: 100%;
      max-height: 100%;
      width: 360px;
    }

    @container wallet-page (min-width: 1100px) {
      width: 410px;
    }

    @container wallet-page (min-width: 1200px) {
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
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;

    @media all and (width <= $screen-xl) {
      flex: 1 1 auto;
      min-height: 0;
    }

    &-container {
      @include custom-scrollbar;

      padding-top: 24px;
      padding-bottom: 24px;
      padding-right: calc(18px - 5px);
      overflow-y: auto;
      max-height: 100%;
      height: 100%;
      min-height: 0;
      flex: 1;

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

<!-- This is required to allow other components to use these containers for container queries -->
<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.vc-wallet-layout-page {
  container-name: wallet-page;
  container-type: inline-size;
}

.vc-wallet-layout-page__aside-container {
  container-name: wallet-aside;

  @container wallet-page (min-width: 730px) {
    container-type: size;
  }
}
</style>
