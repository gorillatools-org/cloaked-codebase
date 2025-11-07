<script setup>
import { computed, ref } from "vue";
import store from "@/store";
import { onBeforeMount } from "vue";
import AtomTopBannerButton from "@/library/AtomTopBannerButton.vue";
import PaymentMethodUpdateModal from "@/features/modals/PaymentMethodUpdateModal.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { posthogCapture } from "@/scripts/posthog";
import { useToast } from "@/composables/useToast.js";

const showPaymentModal = ref(false);
const toast = useToast();

const { featureFlag: paymentManagementV2 } = usePostHogFeatureFlag(
  "payment_method_management_v2"
);

// Check if user has payment management V2 available, is owner, and uses Stripe
const canUsePaymentMethodModal = computed(() => {
  const subscription = store.getters["settings/getSubscription"];
  const isStripeSubscription = store.getters["settings/isStoreStripe"];
  return (
    paymentManagementV2.value && subscription?.owner && isStripeSubscription
  );
});

function handleExpiredAction() {
  // Analytics tracking
  posthogCapture("expired_banner_clicked", {
    action_type: canUsePaymentMethodModal.value
      ? "update_payment_modal"
      : "subscribe",
    is_subscription_owner:
      store.getters["settings/getSubscription"]?.owner || false,
  });

  if (canUsePaymentMethodModal.value) {
    // Open the payment modal directly
    showPaymentModal.value = true;
  } else {
    // Fallback to existing subscription modal for users without V2 or non-owners
    store.dispatch("subscription/openSubscriptionModal");
  }
}

function handleModalClose() {
  showPaymentModal.value = false;
}

async function handleModalSuccess() {
  // Modal has already handled the entire reactivation flow
  // This handler is passive - only refresh data to reflect the updated state
  try {
    showPaymentModal.value = false;

    toast.success("Account reactivated successfully!");

    // Refresh user and subscription data to show updated account state
    await Promise.all([
      store.dispatch("authentication/getUser"),
      store.dispatch("subscription/fetchSubscriptionDetails"),
    ]);
  } catch (error) {
    console.error("Failed to refresh user data after reactivation:", error);
    toast.error("Failed to refresh account data. Please refresh the page.");
  }
}

onBeforeMount(() => {
  store.dispatch("subscription/init");
});
</script>

<template>
  <div>
    <!-- Custom red alert banner -->
    <div class="expired-banner">
      <div class="expired-banner__content">
        <span>
          Your Cloaked subscription has expired and access is limited. Update
          your payment method to restore full access to all features.
          <AtomTopBannerButton @click="handleExpiredAction">
            {{
              canUsePaymentMethodModal ? "Update Payment" : "Subscribe today"
            }}
          </AtomTopBannerButton>
        </span>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentMethodUpdateModal
      v-if="canUsePaymentMethodModal"
      :show="showPaymentModal"
      context="collections"
      source="banner"
      @close="handleModalClose"
      @success="handleModalSuccess"
    />
  </div>
</template>

<style scoped lang="scss">
.expired-banner {
  background-color: $color-alert;
  padding: 12px 20px;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: $white;

  &__content {
    margin: auto;
    max-width: 800px;
  }
}
</style>
