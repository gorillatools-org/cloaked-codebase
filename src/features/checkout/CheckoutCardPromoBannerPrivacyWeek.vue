<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { PH_FEATURE_FLAG_CHECKOUT_PRIVACY_WEEK_BANNER_COPY } from "@/scripts/posthogEvents";
import { computed, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog";

const { featureFlagPayload, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_CHECKOUT_PRIVACY_WEEK_BANNER_COPY
);

onMounted(() => {
  posthogCapture("user_viewed_checkout_privacy_week_banner");
});

const copy = computed(() => {
  if (
    featureFlagPayload.value &&
    "title" in featureFlagPayload.value &&
    "description" in featureFlagPayload.value
  ) {
    return featureFlagPayload.value as { title: string; description: string };
  }

  return {
    title: "Limited Time Privacy Week Offer!",
    description: "Save 50% on annual plans",
  };
});
</script>

<template>
  <div
    v-if="hasLoadedFeatureFlag && copy"
    class="checkout-card-promo-banner-privacy-week"
  >
    <InlineSvg
      name="tick-circle-star-green"
      class="checkout-card-promo-banner-privacy-week__icon"
    />
    <div class="checkout-card-promo-banner-privacy-week__content">
      <BaseText
        as="h2"
        variant="headline-5-bold"
        class="checkout-card-promo-banner-privacy-week__content-copy"
      >
        {{ copy.title }}
      </BaseText>
      <BaseText
        as="p"
        variant="body-3-regular"
        class="checkout-card-promo-banner-privacy-week__content-copy"
      >
        {{ copy.description }}
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout-card-promo-banner-privacy-week {
  border: 1px solid $color-status-success;
  padding: 12px;
  background: $color-overlay-status-positive-10-light;
  border-radius: 12px;
  display: flex;
  gap: 8px;

  &__icon {
    width: 32px;
    flex-shrink: 0;
  }

  &__content {
    &-copy {
      color: $color-base-black-100;
    }
  }
}
</style>
