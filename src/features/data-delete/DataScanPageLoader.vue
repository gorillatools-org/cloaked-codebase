<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import CloakedLogoIconOrange from "@/assets/images/CloakedLogoIconFullOrange.svg";
import { computed, onBeforeMount, ref, watch } from "vue";
import { TransitionPresets, useTransition } from "@vueuse/core";
import DataScanPageLoaderItem, {
  type DataScanLoaderItem,
} from "@/features/data-delete/DataScanPageLoaderItem.vue";
import { posthogCapture } from "@/scripts/posthog";

const emit = defineEmits(["complete"]);

const progressSource = ref(0);
const progress = useTransition(progressSource, {
  duration: 15000,
  delay: 500,
  transition: TransitionPresets.easeOutCubic,
});

const loaderMessages = [
  "Scanning your digital footprint...",
  "Searching 1,000+ data broker sites...",
  "Finding exposed records...",
];

const scanItems = ref<DataScanLoaderItem[]>([
  {
    title: "Jonathan Mitchell",
    description: "Your name",
    scanned: false,
  },
  {
    title: "123-45-6789",
    description: "Your Social Security Number",
    scanned: false,
  },
  {
    title: "example@example.com",
    description: "Your email address",
    scanned: false,
  },
]);

const scannedItemsCount = computed(() => {
  return scanItems.value.filter((item) => item.scanned).length;
});

const currentScanningItem = computed(() => {
  return scanItems.value.findIndex((item) => !item.scanned);
});

const currentLoaderMessage = computed(() => {
  const index = Math.min(scannedItemsCount.value, loaderMessages.length - 1);
  return loaderMessages[index];
});

onBeforeMount(() => {
  posthogCapture("data_scan_pre_scan_loader_viewed");
  progressSource.value = 100;
});

const handleItemFinished = (index: number) => {
  scanItems.value[index].scanned = true;
};

watch(scannedItemsCount, (count) => {
  if (count >= scanItems.value.length) {
    emit("complete");
  }
});
</script>

<template>
  <div
    class="data-scan-page-loader data-delete__page"
    :class="{ 'data-scan-page-loader--scanning': progress > 20 }"
  >
    <header class="data-scan-page-loader__header">
      <div class="data-scan-page-loader__logo-container">
        <CloakedLogoIconOrange class="data-scan-page-loader__logo-image" />
        <CloakedLogoIconOrange
          class="data-scan-page-loader__logo-image data-scan-page-loader__logo-image--filled"
          :style="{ clipPath: `inset(${100 - progress}% 0% 0% 0%)` }"
        />
      </div>
      <Transition
        name="fade"
        mode="out-in"
      >
        <BaseText
          :key="currentLoaderMessage"
          as="h2"
          variant="body-3-regular"
          class="data-delete__title data-scan-page-loader__title"
        >
          {{ currentLoaderMessage }}
        </BaseText>
      </Transition>
    </header>

    <div class="data-scan-page-loader__scanner">
      <div class="data-scan-page-loader__scanner-queue">
        <DataScanPageLoaderItem
          v-for="(scanItem, index) in scanItems"
          :key="index"
          class="data-scan-page-loader__scanner-item"
          :item="scanItem"
          :data-scanned="scanItem.scanned"
          :scan-enabled="currentScanningItem === index"
          :style="{ '--index': index + 1 - scannedItemsCount }"
          @finished="handleItemFinished(index)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-scan-page-loader {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  max-width: 450px;
  width: 100%;

  &__header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);

    .data-scan-page-loader--scanning & {
      transform: translateY(-120px);
    }
  }

  &__logo-container {
    display: grid;
    width: 122px;
    height: auto;
    margin-bottom: 16px;
    transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    .data-scan-page-loader--scanning & {
      width: 75px;
    }
  }

  &__logo-image {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.1;
    transition: clip-path 0.8s cubic-bezier(0.19, 1, 0.22, 1);

    &--filled {
      opacity: 1;
      clip-path: inset(100% 0 0 0);
    }
  }

  &__title {
    .data-scan-page-loader:not(.data-scan-page-loader--scanning) & {
      opacity: 0;
      transform: translateY(15px);
    }
  }

  &__scanner {
    width: 100%;
    height: 195px;
    overflow: hidden;
    background-color: $color-base-black-5;
    border: 1px solid $color-base-black-10;
    border-radius: 16px;
    margin-top: 130px;
    filter: blur(2px);
    backdrop-filter: blur(40px);
    opacity: 0;
    transform: translateY(15px) scale(0.7);
    transition:
      filter 1s,
      opacity 1s,
      transform 1s;
    transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);

    .data-scan-page-loader--scanning & {
      filter: blur(0);
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    &-queue {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 100%;
      padding: 16px;
      perspective: 800px;
    }

    &-item {
      transform: translateY(150%) scale(calc(1.05 - var(--index) * 0.1))
        rotateX(-65deg);
      opacity: 0;
      flex-shrink: 0;
      transform-origin: center bottom;
      transform-style: preserve-3d;
      transition:
        transform 0.5s,
        opacity 0.5s;
      transition-timing-function: cubic-bezier(0.785, 0.135, 0.15, 0.86);

      .data-scan-page-loader--scanning & {
        transform: translateY(0%) scale(1) rotateX(0);
        opacity: calc(1.6 - var(--index) * 0.6);
        transition-delay: calc(var(--index) * 0.15s);
      }

      &[data-scanned="true"] {
        opacity: 1 !important;
        transform: translateY(-110%) scale(1) rotateX(60deg) !important;

        & ~ .data-scan-page-loader__scanner-item {
          transform: translateY(-110%) !important;
        }
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
