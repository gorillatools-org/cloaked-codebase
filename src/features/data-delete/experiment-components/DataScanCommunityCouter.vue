<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useTransition, TransitionPresets } from "@vueuse/core";
import NumberFlow from "@number-flow/vue";
import BaseText from "@/library/BaseText.vue";
import DataScanAnimatedLogo from "@/features/data-delete/atoms/DataScanAnimatedLogo.vue";

const COUNTER_PLACEHOLDER = "COUNTER_PLACEHOLDER";
const ANIMATION_FINISH_DELAY_MS = 1000;
const TARGET_COUNT = 300_000;

const counterSource = ref(0);
const animationFinished = ref(false);

const counterTransition = useTransition(counterSource, {
  duration: 2000,
  onFinished: () => {
    setTimeout(() => {
      animationFinished.value = true;
    }, ANIMATION_FINISH_DELAY_MS);
  },
  transition: TransitionPresets.easeOutQuart,
});

const counter = computed(() => Math.round(counterTransition.value));

const textParts = computed(() => {
  const text = `Join over ${COUNTER_PLACEHOLDER} individuals protected`;
  return text.split(" ");
});

onMounted(() => {
  counterSource.value = TARGET_COUNT;
});
</script>

<template>
  <div
    class="data-scan-community-counter"
    :class="{
      'data-scan-community-counter--animation-finished': animationFinished,
    }"
  >
    <div class="data-scan-community-counter__wrapper">
      <DataScanAnimatedLogo :animation-finished="animationFinished" />
      <div class="data-scan-community-counter__text-wrapper">
        <template
          v-for="(word, index) in textParts"
          :key="index"
        >
          <BaseText
            v-if="word !== COUNTER_PLACEHOLDER"
            class="data-scan-community-counter__word"
            variant="headline-6-medium"
            :style="{ '--index': index + 1 }"
          >
            {{ word }}
          </BaseText>
          <div
            v-else
            class="data-scan-community-counter__counter-wrapper"
          >
            <NumberFlow
              :respect-motion-preference="false"
              :will-change="true"
              class="data-scan-community-counter__counter-number"
              :value="counter"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-scan-community-counter {
  --transition-delay: 1s;
  --transition-duration: 0.5s;
  --transition-duration-fast: 0.3s;
  --easing-smooth: cubic-bezier(0.075, 0.82, 0.165, 1);

  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 65px;
  height: 65px;
  margin-bottom: 32px;
  z-index: 4;
  transition:
    min-height var(--transition-duration) ease-out,
    height var(--transition-duration) ease-out;
  transition-delay: var(--transition-delay);

  @media all and (min-width: $screen-lg) {
    margin-bottom: 64px;
  }

  &--animation-finished {
    min-height: 85px;
    height: 85px;
  }

  &__wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background-color: $color-base-black-5;
    overflow: hidden;
    transition: padding-top var(--transition-duration) var(--easing-smooth);
    transition-delay: var(--transition-delay);

    .data-scan-community-counter--animation-finished & {
      padding-top: 35px;
    }
  }

  &__text-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  &__word {
    opacity: 0.3;
    transform: translateY(50px);
    filter: blur(3px);
    font-weight: 500;
    transition:
      opacity var(--transition-duration-fast) var(--easing-smooth)
        calc(var(--index) * 0.08s),
      transform var(--transition-duration-fast) var(--easing-smooth)
        calc(var(--index) * 0.08s),
      filter var(--transition-duration-fast) var(--easing-smooth)
        calc(var(--index) * 0.08s);

    .data-scan-community-counter--animation-finished & {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }

  &__counter-wrapper {
    position: relative;
  }

  &__counter-number {
    color: $color-status-success;
    transform: scale(1.7) translateX(50%);
    white-space: nowrap;
    font-weight: 700;
    font-size: 17px;
    transition: transform var(--transition-duration)
      cubic-bezier(0.455, 0.03, 0.515, 0.955);
    transform-origin: right center;

    .data-scan-community-counter--animation-finished & {
      transform: scale(1) translateX(0) translateY(1px);
    }
  }
}
</style>
