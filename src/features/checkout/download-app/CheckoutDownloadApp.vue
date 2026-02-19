<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import CheckoutDownloadAppReview from "@/features/checkout/download-app/CheckoutDownloadAppReview.vue";
import CheckoutDownloadAppLogo from "@/features/checkout/download-app/CheckoutDownloadAppLogo.vue";
import CheckoutDownloadAppUsername from "@/features/checkout/download-app/CheckoutDownloadAppUsername.vue";
import CheckoutDownloadAppProgress from "@/features/checkout/download-app/CheckoutDownloadAppProgress.vue";
import CheckoutDownloadAppCarousel from "@/features/checkout/download-app/CheckoutDownloadAppCarousel.vue";
import { wait } from "@/features/chat-onboarding/utils.ts";
import type { DownloadAppBlock } from "@/features/checkout/downloadAppTypes.ts";

type CheckoutDownloadAppProps = {
  blocks: DownloadAppBlock[];
};

defineProps<CheckoutDownloadAppProps>();
defineEmits(["download"]);

const hasMounted = ref(false);

onMounted(async () => {
  await wait(200);
  hasMounted.value = true;
});
</script>

<template>
  <div class="checkout-download-app">
    <div
      v-for="(block, key) in blocks"
      :key="key"
      class="checkout-download-app__block"
    >
      <BaseProgressTag
        v-if="block.type === 'subscription'"
        color="safe-zone-blue"
      >
        {{ block.text }}
      </BaseProgressTag>
      <div v-if="block.type === 'image'">
        <CheckoutDownloadAppLogo v-if="block.image === 'logo'" />
        <img
          v-else-if="block.image === 'image-1'"
          src="@/assets/images/download-app-1.png"
          class="checkout-download-app__image"
        />
        <CheckoutDownloadAppCarousel v-else-if="block.image === 'carousel'" />
      </div>
      <BaseText
        v-if="block.type === 'title'"
        variant="headline-1-medium"
        class="checkout-download-app__title"
        as="h1"
      >
        {{ block.text }}
      </BaseText>
      <CheckoutDownloadAppProgress
        v-else-if="block.type === 'progress'"
        :progress="hasMounted ? block.progress : 0"
      />
      <BaseText
        v-else-if="block.type === 'text'"
        variant="body-3-regular"
        as="p"
        class="checkout-download-app__text"
      >
        {{ block.text }}
      </BaseText>
      <CheckoutDownloadAppUsername
        v-else-if="block.type === 'username'"
        :button-text="block.buttonText"
      />
      <BaseButton
        v-else-if="block.type === 'cta'"
        :variant="block.color === 'orange' ? 'primary-fill' : 'primary'"
        full-width
        size="lg"
        class="checkout-download-app__cta"
        @click="$emit('download')"
      >
        {{ block.text }}
      </BaseButton>
      <CheckoutDownloadAppReview v-else-if="block.type === 'review'">
        {{ block.text }}
      </CheckoutDownloadAppReview>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkout-download-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 16px;
  width: 100%;
  min-height: 100%;
  max-width: 550px;
  margin: 0 auto;

  &__block {
    width: 100%;
    text-align: center;
  }

  &__image {
    border-radius: 16px;
  }

  &__title {
    margin-top: 16px;
  }

  &__text {
    color: $color-base-black-70;
    max-width: 90%;
    margin: 0 auto;
  }

  &__cta {
    margin-top: 8px;
  }

  :deep(.base-button__icon) {
    display: none;
  }
}
</style>
