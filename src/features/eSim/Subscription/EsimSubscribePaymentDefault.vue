<script setup>
import { ref, computed } from "vue";
import InlineSvg from "@/features/InlineSvg";
import BaseButton from "@/library/BaseButton.vue";
import EsimSubscribeTitle from "@/features/eSim/Subscription/EsimSubscribeTitle.vue";
import EsimSubscribeToggle from "@/features/eSim/Subscription/EsimSubscribeToggle.vue";
import EsimSubscribeCard from "@/features/eSim/Subscription/EsimSubscribeCard.vue";
import EsimSubscribePayment from "@/features/eSim/Subscription/EsimSubscribePayment.vue";
import { useToast } from "@/composables/useToast.js";
import SubscriptionService from "@/api/settings/subscription-services.js";
import { usePaymentIntent } from "@/composables/usePaymentIntent";
import { usePaymentProviderStripe } from "@/composables/usePaymentProviderStripe";
import { usePaymentProviderPaypal } from "@/composables/usePaymentProviderPaypal";
import { useScrollToElement } from "@/composables/useScrollToElement";
const toast = useToast();

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  esimPlan: {
    type: Object,
    required: true,
  },
});

const PAYMENT_PROVIDER = {
  STRIPE: "stripe",
  PAYPAL: "paypal",
};

const emit = defineEmits(["next"]);

const originalPrice = computed(() => {
  return props.esimPlan?.default_price || 0;
});

const originalPriceFormatted = computed(() => {
  if (originalPrice.value) {
    return (parseInt(originalPrice.value) / 100)?.toFixed(2);
  }
  return 0; // NOTE: 0 is falsy so UI will not display
});

const discountedPrice = computed(() => {
  return props.esimPlan?.price || 0;
});
const discountedPriceFormatted = computed(() => {
  if (discountedPrice.value) {
    return (parseInt(discountedPrice.value) / 100)?.toFixed(2) || 0;
  }
  return 0; // NOTE: 0 is falsy so UI will not display
});
const discountPercentage = computed(() => {
  if (discountedPrice.value < originalPrice.value) {
    const priceDiff = originalPrice.value - discountedPrice.value;
    return Math.round((priceDiff / originalPrice.value) * 100);
  }
  return 0; // NOTE: 0 is falsy so UI will not display
});

const selectedPaymentProvider = ref(PAYMENT_PROVIDER.STRIPE);

const { paymentIntent } = usePaymentIntent(props.esimPlan);

const { stripeRef, stripeError, isProcessingStripePayment, payWithStripe } =
  usePaymentProviderStripe(props.esimPlan, null, paymentIntent);

const { paypalRef, paypalError } = usePaymentProviderPaypal(
  props.esimPlan,
  null,
  props.user
);
const errorMessageRef = ref(null);
useScrollToElement(errorMessageRef);

let addOnFetchCount = 0;
async function getAddOn() {
  const addOns = await SubscriptionService.getAddons();
  const esimAddon = addOns.results.find(
    (addon) => addon?.addon_type === "esim"
  );
  if (esimAddon?.state === "PAID") {
    emit("next");
  } else if (addOnFetchCount < 20) {
    setTimeout(() => {
      addOnFetchCount++;
      getAddOn();
    }, 500);
  }
}

async function handlePurchase() {
  try {
    await payWithStripe();
    if (stripeError.value || paypalError.value) {
      return;
    }
    await getAddOn();
  } catch {
    if (stripeError.value) {
      toast.error(stripeError.value);
    } else {
      toast.error("Error processing eSIM add on");
    }
  }
}
</script>

