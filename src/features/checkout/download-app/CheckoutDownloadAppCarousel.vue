<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="checkout-download-app-carousel">
    <div class="checkout-download-app-carousel__slides">
      <img
        src="@/assets/images/download-app-carousel-exposures.png"
        class="checkout-download-app-carousel__image"
        width="563"
        height="1059"
        alt="Cloaked Exposures"
      />
      <img
        src="@/assets/images/download-app-carousel-call-guard.png"
        class="checkout-download-app-carousel__image"
        width="563"
        height="1059"
        alt="Cloaked Call Guard"
      />
      <img
        src="@/assets/images/download-app-carousel-automation.png"
        class="checkout-download-app-carousel__image"
        width="563"
        height="1059"
        alt="Cloaked Automation"
      />
      <img
        src="@/assets/images/download-app-carousel-health.png"
        class="checkout-download-app-carousel__image"
        width="563"
        height="1059"
        alt="Cloaked Health"
      />
    </div>
    <InlineSvg
      name="logo-app"
      class="checkout-download-app-carousel__logo"
    />
  </div>
</template>

<style lang="scss" scoped>
.checkout-download-app-carousel {
  position: relative;
  margin: 16px 0;

  &__slides {
    height: 240px;
    overflow: auto hidden;
    display: flex;
    align-items: flex-start;
    gap: 32px;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__image {
    width: 80%;
    flex-shrink: 0;
    scroll-snap-align: center;

    &:first-child {
      margin-left: 32px;
    }

    &:last-child {
      margin-right: 32px;
    }
  }

  &__logo {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate3d(-50%, 50%, 0);
    width: 60px;
    height: 60px;
  }
}
</style>
