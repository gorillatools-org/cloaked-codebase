<!-- eslint-disable prettier/prettier -->
<script lang="ts" setup>
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import SubscriptionPlanCard from "@/features/Subscription/SubscriptionPlanCard.vue";
import SubscriptionBillingDetails from "@/features/Subscription/Billing/SubscriptionBillingDetails.vue";
import type { BillingDetailsProps } from "@/features/Subscription/Billing/SubscriptionBillingDetails.vue";
import { reactive, watch, computed, markRaw, nextTick, ref } from "vue";
import { useVirtualCardsApplicationStore } from "@/features/VirtualCards/store/useVirtualCardsApplicationStore";
import store from "@/store";
import VirtualCardsSubscriptionPlanSelectModal from "@/features/modals/VirtualCards/Subscription/VirtualCardsSubscriptionPlanSelectModal.vue";
import {
  type Plan,
  type SubscriptionPreview,
} from "@/features/subscribe/types.js";

import { onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useSavings } from "@/features/subscribe/composables/useSavings.js";
import SubscriptionService from "@/api/settings/subscription-services";
import { useToast } from "@/composables/useToast";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice";
import { usePlanComparisonPrice } from "@/features/subscribe/composables/usePlanComparisonPrice";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling";
import { capitalizeFirstLetter } from "@/scripts/format";
import { useDevice } from "@/composables/useDevice";

// Fallback default prices for early access savings (1 max member plans)
const FALLBACK_DEFAULT_PRICE_ANNUAL = 13999;
const FALLBACK_DEFAULT_PRICE_MONTHLY = 1599;

const emit = defineEmits<{
  (e: "confirm"): void;
}>();

const toast = useToast();
const virtualCardsApplication = useVirtualCardsApplicationStore();
const { isMobile } = useDevice();

const plansWithDiscounts = ref<Plan[]>([]);
const billingDetails: BillingDetailsProps = reactive({
  last4: undefined,
  cardBrand: undefined,
  subtotal: undefined,
  savings: undefined,
  subtotalInterval: undefined,
  dueToday: undefined,
});

onMounted(() => {
  posthogCapture("pay_kyc_confirm_plan_screenview");
});

const plans = computed(() => {
  const plansList = [...virtualCardsApplication.upgradePlanOptions];
  
  return plansList.map((plan) => {
    // Only set default_price if it doesn't exist and max_members === 1
    if (!plan.default_price && plan.max_members === 1) {
      if (plan.recurring_interval === "annually") {
        return { ...plan, default_price: FALLBACK_DEFAULT_PRICE_ANNUAL };
      }
      if (plan.recurring_interval === "monthly") {
        return { ...plan, default_price: FALLBACK_DEFAULT_PRICE_MONTHLY };
      }
    }
    return plan;
  });
});

const savingsByMembersAndInterval = computed(() => {
  const discounts: Record<string, number> = {};
  plans.value.forEach((plan) => {
    const key = `${plan.recurring_interval}-${plan.max_members}`;
    discounts[key] = getPlanSavings(plan);
  });
  return discounts;
});

const higherAnnualSavingsPercentage = computed(() => {
  return Math.max(...Object.values(savingsByMembersAndInterval.value)) || 0;
});

const annualPlans = computed(() => {
  const filteredPlans = plans.value.filter(
    (plan) =>
      plan.recurring_interval === "annually" && plan.provider !== "paypal"
  );
  return getSortedPlans(filteredPlans);
});

const monthlyPlans = computed(() => {
  const filteredPlans = plans.value.filter(
    (plan) =>
      plan.recurring_interval === "monthly" && plan.provider !== "paypal"
  );
  return getSortedPlans(filteredPlans);
});

const isCurrentPlanAnnual = computed(() => {
  return (
    virtualCardsApplication.currentSubscription?.recurring_interval ===
    "annually"
  );
});

const currentSubscription = computed(() => {
  return virtualCardsApplication.currentSubscription;
});

const selectedPlan = computed(() => {
  return virtualCardsApplication.selectedPlan;
});

