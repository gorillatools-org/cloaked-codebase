<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { PH_SCREEN_EVENT_ESIM_ONBOARDING_PAYMENT_SCREEN } from "@/scripts/posthogEvents";
import EsimSubscribePaymentDefault from "@/features/eSim/Subscription/EsimSubscribePaymentDefault.vue";
import SubscriptionService from "@/api/settings/subscription-services.js";

import { computed, onMounted, ref } from "vue";

import store from "@/store";

const emit = defineEmits(["next"]);
const esimPlan = ref(null);
onMounted(() => {
  SubscriptionService.getSubscriptionPlans({ product_label: "esim" }).then(
    (response) => {
      esimPlan.value = response[0];
    }
  );
});

const user = computed(() => {
  return store.getters["authentication/user"];
});
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ONBOARDING_PAYMENT_SCREEN"
    :esim-step="3"
  >
    <UiHeader left-align>
      <h2>Your device is ready for Cloaked eSIM!</h2>
      <h5>
        Add Cloaked eSIM to your subscription today to get ultimate protection
        for texts & calls at a reduced price.
      </h5>
      <h5>Add eSIM to your subscription</h5>
      <EsimSubscribePaymentDefault
        v-if="esimPlan"
        :user="user"
        :esim-plan="esimPlan"
        @next="emit('next')"
      >
        <h5>Why choose Cloaked eSIM?</h5>
        <div class="options-wrapper">
          <div class="options-wrapper__row">
            <InlineSvg
              class="esim-icon"
              name="esim-swap-transparent"
            />
            <div class="row-text">Prevent SIM-swapping and fraud</div>
          </div>
          <div class="options-wrapper__row">
            <InlineSvg
              class="esim-icon"
              name="esim-imessage-transparent"
            />
            <div class="row-text">Blue-bubble (iMessage) compatible</div>
          </div>
          <div class="options-wrapper__row">
            <InlineSvg
              class="esim-icon"
              name="esim-map-transparent"
            />
            <div class="row-text">Choose your area code*</div>
          </div>
        </div>
        <div class="footnote">*Area code is based on your home ZIP code</div>
      </EsimSubscribePaymentDefault>
    </UiHeader>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.options-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: -8px;
  gap: 14px;
  border-radius: 16px;
  padding: 16px;
  width: 100%;
  border: 1px rgba($color-primary-100-light, 0.05);
  background: rgba($color-primary-100-light, 0.05);

  @at-root .theme-dark & {
    border: 1px rgba($color-primary-100-dark, 0.1);
    background: rgba($color-primary-100-dark, 0.1);
  }

  background-blend-mode: screen;

  &__row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    gap: 10px;

    svg {
      width: 40px;
      height: auto;
    }

    .row-text {
      color: $color-primary-100;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }
  }
}

.footnote {
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: $color-primary-70;
}
</style>
