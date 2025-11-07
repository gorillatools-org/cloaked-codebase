<template>
  <div class="payment-management-v2">
    <div class="payment-management-v2__card">
      <div class="payment-management-v2__content">
        <div class="payment-management-v2__header">
          <BaseText
            variant="headline-3-bold"
            class="payment-management-v2__title"
          >
            Payment Method
          </BaseText>
          <BaseText
            variant="body-3-semibold"
            class="payment-management-v2__description"
            :class="{
              'payment-management-v2__description--danger': isAccountExpired,
            }"
          >
            {{ buttonContent.description }}
          </BaseText>
        </div>

        <div class="payment-management-v2__actions">
          <div class="payment-management-v2__primary-action">
            <BaseButton
              :variant="buttonContent.variant"
              size="lg"
              class="payment-management-v2__button"
              @click="openPaymentModal"
            >
              {{ buttonContent.text }}
            </BaseButton>
          </div>

          <div
            v-if="canCancelSubscription || canSwitchPlans"
            class="payment-management-v2__secondary-actions"
          >
            <BaseButton
              v-if="canCancelSubscription"
              variant="outline"
              size="md"
              class="payment-management-v2__cancel-link"
              @click="openCancelModal"
            >
              Cancel Subscription
            </BaseButton>
            <BaseButton
              v-if="canSwitchPlans"
              variant="outline"
              size="md"
              @click="openPlanSwitching"
            >
              Switch Plans
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <PaymentMethodUpdateModal
      :show="isPaymentModalOpen"
      :context="buttonContent.context"
      source="settings"
      @close="closePaymentModal"
      @success="handlePaymentSuccess"
      @reactivation-success="handleReactivationSuccess"
    />

    <SubscriptionModalCancelSubscription
      :show="isCancelModalOpen"
      @close="isCancelModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import PaymentMethodUpdateModal from "@/features/modals/PaymentMethodUpdateModal.vue";
import SubscriptionModalCancelSubscription from "./SubscriptionModalCancelSubscription.vue";
import { useToast } from "@/composables/useToast.js";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";
import store from "@/store";

const toast = useToast();
const { openPlansModal } = usePlansModal();

const isExpired = computed(() => store.getters["settings/isCancelled"]);
const isAccountExpired = computed(() => isExpired.value);

const isCancelModalOpen = ref(false);
const subscription = computed(() => store.getters["settings/getSubscription"]);

const canCancelSubscription = computed(() => {
  return !isAccountExpired.value && !subscription.value?.canceled_at;
});

const canSwitchPlans = computed(() => {
  return !isAccountExpired.value;
});

const buttonContent = computed(() => {
  if (isAccountExpired.value) {
    return {
      text: "Reactivate Account",
      description:
        "Your account is expired. Update your payment method to restore access to all Cloaked services.",
      variant: "danger",
      context: "collections",
    };
  }

  return {
    text: "Change Payment Method",
    description:
      "Update your payment information or change the card used for billing.",
    variant: "primary",
    context: "billing",
  };
});

const isPaymentModalOpen = ref(false);
const openPaymentModal = () => {
  isPaymentModalOpen.value = true;
};

const closePaymentModal = () => {
  isPaymentModalOpen.value = false;
};

const openCancelModal = () => {
  isCancelModalOpen.value = true;
};

const openPlanSwitching = () => {
  openPlansModal(true);
};

const handlePaymentSuccess = async () => {
  const message =
    buttonContent.value.context === "collections"
      ? "Account reactivated successfully!"
      : "Payment method updated successfully!";

  toast.success(message);

  try {
    await store.dispatch("authentication/getUser");
    await store.dispatch("subscription/fetchSubscriptionDetails");
  } catch (error) {
    console.error("Failed to refresh user data after payment update:", error);
  }
};

const handleReactivationSuccess = async () => {
  try {
    await Promise.all([
      store.dispatch("authentication/getUser"),
      store.dispatch("subscription/fetchSubscriptionDetails"),
    ]);
  } catch (error) {
    console.error("Failed to refresh user data after reactivation:", error);
  }
};
</script>

<style lang="scss" scoped>
.payment-management-v2 {
  margin-top: 32px;

  &__card {
    border: 1px solid $color-primary-10;
    border-radius: 8px;
    padding: 24px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  &__header {
    flex: 1;
  }

  &__title {
    display: block;
    margin-bottom: 8px;
  }

  &__description {
    display: block;
    color: $color-primary-50;
    line-height: 1.4;

    &--danger {
      color: $color-alert;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__primary-action {
    display: flex;
    align-items: center;
  }

  &__button {
    min-width: 180px;
    width: auto;
  }

  &__secondary-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
}
</style>
