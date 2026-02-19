<script setup lang="ts">
import { ref } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import MCheckoutPlanBenefitsModal from "./MCheckoutPlanBenefitsModal.vue";
import { posthogCapture } from "@/scripts/posthog";
import { PH_EVENT_MOBILE_CHECKOUT_BENEFITS_VIEWED } from "@/scripts/posthogEvents";

const showModal = ref(false);

const openBenefitsModal = () => {
  showModal.value = true;
  posthogCapture(PH_EVENT_MOBILE_CHECKOUT_BENEFITS_VIEWED);
};
</script>

<template>
  <button
    type="button"
    class="checkout-plan-benefits-button"
    @click="openBenefitsModal"
  >
    <div class="checkout-plan-benefits-button__content">
      <div class="checkout-plan-benefits-button__icon-container">
        <BaseIcon
          name="shield-tick"
          class="checkout-plan-benefits-button__icon"
        />
      </div>
      <BaseText
        variant="title-3-emphasized"
        class="checkout-plan-benefits-button__text"
      >
        What's Included in Your Plan
      </BaseText>
    </div>
    <div class="checkout-plan-benefits-button__chevron-container">
      <BaseIcon
        name="chevron-right"
        class="checkout-plan-benefits-button__chevron"
      />
    </div>
  </button>
  <MCheckoutPlanBenefitsModal
    :show="showModal"
    @close="showModal = false"
  />
</template>

<style scoped lang="scss">
.checkout-plan-benefits-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  background-color: $color-surface-l1;
  border: none;
  box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $color-primary-5;
  }

  &:active {
    background-color: $color-primary-10;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  &__icon {
    font-size: 24px;
    color: $color-primary-100;
  }

  &__text {
    color: $color-primary-100;
  }

  &__chevron-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

  &__chevron {
    font-size: 16px;
    font-weight: 600;
    color: $color-primary-100;
  }
}
</style>
