<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="div"
    variant="headline-6-medium"
    class="data-delete-card-info"
  >
    <InlineSvg
      name="tip-info"
      class="data-delete-card-info__icon"
    />
    <slot />
  </BaseText>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-card-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  @media all and (min-width: $screen-xl) {
    gap: 16px;
  }

  &__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
}
</style>
