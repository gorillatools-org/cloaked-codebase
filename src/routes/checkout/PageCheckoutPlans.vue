<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import CheckoutCardPlan from "@/features/checkout/CheckoutCardPlan.vue";
import CheckoutBillingToggle from "@/features/checkout/CheckoutBillingToggle.vue";
import CheckoutCardPlanSkeleton from "@/features/checkout/CheckoutCardPlanSkeleton.vue";
import { useDisplay } from "@/composables/useDisplay";
import type { Tier } from "@/features/subscribe/types.ts";
import { computed, inject, onMounted } from "vue";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";
import { posthogCapture } from "@/scripts/posthog";

onMounted(() => posthogCapture("tier_checkout_viewed_plans"));

type PageCheckoutPlanProps = {
  tiers: Tier[];
};

const props = withDefaults(defineProps<PageCheckoutPlanProps>(), {
  tiers: () => [],
});

const checkoutSession = inject(checkoutSessionInjectionKey);

const formattedTiers = computed(() =>
  props.tiers.map((tier, index, allTiers) => {
    const previousTier = allTiers[index - 1];

    if (!previousTier) {
      return tier;
    }

    return {
      ...tier,
      features: [
        {
          code: "everything_previous",
          name: `Everything in ${previousTier.name}`,
          order: -1,
          desc: "Everything previous",
        },
        ...tier.features.filter(
          (feature) =>
            !previousTier.features.find(
              (previousFeature) => previousFeature.code === feature.code
            )
        ),
      ],
    };
  })
);

const { isDesktop } = useDisplay();
</script>

<template>
  <div class="page-checkout-plans">
    <BaseText
      :variant="isDesktop ? 'headline-2-semibold' : 'headline-3-bold'"
      as="h1"
      class="page-checkout-plans__title"
    >
      Build your protection plan
    </BaseText>
    <template v-if="checkoutSession">
      <CheckoutBillingToggle
        v-model="checkoutSession.selectedBilling"
        class="page-checkout-plans__billing"
      />
      <ul
        v-if="formattedTiers.length"
        class="page-checkout-plans__list"
      >
        <li
          v-for="(tier, index) in formattedTiers"
          :key="tier.code"
          class="page-checkout-plans__list-item"
        >
          <CheckoutCardPlan
            :tier="tier"
            :billing="checkoutSession.selectedBilling"
            :recommended="index === 1"
          />
        </li>
      </ul>
      <ul
        v-else
        class="page-checkout-plans__list"
      >
        <li
          v-for="index in 3"
          :key="index"
          class="page-checkout-plans__list-item"
        >
          <CheckoutCardPlanSkeleton
            :features="index === 1 ? 4 : index === 2 ? 6 : 4"
          />
        </li>
      </ul>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.page-checkout-plans {
  display: flex;
  flex-direction: column;

  &__title {
    text-align: center;
  }

  &__billing {
    margin: 16px auto 0;

    @media all and (min-width: $screen-xl) {
      margin: 24px auto 0;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    gap: 8px;
    max-width: 540px;
    margin: 16px auto 0;
    width: 100%;

    @media all and (min-width: $screen-xl) {
      flex-direction: row;
      align-items: flex-start;
      max-width: unset;
      margin: 24px auto;
    }

    &-item {
      flex: 1;
    }
  }
}
</style>
