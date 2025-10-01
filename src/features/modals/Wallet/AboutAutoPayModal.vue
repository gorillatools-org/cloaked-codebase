<script setup>
import store from "@/store";
import Button from "@/features/Button.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import { AUTO_PAY_TERMS_URL } from "@/scripts/constants";

function closeModal() {
  store.dispatch("closeModal");
}
</script>

<template>
  <ModalTemplate
    :show="true"
    width="400px"
    @close="closeModal"
  >
    <template #body>
      <div class="about-auto-pay-modal">
        <BaseText variant="headline-2-semibold">About AutoPay</BaseText>

        <BaseText variant="body-3-regular">
          AutoPay ensures your Cloaked Virtual Cards always work by covering
          purchases as they happen. We'll only charge your payment method after
          a transaction is completed—never before. This includes
          <!-- eslint-disable-next-line -->
          <strong>Daily</strong>, <strong>Weekly</strong>, or <strong>Monthly</strong> Cloaked Pay Virtual Cards.
          <br />
          <br />
          AutoPay is currently on, but you can turn it off anytime in Settings.
          <br />
          <br />
          See
          <a
            :href="AUTO_PAY_TERMS_URL"
            target="_blank"
          >
            AutoPay Terms & Conditions.
          </a>
        </BaseText>

        <Button
          type="primary"
          @click="closeModal"
        >
          Got it
        </Button>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$component-name: "about-auto-pay-modal";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  gap: 24px;

  a {
    text-decoration: underline;
  }
}
</style>
