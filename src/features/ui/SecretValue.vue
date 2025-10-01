<script setup>
import BaseTextHiddenDots from "@/library/BaseTextHiddenDots.vue";

const props = defineProps({
  isHidden: {
    type: Boolean,
    required: true,
  },
  count: {
    type: Number,
    default: 22,
  },
  variant: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div>
    <template v-if="props?.isHidden">
      <BaseTextHiddenDots
        :variant="props.variant"
        :count="props.count"
      />
    </template>
    <slot v-else />
  </div>
</template>
