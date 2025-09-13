<script setup>
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="p"
    variant="headline-6-medium"
    class="settings-paragraph"
  >
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.settings-paragraph {
  margin-top: 12px;

  a {
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
