<script setup>
import BaseText from "@/library/BaseText.vue";
import { WEBSITE_TERMS_OF_SERVICE_URL } from "@/scripts/constants.js";
</script>

<template>
  <BaseText
    variant="caption-semibold"
    class="monitoring-terms"
  >
    Available on iOS and Android. View
    <a
      :href="WEBSITE_TERMS_OF_SERVICE_URL"
      target="_blank"
      class="monitoring-terms__link"
    >
      Terms of Service
    </a>
  </BaseText>
</template>

<style scoped lang="scss">
.monitoring-terms {
  color: $color-primary-70;
  text-align: center;

  &__link {
    color: $color-primary-100;
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