const isFetchingPlans = computed(() => {
  return virtualCardsApplication.upgradePlanOptions.length === 0;
});

const isFetchingCurrentSubscription = computed(() => {
  return virtualCardsApplication.currentSubscription === null;
});

const isFetchingBillingDetails = computed(() => {
  return Object.values(billingDetails).some((value) => value === undefined);
});

const isCTADisabled = computed(() => {
  return (
    isFetchingPlans.value ||
    isFetchingCurrentSubscription.value ||
    isFetchingBillingDetails.value ||
    !selectedPlan.value
  );
});

const recommendedAnnualPlanId = computed(() => {
  return getRecommendedPlan(annualPlans.value)?.product_id;
});

const offerText = computed(() => {
  if (!selectedPlan.value) {
    return undefined;
  }

  const annualySavings =
    savingsByMembersAndInterval.value[
      `annually-${selectedPlan.value?.max_members}`
    ] || 0;
  if (annualySavings < 1 || annualySavings >= 100) {
    return undefined;
  }

  if (selectedPlan.value.recurring_interval === "annually") {
    return `You're saving ${annualySavings}% with an Annual subscription`;
  }

  if (selectedPlan.value.recurring_interval === "monthly") {
    return `Save ${annualySavings}% with an Annual subscription`;
  }

  return undefined;
});

const canSwitchPlan = computed(() => {
  if (isFetchingCurrentSubscription.value || isFetchingPlans.value) {
    return false;
  }

  if (!currentSubscription.value?.max_members || plans.value.length <= 1) {
    return false;
  }

  // We don't want to allow switching plans if the current plan is annual and there is only one annual plan
  if (isCurrentPlanAnnual.value && annualPlans.value.length === 1) {
    return false;
  }

  return true;
});

function onSwitchPlan() {
  posthogCapture("pay_kyc_confirm_plan_switch_tapped");
  openSelectPlanModal();
}

function onConfirmPlan() {
  posthogCapture("pay_kyc_confirm_plan_confirm_tapped");
  emit("confirm");
}

const getPlanSavings = (plan: Plan) => {
  if (!plans.value?.length) {
    return 0;
  }

  // The higher is usually monthly individual
  const higherPlanPrice = usePlanComparisonPrice(plans.value).value ?? 0;
  const selected = usePlanPrice(() => plan, "per-member-monthly").value ?? 0;
  const saves = useSavings(selected, higherPlanPrice);

  return Math.max(0, Math.min(100, saves.value ?? 0));
};

const getSortedPlans = (plans: Plan[]) => {
  // Ensures the recommended plan sits in the visual focal point
  // 1 item: keep as-is
  // 2 items: recommended goes first (index 0)
  // 3+ items: recommended goes to the middle index (favor left-middle for even counts)
  if (!plans || plans.length === 0) {
    return [] as Plan[];
  }

  if (plans.length === 1) {
    return [...plans];
  }

  const recommended = getRecommendedPlan(plans);
  if (!recommended) {
    return [...plans];
  }

  const others = plans.filter((p) => p.product_id !== recommended.product_id);

  if (plans.length === 2) {
    return [recommended, ...others];
  }

  const targetIndex = Math.floor((plans.length - 1) / 2);
  const left = others.slice(0, targetIndex);
  const right = others.slice(targetIndex);

  return [...left, recommended, ...right];
};

const openSelectPlanModal = () => {
  const modalProps = reactive({
    // If the current user's plan is annual, we don't want to show the monthly plans
    hideMonthlyPlans: isCurrentPlanAnnual.value,
    monthlyPlans,
    annualPlans,
    isLoading: isFetchingPlans,
    saveUpToAnnually: higherAnnualSavingsPercentage.value || 0,
    shouldApplyIndividualMonthlyDiscount: true,
    selectedPlanId: selectedPlan.value?.product_id,
    primaryAnnualPlanId: recommendedAnnualPlanId,
    originalPriceAs: "per-member-monthly",
    onSelectPlan: (plan: Plan) => {
      store.dispatch("closeModal");
      if (plan.product_id === selectedPlan.value?.product_id) {
        return;
      }

      posthogCapture("pay_kyc_confirm_plan_select_different_plan");
      virtualCardsApplication.setSelectedPlan(plan);
    },
  });

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(VirtualCardsSubscriptionPlanSelectModal),
      props: modalProps,
    },
  });
};

