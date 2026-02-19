<script setup lang="ts">
import { ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";

type Feature = {
  title: string;
  detail: string;
};

type CheckoutFeatureProps = {
  feature: Feature;
};

defineProps<CheckoutFeatureProps>();

const isExpanded = ref(false);
</script>

<template>
  <li
    class="checkout-feature"
    :class="{
      'checkout-feature--expanded': isExpanded,
    }"
    @click="isExpanded = !isExpanded"
  >
    <BaseIcon
      name="chevron-down"
      class="checkout-feature__expand"
    />
    <BaseText
      variant="body-2-semibold"
      class="checkout-feature__title"
    >
      {{ feature.title }}
    </BaseText>
    <BaseIcon
      name="check"
      class="checkout-feature__checkmark"
    />
    <BaseText
      variant="body-small-medium"
      class="checkout-feature__detail"
    >
      {{ feature.detail }}
    </BaseText>
  </li>
</template>

<style scoped lang="scss">
.checkout-feature {
  display: grid;
  grid-template-columns: 18px 1fr 18px;
  grid-template-areas: "expand title checkmark" "detail detail detail";
  align-items: center;
  column-gap: 8px;
  cursor: pointer;
  padding: 4px 0;

  &__title {
    grid-area: title;

    @at-root .checkout-feature:hover & {
      opacity: 0.8;
    }
  }

  &__detail {
    display: none;
    grid-area: detail;

    @at-root .checkout-feature--expanded & {
      display: block;
      flex-shrink: 0;
      width: 100%;
      padding: 0 25px;
      opacity: 0.7;
    }
  }

  &__checkmark {
    margin-left: auto;
    grid-area: checkmark;
  }

  &__expand {
    grid-area: expand;

    @at-root .checkout-feature--expanded & {
      transform: rotate(180deg);
    }
  }
}
</style>
