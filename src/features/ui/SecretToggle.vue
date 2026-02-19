<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

defineProps({
  value: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["input"]);
</script>

<template>
  <button
    class="secret-toggle"
    @click="$emit('input', !value)"
  >
    <InlineSvg
      v-if="value"
      name="eye"
      class="secret-toggle__icon"
    />
    <InlineSvg
      v-else
      name="eye-slash"
      class="secret-toggle__icon"
    />
  </button>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.secret-toggle {
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;

  &__icon {
    cursor: pointer;
    box-sizing: content-box;
    flex-shrink: 0;
    color: $color-primary-100;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
