<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeMount,
  onMounted,
  toRef,
  useTemplateRef,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseText from "@/library/BaseText.vue";
import CheckoutCardPlans from "@/features/checkout/desktop/CheckoutCardPlans.vue";
import CheckoutCardDiscount from "@/features/checkout/desktop/CheckoutCardDiscount.vue";
import CheckoutPromoBanner from "@/features/checkout/CheckoutPromoBanner.vue";
import CheckoutCardAccount from "@/features/checkout/desktop/CheckoutCardAccount.vue";
import CheckoutCardPayment from "@/features/checkout/desktop/CheckoutCardPayment.vue";
import CheckoutCardGuarantee from "@/features/checkout/desktop/CheckoutCardGuarantee.vue";
import CheckoutCardFeatures from "@/features/checkout/desktop/CheckoutCardFeatures.vue";
import CheckoutHeader from "@/features/checkout/CheckoutHeader.vue";
import PageCheckoutReviews from "@/features/subscribe/PageCheckoutReviews.vue";
import PageCheckoutTrustBadgesBanner from "@/features/subscribe/PageCheckoutTrustBadgesBanner.vue";
import { useColorScheme } from "@/composables/useColorScheme.ts";
import { useCheckoutSubmission } from "@/features/checkout/useCheckoutSubmission.ts";
import { posthogCapture } from "@/scripts/posthog";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  PH_FEATURE_FLAG_CHECKOUT_TRUST_BADGES,
  PH_FEATURE_FLAG_CHECKOUT_REDUCED_VISUAL_CLUTTER,
} from "@/scripts/posthogEvents";
import {
  accountRecoveryInjectionKey,
  checkoutSessionInjectionKey,
  couponDiscountInjectionKey,
  headlessAuthInjectionKey,
  paypalButtonsInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan } from "@/features/subscribe/types.ts";
import { useFeatureFlag } from "@/posthog/useFeatureFlag";

type PageCheckoutCombinedProps = {
  plans: Plan[];
};

const props = withDefaults(defineProps<PageCheckoutCombinedProps>(), {
  plans: () => [],
});

/* Feature Flags */
const backgroundGradientOff = useFeatureFlag("background-gradient-off");

const {
  featureFlag: checkoutTrustBadges,
  hasLoadedFeatureFlag: checkoutTrustBadgesLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_TRUST_BADGES);

const {
  featureFlag: reducedVisualClutterFlag,
  hasLoadedFeatureFlag: hasLoadedReducedVisualClutterFlag,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_REDUCED_VISUAL_CLUTTER);

const showGradientBackground = computed(
  () =>
    backgroundGradientOff.loaded && backgroundGradientOff.value === "control"
);

const { setColorScheme } = useColorScheme();

const router = useRouter();
const route = useRoute();

const cardAccount = useTemplateRef("cardAccount");
const cardPayment = useTemplateRef("cardPayment");

const stripeElements = inject(stripeElementsInjectionKey);
const paypalButtons = inject(paypalButtonsInjectionKey);
const headlessAuth = inject(headlessAuthInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);
const accountRecovery = inject(accountRecoveryInjectionKey);
const couponDiscount = inject(couponDiscountInjectionKey);

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
      (await cardAccount.value?.verifyForm()) ?? false,
    refreshStripeIntent: async () => {
      await cardPayment.value?.refreshStripeIntent();
    },
  });

onBeforeMount(() => setColorScheme("dark"));

onMounted(() => posthogCapture("user_viewed_checkout_page"));

const isReducedVisualClutterFlag = computed(
  () => reducedVisualClutterFlag.value === "less-visual-clutter"
);

const showCheckoutTrustBadgesBanner = computed(
  () => checkoutTrustBadges.value === "trust-badges"
);

const canShowLoginLink = computed(
  () => !checkoutSession?.status && !checkoutSession?.isPaid
);

const handleSubmit = () => {
  submit({
    onSuccess: async () => {
      await router.push({
        name: "CheckoutSuccess",
        query: route.query,
      });
    },
  });
};
</script>

