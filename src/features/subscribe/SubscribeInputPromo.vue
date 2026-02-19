<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import DataDeleteInput from "@/features/data-delete/atoms/DataDeleteInput.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  isValid: {
    type: Boolean,
    default: false,
  },
  isValidating: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["validate", "update:modelValue"]);
</script>

<template>
  <DataDeleteInput
    placeholder="Promo code"
    class="subscribe-input-promo"
    :error="error"
    @keydown.enter="$emit('validate')"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #after-input>
      <button
        v-if="isValidating"
        key="promo-validating"
        type="button"
        tabindex="-1"
        class="subscribe-input-promo__button"
        disabled
      >
        <InlineSvg name="spinner" />
      </button>
      <button
        v-else-if="isValid"
        key="promo-clear"
        type="button"
        tabindex="-1"
        class="subscribe-input-promo__button"
        @click="$emit('update:modelValue', '')"
      >
        <InlineSvg name="close-outline" />
      </button>
      <button
        v-else
        key="promo-validate"
        type="button"
        tabindex="-1"
        class="subscribe-input-promo__button"
        :disabled="!$attrs.modelValue"
        @click="$emit('validate')"
      >
        <InlineSvg name="arrow-right" />
      </button>
    </template>
    <template
      v-if="error"
      #after
    >
      <BaseText
        variant="body-small-medium"
        as="p"
        class="subscribe-input-promo__error"
      >
        This code is not valid
      </BaseText>
    </template>
  </DataDeleteInput>
</template>

<style lang="scss" scoped>
.subscribe-input-promo {
  &__button {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 40px;
    height: 60px;
    background-color: transparent;
    border: none;
    opacity: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-100;

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__error {
    margin-top: 4px;
    color: $color-alert;
  }
}
</style>
