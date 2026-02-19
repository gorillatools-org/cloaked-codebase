<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { CLOAKED_PLAN_FEATURES } from "@/features/checkout/constants.ts";
import planBenefitsHero from "@/assets/images/checkout/plan-benefits-hero.webp";

type MCheckoutPlanBenefitsModalProps = {
  show: boolean;
};

const props = defineProps<MCheckoutPlanBenefitsModalProps>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <ModalTemplate
    :show="props.show"
    :without-header-padding="true"
    :without-body-padding="true"
    :without-footer-padding="true"
    size="medium"
    @close="emit('close')"
  >
    <template #body>
      <div class="checkout-plan-benefits-modal">
        <div class="checkout-plan-benefits-modal__scrollable">
          <div class="checkout-plan-benefits-modal__hero">
            <img
              :src="planBenefitsHero"
              alt="Plan benefits"
              class="checkout-plan-benefits-modal__hero-image"
            />
          </div>
          <div class="checkout-plan-benefits-modal__content">
            <BaseText variant="title-3-emphasized">
              What's Included in Your Plan
            </BaseText>
            <ul class="checkout-plan-benefits-modal__list">
              <li
                v-for="feature in CLOAKED_PLAN_FEATURES"
                :key="feature.title"
                class="checkout-plan-benefits-modal__list-item"
              >
                <BaseIcon
                  name="check"
                  class="checkout-plan-benefits-modal__check-icon"
                />
                <BaseText variant="subhead-regular">
                  {{ feature.title }}
                </BaseText>
              </li>
            </ul>
          </div>
        </div>
        <div class="checkout-plan-benefits-modal__footer">
          <BaseButton
            variant="secondary-outline"
            size="lg"
            full-width
            @click="emit('close')"
          >
            Got it
          </BaseButton>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
.checkout-plan-benefits-modal {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__scrollable {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px;
    overflow-y: auto;
  }

  &__hero {
    &-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 8px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 15px;
  }

  &__list-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__check-icon {
    font-size: 24px;
    color: $color-success;
    flex-shrink: 0;
  }

  &__footer {
    position: sticky;
    bottom: 0;
    padding: 16px;
    border-radius: 0 0 26px 26px;
    background-color: $color-primary-1;

    &::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      height: 32px;
      background: linear-gradient(to top, $color-primary-1, transparent);
      pointer-events: none;
    }
  }
}
</style>
