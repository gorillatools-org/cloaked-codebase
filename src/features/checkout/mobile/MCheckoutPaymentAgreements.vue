<script setup lang="ts">
import { computed, inject } from "vue";
import CheckoutPoaAgreement from "@/features/checkout/CheckoutPoaAgreement.vue";
import CheckoutReceipt from "@/features/checkout/CheckoutReceipt.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_CHECKOUT_POA_AGREEMENT } from "@/scripts/posthogEvents";
import { headlessAuthInjectionKey } from "@/features/checkout/injectionKeys.ts";

const headlessAuth = inject(headlessAuthInjectionKey);

const {
  featureFlag: poaAgreementFlag,
  hasLoadedFeatureFlag: poaAgreementFlagLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_POA_AGREEMENT);

const showPoaAgreement = computed(
  () =>
    poaAgreementFlagLoaded.value &&
    (poaAgreementFlag.value === "poa-agreement" ||
      poaAgreementFlag.value === "permission-to-scrub-data" ||
      poaAgreementFlag.value === "permission-to-remove-data")
);
</script>

<template>
  <div class="mobile-payment-agreements">
    <CheckoutPoaAgreement
      v-if="showPoaAgreement"
      :poa-agreement-flag="poaAgreementFlag"
      size="md"
    />
    <CheckoutReceipt
      v-if="headlessAuth?.headlessUser.value"
      size="md"
    />
  </div>
</template>

<style lang="scss" scoped>
.mobile-payment-agreements {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
