<script setup>
import BaseText from "@/library/BaseText.vue";
const props = defineProps({
  header: {
    type: String,
    default: "",
  },
  subheader: {
    type: String,
    default: "",
  },
});
</script>
<template>
  <div class="subtitle">
    <BaseText
      as="h2"
      variant="headline-4-bold"
      class="subtitle__header"
    >
      {{ props.header }}
      <slot />
    </BaseText>
    <BaseText
      as="p"
      variant="headline-6-medium"
      class="subtitle__subheader"
    >
      {{ props.subheader }}
    </BaseText>
  </div>
</template>
<style scoped lang="scss">
.subtitle {
  &__header {
    color: $color-primary-100;
    max-width: 66%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    justify-content: flex-start;
  }

  &__subheader {
    margin-top: 8px;
    max-width: 66%;
  }
}
</style>
