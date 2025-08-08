<script setup>
import { computed, ref, toRef, onMounted, onBeforeUnmount } from "vue";
import store from "@/store";
import ChoosePlanPayment from "@/features/subscribe/ChoosePlanPayment.vue";
import ChoosePlanDiscountBanner from "@/features/subscribe/ChoosePlanDiscountBanner.vue";
import ChoosePlanFeatures from "@/features/subscribe/ChoosePlanFeatures.vue";
import UserReviews from "@/features/subscribe/UserReviews.vue";
import ChoosePlanReceipt from "@/features/subscribe/ChoosePlanReceipt.vue";
import ChoosePlanPickerFlat from "@/features/subscribe/ChoosePlanPickerFlat.vue";
import ChoosePlanVerify from "@/features/subscribe/ChoosePlanVerify.vue";
import ChoosePlanSignupPasswordless from "@/features/subscribe/ChoosePlanSignupPasswordless.vue";
import ChoosePlanTerms from "@/features/subscribe/ChoosePlanTerms.vue";
import { useTimeLimitedDiscount } from "@/composables/useTimeLimitedDiscount";
import { useSignupForm } from "@/features/subscribe/composables/useSignupForm";
import { phone as formatPhone } from "phone";
import { useRoute } from "vue-router";
import { useSignupVerification } from "@/features/subscribe/composables/useSignupVerification";
import { usePaymentIntent } from "@/composables/usePaymentIntent.js";

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

defineExpose({
  checkoutRef,
  subscribeWithStripe: () => checkoutRef.value.subscribeWithStripe(),
  isProcessingStripePayment: () => checkoutRef.value.isProcessingStripePayment,
});

onMounted(() => {
  // NOTE: using custom event because of issues emitting through a slot barrier
  window.addEventListener("cloak:phone-signup-verified", onClickedSubscribe);
});

onBeforeUnmount(() => {
  window.removeEventListener("cloak:phone-signup-verified", onClickedSubscribe);
});

const { formattedTime, timeLimitedDiscount } = useTimeLimitedDiscount();
const { promoDiscount } = usePaymentIntent();
const paymentMethod = ref("Card");

const isSubscribed = computed(() => store.getters["settings/isSubscribed"]);

const emit = defineEmits(["set-user", "subscribed"]);

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
</script>

<template>
  <div
    class="page-checkout-signup"
    :class="{
      'page-checkout-signup--subscribed': isSubscribed,
      'page-checkout-signup--needs-verification': needsSignupVerification,
    }"
  >
    <ChoosePlanPickerFlat
      :anchor="timeLimitedDiscount"
      :discount="paymentMethod === 'Card' ? promoDiscount : null"
      :disabled="isSubscribed"
      class="page-checkout-signup__plans"
    />
    <ChoosePlanDiscountBanner
      v-if="!!timeLimitedDiscount"
      :time-limited-discount="timeLimitedDiscount"
      :time="formattedTime"
      class="page-checkout-signup__discount"
    />
    <div class="page-checkout-signup__form">
      <div class="page-checkout-signup__card">
        <ChoosePlanSignupPasswordless
          ref="signup"
          v-model:type="form.type"
          v-model:phone="form.phone"
          v-model:email="form.email"
          v-model:username="form.username"
          v-model:password="form.password"
          :is-loading="isRealUser || isLoading"
          :signupError="signupError"
          @submit="$emit('set-user', form, paymentMethod)"
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
        </ChoosePlanSignupPasswordless>
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
      </div>
      <ChoosePlanTerms
        class="page-checkout-signup__terms"
        :context="$route.name === 'DataDeleteGuest' ? 'data-delete' : 'default'"
      />
    </div>
    <UserReviews class="page-checkout-signup__reviews" />
    <ChoosePlanFeatures class="page-checkout-signup__features" />
  </div>
</template>

<style scoped lang="scss">
.page-checkout-signup {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 928px + 2 * 25px;
  padding: 25px;
  row-gap: 24px;

  @media all and (min-width: $screen-xl) {
    margin: auto;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: min-content min-content 1fr;
    align-items: start;
    gap: 36px 60px;
  }

  &__form {
    @media all and (min-width: $screen-xl) {
      grid-column: 2/3;
      grid-row: 1/4;
    }
  }

  &__card {
    padding: 24px;
    border-radius: 16px;
    background: rgb(255 255 255 / 10%);
    display: flex;
    flex-direction: column;
    row-gap: 36px;
  }

  :deep(.choose-plan-picker__plans) {
    padding: 16px;
    border-radius: 16px;
    background: rgb(255 255 255 / 6%);
  }

  &__receipt {
    margin-top: 8px;
  }

  &__verify {
    margin-top: 36px;

    &--payment {
      margin-bottom: -36px;
    }
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

  &__reviews {
    @media all and (min-width: $screen-xl) {
      display: none;
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
    margin: 16px 0;
  }

  &__plans {
    opacity: 0;
    animation: appear-bottom-5 0.5s forwards ease-out;
  }

  &__discount {
    opacity: 0;
    animation: appear-bottom-5 0.5s forwards ease-out;
  }

  &__reviews {
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.05s forwards ease-out;
  }

  &__features {
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.05s forwards ease-out;
  }

  &__form {
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.1s forwards ease-out;
  }
}
</style>
