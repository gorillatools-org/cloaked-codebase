<script setup>
import BaseText from "@/library/BaseText.vue";
const props = defineProps({
  title: {
    type: String,
    required: false,
    default: null,
  },
});
</script>
<template>
  <div class="title-wrapper">
    <BaseText
      as="h1"
      variant="headline-3-bold"
    >
      {{ props.title }}
    </BaseText>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.title-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
