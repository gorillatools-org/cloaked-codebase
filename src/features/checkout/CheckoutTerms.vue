<script setup>
import BaseText from "@/library/BaseText.vue";
import {
  WEBSITE_PRIVACY_POLICY_URL,
  WEBSITE_TERMS_OF_SERVICE_URL,
} from "@/scripts/constants.js";
</script>

<template>
  <BaseText
    as="p"
    variant="body-small-medium"
    class="checkout-terms"
  >
    <slot />
    By creating an account you agree to the
    <a
      :href="WEBSITE_TERMS_OF_SERVICE_URL"
      target="_blank"
      class="checkout-terms__link"
    >
      Terms &amp; Conditions
    </a>
    and
    <a
      :href="WEBSITE_PRIVACY_POLICY_URL"
      target="_blank"
      class="checkout-terms__link"
    >
      Privacy Policy
    </a>
    .
  </BaseText>
</template>

<style lang="scss" scoped>
.checkout-terms {
  text-align: center;
  max-width: 330px;
  margin: 0 auto;
  color: $color-base-black-60;

  &__link {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
