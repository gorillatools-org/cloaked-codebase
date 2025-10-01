<script setup lang="ts">
import { toRef } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import type { Tier, TierBilling } from "@/features/subscribe/types.ts";
import CheckoutCta from "@/features/checkout/CheckoutCta.vue";
import { useTierPrice } from "@/features/checkout/useTierPrice.ts";
import { formattedPrice } from "@/features/subscribe/composables/utils.ts";
import { useDisplay } from "@/composables/useDisplay";
import { useRoute } from "vue-router";
import { posthogCapture } from "@/scripts/posthog";

type CheckoutPlanCardProps = {
  tier: Tier;
  billing: TierBilling;
  recommended?: boolean;
};

const props = withDefaults(defineProps<CheckoutPlanCardProps>(), {
  recommended: false,
});

const tier = toRef(() => props.tier);
const billing = toRef(() => props.billing);

const yearlyPerMonthPrice = useTierPrice(tier, "yearly", "per-month");
const monthlyPerMonthPrice = useTierPrice(tier, "monthly", "per-month");

const { isDesktop } = useDisplay();

const route = useRoute();

const onPlanSelected = (tier: string) =>
  posthogCapture("tier_checkout_plan_selected", { tier });
</script>

<template>
  <BaseSheet
    spacing-y="lg"
    spacing-x="md"
    elevation="md"
    class="checkout-card-plan"
  >
    <div class="checkout-card-plan__title">
      <BaseText variant="headline-5-bold">
        {{ tier.name }}
      </BaseText>
      <BaseText
        v-if="recommended"
        variant="caption-bold"
        class="checkout-card-plan__recommended"
      >
        Recommended
      </BaseText>
    </div>
    <div class="checkout-card-plan__price">
      <BaseText
        :variant="isDesktop ? 'headline-2-semibold' : 'headline-1-medium'"
        class="checkout-card-plan__price-amount"
      >
        <BaseText
          variant="body-3-semibold"
          class="checkout-card-plan__price-currency"
        >
          $
        </BaseText>
        {{
          billing === "yearly"
            ? formattedPrice(yearlyPerMonthPrice, "")
            : formattedPrice(monthlyPerMonthPrice, "")
        }}
      </BaseText>
      <BaseText
        variant="body-small-semibold"
        class="checkout-card-plan__price-billing"
      >
        <BaseText
          v-if="billing === 'yearly'"
          variant="body-small-semibold"
          class="checkout-card-plan__price-discount"
        >
          {{ formattedPrice(monthlyPerMonthPrice) }}
          <br />
        </BaseText>
        per month
        <span
          v-if="billing === 'yearly'"
          class="checkout-card-plan__price-annual"
        >
          (billed {{ billing === "yearly" ? "annually" : "monthly" }})
        </span>
      </BaseText>
    </div>
    <router-link
      :to="{
        name: 'CheckoutPayment',
        params: { tier: tier.code, billing: billing },
        query: { ...route.query },
      }"
      @click="onPlanSelected(tier.code)"
    >
      <CheckoutCta
        class="checkout-card-plan__select"
        :primary="recommended"
      >
        Select {{ tier.name }}
      </CheckoutCta>
    </router-link>
    <ul class="checkout-card-plan__features">
      <li
        v-for="feature in tier.features"
        :key="feature.code"
        class="checkout-card-plan__features-item"
      >
        <BaseIcon name="check" />
        <BaseText variant="body-3-semibold">
          {{ feature.name }}
        </BaseText>
      </li>
    </ul>
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-plan {
  display: flex;
  flex-direction: column;

  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 26px;
  }

  &__price {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;

    @media all and (min-width: $screen-xl) {
      margin-top: 8px;
    }

    &-currency {
      @media all and (min-width: $screen-xl) {
        margin-top: 4px;
      }
    }

    &-amount {
      display: flex;
      align-items: center;
      gap: 2px;

      @media all and (min-width: $screen-xl) {
        align-items: start;
      }
    }

    &-billing {
      color: $color-primary-50;
    }

    &-discount {
      text-decoration: line-through;
    }

    &-annual {
      text-wrap: nowrap;
    }
  }

  &__recommended {
    padding: 5px 10px;
    background-color: $color-safe-zone-blue;
    color: $color-primary-100-dark;
    border-radius: 100px;
  }

  &__select {
    margin-top: 24px;
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;

    @media all and (min-width: $screen-xl) {
      margin-top: 32px;
    }

    &-item {
      display: flex;
      align-items: start;
      gap: 8px;
      color: $color-primary-70;

      & > *:first-child {
        flex-shrink: 0;
      }
    }
  }

  &__divider {
    margin-top: 16px;
  }
}
</style>