<template>
  <div
    class="page-checkout-combined"
    :class="{
      'page-checkout-combined--gradient-background': showGradientBackground,
    }"
  >
    <template v-if="checkoutTrustBadgesLoaded">
      <PageCheckoutTrustBadgesBanner v-if="showCheckoutTrustBadgesBanner" />
      <PageCheckoutReviews v-else />
    </template>
    <CheckoutHeader
      v-if="!isReducedVisualClutterFlag && hasLoadedReducedVisualClutterFlag"
    >
      <RouterLink
        v-if="canShowLoginLink"
        to="/auth/login"
        class="page-checkout-combined__login"
      >
        <BaseText variant="body-3-semibold">Already Subscribed?</BaseText>
      </RouterLink>
    </CheckoutHeader>
    <div class="page-checkout-combined__content">
      <CheckoutPromoBanner class="page-checkout-combined__promo-banner" />
      <CheckoutCardPlans
        :plans="plans"
        :hide-title="
          isReducedVisualClutterFlag || !hasLoadedReducedVisualClutterFlag
        "
        class="page-checkout-combined__plans"
      />
      <CheckoutCardGuarantee class="page-checkout-combined__guarantee" />
      <CheckoutCardDiscount class="page-checkout-combined__discount" />
      <div class="page-checkout-combined__main">
        <CheckoutCardAccount
          ref="cardAccount"
          :error="createAccountError || logInError"
          class="page-checkout-combined__account"
        >
          <template #header-right>
            <RouterLink
              v-if="
                canShowLoginLink &&
                isReducedVisualClutterFlag &&
                hasLoadedReducedVisualClutterFlag
              "
              to="/auth/login"
              class="page-checkout-combined__login page-checkout-combined__login--underline"
            >
              <BaseText variant="body-3-semibold">Sign in</BaseText>
            </RouterLink>
          </template>
        </CheckoutCardAccount>
        <CheckoutCardPayment
          ref="cardPayment"
          :plans="plans"
          :error="processPaymentError"
          class="page-checkout-combined__payment"
          @complete="handleSubmit"
        />
      </div>
      <CheckoutCardFeatures class="page-checkout-combined__features" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-checkout-combined {
  &--gradient-background {
    @include cloaked-gradient-background;
  }

  &__login {
    opacity: 0.8;

    &--underline {
      text-decoration: underline;

      &:hover {
        opacity: 0.6;
      }
    }

    &:hover {
      text-decoration: underline;
    }
  }

  &__content {
    max-width: 946px + 2 * 16px;
    width: 100%;
    padding: 0 16px 16px;
    margin: 12px auto 0;
    display: grid;
    gap: 16px;
    grid-template-areas: "plans" "guarantee" "main" "features";
    grid-template-rows: min-content min-content min-content min-content;

    @media all and (min-width: $screen-md) {
      grid-template-columns: 1fr 1fr;
      grid-template-areas: "plans main" "guarantee main" "features main" "empty main";
      padding: 0 16px 32px;
      margin-top: 32px;
      gap: 24px;
      column-gap: 48px;
    }

    @media all and (min-width: $screen-sm) {
      margin: 24px auto 0;
    }

    &:has(.page-checkout-combined__promo-banner) {
      grid-template-areas: "promo-banner" "plans" "guarantee" "main" "features";
      grid-template-rows: min-content min-content min-content min-content min-content;

      @media all and (min-width: $screen-md) {
        grid-template-areas: "promo-banner main" "plans main" "guarantee main" "features main" "empty main";
      }
    }

    &:has(.page-checkout-combined__discount) {
      grid-template-areas: "plans" "guarantee" "discount" "main" "features";
      grid-template-rows: min-content min-content min-content min-content min-content;

      @media all and (min-width: $screen-md) {
        grid-template-areas: "plans main" "guarantee main" "discount main" "features main" "empty main";
      }
    }

    &:has(.page-checkout-combined__promo-banner):has(
        .page-checkout-combined__discount
      ) {
      grid-template-areas: "promo-banner" "plans" "guarantee" "discount" "main" "features";
      grid-template-rows: min-content min-content min-content min-content min-content min-content;

      @media all and (min-width: $screen-md) {
        grid-template-areas: "promo-banner main" "plans main" "guarantee main" "discount main" "features main" "empty main";
      }
    }
  }

  &__main {
    grid-area: main;
    display: grid;
    align-items: start;
    grid-template-rows: min-content min-content;
    gap: 16px;

    @media all and (min-width: $screen-md) {
      gap: 24px;
    }
  }

  &__promo-banner {
    grid-area: promo-banner;
  }

  &__plans {
    grid-area: plans;
  }

  &__guarantee {
    grid-area: guarantee;
  }

  &__discount {
    grid-area: discount;
  }

  &__features {
    grid-area: features;
  }

  @at-root .theme-dark & {
    :deep(.base-input__title),
    :deep(.base-select__title) {
      color: $color-base-black-70;
    }

    :deep(.base-input__action) {
      color: $color-base-black-100;
    }

    :deep(.base-input:has(.base-input__input:disabled) .base-input__action),
    :deep(
      .base-select:has(.base-select__select:disabled) .base-select__chevron
    ) {
      color: $color-base-black-20;
    }

    :deep(.base-input__input),
    :deep(.base-select__select) {
      background-color: $color-base-black-5;
      border: 1px solid $color-base-black-5;
      color: $color-base-black-100;
      opacity: 1;

      &::placeholder {
        color: $color-base-black-20;
      }

      &:hover {
        border: 1px solid $color-base-black-10;
      }

      &:active,
      &:focus {
        border: 1px solid $color-base-black-70;
      }

      &:disabled {
        background-color: $color-base-black-5;
        border: 1px solid $color-base-black-5;
        color: $color-base-black-20;

        &::placeholder {
          color: $color-base-black-20;
        }
      }
    }

    // for windows selects
    :deep(.base-select__option) {
      background-color: $color-base-white-90;
      color: $color-base-black-90;
    }

    :deep(.base-input__input--error),
    :deep(.base-input__select--error) {
      border-color: $color-alert;

      &:hover,
      &:active,
      &:focus {
        border-color: $color-alert;
      }
    }
  }
}
</style>
