<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay";

defineProps<{
  title?: string;
  value?: string | number;
  isValueLoading?: boolean;
}>();

const { isMobile } = useDisplay();
</script>

<template>
  <div class="subs-billing-details-row">
    <div class="subs-billing-details-row__title-container">
      <slot name="title">
        <BaseText
          :variant="isMobile ? 'body-small-semibold' : 'body-3-semibold'"
          class="subs-billing-details-row__title-text"
        >
          {{ title }}
        </BaseText>
      </slot>
    </div>
    <div class="subs-billing-details-row__value-container">
      <slot
        v-if="!isValueLoading"
        name="value"
      >
        <BaseText
          variant="body-3-semibold"
          class="subs-billing-details-row__value-text"
        >
          {{ value }}
        </BaseText>
      </slot>
      <span
        v-else
        class="subs-billing-details-row__skeleton"
        aria-busy="true"
        aria-label="Loading"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@mixin value-skeleton {
  @at-root .theme-dark & {
    @include base-skeleton($color-primary-10, 0.5, #000, 0.5);
  }

  @at-root .theme-light & {
    @include base-skeleton($color-primary-10, 0.6);
  }
}

$component-name: "subs-billing-details-row";

.#{$component-name} {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;

  &__title-text {
    color: $color-primary-50;
  }

  &__value {
    &-container {
      display: grid;
      place-items: center end;
      min-height: 18px;
      position: relative;
    }

    &-text {
      color: $color-base-black-100;
      grid-area: 1 / 1;
      z-index: 1;
      will-change: opacity, transform;
    }
  }

  &__skeleton {
    grid-area: 1 / 1;
    display: inline-block;
    height: 18px;
    width: 80px;
    border-radius: 4px;

    @include value-skeleton;
  }
}
</style>