<template>
  <EsimSubscribePayment
    class="subscribe-payment"
    :class="{
      'subscribe-payment--provider-selected': !!selectedPaymentProvider,
    }"
  >
    <section class="subscribe-payment__section">
      <EsimSubscribeCard class="subscribe-payment__billing-cycle">
        <div class="subscribe-payment__full-width addon-wrapper">
          <div>
            <div class="price-name">Cloaked eSIM (add-on)</div>
            <div class="payment-intent-row">
              <span
                v-show="!!discountPercentage"
                class="original-price"
              >
                ${{ originalPriceFormatted }}
              </span>
              <span
                v-show="!!discountedPrice"
                class="discounted-price"
              >
                ${{ discountedPriceFormatted }}/year
              </span>
            </div>
          </div>
          <div
            v-show="!!discountPercentage"
            class="discount-bubble"
          >
            Save {{ discountPercentage }}%
          </div>
        </div>

        <footer class="subscribe-payment__section-footer">
          <div class="subscribe-payment__section-footer-col">
            <div class="subscribe-payment__section-footer-row">
              <div class="subscribe-payment__section-footer-header">Total</div>
              <span v-show="!!discountedPrice">
                ${{ discountedPriceFormatted }} + tax due today
              </span>
            </div>
            <div class="subscribe-payment__section-footer-footnote">
              Renews annually
            </div>
          </div>
        </footer>
        <div class="money-back-guarantee subscribe-payment__full-width">
          <InlineSvg name="guarantee" />
          Money-back guarantee
        </div>
      </EsimSubscribeCard>
    </section>

    <section class="subscribe-payment__section">
      <header class="subscribe-payment__section-header">
        <EsimSubscribeTitle>Add billing details</EsimSubscribeTitle>
        <span class="subscribe-payment__secure-form">
          Secure form
          <InlineSvg
            name="lock"
            class="subscribe-payment__secure-form-icon"
          />
        </span>
      </header>
      <EsimSubscribeCard class="subscribe-payment__payment-type">
        <EsimSubscribeToggle
          v-model="selectedPaymentProvider"
          :name="PAYMENT_PROVIDER.STRIPE"
        >
          <InlineSvg
            name="credit-card-outline"
            class="subscribe-payment__provider-icon"
          />
          <br />
          Card
        </EsimSubscribeToggle>
        <EsimSubscribeToggle
          v-model="selectedPaymentProvider"
          :name="PAYMENT_PROVIDER.PAYPAL"
        >
          <InlineSvg
            name="paypal"
            class="subscribe-payment__provider-icon"
          />
          <br />
          Paypal
        </EsimSubscribeToggle>
        <div
          v-show="selectedPaymentProvider === PAYMENT_PROVIDER.STRIPE"
          ref="stripeRef"
          class="subscribe-payment__stripe-form"
        />
        <p
          v-show="selectedPaymentProvider === PAYMENT_PROVIDER.STRIPE"
          class="stripe-text subscribe-payment__full-width"
        >
          Checkout powered by
          <InlineSvg name="stripe-logo" />
        </p>
      </EsimSubscribeCard>
    </section>

    <slot />

    <div v-show="selectedPaymentProvider !== PAYMENT_PROVIDER.PAYPAL">
      <BaseButton
        size="lg"
        full-width
        variant="cloaked-gradient"
        :disabled="selectedPaymentProvider !== PAYMENT_PROVIDER.STRIPE"
        :icon="isProcessingStripePayment ? 'spinner' : 'arrow-right'"
        @click="handlePurchase"
      >
        <template v-if="isProcessingStripePayment">
          Completing purchase
        </template>
        <template v-else>Purchase</template>
      </BaseButton>
    </div>
    <div v-show="selectedPaymentProvider === PAYMENT_PROVIDER.PAYPAL">
      <div
        ref="paypalRef"
        class="subscribe-payment__subscribe-button-paypal"
      />
    </div>

    <p
      v-if="stripeError || paypalError"
      ref="errorMessageRef"
      class="subscribe-payment__error"
    >
      {{ stripeError || paypalError }}
    </p>
  </EsimSubscribePayment>
</template>
<style lang="scss" scoped>
.price-name {
  color: $color-primary-100;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.addon-wrapper {
  border: 3px solid $color-primary-100;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.discount-bubble {
  background-color: $color-success;
  color: $white;
  display: flex;
  height: 20px;
  width: 60px;
  padding: 2px 5px;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  border-radius: 21px;
}

.payment-intent-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;

  .original-price {
    text-decoration: line-through;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-50;
  }

  .discounted-price {
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
  }
}

.stripe-text {
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  color: $color-primary-100;
  width: 100%;
}

.money-back-guarantee {
  color: $color-primary-100;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  width: 100%;
  display: flex;
  padding: 3px 0 4px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 99px;
  border-top: solid 1px rgba($color-primary-100-light, 0.1);
  background: rgba($color-primary-100-light, 0.1);
  margin-top: 16px;

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.1);
    border-top: solid 1px rgba($color-primary-100-dark, 0.1);
  }
}
</style>