const getRecommendedPlan = (plans: Plan[]) => {
  if (!plans || plans.length === 0) {
    return null;
  }

  const fallbackPlan = plans[0];
  const currentSubscriptionMembers = currentSubscription.value?.max_members;

  if (plans.length === 1 || !currentSubscriptionMembers) {
    return fallbackPlan;
  }

  if (currentSubscriptionMembers === 1) {
    return plans.find((plan) => plan.max_members === 1) ?? fallbackPlan;
  }

  if (currentSubscriptionMembers === 2) {
    return plans.find((plan) => plan.max_members === 2) ?? fallbackPlan;
  }

  if (currentSubscriptionMembers > 2) {
    return plans.find((plan) => plan.max_members > 2) ?? fallbackPlan;
  }

  return fallbackPlan;
};

const getBillingDetails = () => {
  const selectedPlan = virtualCardsApplication.selectedPlan;
  if (!selectedPlan) {
    return;
  }

  billingDetails.last4 = undefined;
  billingDetails.cardBrand = undefined;
  billingDetails.savings = undefined;
  billingDetails.subtotal = undefined;
  billingDetails.subtotalInterval = undefined;
  billingDetails.dueToday = undefined;
  billingDetails.savings = [
    {
      amount: undefined,
      description: "Early access savings",
    },
  ];
  const interval = usePlanBilling(selectedPlan).value;

  SubscriptionService.getPreviewSubscriptionChange(selectedPlan.product_id)
    .then((response: SubscriptionPreview) => {
      billingDetails.last4 = response.card_last4 || "";
      billingDetails.cardBrand = capitalizeFirstLetter(
        response.card_brand || ""
      );
      billingDetails.subtotalInterval = interval?.toLowerCase() || undefined;

      const effectiveDefaultPrice = selectedPlan.default_price;

      billingDetails.subtotal = effectiveDefaultPrice || selectedPlan.price;
      billingDetails.dueToday = response.total;

      billingDetails.savings = [];

      // Only show early access savings if effective default price exists and is greater than price
      if (
        effectiveDefaultPrice &&
        effectiveDefaultPrice > selectedPlan.price
      ) {
        billingDetails.savings.push({
          amount: -(effectiveDefaultPrice - selectedPlan.price),
          description: "Early access savings",
        });
      }

      if (response.charge_adjustment < 0) {
        billingDetails.savings.push({
          amount: response.charge_adjustment,
          description: "Plan change credit",
        });
      }
    })
    .catch(() => {
      toast.error(
        "Sorry, we couldn't retrieve your billing details. Please refresh or contact Support if you continue experiencing issues."
      );
    });
};

const setPlansWithDiscounts = (plans: Plan[]) => {
  plansWithDiscounts.value = [];

  if (plans.length === 0) {
    return;
  }

  plansWithDiscounts.value = plans.map((plan) => {
    if (plan.recurring_interval === "monthly") {
      return plan;
    }

    const monthlyPlan = plans.find(
      (p) =>
        p.max_members === plan.max_members && p.recurring_interval === "monthly"
    );
    if (!monthlyPlan) {
      return plan;
    }

    return {
      ...plan,
      default_price: monthlyPlan.price,
    };
  });
};

watch(
  () => virtualCardsApplication.selectedPlan,
  (selectedPlan) => {
    if (selectedPlan) {
      getBillingDetails();
    }
  },
  { immediate: true }
);

