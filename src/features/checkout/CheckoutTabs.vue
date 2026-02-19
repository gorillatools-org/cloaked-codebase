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
  border-radius: 100px;
  border: 1px solid $color-base-black-10;

  &__label {
    padding: 12px 0;
    color: $color-base-black-100;
    border-radius: 100px;
    text-align: center;
    cursor: pointer;
    flex: 1;

    &:hover {
      opacity: 0.8;
    }

    &:has(.checkout-tabs__input:disabled) {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:has(.checkout-tabs__input:checked) {
      background-color: $color-base-black-100;
      color: $color-base-white-100;
      opacity: 1;
      cursor: default;
    }

    &:has(.checkout-tabs__input:checked):has(.checkout-tabs__input:disabled) {
      opacity: 0.2;
    }
  }

  &__input {
    display: none;
  }
}
</style>
