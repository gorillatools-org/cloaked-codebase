<script setup lang="ts">
import mastercardLogo from "@/assets/icons/mastercard.svg?url";
</script>

<template>
  <div class="vc-wallet-card-skeleton-tile">
    <header class="vc-wallet-card-skeleton-tile__header">
      <div class="vc-wallet-card-skeleton-tile__header-infos">
        <div
          style="width: 113px"
          class="vc-wallet-card-skeleton-tile__placeholder vc-wallet-card-skeleton-tile__placeholder--20 skeleton-shimmer"
        ></div>
      </div>
    </header>
    <div class="vc-wallet-card-skeleton-tile__content">
      <div
        style="width: 85px"
        class="vc-wallet-card-skeleton-tile__placeholder vc-wallet-card-skeleton-tile__placeholder--17 skeleton-shimmer"
      ></div>
      <div
        style="width: 165px"
        class="vc-wallet-card-skeleton-tile__placeholder vc-wallet-card-skeleton-tile__placeholder--20 skeleton-shimmer"
      ></div>
    </div>
    <footer class="vc-wallet-card-skeleton-tile__footer">
      <div class="vc-wallet-card-skeleton-tile__footer-infos">
        <div class="vc-wallet-card-skeleton-tile__footer-row">
          <div
            style="width: 85px"
            class="vc-wallet-card-skeleton-tile__placeholder vc-wallet-card-skeleton-tile__placeholder--17 skeleton-shimmer"
          ></div>
          <div
            style="width: 55px"
            class="vc-wallet-card-skeleton-tile__placeholder vc-wallet-card-skeleton-tile__placeholder--20 skeleton-shimmer"
          ></div>
        </div>
        <div class="vc-wallet-card-skeleton-tile__footer-row">
          <div
            style="width: 75px"
            class="vc-wallet-card-skeleton-tile__placeholder vc-wallet-card-skeleton-tile__placeholder--17 skeleton-shimmer"
          ></div>
          <div
            style="width: 65px"
            class="vc-wallet-card-skeleton-tile__placeholder vc-wallet-card-skeleton-tile__placeholder--20 skeleton-shimmer"
          ></div>
        </div>
      </div>
      <div class="vc-wallet-card-skeleton-tile__footer-brand">
        <img
          :src="mastercardLogo"
          alt="Mastercard logo"
          class="vc-wallet-card-skeleton-tile__footer-brand-logo"
        />
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
@import "@/features/VirtualCards/assets/skeleton";

.vc-wallet-card-skeleton-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  height: 205px;
  border-radius: 30px;
  position: relative;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: radial-gradient(
      157.8% 94.4% at 54.96% 48%,
      black 34.38%,
      black 100%
    );
    opacity: 0.2;
    transition: opacity 0.2s ease-in-out;

    @at-root .theme-dark & {
      background: radial-gradient(
        157.8% 94.4% at 54.96% 48%,
        white 34.38%,
        white 100%
      );
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 22px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-grow: 1;
    margin-top: 30px;

    &-infos {
      display: flex;
      height: 100%;
      gap: 64px;
      padding-bottom: 10px;
      flex-grow: 1;
    }

    &-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    &-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;

      &-logo {
        max-width: 100%;
        max-height: 100%;
        opacity: 0.3;
        filter: grayscale(100%) brightness(0) invert(1);

        @at-root .theme-dark & {
          opacity: 0.1;
        }
      }
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    border-radius: 14px;

    &--17 {
      height: 17px;
    }

    &--20 {
      height: 20px;
    }
  }
}
</style>
