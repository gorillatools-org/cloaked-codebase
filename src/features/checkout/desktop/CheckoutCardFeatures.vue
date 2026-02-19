<script setup lang="ts">
import { ref } from "vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import CheckoutFeature from "@/features/checkout/CheckoutFeature.vue";
import { CLOAKED_PLAN_FEATURES } from "@/features/checkout/constants.ts";

const isExpanded = ref<boolean>(false);
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    rounding="sm"
    class="checkout-card-features"
  >
    <CheckoutTitle>Features included</CheckoutTitle>
    <ul
      class="checkout-card-features__list"
      :class="{ 'checkout-card-features__list--expanded': isExpanded }"
    >
      <CheckoutFeature
        v-for="feature in CLOAKED_PLAN_FEATURES"
        :key="feature.title"
        :feature="feature"
        class="checkout-card-features__list-item"
      />
    </ul>
    <template v-if="!isExpanded">
      <CheckoutDivider class="checkout-card-features__divider" />
      <BaseText
        variant="body-2-semibold"
        class="checkout-card-features__show-all"
        @click="isExpanded = true"
      >
        <BaseIcon
          name="plus"
          class="checkout-card-features__show-all-expand"
        />
        See all features
      </BaseText>
    </template>
  </BaseSheet>
</template>

<style scoped lang="scss">
.checkout-card-features {
  background: $color-base-black-5;
  border: none;

  &__list {
    margin-top: 16px;

    &-item {
      &:nth-child(n + 5) {
        display: none;

        @at-root .checkout-card-features__list--expanded & {
          display: grid;
        }
      }
    }
  }

  & &__divider {
    margin: 16px 0;
  }

  &__show-all {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    cursor: pointer;
    padding: 4px 0;

    &:hover {
      opacity: 0.8;
    }

    &-expand {
      width: 18px;
    }
  }
}
</style>
