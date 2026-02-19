<script setup lang="ts">
import LineProgress from "@/features/ui/LineProgress.vue";
import { computed, useTemplateRef } from "vue";
import { useElementSize } from "@vueuse/core";

type CheckoutDownloadAppProgressProps = {
  progress: number;
};

const props = defineProps<CheckoutDownloadAppProgressProps>();

const content = useTemplateRef("content");

const { width } = useElementSize(content);

const iconStyle = computed(() => ({
  transform: `translate3d(calc(${width.value * props.progress}px), -50%, 0)`,
}));
</script>

<template>
  <div
    ref="content"
    class="checkout-download-app-progress"
  >
    <LineProgress
      :width="width"
      :progress="progress"
      :height="10"
    />
    <div
      class="checkout-download-app-progress__icon"
      :style="iconStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
.checkout-download-app-progress {
  position: relative;

  :deep(.progress-line__indicator) {
    transition: stroke-dasharray 400ms ease-out;
    stroke: $color-brand-300;
  }

  &__icon {
    width: 18px;
    height: 18px;
    border: 2px solid $color-base-black-100;
    background-color: $color-brand-300;
    border-radius: 100px;
    position: absolute;
    left: 0;
    top: 50%;
    transition: transform 400ms ease-out;
  }
}
</style>
