<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  text: {
    type: String,
    default: "Hassle free 30 day money back guarantee. Switch plans anytime.",
  },
});
</script>

<template>
  <BaseText
    as="p"
    variant="body-small-medium"
    class="choose-plan-guarantee"
  >
    <InlineSvg
      name="shield-lightening"
      class="choose-plan-guarantee__icon"
    />
    {{ text }}
  </BaseText>
</template>

<style scoped lang="scss">
.choose-plan-guarantee {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid $color-primary-50;

  &__icon {
    width: 16px;
    height: 16px;
  }
}
</style>
