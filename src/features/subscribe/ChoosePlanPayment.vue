<script setup>
import ChoosePlanCta from "@/features/subscribe/ChoosePlanCta.vue";
import SubscribeInputPromo from "@/features/subscribe/SubscribeInputPromo.vue";
import { ref, toRef, watch, computed, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { usePromoCode } from "@/composables/usePromoCode";
import { usePaymentIntent } from "@/composables/usePaymentIntent";
import { usePaymentProviderStripe } from "@/composables/usePaymentProviderStripe";
import { usePaymentProviderPaypal } from "@/composables/usePaymentProviderPaypal";
import { usePlanOptions } from "@/features/subscribe/composables/usePlanOptions";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import { usePriceAnchor } from "@/features/subscribe/composables/usePriceAnchor.js";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.js";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";
import { toValue, until } from "@vueuse/core/index";
import { useStripeIntent } from "@/features/subscribe/composables/useStripeIntent.js";
import BaseText from "@/library/BaseText.vue";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling.js";
import ChoosePlanGuarantee from "@/features/subscribe/ChoosePlanGuarantee.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT,
  PH_FEATURE_FLAG_CHECKOUT_MINIMAL_COPY_MODE,
  PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE,
} from "@/scripts/posthogEvents";
import { useRoute } from "vue-router";

const {
  featureFlag: checkoutMinimalModeEnabled,
  hasLoadedFeatureFlag: checkoutMinimalModeLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_MINIMAL_COPY_MODE);

const isMinimalModeDisabled = computed(
  () =>
    checkoutMinimalModeLoaded.value && checkoutMinimalModeEnabled.value !== true
);

