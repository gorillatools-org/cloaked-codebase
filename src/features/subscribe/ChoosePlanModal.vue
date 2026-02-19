<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import ChoosePlanPayment from "@/features/subscribe/ChoosePlanPayment.vue";
import router from "@/routes/router";
import ChoosePlanPicker from "@/features/subscribe/ChoosePlanPicker.vue";
import ChoosePlanBenefits from "@/features/ChoosePlanBenefits.vue";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";
import { ref, watch, onMounted, computed } from "vue";
import { usePaymentIntent } from "@/composables/usePaymentIntent.js";
import { useStripeIntentPrefetch } from "@/features/subscribe/composables/useStripeIntentPrefetch.js";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { logout } from "@/scripts/actions/auth";

const {
  isPlansModalOpen,
  allowClose,
  onSubscribed: onSubscribedCallback,
} = usePlansModal();

const { prefetchIntents } = useStripeIntentPrefetch();

onMounted(() => {
  store.dispatch("subscription/init");
});

watch(isPlansModalOpen, (isOpen) => {
  if (isOpen) {
    prefetchIntents();
  }
});

const onSubscribed = (plan) => {
  if (onSubscribedCallback.value) {
    onSubscribedCallback.value(plan);
  } else {
    if (["couple", "family"].includes(plan.type)) {
      router.push("/settings/subscription");
    }
  }

  isPlansModalOpen.value = false;
  allowClose.value = true;
  onSubscribedCallback.value = null;
};

const { promoDiscount } = usePaymentIntent();

const paymentMethod = ref("Card");

const choosePlanPaymentRef = ref(null);

const onClickedSubscribe = async () => {
  await choosePlanPaymentRef.value?.subscribeWithStripe();
};

const isChangingPlan = computed(() => {
  return store.getters["settings/isSubscribed"];
});

const ERROR_CODE = "13.17.05";
const errorCode131705 = computed(() => {
  return store.getters["errors/getErrorCodesByCode"](ERROR_CODE);
});

const subscriptionState = computed(() => {
  return store.getters["settings/getSubscription"]?.state;
});

const billingCycle = ref("annually");
function onAlreadyPurchasedSubscription() {
  posthogCapture("user_clicked_already_have_subscription", {
    errorCode: ERROR_CODE,
    subscriptionState: subscriptionState.value,
  });

  store.dispatch("openModal", {
    header: "Already have a subscription?",
    paragraphs: [
      errorCode131705.value.long + ` CODE: ${ERROR_CODE}`,
      "<a href='https://help.cloaked.app' target='_blank' style='text-decoration: underline;'>Contact support</a>",
    ],
    button: {
      text: "Logout",
      onClick: () => logout(),
    },
    showCancel: true,
  });
}

const showAlreadyPurchasedSubscription = computed(() => {
  return store.getters["settings/isTrial"];
});
</script>

<template>
  <AppModal
    v-bind="$attrs"
    :has-outside-click-close="allowClose"
  >
    <AppModalContent
      class="choose-plan-modal"
      width="920px"
    >
      <div class="choose-plan-modal__picker">
        <ChoosePlanPicker
          v-model:billing-cycle="billingCycle"
          :discount="paymentMethod === 'Card' ? promoDiscount : null"
        />
        <BaseText
          v-if="isChangingPlan"
          variant="body-2-semibold"
          class="choose-plan-modal__change-plan-text"
        >
          You will be refunded a prorated amount for your current subscription
          and then charged for this new subscription.
        </BaseText>
        <ChoosePlanBenefits
          v-else
          class="choose-plan-modal__benefits"
        />
      </div>
      <ChoosePlanPayment
        ref="choosePlanPaymentRef"
        v-model:payment-method="paymentMethod"
        class="choose-plan-modal__payment"
        :user="$store.getters['authentication/user']"
        :billing-cycle="billingCycle"
        @clicked-subscribe="onClickedSubscribe"
        @subscribed="onSubscribed"
      >
        <template #after-cta>
          <div class="choose-plan-modal__after-cta">
            <BaseText
              v-if="showAlreadyPurchasedSubscription"
              variant="body-3-semibold"
              as="p"
              @click="onAlreadyPurchasedSubscription"
            >
              Already have a subscription?
            </BaseText>
          </div>
        </template>
      </ChoosePlanPayment>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.choose-plan-modal {
  width: 920px;
  display: grid;
  grid-template-columns: 1fr;
  padding: 32px 20px;

  @media all and (max-width: $screen-lg) {
    max-height: 80vh;
  }

  @media all and (min-width: $screen-lg) {
    grid-template-columns: 1fr 1fr;
    padding: 32px;
  }

  &__picker {
    @media all and (min-width: $screen-lg) {
      display: block;
      padding: 32px;
    }
  }

  &__after-cta {
    margin-top: 16px;
    text-align: center;
    cursor: pointer;
  }

  .choose-plan-picker {
    &__billing-cycle {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;

      @media all and (min-width: $screen-xl) {
        gap: 24px;
      }
    }

    .choose-plan-picker__plans {
      padding: 0;
      background: none;
      box-shadow: none;
    }
  }

  &__benefits {
    display: none;

    @media all and (min-width: $screen-lg) {
      display: flex;
    }
  }

  &__payment {
    @media all and (min-width: $screen-lg) {
      border-left: 1px solid $color-primary-10;
      padding: 0 32px;
      margin: 32px 0;
    }
  }

  &__change-plan-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin: 22px 9px;
  }
}
</style>
