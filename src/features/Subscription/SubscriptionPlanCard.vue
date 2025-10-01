<script lang="ts" setup>
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import Button from "@/features/Button.vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import type { Plan } from "@/features/subscribe/types";
import { computed } from "vue";
import { formattedPrice } from "@/features/subscribe/composables/utils";
import {
  usePlanPrice,
  type PlanPriceAs,
} from "@/features/subscribe/composables/usePlanPrice";
import { usePlanBilling } from "../subscribe/composables/usePlanBilling";
import { usePriceDiscount } from "../subscribe/composables/usePriceDiscount";
import { usePriceAnchor } from "../subscribe/composables/usePriceAnchor";

interface Props {
  plan?: Plan | null;
  icon?: BaseIconName;
  description?: string;
  offerText?: string;
  ctaText: string;
  loading?: boolean;
  showCta?: boolean;
  discountPercentage?: number;
  originalPriceAs?: PlanPriceAs;
  finalPriceAs?: PlanPriceAs;
}

const emit = defineEmits<{
  (e: "ctaClick"): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  icon: "layers",
  plan: undefined,
  description: undefined,
  offerText: undefined,
  loading: false,
  showCta: true,
  discountPercentage: 0,
  originalPriceAs: "per-member-monthly",
  finalPriceAs: "per-member-monthly",
});

const originalPrice = computed(() => {
  if (!props.plan) {
    return 0;
  }

  if (props.discountPercentage > 0) {
    const perMemberPrice = usePlanPrice(props.plan, props.originalPriceAs);
    return usePriceAnchor(perMemberPrice, props.discountPercentage).value;
  }

  return (
    usePlanPrice(props.plan, props.originalPriceAs, "default_price").value || 0
  );
});

const finalPrice = computed(() => {
  if (!props.plan) {
    return 0;
  }

  if (props.discountPercentage > 0) {
    return usePriceDiscount(originalPrice.value, props.discountPercentage)
      .value;
  }

  return usePlanPrice(props.plan, props.finalPriceAs).value || 0;
});

const billingInterval = computed(() =>
  props.plan ? usePlanBilling(props.plan).value : null
);
const isLoading = computed(() => props.loading || !props.plan);
</script>

<template>
  <div class="subs-plan-card">
    <div class="subs-plan-card__plan">
      <div class="subs-plan-card__plan-icon-container">
        <BaseIcon
          :name="icon"
          class="subs-plan-card__plan-icon"
        />
      </div>
      <div class="subs-plan-card__plan-info">
        <BaseText
          v-if="!isLoading"
          variant="headline-6-bold"
          class="subs-plan-card__plan-info-title"
        >
          {{ plan?.name }}
        </BaseText>
        <span
          v-else
          class="subs-plan-card__skeleton subs-plan-card__plan-title-skeleton"
          aria-busy="true"
          aria-label="Loading"
        />
        <div class="subs-plan-card__plan-info-price-container">
          <BaseText
            v-if="!isLoading && (originalPrice || 0) > 0"
            variant="body-3-semibold"
            class="subs-plan-card__plan-info-price subs-plan-card__plan-info-price--original"
          >
            {{ formattedPrice(originalPrice) }}
          </BaseText>
          <BaseText
            v-if="!isLoading"
            variant="body-3-semibold"
            class="subs-plan-card__plan-info-price"
          >
            {{ formattedPrice(finalPrice) }}
            {{ billingInterval?.toLowerCase() }}
          </BaseText>
          <span
            v-else
            class="subs-plan-card__skeleton subs-plan-card__plan-price-skeleton"
            aria-busy="true"
            aria-label="Loading"
          />
        </div>
        <BaseText
          v-if="description && !isLoading"
          variant="body-3-semibold"
          class="subs-plan-card__plan-info-description"
        >
          {{ description }}
        </BaseText>
        <span
          v-else-if="description && isLoading"
          class="subs-plan-card__skeleton subs-plan-card__plan-description-skeleton"
          aria-busy="true"
          aria-label="Loading"
        />
      </div>
      <div
        v-if="showCta"
        class="subs-plan-card__plan-cta-container"
      >
        <Button
          variant="primary"
          size="sm"
          class="subs-plan-card__plan-cta-button"
          @click="emit('ctaClick')"
        >
          {{ ctaText }}
        </Button>
      </div>
    </div>

    <div
      v-if="offerText && !isLoading"
      class="subs-plan-card__offer"
    >
      <BaseText
        variant="caption-bold"
        class="subs-plan-card__offer-text"
      >
        {{ offerText }}
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "subs-plan-card";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: $color-base-white-80;
  border-radius: 30px;
  border: 1px solid $color-base-black-10;
  padding: 20px 16px 16px;
  box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);

  &__plan {
    display: flex;
    flex-direction: row;
    gap: 12px;

    &-icon {
      font-size: 22px;

      &-container {
        height: 40px;
        width: 40px;
        min-height: 40px;
        min-width: 40px;
        border-radius: 50%;
        background-color: $color-base-white-80;
        border: 1px solid $color-base-black-15;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      &-title {
        color: $color-base-black-100;
      }

      &-description {
        color: $color-primary-50;
      }

      &-price {
        &-container {
          display: flex;
          gap: 4px;
        }

        color: $color-primary-50;

        &--original {
          color: $color-primary-30;
          text-decoration: line-through;
        }
      }
    }
  }

  &__offer {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba($color-safe-zone-green, 0.3);
    border-radius: 50px;
    padding: 4px;

    &-text {
      @media screen and (width <= $screen-md) {
        font-size: 11px;
      }
    }
  }

  &__skeleton {
    @at-root .theme-dark & {
      @include base-skeleton($color-primary-10, 0.5, #000, 0.5);
    }

    @at-root .theme-light & {
      @include base-skeleton($color-primary-10, 0.6);
    }

    display: inline-block;
    border-radius: 6px;
  }

  &__plan-title-skeleton {
    height: 18px;
    width: 60%;
    min-width: 120px;
  }

  &__plan-description-skeleton {
    height: 14px;
    margin-top: 4px;
    width: 50%;
    min-width: 100px;
  }

  &__plan-price-skeleton {
    height: 14px;
    width: 40%;
    min-width: 90px;
    margin-top: 6px;
  }
}
</style>
