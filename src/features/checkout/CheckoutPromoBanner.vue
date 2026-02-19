<script setup lang="ts">
import CheckoutCardPromoBannerPrivacyWeek from "@/features/checkout/CheckoutCardPromoBannerPrivacyWeek.vue";
import { plansExperimentInjectionKey } from "./injectionKeys";
import { computed, inject, type Component } from "vue";

const plansExperiment = inject(plansExperimentInjectionKey);

const bannerComponent = computed<Component | null>(() => {
  if (plansExperiment?.experimentType?.value === "discounted-annual-plans") {
    return CheckoutCardPromoBannerPrivacyWeek;
  }

  return null;
});
</script>

<template>
  <div
    v-if="bannerComponent"
    class="checkout-promo-banner"
  >
    <component :is="bannerComponent" />
  </div>
</template>
