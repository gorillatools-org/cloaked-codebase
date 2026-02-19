<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { formattedPrice } from "@/features/subscribe/composables/utils";
import type { Plan } from "@/features/subscribe/types";
import {
  usePlanPrice,
  type PlanPriceAs,
} from "@/features/subscribe/composables/usePlanPrice";
import { computed } from "vue";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount";
import { usePriceAnchor } from "../subscribe/composables/usePriceAnchor";

export type Feature = {
  label: string;
  new: boolean;
};

const emit = defineEmits<{
  (e: "ctaClick"): void;
}>();

const props = withDefaults(
  defineProps<{
    plan?: Plan | null;
    description?: string;
    isPrimary?: boolean;
    ctaText?: string;
    primaryBadgeText?: string;
    features?: Feature[];
    loading?: boolean;
    discountPercentage?: number;
    showOriginalPrice?: boolean;
    originalPriceAs?: PlanPriceAs;
    finalPriceAs?: PlanPriceAs;
    isSelected?: boolean;
  }>(),
  {
    primaryBadgeText: "Recommended",
    ctaText: "Upgrade",
    isPrimary: false,
    plan: null,
    description: undefined,
    features: () => [
      { label: "Virtual Cards", new: true },
      { label: "$3 million in Identity Theft Insurance", new: true },
      { label: "Automated Exposure Clean Up", new: false },
      { label: "Password & Identity Manager", new: false },
      { label: "Data Removal & Dark Web Monitoring", new: false },
      { label: "Call Guard Instant Spam Protection", new: false },
    ],
    loading: false,
    discountPercentage: 0,
    showOriginalPrice: true,
    originalPriceAs: "per-member-monthly",
    finalPriceAs: "per-member-monthly",
    isSelected: false,
  }
);

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
const isLoading = computed(() => props.loading || !props.plan);
</script>
<template>
  <div
    class="subs-plan-offer-card"
    :class="{ 'subs-plan-offer-card--primary': isPrimary && !isLoading }"
  >
    <div class="subs-plan-offer-card__header-container">
      <BaseText
        v-if="!isLoading"
        variant="body-2-semibold"
        class="subs-plan-offer-card__header-text"
      >
        {{ plan?.name }}
      </BaseText>
      <span
        v-else
        class="subs-plan-offer-card__skeleton subs-plan-offer-card__header-text-skeleton"
        aria-busy="true"
        aria-label="Loading"
      />
      <div
        v-if="isPrimary && !isLoading"
        class="subs-plan-offer-card__header-recommended-badge"
      >
        <BaseText
          variant="caption-bold"
          class="subs-plan-offer-card__header-recommended-badge-text"
        >
          {{ primaryBadgeText }}
        </BaseText>
      </div>
    </div>
    <div class="subs-plan-offer-card__price-container">
      <BaseText
        v-if="!isLoading"
        variant="headline-2-semibold"
        class="subs-plan-offer-card__price-current"
      >
        {{ formattedPrice(finalPrice) }}
      </BaseText>
      <span
        v-else
        class="subs-plan-offer-card__skeleton subs-plan-offer-card__price-current-skeleton"
        aria-busy="true"
        aria-label="Loading"
      />
      <template v-if="originalPrice && showOriginalPrice">
        <BaseText
          v-if="!isLoading"
          variant="headline-4-bold"
          class="subs-plan-offer-card__price-original"
        >
          {{ formattedPrice(originalPrice) }}
        </BaseText>
        <span
          v-else
          class="subs-plan-offer-card__skeleton subs-plan-offer-card__price-original-skeleton"
          aria-busy="true"
          aria-label="Loading"
        />
      </template>
    </div>
    <BaseText
      v-if="!isLoading"
      variant="body-2-semibold"
      class="subs-plan-offer-card__description"
    >
      {{ description }}
    </BaseText>
    <span
      v-else
      class="subs-plan-offer-card__skeleton subs-plan-offer-card__description-skeleton"
      aria-busy="true"
      aria-label="Loading"
    />
    <div class="subs-plan-offer-card__cta-container">
      <BaseButton
        v-if="!isLoading"
        icon="tick-circle"
        :variant="isSelected ? 'secondary' : 'primary'"
        :background-color="isSelected ? '' : 'purple-gradient'"
        class="subs-plan-offer-card__cta-button"
        @click="emit('ctaClick')"
      >
        {{ isSelected ? "Current plan" : ctaText }}
      </BaseButton>
      <span
        v-else
        class="subs-plan-offer-card__skeleton subs-plan-offer-card__cta-skeleton"
        role="img"
        aria-label="Loading"
      />
    </div>
    <div class="subs-plan-offer-card__features">
      <BaseText
        v-if="!isLoading"
        variant="body-2-semibold"
        class="subs-plan-offer-card__features-title"
      >
        What's included in all plans
      </BaseText>
      <span
        v-else
        class="subs-plan-offer-card__skeleton subs-plan-offer-card__features-title-skeleton"
        aria-busy="true"
        aria-label="Loading"
      />
      <ul
        v-if="!isLoading"
        class="subs-plan-offer-card__features-list"
      >
        <li
          v-for="feature in features"
          :key="feature.label"
          class="subs-plan-offer-card__features-item"
        >
          <BaseIcon
            name="check"
            class="subs-plan-offer-card__features-item-icon"
          />
          <BaseText
            variant="body-3-semibold"
            class="subs-plan-offer-card__features-item-text"
          >
            {{ feature.label }}
            <span
              v-if="feature.new"
              class="subs-plan-offer-card__features-item-new"
            >
              New
            </span>
          </BaseText>
        </li>
      </ul>
      <ul
        v-else
        class="subs-plan-offer-card__features-list"
      >
        <li
          v-for="n in 5"
          :key="n"
          class="subs-plan-offer-card__features-item"
        >
          <span
            class="subs-plan-offer-card__skeleton subs-plan-offer-card__features-icon-skeleton"
            aria-hidden="true"
          />
          <span
            class="subs-plan-offer-card__skeleton subs-plan-offer-card__features-text-skeleton"
            aria-busy="true"
            aria-label="Loading"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped lang="scss">
