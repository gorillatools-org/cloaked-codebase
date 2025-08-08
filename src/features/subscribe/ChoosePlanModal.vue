<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import ChoosePlanPayment from "@/features/subscribe/ChoosePlanPayment.vue";
import router from "@/routes/router";
import ChoosePlanPicker from "@/features/subscribe/ChoosePlanPicker.vue";
import ChoosePlanBenefits from "@/features/ChoosePlanBenefits.vue";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";
import { ref, watch, onMounted } from "vue";
import { usePaymentIntent } from "@/composables/usePaymentIntent.js";
import { useStripeIntentPrefetch } from "@/features/subscribe/composables/useStripeIntentPrefetch.js";
import store from "@/store";

const { isPlansModalOpen, allowClose } = usePlansModal();

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
  if (["couple", "family"].includes(plan.type)) {
    router.push("/settings/subscription");
  }

  isPlansModalOpen.value = false;
  allowClose.value = true;
};

const { promoDiscount } = usePaymentIntent();

const paymentMethod = ref("Card");

const choosePlanPaymentRef = ref(null);

const onClickedSubscribe = async () => {
  await choosePlanPaymentRef.value?.subscribeWithStripe();
};
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
          :discount="paymentMethod === 'Card' ? promoDiscount : null"
        />
        <ChoosePlanBenefits class="choose-plan-modal__benefits" />
      </div>
      <ChoosePlanPayment
        ref="choosePlanPaymentRef"
        v-model:payment-method="paymentMethod"
        class="choose-plan-modal__payment"
        :user="$store.getters['authentication/user']"
        @clicked-subscribe="onClickedSubscribe"
        @subscribed="onSubscribed"
      />
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
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
}
</style>
