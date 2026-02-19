<script setup lang="ts">
import VCBaseAlert from "@/features/VirtualCards/base/VCBaseAlert.vue";
import Button from "@/features/Button.vue";
import store from "@/store";
import { markRaw } from "vue";
import VCBalanceDueModal from "@/features/VirtualCards/modals/balance-due/VCBalanceDueModal.vue";
import useOutstandingBalance from "@/features/VirtualCards/composables/useOutstandingBalance";
import { computed } from "vue";
import { posthogCapture } from "@/scripts/posthog";

const { formattedOutstandingBalance, isCollectionActive, isCollectionPending } =
  useOutstandingBalance();

const canShowPayButton = computed(() => !isCollectionPending.value);

const title = computed(() => {
  if (isCollectionActive.value) {
    return `Your Cloaked Pay account is paused`;
  }

  if (isCollectionPending.value) {
    return `Payment processing`;
  }

  return `Balance Due: ${formattedOutstandingBalance.value}`;
});

const description = computed(() => {
  if (isCollectionActive.value) {
    return `You have an unpaid balance of ${formattedOutstandingBalance.value}. Please pay in full to start using Cloaked Pay again.`;
  }

  if (isCollectionPending.value) {
    return `Once your payment is processed, you can start using Cloaked Pay again if you’ve paid your full balance.`;
  }

  return `Make a payment towards your recent purchases.`;
});

const openBalanceDueModal = () => {
  posthogCapture("pay_wallet_balance_due_payment_modal_viewed");
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(VCBalanceDueModal),
    },
  });
};
</script>

<template>
  <VCBaseAlert
    class="vc-banner-balance-due"
    :color="isCollectionActive ? 'danger' : 'yield'"
    size="lg"
    :icon="isCollectionActive ? 'info-filled' : 'money-filled'"
    icon-with-background
    :title="title"
    :description="description"
    with-border
  >
    <template #extra>
      <div
        v-if="canShowPayButton"
        class="vc-banner-balance-due__actions"
      >
        <Button
          class="vc-banner-balance-due__button"
          type="primary"
          @click="openBalanceDueModal"
        >
          Pay Cloaked {{ formattedOutstandingBalance }}
        </Button>
      </div>
    </template>
  </VCBaseAlert>
</template>

<style lang="scss" scoped>
.vc-banner-balance-due {
  &__actions {
    display: flex;
    justify-content: flex-end;
    padding-left: 12px;
    width: 300px;
  }

  &__button {
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
