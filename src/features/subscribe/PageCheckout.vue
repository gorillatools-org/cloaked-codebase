<script setup>
import PageCheckoutSignup from "@/features/subscribe/PageCheckoutSignup.vue";
import UserReviews from "@/features/subscribe/UserReviews.vue";
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import BaseText from "@/library/BaseText.vue";
import { onMounted, ref } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useDisplay } from "@/composables/useDisplay.js";

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

const { isDesktop } = useDisplay();

onMounted(() => posthogCapture("user_viewed_checkout_page"));
const onSubscribed = (plan) => {
  emit("subscribed");
  posthogCapture("user_subscribed", plan);
};

const onLogin = () => posthogCapture("sign_in_from_subscribe_now");

const checkoutRef = ref(null);

defineExpose({
  checkoutRef,
  subscribeWithStripe: () => checkoutRef.value.subscribeWithStripe(),
  isProcessingStripePayment: () => checkoutRef.value.isProcessingStripePayment,
});
</script>

<template>
  <div class="page-checkout">
    <PageCheckoutHeader>
      <UserReviews v-if="isDesktop" />
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
