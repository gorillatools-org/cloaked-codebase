<script setup>
import {
  computed,
  ref,
  toRef,
  onMounted,
  onBeforeUnmount,
  reactive,
  watch,
} from "vue";
import store from "@/store";
import ChoosePlanPayment from "@/features/subscribe/ChoosePlanPayment.vue";
import ChoosePlanDiscountBanner from "@/features/subscribe/ChoosePlanDiscountBanner.vue";
import ChoosePlanFeatures from "@/features/subscribe/ChoosePlanFeatures.vue";
import ChoosePlanReceipt from "@/features/subscribe/ChoosePlanReceipt.vue";
import ChoosePlanPickerFlat from "@/features/subscribe/ChoosePlanPickerFlat.vue";
import ChoosePlanVerify from "@/features/subscribe/ChoosePlanVerify.vue";
import ChoosePlanTerms from "@/features/subscribe/ChoosePlanTerms.vue";
import CheckoutCard from "@/features/subscribe/components/CheckoutCard.vue";
import { useTimeLimitedDiscount } from "@/composables/useTimeLimitedDiscount";
import { useSignupForm } from "@/features/subscribe/composables/useSignupForm";
import { phone as formatPhone } from "phone";
import { useRoute } from "vue-router";
import { useSignupVerification } from "@/features/subscribe/composables/useSignupVerification";
import { usePaymentIntent } from "@/composables/usePaymentIntent.js";
import ChoosePlanSignup from "@/features/subscribe/ChoosePlanSignup.vue";
import TrustLogos from "@/features/subscribe/TrustLogos.vue";
import PageCheckoutFeatureVpn from "./PageCheckoutFeatureVpn.vue";
import PageCheckoutLimitedTimeDiscountBanner from "./PageCheckoutLimitedTimeDiscountBanner.vue";
import PageCheckoutBreachesBanner from "./PageCheckoutBreachesBanner.vue";
import PageCheckoutFeatureCloakedPay from "./PageCheckoutFeatureCloakedPay.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT,
  PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE,
} from "@/scripts/posthogEvents";
import { PH_FEATURE_FLAG_CLOAKED_PAY_ENABLE_SUBSCRIPTION } from "@/features/VirtualCards/constants/posthog-feature-flag";
import { posthogCapture } from "@/scripts/posthog.js";
import PageCheckoutBlackFridayPromotion from "./PageCheckoutBlackFridayPromotion.vue";
import PageCheckoutBannerSkeleton from "./PageCheckoutBannerSkeleton.vue";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const {
  featureFlag: cloakedPayEnableSubscription,
  hasLoadedFeatureFlag: cloakedPayEnableSubscriptionLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CLOAKED_PAY_ENABLE_SUBSCRIPTION);

const showFeatureVpn = computed(
  () =>
    hasLoadedFeatureFlag.value && featureFlag.value === "checkout-feature-vpn"
);

const showTOFLimitedTimeDiscountBanner = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "limited-time-discount-copy-1"
);

const showBlackFriday2025 = computed(
  () => flagPlanPricing.value === "black-friday-2025"
);

const showLimitedDiscountOfferBanner = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "checkout-limited-time-discount-offer"
);

const {
  featureFlag: checkoutNewBaseLine,
  hasLoadedFeatureFlag: checkoutNewBaseLineLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE);

const showTrustBadges = computed(
  () =>
    checkoutNewBaseLineLoaded.value &&
    checkoutNewBaseLine.value === "new-baseline"
);

