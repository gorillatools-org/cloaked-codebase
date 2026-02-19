<script setup lang="ts">
import store from "@/store";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import useVirtualCardManagement from "@/features/VirtualCards/composables/useVirtualCardManagement";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";
import BaseText from "@/library/BaseText.vue";
import VCPillSettingsButton from "../../VCPillSettingsButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import useVirtualCardModals from "@/features/VirtualCards/composables/useVirtualCardModals";
import VCPillFundingSourceButton from "@/features/VirtualCards/Wallet/VCPillFundingSourceButton.vue";
import { computed } from "vue";
import { posthogCapture } from "@/scripts/posthog";
import useFundingSource from "@/composables/Wallet/useFundingSource";

type Props = {
  cardId: string;
};

const props = defineProps<Props>();

const { checkExpiredFundingSource } = useFundingSource();
const { openManageCardModal } = useVirtualCardManagement(() => props.cardId);
const { openFundingSourcePatchModal } = useVirtualCardModals(
  () => props.cardId
);
const { cardIdentity, isCanceled, isLocked, cardFundingSource } =
  useVirtualCard(() => props.cardId);

const fundingSourcePillBtnLabel = computed(() => {
  return `Funding Source •••• ${cardFundingSource.value?.pan_last_four || "0000"}${isExpiredFundingSource.value ? " (expired)" : ""}`;
});

const isExpiredFundingSource = computed(() => {
  return checkExpiredFundingSource(cardFundingSource.value?.id || "");
});

const openIdentity = () => {
  if (
    (!isCanceled.value && !store.state.rightPanel.cloak) ||
    store.state.rightPanel.cloak.id !== cardIdentity.value?.id
  ) {
    store.dispatch("fetchPopulatedData", cardIdentity.value).then((data) => {
      store.commit("compose", null);
      store.dispatch("openCloakDetails", {
        cloak: data,
        skipNav: true,
      });
    });
  }
};

const openFundingSourceModal = () => {
  posthogCapture("pay_wallet_card_funding_source_modal_viewed");
  openFundingSourcePatchModal();
};
</script>

<template>
  <div
    class="vc-wallet-card-page-header"
    :class="{ 'vc-wallet-card-page-header--canceled': isCanceled }"
  >
    <div
      v-if="cardIdentity"
      class="vc-wallet-card-page-header__identity-container"
      @click="openIdentity()"
    >
      <IdentityIcon
        :identity="cardIdentity"
        :override="{ height: '32px', width: '32px' }"
      />
      <div class="vc-wallet-card-page-header__identity-name-container">
        <BaseText
          variant="headline-3-medium"
          class="vc-wallet-card-page-header__identity-name"
        >
          {{ cardIdentity?.nickname || "Unnamed" }}
          {{ isCanceled ? "(Canceled)" : "" }}
        </BaseText>
        <BaseIcon
          v-if="isLocked"
          name="lock-filled"
          class="vc-wallet-card-page-header__identity-name-icon"
        />
      </div>
    </div>

    <!-- Identity skeleton -->
    <div
      v-else
      class="vc-wallet-card-page-header__identity-skeleton"
    >
      <div
        class="vc-wallet-card-page-header__identity-skeleton-logo skeleton-shimmer"
      ></div>
      <div
        class="vc-wallet-card-page-header__identity-skeleton-name skeleton-shimmer"
      ></div>
    </div>

    <div class="vc-wallet-card-page-header__actions">
      <VCPillFundingSourceButton
        v-if="!isCanceled"
        :label="fundingSourcePillBtnLabel"
        :color="isExpiredFundingSource ? 'error' : 'default'"
        @click="openFundingSourceModal"
      />
      <VCPillSettingsButton
        v-if="!isCanceled"
        @click="openManageCardModal()"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/features/VirtualCards/assets/skeleton";

.vc-wallet-card-page-header {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-direction: column;

  @container wallet-router-view (min-width: 550px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  &__action {
    color: $color-primary-100;
    margin-left: 10px;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    border-radius: 10px;
    padding: 8px 10px;

    &:hover {
      cursor: pointer;
      background-color: $color-primary-10;
    }

    &-icon {
      width: 18px;
      height: 18px;
      display: block;
    }

    &-label {
      margin-left: 5px;
      display: inline-block;
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
    }
  }

  &__identity {
    &-container {
      display: flex;
      align-items: center;
      cursor: pointer;
      justify-self: center;

      .vc-wallet-card-page-header--canceled & {
        cursor: default;
        filter: grayscale(100%);
      }
    }

    &-name {
      font-weight: 500;
      color: $color-primary-100;
      white-space: nowrap;
      max-width: 70cqw;
      overflow: hidden;
      text-overflow: ellipsis;

      @container wallet-router-view (min-width: 550px) {
        max-width: 40cqw;
      }

      @container wallet-router-view (min-width: 715px) {
        max-width: 370px;
      }

      &-container {
        margin-left: 8px;
        display: flex;
        gap: 8px;
        align-items: center;
      }

      &-icon {
        width: 19px;
        height: 19px;
        font-size: 19px;
        color: $color-primary-100;
      }
    }

    &-skeleton {
      display: flex;
      align-items: center;
      gap: 8px;

      &-logo {
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }

      &-name {
        width: 110px;
        height: 20px;
        border-radius: 4px;
      }
    }
  }
}
</style>
