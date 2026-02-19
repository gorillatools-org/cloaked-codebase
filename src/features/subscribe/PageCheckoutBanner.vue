<script setup>
import { computed } from "vue";
import store from "@/store";
import { toValue } from "@vueuse/core/index";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";

const { featureFlag, featureFlagPayload } = usePostHogFeatureFlag(
  "cloaked-checkout-banner"
);

const audience = computed(() => toValue(featureFlagPayload)?.audience ?? "all");

const variant = computed(
  () => toValue(featureFlagPayload)?.variant ?? "danger"
);

const message = computed(
  () =>
    toValue(featureFlagPayload)?.message ??
    "We're experiencing issues with Stripe payments. Please try PayPal instead. If it still doesn't work, email support@cloaked.com"
);

const isVisible = computed(() => {
  if (toValue(featureFlag) !== true) {
    return false;
  }

  if (toValue(audience) === "paid") {
    return (
      store.getters["settings/isSubscribed"] ||
      store.getters["settings/isLegacy"]
    );
  }

  return true;
});
</script>

<template>
  <AtomTopBanner
    v-if="isVisible"
    :variant="variant"
    class="page-checkout-banner"
  >
    {{ message }}
  </AtomTopBanner>
</template>

<style lang="scss" scoped>
.page-checkout-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100000 !important;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
