<script setup lang="ts">
import { computed, inject, toValue } from "vue";
import BaseText from "@/library/BaseText.vue";
import CheckoutGuarantee from "@/features/checkout/CheckoutGuarantee.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import CheckoutTerms from "@/features/checkout/CheckoutTerms.vue";
import CheckoutCta from "@/features/checkout/CheckoutCta.vue";
import CheckoutSelectPlan from "@/features/checkout/CheckoutSelectPlan.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import { formattedPrice } from "@/features/subscribe/composables/utils.ts";
import { useTierPrice } from "@/features/checkout/useTierPrice.ts";
import { useSavings } from "@/features/subscribe/composables/useSavings.ts";
import type { Tier } from "@/features/subscribe/types.ts";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";

type CheckoutCardReviewProps = {
  tiers: Tier[];
};

const props = defineProps<CheckoutCardReviewProps>();

defineEmits(["complete"]);

const checkoutSession = inject(checkoutSessionInjectionKey);

const isDisabled = computed(
  () => !!checkoutSession?.status || !!checkoutSession?.isPaid
);

const status = computed(() => checkoutSession?.status ?? null);

const billing = computed(
  () =>
    checkoutSession?.subscribedBilling ??
    checkoutSession?.selectedBilling ??
    null
);

const tier = computed<Tier | null>(() => {
  return (
    props.tiers.find((tier) => tier.code === checkoutSession?.subscribedTier) ??
    props.tiers.find((tier) => tier.code === checkoutSession?.selectedTier) ??
    null
  );
});

const yearlyPerYearPrice = useTierPrice(tier, "yearly", "per-year");
const monthlyPerMonthPrice = useTierPrice(tier, "monthly", "per-month");
const monthlyPerYearPrice = useTierPrice(tier, "monthly", "per-year");

const annualDiscount = computed(() =>
  toValue(billing) === "yearly"
    ? (monthlyPerYearPrice.value ?? 0) - (yearlyPerYearPrice.value ?? 0)
    : 0
);

const savings = useSavings(yearlyPerYearPrice, monthlyPerYearPrice);

const annualPrice = computed(() =>
  toValue(billing) === "yearly"
    ? yearlyPerYearPrice.value
    : monthlyPerYearPrice.value
);

const price = computed(() =>
  toValue(billing) === "yearly"
    ? yearlyPerYearPrice.value
    : monthlyPerMonthPrice.value
);
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    class="checkout-card-review"
  >
    <CheckoutTitle>Review your plan</CheckoutTitle>
    <template v-if="tier && checkoutSession">
      <CheckoutSelectPlan
        :tiers="tiers"
        :is-disabled="isDisabled"
        class="checkout-card-review__tier"
      />
      <template v-if="annualDiscount">
        <div class="checkout-card-review__row">
          <BaseText variant="body-3-regular">Billed annually</BaseText>
          <BaseText
            variant="body-3-regular"
            class="checkout-card-review__discount"
          >
            {{ formattedPrice(monthlyPerYearPrice) }}
          </BaseText>
        </div>
        <div class="checkout-card-review__row">
          <BaseText variant="body-3-regular">Annual discount</BaseText>
          <BaseText variant="body-3-regular">
            -{{ formattedPrice(annualDiscount) }}
            <template v-if="false">({{ savings }}% off)</template>
          </BaseText>
        </div>
      </template>
      <div
        v-else
        class="checkout-card-review__row"
      >
        <BaseText variant="body-3-regular">Billed annually</BaseText>
        <BaseText variant="body-3-regular">
          {{ formattedPrice(annualPrice) }}
        </BaseText>
      </div>
      <CheckoutDivider class="checkout-card-review__divider" />
      <div class="checkout-card-review__row">
        <BaseText variant="body-3-regular">Due today</BaseText>
        <BaseText variant="headline-3-bold">
          {{ formattedPrice(price) }}
        </BaseText>
      </div>
    </template>
    <CheckoutCta
      :disabled="!!status || !tier"
      :loading="!!status"
      class="checkout-card-review__cta"
      primary
      @click="$emit('complete')"
    >
      <template v-if="status === 'signing-up'">Creating account</template>
      <template v-else-if="status === 'processing-payment'">
        Processing payment
      </template>
      <template v-else-if="status === 'signing-in'">Signing in</template>
      <template v-else-if="checkoutSession?.isPaid">Complete signup</template>
      <template v-else>Complete purchase</template>
    </CheckoutCta>
    <CheckoutGuarantee class="checkout-card-review__guarantee" />
    <CheckoutTerms class="checkout-card-review__terms" />
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-review {
  &__tier {
    margin: 16px 0 24px;
  }

  &__cta {
    margin-top: 24px;
  }

  &__guarantee {
    margin-top: 12px;
  }

  &__terms {
    margin-top: 24px;
  }

  &__divider {
    margin: 16px 0;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  &__discount {
    text-decoration: line-through;
  }
}
</style>
