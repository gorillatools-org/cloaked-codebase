<script setup lang="ts">
import { computed, inject, toRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";
import { usePlans } from "@/features/checkout/usePlans.ts";
import { useCompareAtPrice } from "@/features/checkout/useCompareAtPrice.ts";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.ts";
import { useSavings } from "@/features/subscribe/composables/useSavings.ts";
import { formattedPrice } from "@/features/subscribe/composables/utils.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type MCheckoutBillingProps = {
  plans: Plan[];
  loading?: boolean;
};

const emit = defineEmits<{
  (e: "select", plan: Plan): void;
}>();

const props = withDefaults(defineProps<MCheckoutBillingProps>(), {
  plans: () => [],
  loading: false,
});

const checkoutSession = inject(checkoutSessionInjectionKey);

const { stripePlans } = usePlans(toRef(() => props.plans));

const annualPlan = computed<Plan | null>(
  () =>
    stripePlans.value.find(
      (plan) => plan.recurring_interval === "annually" && plan.max_members === 1
    ) ?? null
);

const monthlyPlan = computed<Plan | null>(
  () =>
    stripePlans.value.find(
      (plan) => plan.recurring_interval === "monthly" && plan.max_members === 1
    ) ?? null
);

const annualTotalPrice = usePlanPrice(annualPlan);
const annualMonthlyPrice = usePlanPrice(annualPlan, "monthly");
const monthlyMonthlyPrice = usePlanPrice(monthlyPlan, "monthly");

const compareAtPrice = useCompareAtPrice(toRef(() => props.plans || []));
const annualSavings = useSavings(annualMonthlyPrice, compareAtPrice);

const planCards = computed(() =>
  [annualPlan.value, monthlyPlan.value]
    .filter((plan) => plan !== null)
    .map((plan) => {
      const isAnnual = plan.recurring_interval === "annually";
      const price = isAnnual ? annualMonthlyPrice : monthlyMonthlyPrice;
      const formatted = formattedPrice(price);

      return {
        plan,
        isAnnual,
        label: isAnnual ? "Annual Plan" : "Monthly Plan",
        subtitle: isAnnual
          ? `Billed at ${formattedPrice(annualTotalPrice)}/yr`
          : "Billed monthly",
        priceFormatted: `${formatted}/mo`,
        savings:
          isAnnual && annualSavings.value && annualSavings.value > 0
            ? annualSavings.value
            : null,
      };
    })
);
</script>

<template>
  <div class="checkout-plans">
    <!-- Skeleton state -->
    <template v-if="props.loading">
      <div
        v-for="i in 2"
        :key="`skeleton-${i}`"
        class="checkout-plans__card"
      >
        <div class="checkout-plans__card-wrapper">
          <div class="checkout-plans__details">
            <div
              class="checkout-plans__skeleton-line checkout-plans__skeleton-line--title"
            />
            <div
              class="checkout-plans__skeleton-line checkout-plans__skeleton-line--subtitle"
            />
          </div>
          <div class="checkout-plans__price">
            <div
              class="checkout-plans__skeleton-line checkout-plans__skeleton-line--price"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Loaded state -->
    <template v-else>
      <div
        v-for="card in planCards"
        :key="card.plan.product_id"
        :class="{
          'checkout-plans__card--highlighted':
            checkoutSession?.billing === card.plan.recurring_interval,
        }"
        class="checkout-plans__card checkout-plans__card--loaded"
        @click="emit('select', card.plan)"
      >
        <div class="checkout-plans__card-wrapper">
          <div
            v-if="card.savings"
            class="checkout-plans__badge"
          >
            <BaseText variant="caption-1-emphasized">
              Save {{ card.savings }}%
            </BaseText>
          </div>
          <div class="checkout-plans__details">
            <BaseText
              variant="callout-emphasized"
              as="p"
            >
              {{ card.label }}
            </BaseText>
            <BaseText
              variant="caption-1-regular"
              as="p"
              class="checkout-plans__subtitle"
            >
              {{ card.subtitle }}
            </BaseText>
          </div>
          <div class="checkout-plans__price">
            <BaseText variant="title-3-emphasized">
              {{ card.priceFormatted }}
            </BaseText>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.checkout-plans {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__card {
    min-height: 75px;

    &--loaded {
      animation: fade-in 0.15s ease-out both;
    }

    &-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-radius: 16px;
      background-color: $color-surface-l1;
      border: 1px solid $color-base-black-10;

      // Inset shadow placeholder so the transition to the highlighted state
      // animates smoothly (box-shadow needs matching layer count).
      box-shadow: inset 0 0 0 0 transparent;

      .checkout-plans__card--highlighted & {
        border-color: $color-neutral-1000;

        // Inset shadow fakes a 2px border without causing layout shift
        box-shadow:
          inset 0 0 0 1px $color-neutral-1000,
          0 0 4px rgb(0 0 0 / 8%),
          0 8px 8px rgb(0 0 0 / 10%);
      }
    }
  }

  &__badge {
    position: absolute;
    top: -14px;
    right: 16px;
    background-color: $color-status-positive;
    color: $color-neutral-0;
    padding: 0 8px;
    border-radius: 1000px;
  }

  &__details {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 2px;
    min-width: 0;
  }

  &__subtitle {
    color: $color-neutral-550;
  }

  &__price {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__skeleton-line {
    border-radius: 6px;

    @include base-skeleton($color-primary-10, 0.5, #fff, 0.5);

    @at-root .theme-dark & {
      @include base-skeleton($color-primary-10, 0.7, #fff, 0.08);
    }

    &--title {
      height: 21px;
      width: 140px;
    }

    &--subtitle {
      height: 16px;
      width: 100px;
    }

    &--price {
      height: 25px;
      width: 72px;
    }
  }
}

@keyframes fade-in {
  from {
    opacity: 0.3;
    filter: blur(3px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}
</style>
