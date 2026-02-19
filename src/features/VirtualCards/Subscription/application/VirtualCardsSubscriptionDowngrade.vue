<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal.ts";
import { onMounted, onBeforeUnmount, watch, computed } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";
import VCBaseCopySupportEmail from "@/features/VirtualCards/base/VCBaseCopySupportEmail.vue";

const emit = defineEmits<{
  (e: "planDowngraded"): void;
}>();

const { activePlan } = usePlans();
const { openPlansModal } = usePlansModal();

onMounted(() => {
  window.addEventListener("focus", handleWindowFocus);
});

onBeforeUnmount(() => {
  window.removeEventListener("focus", handleWindowFocus);
});

const canUpdatePlan = computed(() => {
  return (
    activePlan.value?.provider == "stripe" ||
    activePlan.value?.provider == "paypal"
  );
});

const description = computed(() => {
  return canUpdatePlan.value
    ? "You still have access to Cloaked’s protection. Select a new plan to continue, or contact Cloaked Support for assistance."
    : "You still have access to Cloaked’s protection. Contact Cloaked Support to select a new plan.";
});

const handleWindowFocus = () => {
  SubscriptionService.getSubscription();
};

const openPlanManagement = () => {
  if (activePlan.value?.provider === "stripe") {
    openPlansModal(true, () => {
      emit("planDowngraded");
    });
  } else {
    openPaypal();
  }
};

const openPaypal = () => {
  const windowProxy = window.open(
    "https://www.paypal.com/myaccount/autopay/",
    "_blank",
    "noopener"
  );
  if (windowProxy) windowProxy.opener = null;
};

watch(
  () => activePlan.value?.product_id,
  (newProductId, oldProductId) => {
    // User has updated their plan
    if (oldProductId && newProductId !== oldProductId) {
      emit("planDowngraded");
    }
  }
);
</script>

<template>
  <div class="vc-subs-downgrade">
    <div class="vc-subs-downgrade__wrapper">
      <div class="vc-subs-downgrade__medallion">
        <BaseMedallion
          icon="cloaked-logo-knock-out"
          size="lg"
          color="primary-adaptative"
        />
      </div>

      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="vc-subs-downgrade__title"
      >
        We're sorry, Cloaked Pay is not available to you
      </BaseText>

      <BaseText
        as="p"
        variant="headline-6-medium"
        class="vc-subs-downgrade__subtitle"
      >
        {{ description }}
      </BaseText>

      <div class="vc-subs-downgrade__actions">
        <div
          v-if="$slots['before-actions']"
          class="vc-subs-downgrade__extra-actions"
        >
          <slot name="before-actions" />
        </div>

        <BaseButton
          v-if="canUpdatePlan"
          as="a"
          variant="primary"
          size="md"
          full-width
          icon="arrow-right"
          class="vc-subs-downgrade__actions-button"
          @click="openPlanManagement"
        >
          Select a new plan
        </BaseButton>

        <div
          v-if="$slots['after-actions']"
          class="vc-subs-downgrade__extra-actions"
        >
          <slot name="after-actions" />
        </div>

        <VCBaseCopySupportEmail class="vc-subs-downgrade__copy-email" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vc-subs-downgrade {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-bottom: 10px;

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 434px;
    width: 100%;
  }

  &__medallion {
    margin-bottom: 0;
  }

  &__title {
    color: $color-primary-100;
    text-align: center;
  }

  &__subtitle {
    color: $color-primary-70;
    text-align: center;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    width: 100%;

    &-button {
      width: 80%;
    }
  }

  &__copy-email {
    margin-top: 16px;
  }

  &__extra-actions {
    width: 80%;
  }
}
</style>
