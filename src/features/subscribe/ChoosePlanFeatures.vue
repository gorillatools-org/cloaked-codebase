<script setup>
import { ref, computed } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import ChoosePlanFeaturesItem from "@/features/subscribe/ChoosePlanFeaturesItem.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import CheckoutCard from "@/features/subscribe/components/CheckoutCard.vue";
import BaseText from "@/library/BaseText.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT } from "@/scripts/posthogEvents";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const vpnCustomer = computed(
  () =>
    hasLoadedFeatureFlag.value && featureFlag.value === "checkout-feature-vpn"
);

const isExpanded = ref(false);

const vpnFeature = {
  title: "Mobile VPN",
  detail:
    "Mask your IP address for complete privacy & safety when browsing. Connect to servers in 68 countries to access region-restricted content.",
};

const baseFeatures = [
  {
    title: "Data removal & dark web monitoring",
    detail:
      "Remove your personal information from 130+ data brokers + realtime dark web alerts for your sensitive info.",
  },
  {
    title: "Unlimited aliases & password manager",
    detail:
      "Generate and manage unlimited aliases - email addresses, phone numbers, passwords and usernames to protect your personal information from exposure.",
  },
  {
    title: "Call Guard instant spam protection",
    detail: "Block scam calls and robocalls instantly.",
  },
  {
    title: "$1 million identity theft insurance",
    detail:
      "Up to $1,000,000 in comprehensive insurance on your digital identity. (🇺🇸 only)",
  },
  {
    title: "Call, text and email in one place",
    detail:
      "Every alias comes with a full-featured inbox that you can use inside of Cloaked or forward to your personal one.",
  },
  {
    title: "Custom password manager fields",
    detail:
      "Encrypt more than just login details to your identities with custom fields.",
  },
  {
    title: "2FA login support",
    detail:
      "Replace your authenticator apps with embedded time-based one time passcode support right in Cloaked. Scan with your camera or add using secret keys.",
  },
  {
    title: "Identity sharing",
    detail:
      "Send time-based, password-protected links to identity information for easy and secure sharing.",
  },
  {
    title: "One-on-one customer support",
    detail: "Cloaked support is one click away at any time ready to help you.",
  },
];

const features = computed(() => {
  if (vpnCustomer.value) {
    return [vpnFeature, ...baseFeatures];
  }
  return baseFeatures;
});
</script>

<template>
  <div class="choose-plan-features">
    <CheckoutTitle>Features included</CheckoutTitle>
    <CheckoutCard
      class="choose-plan-features__card"
      rounding="sm"
    >
      <ul
        class="choose-plan-features__list"
        :class="{ 'choose-plan-features__list--expanded': isExpanded }"
      >
        <ChoosePlanFeaturesItem
          v-for="feature in features"
          :key="feature.title"
          :feature="feature"
          class="choose-plan-features__list-item"
        />
      </ul>
      <template v-if="!isExpanded">
        <CheckoutDivider class="choose-plan-features__divider" />
        <BaseText
          variant="body-2-semibold"
          class="choose-plan-features__show-all"
          @click="isExpanded = true"
        >
          <InlineSvg
            name="plus"
            class="choose-plan-features__show-all-expand"
          />
          See all features
        </BaseText>
      </template>
    </CheckoutCard>
  </div>
</template>

<style scoped lang="scss">
.choose-plan-features {
  &__card {
    margin-top: 24px;
    row-gap: 4px;
  }

  &__list-item {
    &:nth-child(n + 5) {
      display: none;

      @at-root .choose-plan-features__list--expanded & {
        display: grid;
      }
    }
  }

  & &__divider {
    margin: 8px 0;
  }

  &__show-all {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    cursor: pointer;
    padding: 4px 0;

    &:hover {
      opacity: 0.8;
    }

    &-expand {
      width: 18px;
    }
  }
}
</style>
