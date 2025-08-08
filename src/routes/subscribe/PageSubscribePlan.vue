<script setup>
import BaseText from "@/library/BaseText.vue";
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import UserReviews from "@/features/subscribe/UserReviews.vue";
import ChoosePlanPickerFlat from "@/features/subscribe/ChoosePlanPickerFlat.vue";
import ChoosePlanDiscountBanner from "@/features/subscribe/ChoosePlanDiscountBanner.vue";
import ChoosePlanFeatures from "@/features/subscribe/ChoosePlanFeatures.vue";
import ChoosePlanGuarantee from "@/features/subscribe/ChoosePlanGuarantee.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useDisplay } from "@/composables/useDisplay.js";
import { useBillingCycle } from "@/features/subscribe/composables/useBillingCycle.js";
import { useTimeLimitedDiscount } from "@/composables/useTimeLimitedDiscount.js";
import { usePlanOptions } from "@/features/subscribe/composables/usePlanOptions.js";
import { onMounted } from "vue";
import { usePlans } from "@/features/subscribe/composables/usePlans.js";

const { formattedTime, timeLimitedDiscount } = useTimeLimitedDiscount();

const { isDesktop } = useDisplay();

const { allPlans } = usePlans();

const { selectedBillingCycle } = useBillingCycle(allPlans);

const { selectedPlanOption } = usePlanOptions({
  selectedBillingCycle,
});

onMounted(() => posthogCapture("user_viewed_subscribe_plan_selection"));
</script>

<template>
  <div class="page-subscribe-plan">
    <PageCheckoutHeader>
      <UserReviews v-if="isDesktop" />
      <RouterLink
        v-if="$route.name.startsWith('Subscribe')"
        to="auth/login"
        class="page-subscribe-plan__login"
        @click="posthogCapture('sign_in_from_subscribe_now')"
      >
        <BaseText variant="body-3-semibold">Already Subscribed?</BaseText>
      </RouterLink>
    </PageCheckoutHeader>
    <div class="page-subscribe-plan__content">
      <ChoosePlanPickerFlat
        :anchor="timeLimitedDiscount"
        class="page-subscribe-plan__picker"
      />
      <div class="page-subscribe-plan__benefits">
        <ChoosePlanDiscountBanner
          v-if="!!timeLimitedDiscount"
          :time-limited-discount="timeLimitedDiscount"
          :time="formattedTime"
          class="page-subscribe-plan__discount"
        />
        <UserReviews
          v-if="!isDesktop"
          class="page-subscribe-plan__reviews"
        />
        <ChoosePlanFeatures />
        <ChoosePlanGuarantee class="page-subscribe-plan__guarantee" />
      </div>
      <BaseButton
        size="lg"
        full-width
        :disabled="!selectedPlanOption"
        class="page-subscribe-plan__cta"
        @click="
          $router.push({
            name: 'SubscribeCheckout',
            query: $route.query,
          })
        "
      >
        Start Protection
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-subscribe-plan {
  &__content {
    display: grid;
    grid-template-columns: 1fr;
    max-width: 928px + 2 * 25px;
    grid-template-areas: "picker" "benefits" "cta";
    padding: 25px;
    row-gap: 24px;

    @media all and (min-width: $screen-xl) {
      margin: auto;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: min-content 1fr;
      grid-template-areas: "picker benefits" "cta benefits";
      align-items: start;
      gap: 36px 60px;
    }
  }

  &__picker {
    grid-area: picker;

    :deep(.choose-plan-picker-flat__guarantee) {
      display: none;
    }
  }

  &__benefits {
    grid-area: benefits;
    display: grid;
    row-gap: 24px;
  }

  &__guarantee {
    margin-top: -8px;
    grid-row-start: 1;

    @media all and (min-width: $screen-xl) {
      grid-row-start: 2;
      margin-top: 0;
    }
  }

  &__discount {
    margin-top: -8px;

    @media all and (min-width: $screen-xl) {
      grid-row-start: 3;
      margin-top: 0;
    }
  }

  &__reviews {
    margin: 16px 0;
  }

  &__cta {
    grid-area: cta;
    position: sticky;
    bottom: 24px;

    @media all and (min-width: $screen-xl) {
      position: static;
    }
  }

  :deep(.choose-plan-picker__plans) {
    padding: 16px;
    border-radius: 16px;
    background: rgb(255 255 255 / 6%);
    margin-bottom: 0;
  }

  :deep(.choose-plan-features__list-item) {
    &:nth-child(n + 5) {
      display: grid;
    }

    &:nth-child(n + 7) {
      display: none;
    }
  }

  :deep(.choose-plan-features__list--expanded) {
    .choose-plan-features__list-item {
      &:nth-child(n + 7) {
        display: grid;
      }
    }
  }

  &:has(.page-subscribe-plan__login) {
    :deep(.page-checkout-header) {
      justify-content: space-between;
    }

    :deep(.page-checkout-header__navigation) {
      display: flex;
      align-items: center;
      gap: 155px;
    }
  }

  &__login {
    opacity: 0.8;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
