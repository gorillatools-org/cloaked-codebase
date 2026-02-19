<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import { toRef, computed } from "vue";
import { usePlanMembers } from "@/features/subscribe/composables/usePlanMembers.js";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling.js";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.js";
import { usePriceAnchor } from "@/features/subscribe/composables/usePriceAnchor.js";
import { useSavings } from "@/features/subscribe/composables/useSavings.js";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";
import BaseText from "@/library/BaseText.vue";
import { useBillingCycles } from "@/features/subscribe/composables/useBillingCycles.js";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { type ChoosePlanOptionProps } from "@/features/subscribe/ChoosePlanOption.vue";
import { PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT } from "@/scripts/posthogEvents";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const isBlueCheckout = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "checkout-cta-blue-color"
);

const props = withDefaults(defineProps<ChoosePlanOptionProps>(), {
  disabled: false,
  active: false,
  discount: null,
  anchor: null,
  compareAt: null,
});

const model = defineModel<string | null>({ default: null });

const plan = toRef(() => props.plan);
const discount = toRef(() => props.discount);
const anchor = toRef(() => props.anchor);
const compareAtPerMemberPrice = toRef(() => props.compareAt);

const type = usePlanType(plan);
const billing = usePlanBilling(plan);
const members = usePlanMembers(plan);

const perMemberPrice = usePlanPrice(plan, "per-member-monthly");
const anchoredPerMemberPrice = usePriceAnchor(perMemberPrice, anchor);
const discountedPerMemberPrice = usePriceDiscount(perMemberPrice, discount);

const savings = useSavings(perMemberPrice, compareAtPerMemberPrice);

const availableBillingCycles = useBillingCycles();
</script>

<template>
  <label
    class="plan-option"
    :class="[
      `plan-option--${type?.toLowerCase()}`,
      {
        'plan-option--active': active,
        'plan-option--disabled': disabled,
        'plan-option--uniform-blue': isBlueCheckout,
      },
    ]"
  >
    <slot name="icon">
      <InlineSvg
        name="checkmark"
        class="plan-option__icon plan-option__icon--selected"
      />
      <InlineSvg
        name="radio-inactive"
        class="plan-option__icon plan-option__icon--unselected"
      />
    </slot>
    <span class="plan-option__content">
      <BaseText
        variant="headline-4-bold"
        class="plan-option__title"
      >
        <span
          v-if="type !== 'Individual'"
          class="plan-option__title-type"
        >
          {{ type }}
        </span>
        {{ billing }}
        <BaseText
          v-if="members"
          variant="body-3-semibold"
          class="plan-option__after-title"
        >
          &nbsp;•&nbsp;
          {{ members }}
        </BaseText>
      </BaseText>
      <BaseText variant="body-3-semibold">
        <span
          v-if="isValidPrice(anchoredPerMemberPrice)"
          class="plan-option__original-price"
        >
          {{ formattedPrice(anchoredPerMemberPrice) }}
        </span>
        <span
          v-else-if="isValidPrice(discountedPerMemberPrice)"
          class="plan-option__original-price"
        >
          {{ formattedPrice(perMemberPrice) }}
        </span>
        <span v-if="isValidPrice(discountedPerMemberPrice)">
          {{
            `${formattedPrice(discountedPerMemberPrice)}${type === "Individual" ? "/per month" : "/member per month"}`
          }}
        </span>
        <span v-else>
          {{
            `${formattedPrice(perMemberPrice)}${type === "Individual" ? "/per month" : "/member per month"}`
          }}
        </span>
      </BaseText>
      <BaseText
        v-if="savings"
        variant="body-3-semibold"
        class="plan-option__after-text"
      >
        Save {{ savings }}%
        <template
          v-if="plan.recurring_interval !== availableBillingCycles.at(-1)"
        >
          {{
            billing === "2-Yearly"
              ? "billed every 2 years"
              : billing === "Yearly"
                ? "billed annually"
                : null
          }}
        </template>
      </BaseText>
    </span>
    <input
      v-bind="$attrs"
      v-model="model"
      :value="plan.product_id"
      type="radio"
      class="plan-option__input"
    />
  </label>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.plan-option {
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 26px 1fr;
  align-items: center;
  gap: 16px;

  &:hover {
    opacity: 0.8;
  }

  &:has(.plan-option__input:checked) {
    opacity: 1;
  }

  &--disabled,
  &--active {
    cursor: not-allowed;

    &:hover {
      opacity: 1;
    }
  }

  &--disabled {
    .plan-option__icon {
      opacity: 0.2;
    }
  }

  &__content {
    grid-column-start: 2;
  }

  &__title {
    display: block;
  }

  &__after-title {
    opacity: 0.9;
  }

  &__original-price {
    text-decoration: line-through;
    margin-right: 4px;
  }

  &__after-text {
    display: block;

    @at-root .plan-option--individual & {
      @at-root .theme-dark & {
        color: $color-brand-1-90-dark;
      }

      @at-root .theme-light & {
        color: $color-brand-1-90-dark;
      }
    }

    @at-root .plan-option--couple & {
      @at-root .theme-dark & {
        color: $color-brand-2-90-light;
      }

      @at-root .theme-light & {
        color: $color-brand-2-50-dark;
      }
    }

    @at-root .plan-option--family & {
      @at-root .theme-dark & {
        color: $color-brand-3-90-light;
      }

      @at-root .theme-light & {
        color: $color-brand-3-90-dark;
      }
    }

    @at-root .plan-option--uniform-blue & {
      @at-root .theme-dark & {
        color: $color-brand-3-90-light;
      }

      @at-root .theme-light & {
        color: $color-brand-3-90-dark;
      }
    }
  }

  &__input {
    position: absolute;
    opacity: 0;
  }

  &__icon {
    width: 26px;
    height: 26px;
    flex-shrink: 0;

    &--selected {
      display: none;

      &:has(~ .plan-option__input:checked) {
        display: block;
      }
    }

    &--unselected {
      &:has(~ .plan-option__input:checked) {
        display: none;
      }
    }
  }
}
</style>
