<script setup>
import BaseText from "@/library/BaseText.vue";
import { computed } from "vue";

const props = defineProps({
  time: {
    type: String,
    required: true,
  },
  timeLimitedDiscount: {
    type: [Number, null],
    default: null,
  },
  billingCycle: {
    type: String,
    default: null,
  },
});

const formattedBillingCycle = computed(() =>
  props.billingCycle === "annually" ? "annual" : props.billingCycle
);
</script>

<template>
  <BaseText
    as="p"
    variant="body-2-semibold"
    class="choose-plan-discount-banner"
  >
    Purchase in
    <strong class="choose-plan-discount-banner__time">{{ time }}</strong>
    <span class="choose-plan-discount-banner__saving">
      to save {{ timeLimitedDiscount }}% off your
      {{ formattedBillingCycle }} subscription!
    </span>
  </BaseText>
</template>

<style scoped lang="scss">
.choose-plan-discount-banner {
  border: 2px solid $color-success;
  padding: 16px;
  border-radius: 8px;
  color: $color-primary-100;

  @media all and (min-width: $screen-xl) {
    font-size: 16px;
    line-height: 26px;
  }

  &__time {
    color: $color-success;
  }

  &__saving {
    @media all and (min-width: $screen-xl) {
      display: block;
    }
  }
}
</style>
