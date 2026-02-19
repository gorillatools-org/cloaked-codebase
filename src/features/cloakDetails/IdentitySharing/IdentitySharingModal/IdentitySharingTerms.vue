<script setup>
import { WEBSITE_TERMS_OF_SERVICE_URL } from "@/scripts/constants";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
</script>

<template>
  <AppModalParagraph class="identity-sharing-terms">
    Read full sharing
    <a
      :href="WEBSITE_TERMS_OF_SERVICE_URL"
      target="_blank"
      class="identity-sharing-terms__link"
    >
      Terms and Conditions
    </a>
    .
  </AppModalParagraph>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.identity-sharing-terms {
  &__link {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
