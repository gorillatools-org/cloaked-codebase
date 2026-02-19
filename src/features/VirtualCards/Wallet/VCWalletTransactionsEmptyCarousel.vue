<script setup lang="ts">
import { ref } from "vue";
import VCBaseCarousel from "../base/VCBaseCarousel.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import type { BaseIconName } from "@/library/baseIconTypes.ts";
import { posthogCapture } from "@/scripts/posthog.js";

type PromotionSlide = {
  icon: BaseIconName;
  iconColor: "safe-zone-blue" | "safe-zone-green" | "success-green";
  title: string;
  description: string;
};

const emit = defineEmits<{
  (e: "get-started"): void;
}>();

const currentSlide = ref(0);

const promotionSlides: PromotionSlide[] = [
  {
    icon: "bolt-filled",
    iconColor: "safe-zone-blue",
    title: "Secure an online purchase",
    description:
      "Use a virtual card for something you’ve been wanting to buy, safely and privately.",
  },
  {
    icon: "shield-tick-filled",
    iconColor: "safe-zone-blue",
    title: "Protect a subscription",
    description:
      "Create a virtual card for one of your monthly streaming services, easy to manage and cancel anytime.",
  },
];

const handleBulletClick = (index: number) => {
  posthogCapture("pay_wallet_transactions_carousel_bullet_tapped", {
    slide_number: index + 1,
  });
};

const handleGetStarted = () => {
  posthogCapture("pay_wallet_transactions_carousel_get_started_tapped", {
    slide_number: currentSlide.value + 1,
  });
  emit("get-started");
};
</script>

<template>
  <div class="vc-wallet-transactions-empty-carousel">
    <VCBaseCarousel
      v-model:current-slide="currentSlide"
      :total-slides="promotionSlides.length"
      :auto-play="true"
      :auto-play-interval="10000"
      :loop="true"
      :show-bullets="true"
      @bullet-click="handleBulletClick"
    >
      <template #default="{ currentSlide: slideIndex }">
        <div class="vc-wallet-transactions-empty-carousel__slide">
          <div class="vc-wallet-transactions-empty-carousel__content">
            <BaseMedallion
              :icon="promotionSlides[slideIndex].icon"
              :color="promotionSlides[slideIndex].iconColor"
              size="lg"
              class="vc-wallet-transactions-empty-carousel__medallion"
            />
            <BaseText
              variant="headline-2-semibold"
              class="vc-wallet-transactions-empty-carousel__title"
            >
              {{ promotionSlides[slideIndex].title }}
            </BaseText>
            <BaseText
              variant="headline-4-medium"
              class="vc-wallet-transactions-empty-carousel__description"
            >
              {{ promotionSlides[slideIndex].description }}
            </BaseText>
            <Button
              type="primary"
              size="lg"
              class="vc-wallet-transactions-empty-carousel__button"
              @click="handleGetStarted"
            >
              Get Started
            </Button>
          </div>
        </div>
      </template>
    </VCBaseCarousel>
  </div>
</template>

<style lang="scss" scoped>
.vc-wallet-transactions-empty-carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;

  &__slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 280px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    max-width: 430px;
    text-align: center;
    width: 100%;
  }

  &__medallion {
    margin-bottom: 0;
  }

  &__button {
    margin-top: 6px;
    font-size: 14px;
    width: 120px;
  }
}
</style>
