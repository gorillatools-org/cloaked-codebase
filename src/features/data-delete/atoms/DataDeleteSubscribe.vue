<script setup>
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import SubscribeGuarantee from "@/features/subscribe/SubscribeGuarantee.vue";
</script>

<template>
  <DataDeleteSticky class="data-delete-subscribe">
    <SubscribeGuarantee class="data-delete-subscribe__guarantee" />
    <BaseButton
      variant="cloaked-gradient"
      icon="arrow-right"
      v-bind="$attrs"
      class="data-delete-subscribe__cta"
    >
      Subscribe now
    </BaseButton>
  </DataDeleteSticky>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-subscribe {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: appear-bottom-5 0.5s forwards ease-out;
  animation-delay: 0.4s;

  @media all and (min-width: $screen-xl) {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 16px;
    animation: none;
    opacity: 1;
  }

  &__guarantee {
    @media all and (min-width: $screen-xl) {
      display: block;
      width: 180px;
      height: calc(40px * (180 / 161));
      animation: appear-bottom-5 0.5s forwards ease-out;
      opacity: 0;
      animation-delay: 0.5s;
    }
  }

  &__cta {
    width: 100%;

    @media all and (min-width: $screen-xl) {
      animation: appear-bottom-5 0.5s forwards ease-out;
      opacity: 0;
      animation-delay: 0.4s;
    }
  }
}
</style>
