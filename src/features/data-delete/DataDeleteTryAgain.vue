<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const { isMobile } = useDisplay();
</script>

<template>
  <div class="data-delete__page data-delete-try-again">
    <InlineSvg
      name="x-circle"
      class="data-delete__title-icon red"
    />
    <BaseText
      as="h1"
      :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
      class="data-delete__title"
    >
      Something went wrong!
    </BaseText>
    <BaseText
      as="p"
      variant="headline-6-medium"
      class="data-delete__text"
    >
      This search could not be completed. Please try again later.
    </BaseText>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-try-again {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: clamp(40px, 5vh, 150px);

  &.data-delete__page > * {
    opacity: 0;
    animation: appear-bottom-5 0.4s forwards ease-out;

    @for $i from 1 through 3 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 0.05s;
      }
    }
  }
}

.red {
  color: $color-alert;
}
</style>