const props = defineProps({
  headlessUser: {
    type: [Object, null],
    default: null,
  },
  signupError: {
    type: String,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const checkoutRef = ref(null);
const cloakedPay = reactive({
  isCloakedPayAd: false,
  showBanner: false,
  showPlansToggle: false,
  isShowingPlans: false,
});

defineExpose({
  checkoutRef,
  subscribeWithStripe: () => checkoutRef.value.subscribeWithStripe(),
  isProcessingStripePayment: () => checkoutRef.value.isProcessingStripePayment,
});

onMounted(() => {
  // NOTE: using custom event because of issues emitting through a slot barrier
  window.addEventListener("cloak:phone-signup-verified", onClickedSubscribe);
  posthogCapture("user_viewed_checkout_signup_page");
});

onBeforeUnmount(() => {
  window.removeEventListener("cloak:phone-signup-verified", onClickedSubscribe);
});

const billingCycle = ref("annually");

const flagPlanPricing = ref(null);

watch(
  () => props.headlessUser,
  () => {
    flagPlanPricing.value =
      props.headlessUser?.flags?.monthly_plan_experiment ?? null;
  }
);

const hasDiscountedAnnualPlans = computed(
  () =>
    flagPlanPricing.value === "discounted-annual-plans" ||
    showBlackFriday2025.value
);

const discountSize = computed(() =>
  hasDiscountedAnnualPlans.value && billingCycle.value === "annually" ? 50 : 20
);

const { formattedTime, timeLimitedDiscount } = useTimeLimitedDiscount({
  discountSize,
});

const { promoDiscount } = usePaymentIntent();
const paymentMethod = ref("Card");

const isSubscribed = computed(() => store.getters["settings/isSubscribed"]);

const emit = defineEmits(["set-user", "subscribed"]);

const dataScanBreachesCount = ref(
  Number(localStorage.getItem("checkoutScanBreachesCount")) || 0
);

const dataScanBreachesThreatLevel = ref(
  localStorage.getItem("checkoutScanBreachesThreatLevel")
);

const signup = ref();
const onSubscribed = (plan) => {
  emit("subscribed", plan);
};

function onClickedSubscribe() {
  signup.value.onSubmit();
}

const route = useRoute();

const { form } = useSignupForm({
  defaultPhone: route.query?.phone
    ? formatPhone(route.query?.phone).phoneNumber
    : "",
});

const {
  verifiedSearchPhone,
  signupPhone,
  isSignupPhoneVerified,
  verifiedSignupPhone,
} = useSignupVerification({
  form,
  user: toRef(() => props.headlessUser),
});

const needsSignupVerification = computed(
  () =>
    form.value.type === "phone" &&
    signupPhone.value &&
    !isSignupPhoneVerified.value
);

const isRealUser = computed(
  () =>
    !!store.state.authentication.user &&
    store.state.authentication.user?.account_version >= 2
);

watch(
  () => ({
    flagLoaded: cloakedPayEnableSubscriptionLoaded.value,
    flagValue: cloakedPayEnableSubscription.value,
  }),
  ({ flagLoaded, flagValue }) => {
    if (!flagLoaded) return;

    if (!!flagValue && route.query.pay_customer) {
      cloakedPay.showBanner = false;
      cloakedPay.showPlansToggle = true;
      cloakedPay.isShowingPlans = true;
    }
  }
);
</script>

<template>
  <div
    class="page-checkout-signup"
    :class="{
      'page-checkout-signup--subscribed': isSubscribed,
      'page-checkout-signup--needs-verification': needsSignupVerification,
      'page-checkout-signup--with-discount-banner':
        showLimitedDiscountOfferBanner && !!timeLimitedDiscount,
    }"
  >
    <PageCheckoutBreachesBanner
      v-if="dataScanBreachesCount && dataScanBreachesCount > 0"
      :data-scan-breaches-count="dataScanBreachesCount"
      :breach-status="dataScanBreachesThreatLevel"
    />
    <PageCheckoutBannerSkeleton
      v-else-if="!headlessUser || !hasLoadedFeatureFlag"
    />
    <PageCheckoutBlackFridayPromotion v-else-if="showBlackFriday2025" />
    <PageCheckoutLimitedTimeDiscountBanner
      v-else-if="showTOFLimitedTimeDiscountBanner"
    />
    <PageCheckoutFeatureVpn v-else-if="showFeatureVpn" />
    <PageCheckoutFeatureCloakedPay v-if="cloakedPay.showBanner" />
    <ChoosePlanPickerFlat
      v-model:billing-cycle="billingCycle"
      v-model:show-cloaked-pay-plans="cloakedPay.isShowingPlans"
      :anchor="timeLimitedDiscount"
      :discount="paymentMethod === 'Card' ? promoDiscount : null"
      :disabled="isSubscribed"
      :show-cloaked-pay-plans-toggle="cloakedPay.showPlansToggle"
      class="page-checkout-signup__plans"
    />
    <ChoosePlanDiscountBanner
      v-if="!!timeLimitedDiscount && !showLimitedDiscountOfferBanner"
      :time-limited-discount="timeLimitedDiscount"
      :time="formattedTime"
      :billing-cycle="hasDiscountedAnnualPlans ? billingCycle : null"
      class="page-checkout-signup__discount"
    />
    <TrustLogos
      v-if="showTrustBadges"
      class="page-checkout-signup__trust-badges"
    />
    <div class="page-checkout-signup__form">
      <CheckoutCard>
        <ChoosePlanSignup
          ref="signup"
          v-model:type="form.type"
          v-model:phone="form.phone"
          v-model:email="form.email"
          v-model:username="form.username"
          v-model:password="form.password"
          :is-loading="isRealUser || isLoading"
          :signup-error="signupError"
          @submit="$emit('set-user', $event, paymentMethod)"
          @input.stop
        >
          <template
            v-if="isSubscribed && needsSignupVerification"
            #cta
          >
            <ChoosePlanVerify
              class="page-checkout-signup__verify"
              :phone="signupPhone"
            />
          </template>
        </ChoosePlanSignup>
        <div v-show="!isSubscribed">
          <ChoosePlanPayment
            v-if="headlessUser"
            ref="checkoutRef"
            v-model:payment-method="paymentMethod"
            :user="headlessUser"
            :time-limited-discount="timeLimitedDiscount"
            variant="flat"
            :disabled="!signup?.isFormValid"
            :is-loading="isLoading"
            :billing-cycle="billingCycle"
            :plan-product="cloakedPay.isShowingPlans ? 'cloaked_pay' : 'all'"
            @subscribed="onSubscribed"
            @clicked-subscribe="onClickedSubscribe"
          >
            <template
              v-if="headlessUser"
              #after-total
            >
              <ChoosePlanReceipt
                v-if="
                  form.type === 'phone'
                    ? (verifiedSignupPhone ?? verifiedSearchPhone)
                    : verifiedSearchPhone
                "
                :recipient="
                  form.type === 'phone'
                    ? (verifiedSignupPhone ?? verifiedSearchPhone)
                    : verifiedSearchPhone
                "
                class="page-checkout-signup__receipt"
                @input.stop
              />
              <ChoosePlanVerify
                v-if="needsSignupVerification"
                class="page-checkout-signup__verify page-checkout-signup__verify--payment"
                :phone="signupPhone"
              />
            </template>
          </ChoosePlanPayment>
        </div>
      </CheckoutCard>
      <ChoosePlanTerms
        class="page-checkout-signup__terms"
        :context="$route.name === 'DataDeleteGuest' ? 'data-delete' : 'default'"
      />
    </div>
    <ChoosePlanFeatures
      class="page-checkout-signup__features"
      :class="showTrustBadges ? 'page-checkout-signup__features--baseline' : ''"
    />
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.page-checkout-signup {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 928px + 2 * 25px;
  padding: 25px;
  row-gap: 24px;
  min-height: calc(
    100dvh - 148px
  ); // 148 is the height of reviews banner + header

  &--with-discount-banner {
    min-height: calc(
      100dvh - 204px
    ); // 148 is the height of reviews banner + header
  }

  @media all and (min-width: $screen-xl) {
    margin: auto;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: min-content min-content min-content min-content 1fr;
    align-items: start;
    gap: 36px 60px;
  }

  &__form {
    @media all and (min-width: $screen-xl) {
      grid-column: 2/3;
      grid-row: 1/-1;
    }
  }

  &__receipt {
    margin-top: 8px;
  }

  &__verify {
    margin-top: 36px;
  }

  &__phone {
    width: 20px;
    height: 20px;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translate3d(0, -50%, 0);

    &--verified {
      color: $color-success;
    }

    &--unverified {
      color: $color-warning;
    }
  }

  :deep(.choose-plan-signup__cta) {
    display: none;
  }

  &--subscribed {
    :deep(.choose-plan-signup__cta) {
      display: flex;
    }
  }

  &--needs-verification {
    :deep(.choose-plan-payment__cta),
    :deep(.choose-plan-payment__paypal) {
      display: none;
    }
  }

  &__status {
    margin-top: 36px;
  }

  &__terms {
    margin: 16px 0 8px;
  }

  &__trust-badges {
    order: 4;
  }

  &__plans {
    opacity: 0;
    animation: appear-bottom-5 0.5s forwards ease-out;
  }

  &__discount {
    opacity: 0;
    animation: appear-bottom-5 0.5s forwards ease-out;
  }

  &__features {
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.05s forwards ease-out;

    &--baseline {
      order: 5;
    }
  }

  &__form {
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.1s forwards ease-out;
  }
}
</style>
