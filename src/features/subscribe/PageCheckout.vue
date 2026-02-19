<script setup>
import { computed } from "vue";
import PageCheckoutSignup from "@/features/subscribe/PageCheckoutSignup.vue";
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import PageCheckoutReviews from "@/features/subscribe/PageCheckoutReviews.vue";
import PageCheckoutDiscountOffer from "@/features/subscribe/PageCheckoutDiscountOffer.vue";
import BaseText from "@/library/BaseText.vue";
import { onMounted, ref } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT,
  PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE,
} from "@/scripts/posthogEvents";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const showLimitedDiscountOfferBanner = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "checkout-limited-time-discount-offer"
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

const emit = defineEmits(["set-user", "subscribed"]);

onMounted(() => posthogCapture("user_viewed_checkout_page"));
const onSubscribed = () => {
  emit("subscribed");
};

const onLogin = () => posthogCapture("sign_in_from_subscribe_now");

const checkoutRef = ref(null);

defineExpose({
  checkoutRef,
  subscribeWithStripe: () => checkoutRef.value.subscribeWithStripe(),
  isProcessingStripePayment: () => checkoutRef.value.isProcessingStripePayment,
});

const {
  featureFlag: checkoutNewBaseLine,
  hasLoadedFeatureFlag: checkoutNewBaseLineLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE);

const showCheckoutReviewsOnTop = computed(
  () => checkoutNewBaseLine.value !== "new-baseline"
);

const dataScanBreachesCount = ref(
  Number(localStorage.getItem("checkoutScanBreachesCount")) || 0
);
</script>

<template>
  <div class="page-checkout">
    <PageCheckoutDiscountOffer
      v-if="showLimitedDiscountOfferBanner"
      :minutes="5"
      :discount-percent="20"
    />
    <PageCheckoutReviews
      v-if="
        checkoutNewBaseLineLoaded &&
        showCheckoutReviewsOnTop &&
        (!dataScanBreachesCount || dataScanBreachesCount === 0)
      "
    />
    <PageCheckoutHeader>
      <RouterLink
        v-if="$route.name === 'SubscribeNow'"
        to="auth/login"
        class="page-checkout__login"
        @click="onLogin"
      >
        <BaseText variant="body-3-semibold">Already Subscribed?</BaseText>
      </RouterLink>
    </PageCheckoutHeader>
    <PageCheckoutSignup
      ref="checkoutRef"
      :headless-user="props.headlessUser"
      :signup-error="props.signupError"
      :is-loading="props.isLoading"
      @set-user="
        (form, paymentMethod) => $emit('set-user', form, paymentMethod)
      "
      @subscribed="onSubscribed"
    />
    <PageCheckoutReviews
      v-if="checkoutNewBaseLineLoaded && !showCheckoutReviewsOnTop"
    />
  </div>
</template>

<style scoped lang="scss">
.page-checkout {
  padding: 0;

  &:has(.page-checkout__login) {
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
