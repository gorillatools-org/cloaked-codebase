<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import { useWindowSize } from "@vueuse/core";
import { computed, toRef } from "vue";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling.js";
import { usePlanMembers } from "@/features/subscribe/composables/usePlanMembers.js";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import { usePriceAnchor } from "@/features/subscribe/composables/usePriceAnchor.js";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.js";
import { useSavings } from "@/features/subscribe/composables/useSavings.js";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";
import BaseText from "@/library/BaseText.vue";
import { useBillingCycles } from "@/features/subscribe/composables/useBillingCycles.js";
import { type Plan } from "@/features/subscribe/types.js";

export type ChoosePlanOptionProps = {
  plan: Plan;
  disabled?: boolean;
  active?: boolean;
  discount?: number | null;
  anchor?: number | null;
  compareAt?: number | null;
};

const props = withDefaults(defineProps<ChoosePlanOptionProps>(), {
  disabled: false,
  active: false,
  discount: null,
  anchor: null,
  compareAt: null,
});

const model = defineModel<string | null>({ default: null });

const { width } = useWindowSize();
const isMobile = computed(() => width.value <= 768);

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
    class="choose-plan-option"
    :class="[
      `choose-plan-option--${type?.toLowerCase()}`,
      {
        'choose-plan-option--active': active,
        'choose-plan-option--disabled': disabled,
      },
    ]"
  >
    <span class="choose-plan-option__content">
      <BaseText
        variant="headline-4-bold"
        class="choose-plan-option__title"
      >
        <template v-if="type !== 'Individual'">
          {{ type }}
        </template>
        {{ billing }}
        <BaseText
          v-if="members"
          variant="body-3-semibold"
          class="choose-plan-option__after-title"
        >
          &nbsp;&nbsp;•&nbsp;&nbsp;
          {{ members }}
        </BaseText>
      </BaseText>
      <BaseText variant="body-3-semibold">
        <span
          v-if="isValidPrice(anchoredPerMemberPrice)"
          class="choose-plan-option__original-price"
        >
          {{ formattedPrice(anchoredPerMemberPrice) }}
        </span>
        <span
          v-else-if="isValidPrice(discountedPerMemberPrice)"
          class="choose-plan-option__original-price"
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
        v-if="savings && type !== 'Individual'"
        variant="body-3-semibold"
        class="choose-plan-option__after-text"
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
      class="choose-plan-option__input"
    />
    <slot name="icon">
      <BaseText
        v-if="$attrs.active"
        variant="body-3-semibold"
        class="choose-plan-option__current-plan"
      >
        {{ isMobile ? "Current" : "Current plan" }}
      </BaseText>
      <template v-else>
        <InlineSvg
          name="checkmark"
          class="choose-plan-option__icon choose-plan-option__icon--selected"
        />
        <InlineSvg
          name="radio-inactive"
          class="choose-plan-option__icon choose-plan-option__icon--unselected"
        />
      </template>
    </slot>
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.choose-plan-option {
  padding: 8px 16px;
  border: 2px solid $color-primary-10;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  &:hover {
    border: 2px solid $color-primary-50;
  }

  &:has(.choose-plan-option__input:checked) {
    border: 2px solid $color-primary-100;
  }

  &--disabled,
  &--active {
    background-color: $color-primary-5;
    border: 2px solid $color-primary-5 !important;
    cursor: default;
  }

  &--disabled {
    .choose-plan-option__icon {
      opacity: 0.2;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__title {
    display: block;
  }

  &__after-title {
    opacity: 0.9;
  }

  &__after-text {
    display: block;

    @at-root .choose-plan-option--couple & {
      @at-root .theme-dark & {
        color: $color-brand-2-90-light;
      }

      @at-root .theme-light & {
        color: $color-brand-2-50-dark;
      }
    }

    @at-root .choose-plan-option--family & {
      @at-root .theme-dark & {
        color: $color-brand-3-90-light;
      }

      @at-root .theme-light & {
        color: $color-brand-3-70-dark;
      }
    }
  }

  &__original-price {
    text-decoration: line-through;
    margin-right: 4px;
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

      @at-root .choose-plan-option__input:checked ~ & {
        display: block;
      }
    }

    &--unselected {
      @at-root .choose-plan-option__input:checked ~ & {
        display: none;
      }
    }
  }

  &__current-plan {
    opacity: 0.9;
  }
}
</style>
