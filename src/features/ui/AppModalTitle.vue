<script setup>
import BaseText from "@/library/BaseText.vue";
import { computed } from "vue";
const props = defineProps({
  size: {
    type: [String, null],
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
});

const textVariant = computed(() => {
  return props.size === "lg" ? "headline-2-semibold" : "headline-4-bold";
});
</script>

<template>
  <BaseText
    as="h3"
    :variant="textVariant"
    class="app-modal-title"
  >
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
.app-modal-title {
  padding: 0 32px;
  margin-top: 32px;
}
</style>
