<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  useTemplateRef,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import MCheckoutHeader from "@/features/checkout/mobile/MCheckoutHeader.vue";
import MCheckoutPlanBenefitsButton from "@/features/checkout/mobile/MCheckoutPlanBenefitsButton.vue";
import MCheckoutStepper from "@/features/checkout/mobile/MCheckoutStepper.vue";
import type { MobileCheckoutStepId } from "@/features/checkout/mobile/MCheckoutStepper.vue";
import type { Plan } from "@/features/subscribe/types";
import MCheckoutBilling from "@/features/checkout/mobile/MCheckoutBilling.vue";
import MCheckoutPlans from "@/features/checkout/mobile/MCheckoutPlans.vue";
import MCheckoutAccount from "@/features/checkout/mobile/MCheckoutAccount.vue";
import MCheckoutPayment from "@/features/checkout/mobile/MCheckoutPayment.vue";
import {
  checkoutSessionInjectionKey,
  stripeElementsInjectionKey,
  paypalButtonsInjectionKey,
  headlessAuthInjectionKey,
  accountRecoveryInjectionKey,
  couponDiscountInjectionKey,
  countdownDiscountInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import { useCheckoutSubmission } from "@/features/checkout/useCheckoutSubmission.ts";
import { useUserPhoneVerification } from "@/features/data-delete/composables/useUserPhoneVerification";
import { getPlanType } from "@/features/checkout/utils.ts";
import CheckoutPromoBanner from "@/features/checkout/CheckoutPromoBanner.vue";
import { posthogCapture } from "@/scripts/posthog";
import {
  PH_EVENT_MOBILE_CHECKOUT_PAGE_VIEWED,
  PH_EVENT_MOBILE_CHECKOUT_PLAN_SELECTED,
  PH_EVENT_MOBILE_CHECKOUT_PROTECTION_COMPLETED,
  PH_EVENT_MOBILE_CHECKOUT_ACCOUNT_COMPLETED,
  PH_EVENT_MOBILE_CHECKOUT_PAYMENT_SUBMITTED,
  PH_EVENT_MOBILE_CHECKOUT_PAYMENT_SUCCEEDED,
  PH_EVENT_MOBILE_CHECKOUT_STEP_CHANGED,
} from "@/scripts/posthogEvents";

type PageCheckoutMobileProps = {
  plans: Plan[];
};

const props = withDefaults(defineProps<PageCheckoutMobileProps>(), {
  plans: () => [],
});

const router = useRouter();
const route = useRoute();

const userCameFromDataScan = computed(() => !!route.query.phone);
const gradientFadedOut = ref(false);

const stepperRef = useTemplateRef("stepperRef");
const accountRef = useTemplateRef("accountRef");
const paymentRef = useTemplateRef("paymentRef");

const checkoutSession = inject(checkoutSessionInjectionKey);
const stripeElements = inject(stripeElementsInjectionKey);
const paypalButtons = inject(paypalButtonsInjectionKey);
const headlessAuth = inject(headlessAuthInjectionKey);
const accountRecovery = inject(accountRecoveryInjectionKey);
const couponDiscount = inject(couponDiscountInjectionKey);
const countdownDiscount = inject(countdownDiscountInjectionKey);

// Skip the account step when the user already has a verified phone number
// Meaning that the user will not be able to create an account with a different method.
// (e.g. coming from data scan where the phone was verified via OTP).
const { isPhoneVerified } = useUserPhoneVerification(
  toRef(() => checkoutSession?.phone ?? "")
);

const { createAccountError, processPaymentError, logInError, submit } =
  useCheckoutSubmission({
    plans: toRef(() => props.plans),
    stripeElements,
    paypalButtons,
    headlessAuth,
    checkoutSession,
    accountRecovery,
    couponDiscount,
    verifyAccountForm: async () =>
      (await accountRef.value?.verifyForm()) ?? false,
    refreshStripeIntent: async () => {
      await paymentRef.value?.refreshStripeIntent();
    },
  });

const shouldSkipAccountStep = computed(
  () => !!checkoutSession?.phone && isPhoneVerified.value
);

const hiddenSteps = computed<MobileCheckoutStepId[]>(() => {
  return shouldSkipAccountStep.value ? ["account"] : [];
});

const disabledSteps = computed<MobileCheckoutStepId[]>(() => {
  if (checkoutSession?.status) {
    return ["plan", "protection", "account"];
  }

  if (checkoutSession?.isRegistered) {
    return ["account"];
  }

  return [];
});

const paymentStepError = computed(() => {
  // If the account step is skipped, instead of showing the error in the account step, show it in the payment step.
  if (shouldSkipAccountStep.value) {
    return (
      createAccountError.value || processPaymentError.value || logInError.value
    );
  }

  return processPaymentError.value || logInError.value;
});

onBeforeMount(() => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
});

