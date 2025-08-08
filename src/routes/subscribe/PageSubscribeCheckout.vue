<script setup>
import BaseText from "@/library/BaseText.vue";
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import UserReviews from "@/features/subscribe/UserReviews.vue";
import { useDisplay } from "@/composables/useDisplay.js";
import { posthogCapture } from "@/scripts/posthog.js";
import ChoosePlanVerify from "@/features/subscribe/ChoosePlanVerify.vue";
import ChoosePlanSignupPasswordless from "@/features/subscribe/ChoosePlanSignupPasswordless.vue";
import { useSignupForm } from "@/features/subscribe/composables/useSignupForm.js";
import { phone as formatPhone } from "phone";
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
} from "vue";
import store from "@/store/index.js";
import { useRoute, useRouter } from "vue-router";
import { useSignupVerification } from "@/features/subscribe/composables/useSignupVerification.js";
import ChoosePlanReceipt from "@/features/subscribe/ChoosePlanReceipt.vue";
import ChoosePlanPayment from "@/features/subscribe/ChoosePlanPayment.vue";
import { useTimeLimitedDiscount } from "@/composables/useTimeLimitedDiscount.js";
import ChoosePlanTerms from "@/features/subscribe/ChoosePlanTerms.vue";
import ChoosePlanCheckout from "@/features/subscribe/ChoosePlanCheckout.vue";
import CheckoutCard from "@/features/subscribe/components/CheckoutCard.vue";
import { useBillingCycle } from "@/features/subscribe/composables/useBillingCycle.js";
import { usePlanOptions } from "@/features/subscribe/composables/usePlanOptions.js";
import { usePlanComparisonPrice } from "@/features/subscribe/composables/usePlanComparisonPrice.js";
import ChoosePlanGuarantee from "@/features/subscribe/ChoosePlanGuarantee.vue";
import { usePlans } from "@/features/subscribe/composables/usePlans.js";

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

onMounted(() => posthogCapture("user_viewed_subscribe_checkout"));

const { isDesktop } = useDisplay();

const route = useRoute();

const { form } = useSignupForm({
  defaultPhone: route.query?.phone
    ? formatPhone(route.query?.phone).phoneNumber
    : "",
});

const paymentMethod = ref("Card");
const promoDiscount = ref(null);

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

const signup = ref();

const { timeLimitedDiscount } = useTimeLimitedDiscount();

const onSubscribed = (plan) => {
  emit("subscribed", plan);
};

function onClickedSubscribe() {
  signup.value.onSubmit();
}

onMounted(() => {
  // NOTE: using custom event because of issues emitting through a slot barrier
  window.addEventListener("cloak:phone-signup-verified", onClickedSubscribe);
});

onBeforeUnmount(() => {
  window.removeEventListener("cloak:phone-signup-verified", onClickedSubscribe);
});

const checkoutRef = ref(null);

defineExpose({
  checkoutRef,
  subscribeWithStripe: () => checkoutRef.value.subscribeWithStripe(),
  isProcessingStripePayment: () => checkoutRef.value.isProcessingStripePayment,
});

const { allPlans } = usePlans();

const { selectedBillingCycle } = useBillingCycle(allPlans);

const { selectedPlan } = usePlanOptions({
  selectedBillingCycle,
});

const router = useRouter();

onBeforeMount(() => {
  if (!selectedPlan.value) {
    router.push({ name: "SubscribePlan" });
  }
});

const compareAtPerMemberPrice = usePlanComparisonPrice();
</script>

