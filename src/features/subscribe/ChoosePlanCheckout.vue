<script setup>
import { toRef } from "vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling.js";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import { usePlanMembers } from "@/features/subscribe/composables/usePlanMembers.js";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.js";
import { usePriceAnchor } from "@/features/subscribe/composables/usePriceAnchor.js";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.js";
import BaseText from "@/library/BaseText.vue";
import CheckoutCard from "@/features/subscribe/components/CheckoutCard.vue";

const props = defineProps({
  plan: {
    type: Object,
    default: null,
  },
  discount: {
    type: Number,
    default: null,
  },
  anchor: {
    type: Number,
    default: null,
  },
  compareAt: {
    type: Number,
    default: null,
  },
});

const plan = toRef(() => props.plan);
const discount = toRef(() => props.discount);
const anchor = toRef(() => props.anchor);

const type = usePlanType(plan);
const billing = usePlanBilling(plan);
const members = usePlanMembers(plan);

const perMemberPrice = usePlanPrice(plan, "per-member-monthly");
const perMemberPriceBefore = usePriceAnchor(perMemberPrice, anchor);
const discountedPerMemberPrice = usePriceDiscount(perMemberPrice, discount);

const price = usePlanPrice(plan);
const priceBefore = usePriceAnchor(price, anchor);
const discountedPrice = usePriceDiscount(price, discount);
</script>

<template>
  <div class="checkout">
    <div class="checkout__header">
      <CheckoutTitle>Checkout</CheckoutTitle>
      <RouterLink
        :to="{ name: 'SubscribePlan', query: $route.query }"
        class="checkout__back"
      >
        <BaseText variant="body-3-semibold">Change plan</BaseText>
      </RouterLink>
    </div>
    <CheckoutCard class="checkout__card">
      <CheckoutParagraph class="checkout__plan">
        {{ type }} Plan (Billed {{ billing }})
      </CheckoutParagraph>
      <CheckoutParagraph
        v-if="anchor"
        class="checkout__row"
      >
        {{ formattedPrice(perMemberPriceBefore) }}
        x {{ members }} x
        {{ billing === "Yearly" ? "12 months" : "1 month" }}
      </CheckoutParagraph>
      <CheckoutParagraph
        v-else
        class="checkout__row"
      >
        {{ formattedPrice(perMemberPrice) }}
        x {{ members }} x
        {{ billing === "Yearly" ? "12 months" : "1 month" }}
      </CheckoutParagraph>
      <CheckoutDivider />
      <CheckoutParagraph class="checkout__row">
        Subtotal
        <span class="checkout__price">
          {{ anchor ? formattedPrice(priceBefore) : formattedPrice(price) }}
        </span>
      </CheckoutParagraph>
      <CheckoutParagraph
        v-if="anchor"
        class="checkout__row"
      >
        Time-limited discount
        <span class="checkout__discount">
          -{{ formattedPrice(priceBefore - price) }}
        </span>
      </CheckoutParagraph>
      <CheckoutParagraph
        v-if="discount"
        class="checkout__row"
      >
        {{ discount }}% off discount code
        <span class="checkout__discount">
          -{{ formattedPrice(price - discountedPrice) }}
        </span>
      </CheckoutParagraph>
      <CheckoutParagraph
        v-if="anchor || discount"
        class="checkout__row"
      >
        {{
          discount
            ? formattedPrice(discountedPerMemberPrice)
            : formattedPrice(perMemberPrice)
        }}
        x {{ members }} x
        {{ billing === "Yearly" ? "12 months" : "1 month" }}
        <span class="checkout__price">
          {{
            discount ? formattedPrice(discountedPrice) : formattedPrice(price)
          }}
        </span>
      </CheckoutParagraph>
      <CheckoutDivider />
      <BaseText
        as="div"
        variant="headline-4-bold"
        class="checkout__total"
      >
        Your price
        <span>
          <span
            v-if="priceBefore"
            class="checkout__before"
          >
            {{ formattedPrice(priceBefore) }}
          </span>
          <span
            v-else-if="discount"
            class="checkout__before"
          >
            {{ formattedPrice(price) }}
          </span>
          {{
            isValidPrice(discountedPrice)
              ? formattedPrice(discountedPrice)
              : formattedPrice(price)
          }}
        </span>
      </BaseText>
    </CheckoutCard>
    <slot name="after" />
  </div>
</template>

<style lang="scss" scoped>
.checkout {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  &__back {
    &:hover {
      opacity: 0.8;
    }
  }

  &__row {
    margin: 0;
    display: flex;
    justify-content: space-between;
  }

  &__plan {
    font-weight: 500;
  }

  &__discount {
    font-weight: 600;
    color: $color-success;
  }

  &__price {
    font-weight: 600;
  }

  &__before {
    opacity: 0.6;
    text-decoration: line-through;
  }

  &__total {
    display: flex;
    justify-content: space-between;
  }
}
</style>