onMounted(() => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    if (userCameFromDataScan.value) {
      gradientFadedOut.value = true;
    }
  });

  if (checkoutSession) {
    checkoutSession.billing = null;
  }

  // Since there's no countdown discount on mobile and we still want to display the discount,
  // we set a very long expiration time to prevent the countdown from running out.
  if (countdownDiscount) {
    countdownDiscount.updateExpirationTime(Number.MAX_SAFE_INTEGER);
  }

  posthogCapture(PH_EVENT_MOBILE_CHECKOUT_PAGE_VIEWED, {
    account_step_skipped: shouldSkipAccountStep.value,
  });

  // Send the same event as the desktop checkout page to have a unified view of the checkout flow.
  // So it can be used on insights and experiments to compare the checkout flow between desktop and mobile.
  posthogCapture("user_viewed_checkout_page");
});

onUnmounted(() => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "auto";
  }

  // Reset countdown and billing, so it doesn't mess up the desktop checkout page.
  if (checkoutSession && !checkoutSession.billing) {
    checkoutSession.billing = "annually";
    checkoutSession.plan = "individual";
  }

  if (countdownDiscount) {
    countdownDiscount.updateExpirationTime(5 * 60);
  }
});

const handleStepAction = (stepId: MobileCheckoutStepId) => {
  stepperRef.value?.goToStep(stepId);
  posthogCapture(PH_EVENT_MOBILE_CHECKOUT_STEP_CHANGED, {
    step_id: stepId,
    from_step: stepperRef.value?.activeStepId,
  });
};

const handleBillingSelect = (plan: Plan) => {
  if (checkoutSession) {
    const billingLabel =
      plan.recurring_interval === "annually" ? "Annual" : "Monthly";

    checkoutSession.billing = plan.recurring_interval;

    stepperRef.value?.nextStep(100).then(() => {
      stepperRef.value?.updateStepCompletedMeta("plan", {
        completedSubtitle: `${billingLabel} plan`,
      });
    });

    posthogCapture(PH_EVENT_MOBILE_CHECKOUT_PLAN_SELECTED, {
      billing: plan.recurring_interval,
    });
  }
};

const handlePlanSelect = (plan: Plan) => {
  if (checkoutSession) {
    checkoutSession.plan = getPlanType(plan);
  }

  stepperRef.value?.nextStep(100).then(() => {
    stepperRef.value?.updateStepCompletedMeta("protection", {
      completedSubtitle: `Plan covers ${plan.max_members} people`,
    });
  });

  posthogCapture(PH_EVENT_MOBILE_CHECKOUT_PROTECTION_COMPLETED, {
    plan_type: getPlanType(plan),
    max_members: plan.max_members,
    skipped: false,
  });
};

const handleProtectionSkip = () => {
  if (checkoutSession) {
    checkoutSession.plan = "individual";
  }

  stepperRef.value?.nextStep(100).then(() => {
    stepperRef.value?.updateStepCompletedMeta("protection", {
      completedSubtitle: "Individual plan",
    });
  });

  posthogCapture(PH_EVENT_MOBILE_CHECKOUT_PROTECTION_COMPLETED, {
    plan_type: "individual",
    max_members: 1,
    skipped: true,
  });
};

const handleAccountContinue = () => {
  stepperRef.value?.nextStep().then(() => {
    stepperRef.value?.updateStepCompletedMeta("account", {
      completedSubtitle: "Your account is ready",
    });
  });

  posthogCapture(PH_EVENT_MOBILE_CHECKOUT_ACCOUNT_COMPLETED);
};

