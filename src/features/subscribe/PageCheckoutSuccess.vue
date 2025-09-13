<script setup>
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import SocCertifications from "@/features/subscribe/SocCertifications.vue";

import { useSlots } from "vue";
const slots = useSlots();
</script>

<template>
  <div class="page-checkout-success">
    <slot name="background" />
    <PageCheckoutHeader>
      <slot name="header-nav" />
    </PageCheckoutHeader>
    <div class="page-checkout-success__header">
      <slot name="header" />
    </div>
    <div class="page-checkout-success__content">
      <div class="page-checkout-success__column">
        <slot name="left-column" />
      </div>
      <div
        v-if="!!slots['right-column']"
        class="page-checkout-success__column"
      >
        <slot name="right-column" />
      </div>
    </div>
    <slot name="footer" />
    <footer class="page-checkout-success__footer">
      <SocCertifications />
    </footer>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.page-checkout-success {
  &__header {
    margin-top: 24px;
    margin: 0 auto;
    align-items: center;
    text-align: center;
    max-width: 1120px;
    padding: 25px 25px 0;
  }

  &__content,
  &__footer {
    margin: 0 auto;
  }

  &__column {
    height: 100%;
    max-width: 500px;

    @media all and (min-width: $screen-xl) {
      max-width: 450px;

      &:first-of-type {
        max-width: 500px;
      }
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 24px;
    padding: 24px;
    width: 100%;

    @media all and (min-width: $screen-xl) {
      align-items: stretch;
      justify-content: center;
      flex-direction: row;
      width: 100%;
    }
  }

  &__footer {
    max-width: 650px;
    margin-top: 24px;
    padding: 0 25px 25px;

    @media all and (min-width: $screen-xl) {
      margin-top: clamp(24px, 10vh, 96px);
    }
  }
}
</style>
