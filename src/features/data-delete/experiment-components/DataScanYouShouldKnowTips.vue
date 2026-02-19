<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import BaseText from "@/library/BaseText.vue";
import DataScanAnimatedLogo from "@/features/data-delete/atoms/DataScanAnimatedLogo.vue";

const TIPS = [
  "1 in 5 Americans have experienced identity theft",
  "93% of identity theft victims never report it",
  "Data brokers can legally sell your personal information",
  "Cloaked has removed over 1 billion exposures to date",
];

const TIP_INTERVAL_MS = 4000;

const currentTipIndex = ref(0);
const animationFinished = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;

const startTipRotation = () => {
  intervalId = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % TIPS.length;
  }, TIP_INTERVAL_MS);
};

const stopTipRotation = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onMounted(() => {
  startTipRotation();
  setTimeout(() => {
    animationFinished.value = true;
  }, 1000);
});

onUnmounted(() => {
  stopTipRotation();
});
</script>

<template>
  <div
    class="data-scan-you-should-know-tips"
    :class="{
      'data-scan-you-should-know-tips--animation-finished': animationFinished,
    }"
  >
    <DataScanAnimatedLogo :animation-finished="animationFinished" />
    <BaseText
      variant="body-2-semibold"
      class="data-scan-you-should-know-tips__header"
    >
      You should know
    </BaseText>
    <div class="data-scan-you-should-know-tips__content-wrapper">
      <Transition
        name="tip-slide"
        mode="out-in"
      >
        <div
          :key="currentTipIndex"
          class="data-scan-you-should-know-tips__content"
        >
          <BaseText
            variant="headline-6-medium"
            class="data-scan-you-should-know-tips__tip"
          >
            {{ TIPS[currentTipIndex] }}
          </BaseText>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-scan-you-should-know-tips {
  --transition-delay: 1s;
  --transition-duration: 0.5s;
  --transition-duration-fast: 0.3s;
  --easing-smooth: cubic-bezier(0.075, 0.82, 0.165, 1);
  --easing-ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);

  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 343px;
  margin: 0 auto;
  padding: 16px;
  padding-top: 16px;
  transition:
    padding-top var(--transition-duration) var(--easing-ease-out-expo),
    margin-top var(--transition-duration) var(--easing-ease-out-expo);
  transition-delay: var(--transition-delay);

  &--animation-finished {
    padding-top: 60px;
    margin-top: 12px;
  }

  &__header {
    color: $color-cloaked;
    text-align: center;
  }

  &__content-wrapper {
    position: relative;
    width: 100%;
    height: 86px;
    overflow: hidden;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 86px;
    padding: 16px 20px;
    background-color: $color-base-black-5;
    border-radius: 12px;
  }

  &__tip {
    color: $color-base-black-100;
    text-align: center;
    line-height: 1.4;
  }
}

.tip-slide-enter-active,
.tip-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tip-slide-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.tip-slide-enter-from {
  transform: translateY(105%);
}

.tip-slide-leave-to {
  transform: translateY(105%);
}
</style>
