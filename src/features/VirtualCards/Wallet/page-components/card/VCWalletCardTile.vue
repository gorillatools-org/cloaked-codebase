<script setup lang="ts">
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";
import mastercardLogo from "@/assets/icons/mastercard.svg?url";
import BaseText from "@/library/BaseText.vue";
import VCWalletCardMaskedData from "@/features/VirtualCards/Wallet/page-components/card/VCWalletCardMaskedData.vue";
import { computed } from "vue";
import store from "@/store";
import type { VirtualCard } from "@/types/Wallet/virtual-card";
import { formatExpirationDate } from "@/features/VirtualCards/utils/expiration-utils";

type Props = {
  cardId: string;
};

const props = defineProps<Props>();

const { card, cardIdentity, isCanceled, lastFourDigits } = useVirtualCard(
  () => props.cardId
);

const realCardNumbers = computed<VirtualCard | null>(() => {
  return store.state.cards.currentCard;
});

const cardNumberMask = computed(() => {
  return `**** **** **** ${lastFourDigits.value}`;
});

const expirationDate = computed(() => {
  return formatExpirationDate(card.value?.expires_at_unmasked);
});
</script>

<template>
  <div
    class="vc-wallet-card-tile"
    :class="{ 'vc-wallet-card-tile--canceled': isCanceled }"
  >
    <div class="vc-wallet-card-tile__wrapper">
      <header class="vc-wallet-card-tile__header">
        <BaseText
          variant="headline-3-medium"
          class="vc-wallet-card-tile__name"
        >
          {{ cardIdentity?.nickname || "Unnamed" }}
        </BaseText>
      </header>
      <div class="vc-wallet-card-tile__content">
        <div class="vc-wallet-card-tile__content-row">
          <VCWalletCardMaskedData
            label="Card Number"
            :disabled="isCanceled"
            :unmasked-data="realCardNumbers?.pan_unmasked || cardNumberMask"
            :mask="cardNumberMask"
          />
        </div>
        <div class="vc-wallet-card-tile__content-row">
          <VCWalletCardMaskedData
            label="Expiration Date"
            :disabled="isCanceled"
            :unmasked-data="expirationDate"
            mask="**/**"
            class="vc-wallet-card-tile__exp-container"
          />
          <VCWalletCardMaskedData
            label="Security Code"
            :disabled="isCanceled"
            :unmasked-data="realCardNumbers?.security_code_unmasked || '***'"
            mask="***"
          />
        </div>
      </div>
      <footer class="vc-wallet-card-tile__footer">
        <div class="vc-wallet-card-tile__footer-brand">
          <img
            :src="mastercardLogo"
            alt="Mastercard logo"
            class="vc-wallet-card-tile__footer-brand-logo"
          />
        </div>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-wallet-card-tile";
$card-border-radius: 30px;

.vc-wallet-card-tile {
  width: 100%;
  padding: 20px;
  min-height: 208px;
  border-radius: $card-border-radius;
  border: 1px solid $color-base-white-50;
  position: relative;
  overflow: hidden;
  background-color: $color-primary-90-light;

  @at-root .theme-dark & {
    border: 1px solid $color-base-black-10;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: blur(10px);
    transform: scale(3);
    border-radius: $card-border-radius;
  }

  &:not(&--canceled)::before {
    background:
      linear-gradient(to bottom right, transparent 0%, $color-black 45%) bottom
        right / 50% 50% no-repeat,
      linear-gradient(to bottom left, transparent 0%, $color-black 45%) bottom
        left / 50% 50% no-repeat,
      linear-gradient(to top left, transparent 0%, $color-black 45%) top left /
        50% 50% no-repeat,
      linear-gradient(to top right, transparent 0%, $color-black 45%) top
        right / 50% 50% no-repeat,
      $color-primary-70-light;

    @at-root .theme-dark & {
      background:
        linear-gradient(to bottom right, transparent 0%, $color-black 45%)
          bottom right / 50% 50% no-repeat,
        linear-gradient(to bottom left, transparent 0%, $color-black 45%) bottom
          left / 50% 50% no-repeat,
        linear-gradient(to top left, transparent 0%, $color-black 45%) top
          left / 50% 50% no-repeat,
        linear-gradient(to top right, transparent 0%, $color-black 45%) top
          right / 50% 50% no-repeat,
        $color-primary-90-light;
      filter: blur(15px) brightness(0.75);
    }
  }

  &--canceled {
    &::before {
      background:
        linear-gradient(
            to bottom right,
            transparent 0%,
            $color-base-black-5-light 45%
          )
          bottom right / 50% 50% no-repeat,
        linear-gradient(
            to bottom left,
            transparent 0%,
            $color-base-black-5-light 45%
          )
          bottom left / 50% 50% no-repeat,
        linear-gradient(
            to top left,
            transparent 0%,
            $color-base-black-5-light 45%
          )
          top left / 50% 50% no-repeat,
        linear-gradient(
            to top right,
            transparent 0%,
            $color-base-black-5-light 45%
          )
          top right / 50% 50% no-repeat,
        $color-primary-50-light;
      filter: blur(5px);

      @at-root .theme-dark & {
        background:
          linear-gradient(
              to bottom right,
              transparent 0%,
              $color-base-black-10-dark 45%
            )
            bottom right / 50% 50% no-repeat,
          linear-gradient(
              to bottom left,
              transparent 0%,
              $color-base-black-10-dark 45%
            )
            bottom left / 50% 50% no-repeat,
          linear-gradient(
              to top left,
              transparent 0%,
              $color-base-black-10-dark 45%
            )
            top left / 50% 50% no-repeat,
          linear-gradient(
              to top right,
              transparent 0%,
              $color-base-black-10-dark 45%
            )
            top right / 50% 50% no-repeat,
          $color-primary-10-dark;
        filter: blur(125px);
      }
    }
  }

  &__wrapper {
    position: relative;
    z-index: 1;
    height: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__name {
    color: $color-base-white-100;
    opacity: 0.3;
    white-space: nowrap;
    max-width: 270px;
    overflow: hidden;
    text-overflow: ellipsis;

    @at-root .theme-dark & {
      color: $color-base-black-100;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    margin-top: 2px;
    gap: 14px;

    &-row {
      display: flex;
      align-items: center;
      gap: 25px;
    }
  }

  &__exp-container {
    min-width: 100px;
  }

  &__footer {
    display: flex;
    align-items: flex-end;

    &-infos {
      display: flex;
    }

    &-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      position: absolute;
      bottom: 0;
      right: 0;

      &-logo {
        max-width: 100%;
        max-height: 100%;
        opacity: 0.2;
        filter: grayscale(100%) brightness(0) invert(1);

        @at-root .theme-dark & {
          opacity: 0.15;
        }
      }
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    background-color: $color-primary-100;
    opacity: 0.1;
    border-radius: 14px;

    &--20 {
      min-height: 20px;
    }

    &--25 {
      min-height: 25px;
    }
  }
}
</style>