$component-name: "subs-plan-offer-card";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 30px;
  padding: 24px 20px;
  background-color: $color-base-white-80;
  border: 1px solid $color-base-black-10;
  box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);
  gap: 4px;

  &--primary {
    border: 1px solid $color-spam-protection;
    box-shadow: 0 10px 24px 0 rgb(0 0 0 / 15%);
  }

  &__header {
    &-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      position: relative;

      .#{$component-name}--primary & {
        padding-right: 110px;
      }
    }

    &-recommended-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 10px;
      border-radius: 100px;
      background-color: $color-violet-reflection;
      position: absolute;

      /* remove from flow to avoid affecting card height */
      right: 0;
      top: 0;
      overflow: hidden;

      &::after {
        content: "";
        position: absolute;
        top: -50%;
        left: -30%;
        width: 20px;
        height: 200%;
        background: linear-gradient(
          90deg,
          rgb(255 255 255 / 0%) 0%,
          rgb(255 255 255 / 45%) 50%,
          rgb(255 255 255 / 0%) 100%
        );
        transform: translateX(0) rotate(25deg);
        pointer-events: none;
        animation: badge-shine 4s ease-out infinite;
      }

      &-text {
        color: $color-white;
      }
    }
  }

  &__price {
    &-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &-current {
      font-size: 29px;
      color: $color-base-black-100;
    }

    &-original {
      text-decoration: line-through;
      color: $color-primary-50;
    }
  }

  &__description {
    color: $color-primary-50;
  }

  &__cta {
    &-container {
      width: 100%;
      margin-top: 16px;
    }

    &-button {
      width: 100%;
    }
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 16px;

    &-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;

      &-icon {
        font-weight: 400;
        font-size: 16px;
      }

      &-text {
        color: $color-primary-70;
      }

      &-new {
        color: $color-white;
        background-color: $color-violet-reflection;
        border-radius: 50px;
        padding: 2px 6px;
        font-size: 12px;
        font-weight: 600;
      }
    }
  }
}

/* Skeletons */
.#{$component-name} {
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

  &__header-text-skeleton {
    height: 20px;
    width: 40%;
    min-width: 140px;
    margin-bottom: 12px;
  }

  &__price-current-skeleton {
    height: 32px;
    width: 140px;
  }

  &__price-original-skeleton {
    height: 22px;
    width: 84px;
    margin-bottom: 8px;
  }

  &__description-skeleton {
    height: 18px;
    width: 70%;
    min-width: 200px;
    margin-top: 6px;
  }

  &__cta-skeleton {
    display: block;
    width: 100%;
    height: 44px;
    border-radius: 12px;
    margin-top: 4px;
  }

  &__features-title-skeleton {
    height: 18px;
    width: 60%;
    min-width: 180px;
    margin-top: 4px;
  }

  &__features-icon-skeleton {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 8px;
  }

  &__features-text-skeleton {
    height: 14px;
    width: 70%;
    min-width: 160px;
    margin-top: 8px;
  }
}

@keyframes badge-shine {
  0%,
  80% {
    transform: translateX(-150%) rotate(25deg);
    opacity: 0;
  }

  82% {
    opacity: 0.6;
  }

  100% {
    transform: translateX(950%) rotate(25deg);
    opacity: 0;
  }
}
</style>