const props = defineProps({
  user: {
    type: [Object, null],
    required: true,
  },
  variant: {
    type: String,
    default: "outline",
  },
  timeLimitedDiscount: {
    type: [Number, null],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  billingCycle: {
    type: String,
    required: true,
  },
  planProduct: {
    type: String,
    required: true,
    validator: (value) => value === "cloaked_pay" || value === "all",
  },
});

const paymentMethod = defineModel("paymentMethod", {
  default: "Card",
  type: String,
});

const route = useRoute();
const promoCode = route.query.coupon ?? "";
const isPromoCodeInputVisible = ref(!!promoCode);

const { activePlan } = usePlans(toRef(() => props.planProduct));

const { selectedPlanOption, selectedPlan, selectedPaypalPlan } = usePlanOptions(
  {
    selectedBillingCycle: toRef(() => props.billingCycle),
    planProduct: toRef(() => props.planProduct),
  }
);

const {
  isValidatingPromoCode,
  promoCodeInput,
  promoCodeOffer,
  promoCodeError,
  validatePromoCode,
} = usePromoCode(selectedPlan);

onMounted(async () => {
  if (!promoCode) return;
  await until(() => !!selectedPlan.value?.product_id).toBe(true);
  promoCodeInput.value = promoCode;
  validatePromoCode();
});

const { paymentIntent, isLoadingIntent, promoDiscount } = usePaymentIntent(
  selectedPlan,
  promoCodeOffer,
  promoCodeError,
  validatePromoCode
);

const price = usePlanPrice(selectedPlan);
const anchoredPrice = usePriceAnchor(
  price,
  toRef(() => props.timeLimitedDiscount)
);
const discountedPrice = usePriceDiscount(
  price,
  toRef(() => (paymentMethod.value === "Card" ? toValue(promoDiscount) : null))
);

const emit = defineEmits(["subscribed", "clicked-subscribe"]);

const { clearIntentCache } = useStripeIntent();

const onSubscribed = (plan) => {
  clearIntentCache();
  posthogCapture("user_subscribed", plan);
  emit("subscribed", plan);
};

const {
  stripeRef,
  stripeError,
  isProcessingStripePayment,
  subscribeWithStripe,
} = usePaymentProviderStripe(
  selectedPlan,
  onSubscribed,
  paymentIntent,
  null,
  toRef(() => props.variant)
);

const onChoosePlan = async () => {
  await posthogCapture("user_clicked_credit_card_subscribe");
  emit("clicked-subscribe");
};

const { paypalRef, paypalError } = usePaymentProviderPaypal(
  selectedPaypalPlan,
  onSubscribed,
  toRef(() => props.user),
  false
);

function togglePromoCodeInput() {
  isPromoCodeInputVisible.value = !isPromoCodeInputVisible.value;
  posthogCapture("user_clicked_promo_code_button");
}

watch(selectedPaypalPlan, (newValue) => {
  if (newValue === null) {
    paymentMethod.value = "Card";
  }
});

defineExpose({
  subscribeWithStripe,
  paymentMethod,
  paypalRef,
  isProcessingStripePayment,
});

const isHeadlessUser = computed(() => {
  return !props.user || props.user.account_version < 2;
});

const {
  featureFlag: checkoutNewBaseLine,
  hasLoadedFeatureFlag: checkoutNewBaseLineLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE);

const showGuaranteeBelowCta = computed(
  () =>
    checkoutNewBaseLineLoaded.value &&
    checkoutNewBaseLine.value === "new-baseline"
);

const {
  featureFlag: topOfFunnelExperiment,
  hasLoadedFeatureFlag: topOfFunnelFlagLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT);

const showSubscribeNowCta = computed(
  () =>
    topOfFunnelFlagLoaded.value &&
    topOfFunnelExperiment.value === "checkout-cta-subscribe-now-copy"
);

const planType = usePlanType(toRef(() => selectedPlanOption.value?.stripePlan));
const billingCycleLabel = usePlanBilling(selectedPlan);
</script>

<template>
  <div
    v-show="selectedPlanOption"
    class="choose-plan-payment"
  >
    <div
      class="choose-plan-payment__header"
      :class="{
        'choose-plan-payment__header--minimal-mode': !isMinimalModeDisabled,
      }"
    >
      <BaseText
        as="div"
        variant="headline-3-bold"
        class="choose-plan-payment__header-title"
      >
        <h2>Checkout</h2>

        <BaseText
          v-if="paymentMethod === 'Card'"
          as="button"
          variant="body-small-medium"
          underline
          class="choose-plan-payment__promo-toggle"
          @click="togglePromoCodeInput"
        >
          Promo code?
        </BaseText>
      </BaseText>
      <BaseText
        v-if="isMinimalModeDisabled"
        as="div"
        variant="body-3-semibold"
        class="choose-plan-payment__header-subtitle"
      >
        <span
          v-if="selectedPlanOption?.paypalPlan && paymentMethod === 'PayPal'"
        >
          All transactions are secured and encrypted by
          <strong>PayPal</strong>
          .
        </span>
        <span v-else>
          All transactions are secured and encrypted by
          <strong>Stripe</strong>
          .
        </span>
      </BaseText>
    </div>
    <div
      v-if="selectedPlanOption?.paypalPlan"
      class="choose-plan-payment__tabs"
    >
      <BaseText
        v-for="tab in ['Card', 'PayPal']"
        :key="tab"
        as="button"
        variant="headline-6-medium"
        class="choose-plan-payment__tab"
        :class="{ 'choose-plan-payment__tab--active': tab === paymentMethod }"
        @click="paymentMethod = tab"
      >
        {{ tab }}
      </BaseText>
    </div>

    <section
      v-show="paymentMethod === 'Card'"
      class="choose-plan-payment__section"
    >
      <div
        v-show="isPromoCodeInputVisible"
        class="choose-plan-payment__promo-code"
      >
        <BaseText
          v-if="variant === 'outline'"
          variant="body-3-semibold"
          as="h3"
        >
          Promo code
        </BaseText>
        <SubscribeInputPromo
          v-model="promoCodeInput"
          variant="flat"
          :is-valid="!!promoCodeOffer && promoCodeInput === promoCodeOffer.code"
          :is-validating="
            isValidatingPromoCode || (promoCodeOffer && isLoadingIntent)
          "
          :error="promoCodeError"
          :size-mobile="variant === 'flat' ? 'md' : 'sm'"
          :size-desktop="variant === 'flat' ? 'md' : 'sm'"
          class="choose-plan-payment__promo-code-input"
          @validate="validatePromoCode"
        />
        <BaseText
          v-if="promoCodeOffer?.terms && !isLoadingIntent"
          variant="body-small-medium"
          as="div"
          class="choose-plan-payment__promo-code-terms"
        >
          Promo code added ({{ promoCodeOffer.terms }})
        </BaseText>
      </div>
      <div>
        <div
          ref="stripeRef"
          class="choose-plan-payment__stripe-form"
        />
      </div>
      <BaseText
        v-if="stripeError"
        as="p"
        variant="body-small-medium"
        class="choose-plan-payment__error"
      >
        {{ stripeError }}
      </BaseText>
    </section>
    <section class="choose-plan-payment__total">
      <div class="choose-plan-payment__total-row">
        <BaseText
          as="div"
          variant="body-2-semibold"
          class="choose-plan-payment__total-title"
        >
          Total
        </BaseText>
        <div>
          <BaseText
            v-if="showSubscribeNowCta"
            as="div"
            variant="body-small-semibold"
            class="choose-plan-payment__plan-type"
          >
            {{ planType }}
            {{ billingCycleLabel }}
            Plan
          </BaseText>
          <BaseText
            variant="headline-4-bold"
            as="p"
            class="choose-plan-payment__total-price"
          >
            <span
              v-if="isValidPrice(anchoredPrice)"
              class="choose-plan-payment__total-price-strikeout"
            >
              {{ formattedPrice(anchoredPrice) }}
            </span>
            <span
              v-else-if="isValidPrice(discountedPrice)"
              class="choose-plan-payment__total-price-strikeout"
            >
              {{ formattedPrice(price) }}
            </span>
            <span
              v-if="isValidPrice(discountedPrice)"
              class="choose-plan-payment__total-price-span"
            >
              {{ formattedPrice(discountedPrice) }}
            </span>
            <span
              v-else-if="isValidPrice(price)"
              class="choose-plan-payment__total-price-span"
            >
              {{ formattedPrice(price) }}
            </span>
          </BaseText>
        </div>
      </div>
      <slot name="after-total" />
    </section>
    <ChoosePlanCta
      v-if="selectedPlanOption && (paymentMethod === 'Card' || isHeadlessUser)"
      :option="selectedPlanOption"
      :has-plan="!!activePlan"
      :loading="(isProcessingStripePayment || props.isLoading) && !stripeError"
      :disabled="
        (props.disabled || isProcessingStripePayment || props.isLoading) &&
        !stripeError
      "
      class="choose-plan-payment__cta"
      @choose-plan="onChoosePlan"
    />

    <slot name="after-cta" />

    <section
      v-show="
        selectedPlanOption?.paypalPlan &&
        paymentMethod === 'PayPal' &&
        !isHeadlessUser
      "
      class="choose-plan-payment__paypal-wrapper"
      :class="{
        'choose-plan-payment__paypal-wrapper--disabled': props.disabled,
      }"
    >
      <div
        ref="paypalRef"
        class="choose-plan-payment__paypal"
      />
      <BaseText
        v-if="paypalError"
        variant="body-3-semibold"
        as="p"
        class="choose-plan-payment__error"
      >
        {{ paypalError }}
      </BaseText>
    </section>
    <ChoosePlanGuarantee
      v-if="showGuaranteeBelowCta"
      class="choose-plan-picker-flat__guarantee"
      text="30-day money-back guarantee"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.choose-plan-payment {
  &__header {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;

    &-title {
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }

    &--minimal-mode {
      margin-bottom: 16px;
    }
  }

  &__tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    gap: 8px;
  }

  &__tab {
    padding: 10px 16px;
    border: 1px solid $color-primary-100;
    border-radius: 24px;
    cursor: pointer;
    background: none;
    width: 100%;

    &:hover {
      @include transition(all 0.2s ease);

      @at-root .theme-dark & {
        background: rgba($white, 0.1);
      }

      @at-root .theme-light & {
        background: rgba($black, 0.1);
      }
    }

    &--active {
      background: $color-primary-100;
      color: $color-primary-1 !important;

      &:hover {
        @at-root .theme-dark & {
          background: $color-primary-90;
        }

        @at-root .theme-light & {
          background: $color-primary-90;
        }
      }
    }
  }

  &__section {
    display: none;
    flex-direction: column;
    overflow: hidden;

    &:has(iframe) {
      display: flex;
    }

    &-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
  }

  &__promo-toggle {
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  &__promo-code {
    margin: 0 2px 12px;

    &-input {
      margin: 4px 0 0;
    }

    &-terms {
      margin-top: 4px;
      color: $color-success;
    }
  }

  &__stripe {
    &-form {
      margin: 3px;
    }
  }

  &__error {
    color: $color-alert;
  }

  &__cta {
    width: 100%;
    margin-top: 36px;
  }

  &__total {
    display: flex;
    flex-direction: column;
    margin-top: 24px;
    // margin-bottom: 36px;
    padding-top: 16px;

    @at-root .theme-dark & {
      border-top: 1px solid rgba($white, 0.1);
    }

    @at-root .theme-light & {
      border-top: 1px solid rgba($black, 0.1);
    }

    &-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    &-title {
      margin-right: 12px;
    }

    &-price {
      &::after {
        content: " due today";
      }

      &-strikeout {
        opacity: 0.5;
        text-decoration: line-through;
      }

      &-span {
        margin-left: 4px;
        display: inline-block;
      }
    }
  }

  &__plan-type {
    text-align: right;

    @at-root .theme-light & {
      opacity: 0.5;
    }

    @at-root .theme-dark & {
      opacity: 0.6;
    }
  }

  &__paypal-wrapper {
    margin-top: 36px;
    &--disabled {
      opacity: 0.5;
      pointer-events: none;
      cursor: not-allowed;
    }
  }

  &__after-cta {
    margin-top: 16px;
    text-align: center;
    cursor: pointer;
  }

  .choose-plan-picker-flat {
    &__guarantee {
      margin-top: 16px;
      padding-left: 6px;
      padding-right: 6px;
      padding: 0;
      border: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