const handleSubmit = () => {
  const eventPayload = {
    method: checkoutSession?.method ?? "stripe",
    billing: checkoutSession?.billing ?? "",
    plan_type: checkoutSession?.plan ?? "",
  };

  submit({
    onSuccess: async () => {
      posthogCapture(PH_EVENT_MOBILE_CHECKOUT_PAYMENT_SUCCEEDED, eventPayload);

      await router.push({
        name: "CheckoutSuccess",
        query: route.query,
      });
    },
  });

  posthogCapture(PH_EVENT_MOBILE_CHECKOUT_PAYMENT_SUBMITTED, eventPayload);
};

watch(createAccountError, (error: string | null) => {
  if (error && !shouldSkipAccountStep.value) {
    stepperRef.value?.goToStep("account");
  }
});

watch(
  toRef(() => checkoutSession?.isRegistered),
  (isRegistered) => {
    if (isRegistered) {
      stepperRef.value?.updateStepCompletedMeta("account", {
        completedSubtitle: "Your account is created",
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="page-checkout-mobile"
    :class="{
      'page-checkout-mobile--from-data-scan': userCameFromDataScan,
      'page-checkout-mobile--gradient-faded': gradientFadedOut,
    }"
  >
    <div
      class="page-checkout-mobile__content"
      :class="{ 'page-checkout-mobile__content--reveal': userCameFromDataScan }"
    >
      <MCheckoutHeader :plans="props.plans" />
      <MCheckoutPlanBenefitsButton />
      <MCheckoutStepper
        ref="stepperRef"
        class="page-checkout-mobile__stepper"
        :disabled-steps="disabledSteps"
        :hidden-steps="hiddenSteps"
        @step-action="handleStepAction"
      >
        <template #steps-header>
          <CheckoutPromoBanner
            class="page-checkout-mobile__promo-banner-container"
          />
        </template>
        <template #plan>
          <MCheckoutBilling
            :plans="props.plans"
            :loading="props.plans.length === 0"
            @select="handleBillingSelect($event)"
          />
        </template>
        <template #protection>
          <MCheckoutPlans
            :plans="props.plans"
            @select="handlePlanSelect($event)"
            @skip="handleProtectionSkip"
          />
        </template>
        <template #account>
          <MCheckoutAccount
            ref="accountRef"
            :error="createAccountError"
            @continue="handleAccountContinue"
          />
        </template>
        <template #payment-header-action>
          <button
            class="page-checkout-mobile__coupon-toggle"
            @click="paymentRef?.toggleCouponField()"
          >
            Promo code
          </button>
        </template>
        <template #payment>
          <MCheckoutPayment
            ref="paymentRef"
            :plans="props.plans"
            :error="paymentStepError"
            @complete="handleSubmit"
          />
        </template>
      </MCheckoutStepper>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-checkout-mobile {
  position: relative;
  min-height: 100vh;
  overflow-x: clip;

  @at-root .theme-dark & {
    background-color: $color-surface-l2-dark;
  }

  // Gradient background overlay (data-scan transition)
  &--from-data-scan::before {
    content: "";
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 0;
    border-radius: 60px;
    pointer-events: none;
    filter: blur(95px);
    mix-blend-mode: screen;
    background: linear-gradient(
      -30deg,
      rgb(255 122 0 / 65%) 5.3%,
      rgb(240 83 107 / 65%) 26.61%,
      rgb(142 131 234 / 65%) 56.26%,
      rgb(0 196 154 / 65%) 82.21%,
      rgb(41 190 232 / 65%) 94.26%
    );
    height: 100vh;
    width: 110vw;
    transform: translate3d(-60%, -50%, 0) skew(-5deg, -30deg);
    opacity: 0.45;
    transition: opacity 1.5s 0.2s ease-out;
  }

  &--gradient-faded::before {
    opacity: 0;
  }

  &__content {
    position: relative;
    z-index: 1;

    // Fade-in reveal for content when coming from data-scan
    // Delay the content reveal until the gradient is almost gone
    &--reveal {
      animation: content-reveal 0.7s 0.9s ease-out both;
    }
  }

  &__stepper {
    margin-top: 8px;
  }

  &__coupon-toggle {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    background-color: transparent;
    border: none;
    outline: none;
    color: $color-neutral-850;
    text-decoration: underline;
    cursor: pointer;
  }

  &__promo-banner-container {
    margin-bottom: 16px;
  }
}

@keyframes content-reveal {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
