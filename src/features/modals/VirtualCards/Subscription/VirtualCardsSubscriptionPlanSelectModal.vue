<script setup lang="ts">
import store from "@/store";
import { ref, computed } from "vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import VirtualCardsApplicationPlanSelectTabs from "@/features/VirtualCards/Subscription/application/VirtualCardsApplicationPlanSelectTabs.vue";
import SubscriptionPlanOfferCard from "@/features/Subscription/SubscriptionPlanOfferCard.vue";
import type { Plan } from "@/features/subscribe/types";
import type { Feature } from "@/features/Subscription/SubscriptionPlanOfferCard.vue";
import { type PlanPriceAs } from "@/features/subscribe/composables/usePlanPrice";
import { useDevice } from "@/composables/useDevice";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "selectPlan", plan: Plan): void;
}>();

type Props = {
  isLoading?: boolean;
  hideMonthlyPlans?: boolean;
  monthlyPlans?: Plan[];
  annualPlans?: Plan[];
  selectedPlanId?: string;
  primaryMonthlyPlanId?: string;
  primaryAnnualPlanId?: string;
  saveUpToAnnually?: number;
  discountPercentage?: number;
  shouldApplyIndividualMonthlyDiscount?: boolean;
  originalPriceAs?: PlanPriceAs;
  finalPriceAs?: PlanPriceAs;
  features?: Feature[];
  ctaText?: string;
};

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hideMonthlyPlans: false,
  monthlyPlans: () => [],
  annualPlans: () => [],
  selectedPlanId: undefined,
  primaryMonthlyPlanId: "",
  primaryAnnualPlanId: "",
  saveUpToAnnually: 0,
  discountPercentage: 0,
  shouldApplyIndividualMonthlyDiscount: false,
  originalPriceAs: "per-member-monthly",
  finalPriceAs: "per-member-monthly",
  features: undefined,
  ctaText: "Switch",
});

const { isMobile } = useDevice();
const activeTab = ref(0);

const labels = computed(() => {
  const annualLabel = `Annually ${props.saveUpToAnnually > 0 && !isMobile.value ? `(Save up to ${props.saveUpToAnnually}%)` : ""}`;
  if (props.hideMonthlyPlans) {
    return [annualLabel];
  }

  return [annualLabel, "Monthly"];
});

const currentTabPlans = computed(() => {
  const isAnnualTab = activeTab.value === 0;
  return isAnnualTab ? props.annualPlans : props.monthlyPlans;
});

const modalWidth = computed(() => {
  const count = currentTabPlans.value?.length ?? 0;
  if (props.isLoading) return "1110px";
  if (count <= 1) return "480px";
  if (count === 2) return "770px";
  return "1110px";
});

function closeModal() {
  emit("close");
  store.dispatch("closeModal");
}
</script>

<template>
  <ModalTemplate
    :show="true"
    :width="modalWidth"
    :without-body-padding="true"
    :without-header-padding="true"
    :without-footer-padding="true"
    prevent-body-scroll
    @close="closeModal"
  >
    <template #body>
      <div class="vc-subscription-select-plan-modal">
        <span
          role="button"
          tabindex="0"
          class="vc-subscription-select-plan-modal__close-btn"
          @click="closeModal"
        >
          <BaseIcon
            class="vc-subscription-select-plan-modal__close-btn-icon"
            name="close"
          />
        </span>
        <BaseText
          class="vc-subscription-select-plan-modal__title"
          variant="headline-2-semibold"
        >
          Upgrade Plan
        </BaseText>
        <div class="vc-subscription-select-plan-modal__tabs-container">
          <VirtualCardsApplicationPlanSelectTabs
            v-model="activeTab"
            class="vc-subscription-select-plan-modal__tabs"
            :full-width="false"
            :width="isMobile ? '100%' : '450px'"
            :skeleton="isLoading"
            :hide-track-when-one-tab="hideMonthlyPlans"
            :labels="labels"
          >
            <template #tab-0>
              <div class="vc-subscription-select-plan-modal__tabs-content">
                <template v-if="isLoading">
                  <SubscriptionPlanOfferCard
                    v-for="placeholder in 3"
                    :key="placeholder"
                    class="vc-subscription-select-plan-modal__plan-card"
                    :loading="true"
                  />
                </template>
                <template v-else>
                  <SubscriptionPlanOfferCard
                    v-for="plan in annualPlans"
                    :key="plan.product_id"
                    class="vc-subscription-select-plan-modal__plan-card"
                    :plan="plan"
                    :description="
                      plan.max_members > 1
                        ? 'Per member per month, billed annually'
                        : 'Per month, billed annually'
                    "
                    :cta-text="ctaText"
                    :is-selected="selectedPlanId === plan.product_id"
                    :is-primary="primaryAnnualPlanId === plan.product_id"
                    :discount-percentage="discountPercentage"
                    :original-price-as="originalPriceAs"
                    :final-price-as="finalPriceAs"
                    :features="features"
                    @cta-click="emit('selectPlan', plan)"
                  />
                </template>
              </div>
            </template>
            <template
              v-if="!hideMonthlyPlans"
              #tab-1
            >
              <div class="vc-subscription-select-plan-modal__tabs-content">
                <template v-if="isLoading">
                  <SubscriptionPlanOfferCard
                    v-for="placeholder in 3"
                    :key="placeholder"
                    class="vc-subscription-select-plan-modal__plan-card"
                    :loading="true"
                  />
                </template>
                <template v-else>
                  <SubscriptionPlanOfferCard
                    v-for="plan in monthlyPlans"
                    :key="plan.product_id"
                    class="vc-subscription-select-plan-modal__plan-card"
                    :is-selected="selectedPlanId === plan.product_id"
                    :is-primary="primaryMonthlyPlanId === plan.product_id"
                    :plan="plan"
                    :description="
                      plan.max_members > 1
                        ? 'Per member, billed monthly'
                        : 'Billed monthly'
                    "
                    :cta-text="ctaText"
                    :features="features"
                    :loading="isLoading"
                    :show-original-price="shouldApplyIndividualMonthlyDiscount"
                    :discount-percentage="discountPercentage"
                    :original-price-as="originalPriceAs"
                    :final-price-as="finalPriceAs"
                    @cta-click="emit('selectPlan', plan)"
                  />
                </template>
              </div>
            </template>
          </VirtualCardsApplicationPlanSelectTabs>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$component-name: "vc-subscription-select-plan-modal";

.#{$component-name} {
  padding: 16px;

  @media (min-width: $screen-md) {
    padding: 36px;
  }

  &__title {
    display: block;
    width: 100%;
    text-align: center;
  }

  &__close-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: $color-base-black-5;
    position: absolute;
    top: 18px;
    right: 18px;
    cursor: pointer;

    &:hover {
      background-color: $color-base-black-10;
    }

    &-icon {
      font-size: 16px;
      color: $color-base-black-100;
    }
  }

  &__tabs {
    display: flex;
    justify-content: center;
    align-items: center;

    &-container {
      display: flex;
      flex-direction: column;
      margin-top: 24px;
    }

    &-content {
      width: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 24px;
    }
  }

  &__plan-card {
    height: 100%;
    flex: 0 1 310px;
    width: 310px;

    @media (min-width: $screen-xl) {
      height: 100%;
      flex: 0 1 340px;
      width: 340px;
    }
  }
}
</style>
