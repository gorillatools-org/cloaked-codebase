<script setup lang="ts">
import { computed, inject } from "vue";
import BaseSelect from "@/library/BaseSelect.vue";
import { formattedPrice } from "@/features/subscribe/composables/utils.ts";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";
import type { Tier, TierBilling } from "@/features/subscribe/types.ts";
import { posthogCapture } from "@/scripts/posthog";

type CheckoutSelectPlanProps = {
  tiers: Tier[];
  isDisabled: boolean;
};

const props = defineProps<CheckoutSelectPlanProps>();

const checkoutSession = inject(checkoutSessionInjectionKey);

const modelValue = computed(() => {
  if (checkoutSession?.isPaid) {
    return `${checkoutSession.subscribedTier}/${checkoutSession.subscribedBilling}`;
  }

  if (checkoutSession) {
    return `${checkoutSession.selectedTier}/${checkoutSession.selectedBilling}`;
  }

  return "";
});

const onSelectTier = (value: string) => {
  if (!checkoutSession) {
    return;
  }

  const [tier, billing] = value.split("/");

  if (tier && billing) {
    checkoutSession.selectedTier = tier;
    checkoutSession.selectedBilling = billing as TierBilling;

    posthogCapture("tier_checkout_plan_changed", { tier, billing });
  }
};

type TierOption = { label: string; value: string };

const billingFormat = {
  yearly: { label: "Annual", short: "yr" },
  monthly: { label: "Monthly", short: "mo" },
} as const;

const options = computed<TierOption[]>(() =>
  props.tiers.flatMap((tier) =>
    (["yearly", "monthly"] as const).map((billing: TierBilling) => {
      const formattedBilling = billingFormat[billing];
      const price = formattedPrice(tier.price[billing] / 100);

      return {
        label: `${tier.name} (${formattedBilling.label}) • ${price}/${formattedBilling.short}`,
        value: `${tier.code}/${billing}`,
      };
    })
  )
);
</script>

<template>
  <BaseSelect
    v-if="checkoutSession"
    :model-value="modelValue"
    title="Review your plan"
    placeholder="Select a plan"
    :options="options"
    class="checkout-select-plan"
    :disabled="isDisabled"
    @update:model-value="onSelectTier"
  />
</template>

<style scoped lang="scss">
.checkout-select-plan {
  :deep(.base-select__title) {
    display: none;
  }

  :deep(.base-select__select) {
    height: 65px;
  }
}
</style>
