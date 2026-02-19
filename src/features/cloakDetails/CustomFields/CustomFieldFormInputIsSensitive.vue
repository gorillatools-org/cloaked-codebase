<script setup>
import BorderInputSwitch from "@/features/BorderInputSwitch.vue";
defineEmits(["input"]);
defineProps({
  value: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <BorderInputSwitch
    v-bind="$attrs"
    title="Sensitive Information"
    text="Hide this content by default"
    :value="value"
    @input="$emit('input', $event)"
  />
</template>
