<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    required: false,
    default: null,
  },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <button
    v-bind="$attrs"
    class="subscribe-toggle"
    :class="{
      'subscribe-toggle--selected': modelValue === name,
    }"
    @click="$emit('update:modelValue', name)"
  >
    <slot />
  </button>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.subscribe-toggle {
  padding: 8px 12px;
  border-radius: 10px;
  color: $color-primary-100;
  cursor: pointer;
  border: 3px solid transparent;
  text-align: left;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.1);
  }

  @at-root .theme-light & {
    background: rgba($color-primary-100-light, 0.1);
  }

  &:hover {
    opacity: 0.8;
  }

  &--selected {
    border: 3px solid $color-primary-100;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
