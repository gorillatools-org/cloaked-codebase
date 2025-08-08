<script setup>
import { computed, ref } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import ChoosePlanFeaturesItem from "@/features/subscribe/ChoosePlanFeaturesItem.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import BaseText from "@/library/BaseText.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";

const isExpanded = ref(false);

const { featureFlag: hasIdentityMonitoring, hasLoadedFeatureFlag } =
  usePostHogFeatureFlag("identity-monitoring-enabled");

const features = computed(() =>
  hasIdentityMonitoring.value
    ? [
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
          detail:
            "Cloaked support is one click away at any time ready to help you.",
        },
      ]
    : [
        {
          title: "Data removal",
          detail:
            "Remove your personal information from data brokers and the dark web with 24/7 monitoring with new scans every 30 days.",
        },
        {
          title: "Unlimited aliases",
          detail:
            "Generate unlimited email addresses, phone numbers*, passwords and usernames to protect your real information from exposure.",
        },
        {
          title: "Call, text and email in one place",
          detail:
            "Every alias comes with a full-featured inbox that you can use inside of Cloaked or forward to your personal one.",
        },
        {
          title: "Password manager",
          detail:
            "Store all of your logins & identities together in one place. Autofill from the web on desktop (chrome extension required) and mobile.",
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
          title: "ID Theft Protection",
          detail:
            "Up to $1,000,000 in comprehensive insurance on your digital identity. (🇺🇸 only)",
        },
        {
          title: "One-on-one customer support",
          detail:
            "Cloaked support is one click away at any time ready to help you.",
        },
      ]
);
</script>

<template>
  <div
    v-if="hasLoadedFeatureFlag"
    class="choose-plan-features"
  >
    <CheckoutTitle>Features included</CheckoutTitle>
    <div class="choose-plan-features__card">
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.choose-plan-features {
  &__card {
    margin-top: 24px;
    padding: 16px;
    border-radius: 8px;
    background: rgb(255 255 255 / 6%);
    background-blend-mode: overlay;
    backdrop-filter: blur(17px);
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