<template>
  <div
    class="page-subscribe-checkout"
    :class="{
      'page-subscribe-checkout--needs-verification': needsSignupVerification,
    }"
  >
    <PageCheckoutHeader>
      <UserReviews v-if="isDesktop" />
      <RouterLink
        v-if="$route.name.startsWith('Subscribe')"
        to="auth/login"
        class="page-subscribe-checkout__login"
        @click="posthogCapture('sign_in_from_subscribe_now')"
      >
        <BaseText variant="body-3-semibold">Already Subscribed?</BaseText>
      </RouterLink>
    </PageCheckoutHeader>
    <div class="page-subscribe-checkout__content">
      <ChoosePlanSignupPasswordless
        ref="signup"
        v-model:type="form.type"
        v-model:phone="form.phone"
        v-model:email="form.email"
        v-model:username="form.username"
        v-model:password="form.password"
        :is-loading="isRealUser || isLoading"
        :signupError="signupError"
        class="page-subscribe-checkout__signup"
        @submit="$emit('set-user', form, paymentMethod)"
        @input.stop
      />
      <CheckoutCard
        v-if="headlessUser"
        class="page-subscribe-checkout__payment"
      >
        <ChoosePlanPayment
          ref="checkoutRef"
          v-model:payment-method="paymentMethod"
          v-model:discount="promoDiscount"
          :user="headlessUser"
          :time-limited-discount="timeLimitedDiscount"
          variant="flat"
          :disabled="!signup?.isFormValid"
          :is-loading="isLoading"
          title="Payment details"
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
              class="page-subscribe-checkout__receipt"
              @input.stop
            />
            <ChoosePlanVerify
              v-if="needsSignupVerification"
              class="page-subscribe-checkout__verify page-subscribe-checkout__verify--payment"
              :phone="signupPhone"
            />
          </template>
        </ChoosePlanPayment>
      </CheckoutCard>
      <ChoosePlanTerms
        :context="$route.name === 'DataDeleteGuest' ? 'data-delete' : 'default'"
        class="page-subscribe-checkout__terms"
      />
      <ChoosePlanCheckout
        class="page-subscribe-checkout__checkout"
        :plan="selectedPlan"
        :compare-at="compareAtPerMemberPrice"
        :discount="paymentMethod === 'Card' ? promoDiscount : null"
        :anchor="timeLimitedDiscount"
      >
        <template #after>
          <ChoosePlanGuarantee class="page-subscribe-checkout__guarantee" />
        </template>
      </ChoosePlanCheckout>
      <UserReviews
        v-if="!isDesktop"
        class="page-subscribe-checkout__reviews"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-subscribe-checkout {
  &__content {
    display: grid;
    grid-template-columns: 1fr;
    max-width: 928px + 2 * 25px;
    grid-template-areas: "checkout" "signup" "payment" "terms";
    padding: 25px;
    row-gap: 24px;

    @media all and (min-width: $screen-xl) {
      margin: auto;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: min-content min-content 1fr;
      grid-template-areas: "signup checkout" "payment checkout";
      align-items: start;
      gap: 36px 60px;
    }
  }

  &__signup {
    grid-area: signup;
  }

  &__payment {
    grid-area: payment;
  }

  &__checkout {
    grid-area: checkout;
  }

  :deep(.choose-plan-signup__cta) {
    display: none;
  }

  &__receipt {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  &__verify {
    margin-top: 8px;
  }

  &__terms {
    margin-top: -16px;
  }

  &__guarantee {
    margin-top: 8px;

    @media all and (min-width: $screen-xl) {
      margin-top: 16px;
    }
  }

  &__reviews {
    margin: 16px 0;
  }

  &--needs-verification {
    :deep(.choose-plan-payment__cta),
    :deep(.choose-plan-payment__paypal) {
      display: none;
    }
  }

  &:has(.page-subscribe-checkout__login) {
    :deep(.page-checkout-header) {
      justify-content: space-between;
    }

    :deep(.page-checkout-header__navigation) {
      display: flex;
      align-items: center;
      gap: 155px;
    }
  }

  :deep(.choose-plan-payment__total) {
    margin-bottom: 8px;
  }

  :deep(.choose-plan-payment__total-title) {
    display: none;
  }

  :deep(.choose-plan-payment__total-price) {
    display: none;
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
