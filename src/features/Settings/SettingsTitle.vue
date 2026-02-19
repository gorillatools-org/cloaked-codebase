<script setup>
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="h1"
    variant="headline-2-semibold"
    class="settings-title"
  >
    <slot />
  </BaseText>
</template>
