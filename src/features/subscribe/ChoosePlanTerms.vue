<script setup>
import {
  WEBSITE_PRIVACY_POLICY_URL,
  WEBSITE_TERMS_OF_SERVICE_URL,
} from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";

defineProps({
  context: {
    type: String,
    default: "default",
    validator: (value) => ["default", "data-delete"].includes(value),
  },
});
</script>

<template>
  <BaseText
    as="p"
    variant="body-small-medium"
    class="choose-plan-terms"
  >
    <template v-if="context === 'data-delete'">
      Cloaked Data Removal is subject to each site's agency access, and efficacy
      is based on each site's action.
    </template>
    By creating an account you agree to the
    <a
      :href="WEBSITE_TERMS_OF_SERVICE_URL"
      target="_blank"
      class="choose-plan-terms__link"
    >
      Terms &amp; Conditions
    </a>
    and
    <a
      :href="WEBSITE_PRIVACY_POLICY_URL"
      target="_blank"
      class="choose-plan-terms__link"
    >
      Privacy Policy
    </a>
    .
  </BaseText>
</template>

<style lang="scss" scoped>
.choose-plan-terms {
  opacity: 0.8;

  &__link {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
