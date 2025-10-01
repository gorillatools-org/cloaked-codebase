<script setup>
import BaseText from "@/library/BaseText.vue";

defineProps({
  options: {
    type: Array,
    default: () => [],
  },
});

const model = defineModel({ type: String, default: "" });
</script>

<template>
  <div class="button-toggle">
    <BaseText
      v-for="option in options"
      :key="option.id"
      as="button"
      variant="body-3-semibold"
      class="button-toggle__option"
      :class="{ 'button-toggle__option--selected': model === option.id }"
      @click="model = option.id"
    >
      {{ option.label }}
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
.button-toggle {
  border: 1px solid $color-primary-50;
  border-radius: 100px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;

  &__option {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px 14px;
    border-radius: 100px;
    flex-grow: 1;

    @at-root .button-toggle:hover & {
      opacity: 0.9;
    }

    &--selected {
      color: $color-primary-1;
      background-color: $color-primary-100;
    }
  }
}
</style>
