<script setup lang="ts">
import { ref } from "vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import CheckoutFeature from "@/features/checkout/CheckoutFeature.vue";

const isExpanded = ref<boolean>(false);

const features = [
  {
    title: "Mobile VPN",
    detail:
      "Mask your IP address for complete privacy & safety when browsing. Connect to servers in 68 countries to access region-restricted content.",
  },
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
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    class="checkout-card-features"
  >
    <CheckoutTitle>Features included</CheckoutTitle>
    <ul
      class="checkout-card-features__list"
      :class="{ 'checkout-card-features__list--expanded': isExpanded }"
    >
      <CheckoutFeature
        v-for="feature in features"
        :key="feature.title"
        :feature="feature"
        class="checkout-card-features__list-item"
      />
    </ul>
    <template v-if="!isExpanded">
      <CheckoutDivider class="checkout-card-features__divider" />
      <BaseText
        variant="body-2-semibold"
        class="checkout-card-features__show-all"
        @click="isExpanded = true"
      >
        <BaseIcon
          name="plus"
          class="checkout-card-features__show-all-expand"
        />
        See all features
      </BaseText>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.checkout-card-features {
  &__list {
    margin-top: 16px;

    &-item {
      &:nth-child(n + 5) {
        display: none;

        @at-root .checkout-card-features__list--expanded & {
          display: grid;
        }
      }
    }
  }

  & &__divider {
    margin: 16px 0;
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
