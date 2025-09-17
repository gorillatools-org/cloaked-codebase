<script setup>
import { onBeforeMount, ref } from "vue";
import { usePaymentProviderStripe } from "@/composables/usePaymentProviderStripe";
import store from "@/store";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import BaseButton from "@/library/BaseButton.vue";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.js";
import BaseText from "@/library/BaseText.vue";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling.js";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.js";
import { useIntentPrice } from "@/features/subscribe/composables/useIntentPrice.js";
import { useSavings } from "@/features/subscribe/composables/useSavings.js";
import { useRoute } from "vue-router";
import { useColorScheme } from "@/composables/useColorScheme";

const { setColorScheme } = useColorScheme();
onBeforeMount(() => setColorScheme("light"));

const intent = ref(null);
const plan = ref(null);
const route = useRoute();

const parseParam = (param) => {
  try {
    return JSON.parse(decodeURIComponent(route.query[param]));
  } catch {
    return null;
  }
};

onBeforeMount(async () => {
  await store.dispatch("subscription/loadStripe");

  intent.value = parseParam("intent");
  plan.value = parseParam("plan");
});

const onSubscribed = () => {
  const payload = { result: "subscribed" };

  window.webkit?.messageHandlers?.checkoutCompleted?.postMessage(payload);
  window.cloakedAndroid?.onReceiveMessage?.(payload);
};

const {
  stripeRef,
  subscribeWithStripe,
  stripeError,
  isProcessingStripePayment,
} = usePaymentProviderStripe(plan, onSubscribed, intent);

const planType = usePlanType(plan);
const billingCycleLabel = usePlanBilling(plan);
const price = useIntentPrice(intent, "original");
const finalPrice = useIntentPrice(intent, "final");
const promoDiscount = useSavings(finalPrice, price);
const discountedPrice = usePriceDiscount(price, promoDiscount);
</script>

<template>
  <div class="native-checkout">
    <CheckoutTitle>Payment details</CheckoutTitle>
    <div ref="stripeRef" />
    <BaseText
      v-if="stripeError"
      as="p"
      variant="body-small-medium"
      class="native-checkout__error"
    >
      {{ stripeError }}
    </BaseText>
    <div class="native-checkout__total">
      <BaseText
        as="div"
        variant="body-2-semibold"
        class="native-checkout__total-title"
      >
        Total
      </BaseText>
      <BaseText
        v-if="plan"
        as="div"
        variant="body-small-semibold"
        class="native-checkout__total-plan"
      >
        {{ planType }}
        {{ billingCycleLabel }}
        Plan
      </BaseText>
      <BaseText
        variant="headline-4-bold"
        as="p"
        class="native-checkout__total-price"
      >
        <template v-if="isValidPrice(discountedPrice)">
          <span
            v-if="isValidPrice(price)"
            class="native-checkout__total-discount"
          >
            {{ formattedPrice(price) }}
          </span>
          <span>
            {{ formattedPrice(discountedPrice) }}
          </span>
        </template>
        <span v-else-if="isValidPrice(price)">
          {{ formattedPrice(price) }}
        </span>
      </BaseText>
    </div>
    <BaseButton
      size="lg"
      full-width
      :loading="isProcessingStripePayment"
      :disabled="isProcessingStripePayment"
      @click="subscribeWithStripe(false)"
    >
      <template v-if="isProcessingStripePayment">Processing...</template>
      <template v-else>Subscribe now</template>
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.native-checkout {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100dvh;

  &__error {
    color: $color-alert;
  }

  &__total {
    margin-top: auto;
    display: grid;
    grid-template-columns: 1fr max-content;
    grid-template-areas: "title plan" "title price";

    &-title {
      grid-area: title;
      text-align: left;
      align-self: end;
    }

    &-plan {
      grid-area: plan;
      text-align: right;
      color: $color-primary-50;
    }

    &-price {
      grid-area: price;
      text-align: right;
    }

    &-discount {
      margin-right: 4px;
      color: $color-primary-30;
      text-decoration: line-through;
    }
  }
}
</style>
