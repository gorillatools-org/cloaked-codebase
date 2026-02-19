<script setup>
import { useAttrs } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";

defineProps({
  label: {
    type: String,
    default: "Add",
  },
});
const attrs = useAttrs();
</script>

<template>
  <button
    v-bind="attrs"
    class="button-add"
  >
    <InlineSvg name="plus" />
    {{ label }}
  </button>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.button-add {
  display: flex;
  justify-content: flex-start;
  background: none;
  border: none;
  align-items: center;
  gap: 12px;
  color: $color-primary-50;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  padding: 12px 0;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}
</style>
