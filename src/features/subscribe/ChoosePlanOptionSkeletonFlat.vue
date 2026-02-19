<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import type { PlanBilling, PlanType } from "@/features/subscribe/types.ts";

type ChoosePlanOptionSkeletonFlatProps = {
  type?: PlanType;
  billing?: PlanBilling;
};

withDefaults(defineProps<ChoosePlanOptionSkeletonFlatProps>(), {
  type: "individual",
  billing: "annually",
});
</script>

<template>
  <div
    class="plan-option-skeleton"
    :class="`plan-option-skeleton--${type}`"
  >
    <div class="plan-option-skeleton__icon plan-option-skeleton__skeleton" />
    <div class="choose-plan-option__content">
      <BaseText
        variant="headline-4-bold"
        class="choose-plan-option__title plan-option-skeleton__title"
      >
        <span
          v-if="type !== 'individual'"
          class="plan-option-skeleton__title-type"
        >
          {{ type }}
        </span>
        {{
          billing === "2-yearly"
            ? "2-Yearly"
            : billing === "annually"
              ? "Yearly"
              : "Monthly"
        }}
        <span class="choose-plan-option__after-title">
          &nbsp;•&nbsp;&nbsp;
          <span
            class="plan-option-skeleton__after-title plan-option-skeleton__skeleton"
          />
        </span>
      </BaseText>
      <div class="plan-option-skeleton__text plan-option-skeleton__skeleton" />
      <div
        v-if="type !== 'individual' || billing !== 'monthly'"
        class="plan-option-skeleton__after-text plan-option-skeleton__skeleton"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.plan-option-skeleton {
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: wait;

  &__skeleton {
    @at-root .theme-dark & {
      @include base-skeleton(
        $color-primary-10-light,
        0.05,
        $color-primary-10-dark,
        0.5
      );
    }

    @at-root .theme-light & {
      @include base-skeleton($color-primary-20);
    }
  }

  &__title {
    text-transform: capitalize;
  }

  &__after-title {
    display: inline-block;
    height: 15px;
    width: 60px;
    border-radius: 100px;

    @media screen and (width >= 768px) {
      @at-root .plan-option-skeleton--family & {
        width: 100px;
      }
    }
  }

  &__text {
    margin: 6px 0 4px;
    height: 15px;
    width: 100px;
    border-radius: 100px;

    @at-root .plan-option-skeleton--couple &,
      .plan-option-skeleton--family & {
      width: 170px;
    }
  }

  &__after-text {
    margin: 4px 0;
    height: 16px;
    width: 60px;
    border-radius: 100px;
  }

  &__icon {
    width: 26px;
    height: 26px;
    border-radius: 26px;
  }
}
</style>
