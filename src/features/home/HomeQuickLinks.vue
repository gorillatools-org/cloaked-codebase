<script setup>
import {
  HELP_CENTER_HOUSEKEEPING_URL,
  HELP_CENTER_TEXT_FAQ_URL,
  HELP_CENTER_FORWARDING_FAQ_URL,
  HELP_CENTER_AUTOFILL_FAQ_URL,
  WEBSITE_WAYS_TO_USE_UTL,
} from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog.js";
import BaseText from "@/library/BaseText.vue";

function openQuickLinks(externalUrl) {
  posthogCapture("user_clicked_article", {
    website: externalUrl,
  });
  window.open(externalUrl, "_blank");
}
</script>
<template>
  <section class="quick-links">
    <BaseText
      as="h1"
      variant="headline-3-bold"
    >
      Quick links
    </BaseText>
    <BaseText
      as="div"
      variant="headline-6-medium"
      underline
      class="link"
      @click="openQuickLinks(HELP_CENTER_HOUSEKEEPING_URL)"
    >
      How to complete your Cloaked account set up
    </BaseText>
    <BaseText
      as="div"
      variant="headline-6-medium"
      underline
      class="link"
      @click="openQuickLinks(HELP_CENTER_TEXT_FAQ_URL)"
    >
      How do Cloaked phone calls and text messages work?
    </BaseText>
    <BaseText
      as="div"
      variant="headline-6-medium"
      underline
      class="link"
      @click="openQuickLinks(HELP_CENTER_FORWARDING_FAQ_URL)"
    >
      How to manage email and phone forwarding
    </BaseText>
    <BaseText
      as="div"
      variant="headline-6-medium"
      underline
      class="link"
      @click="openQuickLinks(HELP_CENTER_AUTOFILL_FAQ_URL)"
    >
      Frequently asked questions about Autofill
    </BaseText>
    <BaseText
      as="div"
      variant="headline-6-medium"
      underline
      class="link"
      @click="openQuickLinks(WEBSITE_WAYS_TO_USE_UTL)"
    >
      5 exciting ways to use the Cloaked mobile app
    </BaseText>
  </section>
</template>
<style lang="scss" scoped>
.quick-links {
  display: flex;
  padding: 24px 24px 40px 32px;
  align-items: flex-start;
  gap: 24px;
  border-radius: 20px;
  background-color: $color-primary-5;
  flex-direction: column;
  width: 100%;

  @media (width <= 1200px) {
    width: 100%;
    margin-top: 48px;
  }

  .link {
    cursor: pointer;
    color: $color-primary-70;
    transition: all 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    &:hover {
      transition: all 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      transform: scale(1.005);
      color: $color-primary-100;
    }
  }
}
</style>
