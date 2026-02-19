<script setup lang="ts">
import { TransitionPresets, useTransition } from "@vueuse/core";
import { nextTick, onMounted, ref, watch } from "vue";
import DataScanPageLoaderItem from "@/features/data-delete/DataScanPageLoaderItem.vue";

export type DataScanLoaderItem = {
  title: string;
  description: string;
  scanned: boolean;
};

const emit = defineEmits(["finished"]);

const props = defineProps<{
  item: DataScanLoaderItem;
  scanEnabled?: boolean;
  showRealContent?: boolean;
}>();

const delay = ref(2000);
const progressSource = ref(0);
const isScanned = ref(false);

const progress = useTransition(progressSource, {
  duration: 3500,
  delay,
  transition: TransitionPresets.easeInOutCubic,
  onFinished: () => {
    isScanned.value = true;
    emit("finished");
  },
});

onMounted(() => {
  if (props.scanEnabled) {
    progressSource.value = 100;
  }
});

watch(
  () => props.scanEnabled,
  async (enabled) => {
    if (enabled && !isScanned.value) {
      progressSource.value = 0;
      await nextTick();
      progressSource.value = 100;
      delay.value = 0;
    }
  }
);
</script>

<template>
  <div
    class="data-scan-page-loader-item"
    :class="{ 'data-scan-page-loader-item--real-content': showRealContent }"
  >
    <div class="data-scan-page-loader-item__wrapper">
      <span class="data-scan-page-loader-item__title">
        {{ showRealContent ? item.title : "" }}
      </span>
      <span class="data-scan-page-loader-item__description">
        {{ showRealContent ? item.description : "" }}
      </span>
    </div>
    <DataScanPageLoaderItem
      v-if="(props.scanEnabled || isScanned) && !showRealContent"
      :item="item"
      :show-real-content="true"
      class="data-scan-page-loader-item__real-content"
      :style="{ clipPath: `inset(0% 0% ${100 - progress}% 0%)` }"
    />
    <span
      class="data-scan-page-loader-item__scanner-line"
      :style="{
        top: `${progress}%`,
        opacity: progress < 92 && progress > 2 ? 1 : 0,
      }"
    ></span>
  </div>
</template>

<style lang="scss" scoped>
.data-scan-page-loader-item {
  position: relative;
  height: 77px;
  background-color: $color-status-error-15;
  border: 1px solid $color-status-error-15;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgb(0 0 0 / 5%);
  display: grid;

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    grid-area: 1 / 1;
  }

  &__title,
  &__description {
    height: 17px;
    border-radius: 99px;
    text-align: center;
    text-wrap: nowrap;
    color: $color-black;
  }

  &__title {
    background-color: rgba($color-status-error, 0.2);
    width: 70%;
    font-size: 15px;

    .data-scan-page-loader-item--real-content & {
      background-color: $color-status-error;
      color: transparent;
      text-shadow: 0 0 7px $color-black;
    }
  }

  &__description {
    background-color: rgba($color-primary-100-dark, 0.2);
    width: 55%;
    line-height: 18px;
    font-size: 12px;

    .data-scan-page-loader-item--real-content & {
      background-color: $color-primary-100;
    }
  }

  &__real-content {
    z-index: 1;
    border-radius: 16px;
    grid-area: 1 / 1;
    clip-path: inset(0 0 100% 0);
  }

  &__scanner-line {
    position: absolute;
    top: 0;
    left: 4%;
    width: 92%;
    height: 1px;
    background-color: $color-primary-50;
    box-shadow: 2px 0 10px 0 rgb(0 0 0 / 100%);
    opacity: 0.3;
    z-index: 2;
    transition: opacity 0.4s ease-out;
  }
}
</style>
