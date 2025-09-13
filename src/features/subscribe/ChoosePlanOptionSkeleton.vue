<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import type { PlanType } from "@/features/subscribe/types.ts";

type ChoosePlanOptionSkeletonProps = {
  type?: PlanType;
};

withDefaults(defineProps<ChoosePlanOptionSkeletonProps>(), {
  type: "individual",
});
</script>

<template>
  <div
    class="choose-plan-option choose-plan-option-skeleton"
    :class="`choose-plan-option-skeleton--${type}`"
  >
    <div class="choose-plan-option__content">
      <BaseText
        variant="headline-4-bold"
        class="choose-plan-option__title choose-plan-option-skeleton__title"
      >
        {{ type }}
        <span class="choose-plan-option__after-title">
          &nbsp;•&nbsp;&nbsp;
          <span
            class="choose-plan-option-skeleton__after-title choose-plan-option-skeleton__skeleton"
          />
        </span>
      </BaseText>
      <div
        class="choose-plan-option-skeleton__text choose-plan-option-skeleton__skeleton"
      />
      <div
        v-if="type !== 'individual'"
        class="choose-plan-option-skeleton__after-text choose-plan-option-skeleton__skeleton"
      />
    </div>
    <div
      class="choose-plan-option-skeleton__icon choose-plan-option-skeleton__skeleton"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.choose-plan-option-skeleton {
  border: 2px solid $color-primary-10 !important;
  cursor: wait !important;

  &__skeleton {
    @at-root .theme-dark & {
      @include base-skeleton($color-primary-10, 0.5, $white, 0.3);
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
      @at-root .choose-plan-option-skeleton--family & {
        width: 100px;
      }
    }
  }

  &__text {
    margin: 6px 0 4px;
    height: 13px;
    width: 100px;
    border-radius: 100px;

    @at-root .choose-plan-option-skeleton--couple &,
      .choose-plan-option-skeleton--family & {
      width: 170px;
    }
  }

  &__after-text {
    margin: 4px 0;
    height: 13px;
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
