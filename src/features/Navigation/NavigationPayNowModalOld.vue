<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import Button from "@/features/Button.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { computed, ref } from "vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import SubscriptionService from "@/api/settings/subscription-services";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import { formattedPrice } from "@/features/subscribe/composables/utils.ts";

const toast = useToast();
const emit = defineEmits(["input"]);
const isProcessingPayment = ref(false);

const planDetails = computed(
  () => store.getters["subscription/getSubscriptionDetails"]
);

const onPayNow = async () => {
  try {
    isProcessingPayment.value = true;
    await SubscriptionService.payNow();
    await store.dispatch("subscription/fetchSubscriptionDetails");
    emit("input", false);
    toast.success("Upgrade successful!");
  } catch {
    toast.error(
      "There was an error processing your request. Please try again."
    );
  } finally {
    isProcessingPayment.value = false;
  }
};

const planPrice = usePlanPrice(planDetails);

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const formattedNextBillingDate = computed(() =>
  dateFormatter.format(new Date(planDetails.value.next_billing_date))
);
</script>

<template>
  <AppModal v-bind="$attrs">
    <AppModalContent class="pay-now-modal">
      <AppModalTitle>Upgrade now</AppModalTitle>
      <AppModalParagraph>
        We’ll charge the card we have on file for the plan you selected.
      </AppModalParagraph>
      <div class="pay-now-modal__payment">
        <div class="pay-now-modal__payment-icon">
          <InlineSvg
            name="card"
            class="pay-now-modal__payment-icon-svg"
          />
        </div>
        <span class="pay-now-modal__payment-carrier">
          {{ planDetails.brand }}
        </span>
        <span class="pay-now-modal__payment-price">
          {{ formattedPrice(planPrice) }}
        </span>
        <span class="pay-now-modal__payment-card">
          •••• {{ planDetails.card }}
        </span>
        <span class="pay-now-modal__payment-plan">
          {{ planDetails.subscription_name }} • Renews
          {{ formattedNextBillingDate }}
        </span>
      </div>
      <AppModalFooter>
        <Button
          type="secondary"
          @click="$emit('input', false)"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          @click="onPayNow"
        >
          <template v-if="isProcessingPayment">
            <InlineSvg name="spinner" />
            Upgrading...
          </template>
          <template v-else>Confirm</template>
        </Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.pay-now-modal {
  width: 580px !important;

  &__payment {
    margin: 16px 32px 0;
    border-radius: 12px;
    border: 1px solid $color-primary-10;
    padding: 20px;
    display: grid;
    column-gap: 16px;
    grid-template-columns: 48px 120px 1fr;
    align-items: center;

    &-icon {
      grid-row: 1/3;
      justify-self: center;
      border-radius: 10px;
      border: 2px solid $color-primary-10;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      &-svg {
        width: 24px;
        height: 24px;
      }
    }

    &-carrier {
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      text-transform: capitalize;
    }

    &-price {
      font-size: 15px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      justify-self: end;
      text-align: right;
    }

    &-plan {
      justify-self: end;
      text-align: right;
    }

    &-card,
    &-plan {
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
  }
}
</style>
