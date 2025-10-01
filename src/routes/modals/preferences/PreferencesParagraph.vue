<script setup>
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="p"
    variant="body-2-semibold"
    class="preferences-paragraph"
  >
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.preferences-paragraph {
  color: $color-primary-70;

  strong {
    font-weight: 600;
  }

  + .preferences-paragraph {
    margin-top: 21px;
  }
}
</style>
