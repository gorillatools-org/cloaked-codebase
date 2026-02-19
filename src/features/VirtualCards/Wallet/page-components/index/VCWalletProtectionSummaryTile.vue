<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import NumberFlow, { continuous } from "@number-flow/vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { currencyFormatConfig } from "@/features/VirtualCards/utils/currency-utils";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import { useVirtualCardsWalletPageStore } from "@/features/VirtualCards/store/useVirtualCardsWalletPageStore";
import { storeToRefs } from "pinia";
import CardsServices from "@/api/actions/cards-services";
import type { ProtectionSummaryResponse } from "@/types/Wallet/protection-summary";
import { useToast } from "@/composables/useToast";
import { useMounted } from "@vueuse/core";
import store from "@/store";

const { fundingSources } = useFundingSource();

const virtualCardsApplication = useVirtualCardsWalletPageStore();
const { shouldAnimateOnMount } = storeToRefs(virtualCardsApplication);

const totalSavedCents = ref(0);
const blockedTransactions = ref(0);
const toast = useToast();
const isMounted = useMounted();

onMounted(() => {
  fetchBlockedTransactionStats();
});

const user = computed(() => {
  return store.state.authentication?.user;
});

const fundingSourcesProtectedValue = computed(() =>
  shouldAnimateOnMount.value ? 0 : fundingSources.value.length
);

const totalSavedValue = computed(() =>
  shouldAnimateOnMount.value ? 0 : totalSavedCents.value / 100
);

const blockedTransactionsValue = computed(() =>
  shouldAnimateOnMount.value ? 0 : blockedTransactions.value
);

const isLargeValue = computed(() => totalSavedValue.value > 99999.99);

const fetchBlockedTransactionStats = async () => {
  CardsServices.getBlockedTransactionStats()
    .then((response: ProtectionSummaryResponse) => {
      totalSavedCents.value = response.stats.total_amount;
      blockedTransactions.value = response.stats.count;
    })
    .catch(() => {
      if (!user.value || !isMounted.value) {
        return;
      }

      toast.error(
        "We were unable to fetch the blocked transaction stats. Please try again later."
      );
    });
};
</script>
<template>
  <VCBaseCard
    class="vc-wallet-protection-summary-tile"
    :border="{ borderRadius: 24 }"
  >
    <div class="vc-wallet-protection-summary-tile__wrapper">
      <!-- Header -->
      <header class="vc-wallet-protection-summary-tile__header">
        <div class="vc-wallet-protection-summary-tile__header-title-container">
          <BaseText variant="headline-5-bold">Protection Summary</BaseText>
          <UiTooltip
            title="Protection Summary"
            position="bottom"
            align-x="left"
            :max-width="300"
          >
            <BaseIcon
              class="vc-wallet-protection-summary-tile__header-title-icon"
              name="info"
            />
            <template #content>
              <div class="vc-wallet-protection-summary-tile__tooltip">
                <BaseText
                  variant="body-2-semibold"
                  class="vc-wallet-protection-summary-tile__tooltip-title"
                >
                  What’s a Protection Summary?
                </BaseText>
                <BaseText
                  variant="body-small-medium"
                  class="vc-wallet-protection-summary-tile__tooltip-content"
                >
                  This summary shows how Cloaked Pay protects your real
                  accounts. When merchants try to charge closed cards, exceed
                  spend limits, or make unapproved charges, we automatically
                  block those attempts - keeping your funding sources safe.
                </BaseText>
              </div>
            </template>
          </UiTooltip>
        </div>
      </header>

      <!-- Body -->
      <div class="vc-wallet-protection-summary-tile__body">
        <div class="vc-wallet-protection-summary-tile__stat">
          <BaseText
            variant="headline-2-semibold"
            class="vc-wallet-protection-summary-tile__stat-value"
          >
            <NumberFlow
              :value="fundingSourcesProtectedValue"
              :plugins="[continuous]"
            />
          </BaseText>
          <BaseText
            variant="body-small-semibold"
            class="vc-wallet-protection-summary-tile__stat-label"
          >
            Funding sources
            <br />
            protected
          </BaseText>
        </div>

        <div class="vc-wallet-protection-summary-tile__divider" />

        <div class="vc-wallet-protection-summary-tile__stat">
          <BaseText
            variant="headline-2-semibold"
            :class="[
              'vc-wallet-protection-summary-tile__stat-value',
              {
                'vc-wallet-protection-summary-tile__stat-value--large':
                  isLargeValue,
              },
            ]"
          >
            <NumberFlow
              :format="currencyFormatConfig"
              :value="totalSavedValue"
              :plugins="[continuous]"
            />
          </BaseText>
          <BaseText
            variant="body-small-semibold"
            class="vc-wallet-protection-summary-tile__stat-label"
          >
            Total protected with Cloaked Pay
          </BaseText>
        </div>
      </div>

      <!-- Footer -->
      <BaseText
        variant="headline-6-medium"
        class="vc-wallet-protection-summary-tile__footer"
      >
        Cloaked Pay has blocked
        <NumberFlow
          :value="blockedTransactionsValue"
          class="vc-wallet-protection-summary-tile__footer-value"
          :plugins="[continuous]"
        />
        risky
        {{ blockedTransactionsValue === 1 ? "transaction" : "transactions" }}.
      </BaseText>
    </div>
  </VCBaseCard>
</template>
<style lang="scss" scoped>
.vc-wallet-protection-summary-tile {
  &__wrapper {
    display: flex;
    flex-direction: column;
    padding: 24px;
    min-height: 205px;
    gap: 16px;
    container-name: wrapper;
    container-type: inline-size;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      &-container {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      &-icon {
        font-size: 18px;
      }
    }
  }

  &__body {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    height: 84px;
  }

  &__stat {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    container-name: stat;
    container-type: inline-size;
  }

  &__stat-value {
    white-space: nowrap;
    font-size: clamp(17px, 22cqw, 29px);

    &--large {
      font-size: clamp(17px, 20cqw, 26px);
    }
  }

  &__stat-label {
    color: $color-primary-70;
    font-size: clamp(11px, 10cqw, 13px);
    max-width: 140px;
  }

  &__divider {
    width: 1px;
    height: 100%;
    background-color: $color-primary-20;
    flex-shrink: 0;
  }

  &__footer {
    font-size: clamp(14px, 4cqw, 16px);
    color: $color-primary-70;

    &-value {
      font-weight: 700;
      color: $color-primary-100;
    }
  }

  &__tooltip {
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 24px 0 rgb(0 0 0 / 5%);
    max-width: 300px;
  }
}
</style>
