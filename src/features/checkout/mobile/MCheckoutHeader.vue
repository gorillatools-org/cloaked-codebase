<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import { computed, inject, onMounted, ref, toRef } from "vue";
import type { Plan } from "@/features/subscribe/types.ts";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";
import { useCheckoutPricing } from "@/features/checkout/useCheckoutPricing.ts";
import {
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
  couponDiscountInjectionKey,
} from "@/features/checkout/injectionKeys.ts";

type Props = {
  plans?: Plan[];
};

const props = withDefaults(defineProps<Props>(), {
  plans: () => [],
});

// Suppress CSS transitions on initial render
const ready = ref(false);

const checkoutSession = inject(checkoutSessionInjectionKey);
const countdownDiscount = inject(countdownDiscountInjectionKey);
const couponDiscount = inject(couponDiscountInjectionKey);

const { price, discountedPrice } = useCheckoutPricing({
  plans: toRef(() => props.plans),
  checkoutSession,
  countdownDiscount,
  couponDiscount,
});

const totalDueToday = computed(() => {
  if (isValidPrice(discountedPrice)) {
    return discountedPrice.value;
  }
  return price.value;
});

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true;
  });
});
</script>

<template>
  <header
    id="mobile-checkout-header"
    class="mobile-checkout-header"
    :class="{
      'mobile-checkout-header--has-total': !!totalDueToday,
      'mobile-checkout-header--no-transition': !ready,
    }"
  >
    <div class="mobile-checkout-header__logo-container">
      <InlineSvg
        name="cloaked-logo-full"
        class="mobile-checkout-header__logo-img"
      />
    </div>
    <Transition name="total-reveal">
      <div
        v-if="totalDueToday && ready"
        class="mobile-checkout-header__total-container"
      >
        <BaseText
          variant="subhead-regular"
          class="mobile-checkout-header__total-text"
        >
          Due today:
          <span class="mobile-checkout-header__total-price">
            {{ formattedPrice(totalDueToday) }}
          </span>
        </BaseText>
      </div>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
.mobile-checkout-header {
  $header-padding: 16px;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: sticky;
  top: 0;
  z-index: 10;
  min-height: 64px;
  padding: $header-padding;
  background-color: $color-surface-l0;
  border-bottom: 1px solid $color-neutral-200;

  @at-root .theme-dark & {
    background-color: $color-surface-l2-dark;
  }

  &--no-transition *,
  &--no-transition {
    transition: none !important;
  }

  &__logo {
    &-container {
      position: absolute;
      left: $header-padding;
      transform: translateX(calc(50vw - 50% - #{$header-padding}));
      transition: transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);

      .mobile-checkout-header--has-total & {
        transform: translateX(0);
      }
    }

    &-img {
      width: 128px;
    }
  }

  &__total-container {
    position: absolute;
    right: $header-padding;
  }

  &__total {
    &-price {
      font-weight: 600;
    }
  }
}

.total-reveal-enter-active {
  transition:
    opacity 0.5s 0.2s ease-out,
    transform 0.5s 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.total-reveal-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
</style>
