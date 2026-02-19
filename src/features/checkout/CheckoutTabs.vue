<script lang="ts">
type Option = {
  value: string;
  label: string;
};
</script>

<script setup lang="ts" generic="T extends Option">
import BaseText from "@/library/BaseText.vue";

type CheckoutTabsProps<T> = {
  options: T[];
  disabled?: boolean;
};

withDefaults(defineProps<CheckoutTabsProps<T>>(), { disabled: false });

const model = defineModel<T["value"]>();
</script>

<template>
  <div class="checkout-tabs">
    <label
      v-for="option in options"
      :key="option.value"
      class="checkout-tabs__label"
    >
      <input
        v-model="model"
        type="radio"
        class="checkout-tabs__input"
        :value="option.value"
        :disabled="disabled"
      />
      <BaseText variant="body-3-semibold">
        {{ option.label }}
      </BaseText>
    </label>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.checkout-tabs {
  display: flex;
  cursor: pointer;
  background-color: $color-primary-10;
  border-radius: 100px;

  &__label {
    padding: 10px 0;
    cursor: pointer;
    color: $color-primary-70;
    border-radius: 100px;
    border: 1px solid $color-primary-10;
    text-align: center;
    flex: 1;
    display: block;

    &:has(.checkout-tabs__input:checked) {
      background-color: $color-base-white-100;
      border-radius: 100px;
      color: $color-primary-100;
      border: 1px solid $color-base-black-15;
      box-shadow: 0 4px 24px 0 rgba($black, 0.05);
    }

    &:has(.checkout-tabs__input:disabled) {
      opacity: 0.8;
      cursor: not-allowed;
    }
  }

  &__input {
    display: none;
  }
}
</style>