// Set selected plan as soon as plans and current subscription are fetched
watch(
  () => [virtualCardsApplication.upgradePlanOptions, currentSubscription.value],
  ([plans, currentSubscription]) => {
    nextTick(() => {
      if (plans && currentSubscription) {
        setPlansWithDiscounts(virtualCardsApplication.upgradePlanOptions || []);

        const recommendedPlan = getRecommendedPlan(
          isCurrentPlanAnnual.value ? annualPlans.value : monthlyPlans.value
        );

        if (recommendedPlan) {
          virtualCardsApplication.setSelectedPlan({ ...recommendedPlan });
        }
      }
    });
  },
  { immediate: true }
);
</script>

<template>
  <div class="vc-application-upgrade-plan">
    <div class="vc-application-upgrade-plan__header">
      <BaseText
        variant="headline-2-semibold"
        class="vc-application-upgrade-plan__header-title"
      >
        Confirm your plan
      </BaseText>
    </div>

    <div class="vc-application-upgrade-plan__content">
      <div class="vc-application-upgrade-plan__section">
        <BaseText
          variant="headline-6-bold"
          class="vc-application-upgrade-plan__header-title"
        >
          Your plan
        </BaseText>
        <SubscriptionPlanCard
          :plan="selectedPlan"
          :offer-text="offerText"
          :show-cta="canSwitchPlan"
          :original-price-as="'per-member'"
          :final-price-as="'per-member'"
          class="vc-application-upgrade-plan__current-plan-card"
          :loading="isFetchingPlans || isFetchingCurrentSubscription"
          icon="layers"
          cta-text="Switch"
          description="Includes Cloaked Pay"
          @cta-click="onSwitchPlan"
        />
      </div>
      <div class="vc-application-upgrade-plan__section">
        <BaseText
          variant="headline-6-bold"
          class="vc-application-upgrade-plan__header-title"
        >
          Billing details
        </BaseText>
        <SubscriptionBillingDetails
          v-bind="billingDetails"
          :subtotal-description="`Subtotal (Includes Cloaked Pay)`"
        >
          <template #footer-content>
            <BaseText
              variant="caption-semibold"
              class="vc-application-upgrade-plan__billing-details-footer-text"
            >
              You won't be charged until identity verification is successful.
            </BaseText>
          </template>
        </SubscriptionBillingDetails>
      </div>
    </div>

    <Teleport
      to="body"
      :disabled="!isMobile"
    >
      <footer class="vc-application-upgrade-plan__footer">
        <BaseButton
          variant="primary"
          background-color="purple-gradient"
          class="vc-application-upgrade-plan__footer-cta"
          icon="lock"
          :disabled="isCTADisabled"
          @click="onConfirmPlan"
        >
          Confirm plan
        </BaseButton>
      </footer>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-application-upgrade-plan";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  &__content {
    display: flex;
    flex-direction: column;
    margin-top: 26px;
    max-width: 375px;
    width: 100%;
    gap: 24px;
    padding-bottom: 40px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__billing-details-footer-text {
    text-align: center;
    font-weight: 500;
    max-width: 183px;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 12px 20px;
    padding-bottom: 30px;
    background: $color-primary-5-light;
    z-index: 1;

    @at-root body:has(.theme-dark) & {
      background: $color-primary-5-dark;
    }

    @media screen and (min-width: $screen-md) {
      position: sticky;
      bottom: -10px;
      width: 100%;
      padding: 12px 0;
    }

    &::before {
      content: "";
      display: block;
      height: 35px;
      position: absolute;
      z-index: 1;
      width: 100%;
      max-width: 375px;
      top: -30px;
      background: linear-gradient(
        to bottom,
        rgba($color-primary-5-light, 0),
        rgba($color-primary-5-light, 1)
      );
      pointer-events: none;

      @at-root body:has(.theme-dark) & {
        background: linear-gradient(
          to bottom,
          rgba($color-primary-5-dark, 0),
          rgba($color-primary-5-dark, 1)
        );
      }
    }

    &-cta {
      width: 100%;
      max-width: 375px;

      @media (min-width: $screen-md) {
        width: 85%;
      }
    }
  }
}
</style>
