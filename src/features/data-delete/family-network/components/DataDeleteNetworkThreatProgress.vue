<script setup lang="ts">
import DataDeleteThreatProgress from "@/features/data-delete/atoms/DataDeleteThreatProgress.vue";
import BaseText from "@/library/BaseText.vue";

type Props = {
  progress?: number;
  title?: string;
  subtitle?: string;
  animationDelay?: number;
  hideIcon?: boolean;
};

withDefaults(defineProps<Props>(), {
  progress: 0,
  title: "Analyzing Info and Connections...",
  subtitle: "",
  animationDelay: 50,
  hideIcon: true,
});

const progressBarWidth = 312;
</script>

<template>
  <div class="data-delete-network-threat-progress">
    <div class="data-delete-network-threat-progress__content">
      <div class="data-delete-network-threat-progress__title-wrapper">
        <Transition name="spin-up">
          <!-- eslint-disable vue/no-v-html -->
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <BaseText
            :key="title"
            variant="body-2-semibold"
            class="data-delete-network-threat-progress__title"
            v-html="title"
          />
          <!-- eslint-enable vue/no-v-text-v-html-on-component -->
          <!-- eslint-enable vue/no-v-html -->
        </Transition>
      </div>
      <div class="data-delete-network-threat-progress__progress-wrapper">
        <DataDeleteThreatProgress
          :progress="progress"
          :width="progressBarWidth"
          :animation-delay="animationDelay"
          :hide-icon="hideIcon"
          class="data-delete-network-threat-progress__progress"
        />
      </div>
      <BaseText
        v-if="subtitle"
        variant="headline-6-bold"
        class="data-delete-network-threat-progress__subtitle"
      >
        {{ subtitle }}
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-network-threat-progress {
  backdrop-filter: blur(9.5px);
  background: rgba($color-white, 0.05);
  border: 1px solid $color-base-black-20;
  border-radius: 16px;
  box-shadow: 0 20px 44px 0 rgba($color-black, 0.45);
  background-blend-mode: overlay;
  padding: 16px;

  @media screen and (min-width: $screen-lg) {
    background: rgba($color-black, 0.15);
    padding: 24px 48px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;

    @media screen and (min-width: $screen-lg) {
      gap: 16px;
    }
  }

  &__title {
    color: white;
    text-align: center;
    white-space: nowrap;

    &-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      min-height: 21px;
    }
  }

  &__progress {
    width: 312px;

    :deep(.threat-progress__background) {
      stroke: $color-base-white-20;
    }

    @media screen and (min-width: $screen-lg) {
      :deep(.threat-progress__background) {
        stroke: $color-base-black-10;
      }
    }

    &-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }

  &__subtitle {
    color: $color-base-black-50;
    text-align: center;
    white-space: nowrap;
    display: none;

    @media screen and (min-width: $screen-lg) {
      display: block;
    }
  }
}

.spin-up-enter-active,
.spin-up-leave-active {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  width: max-content;
  transform-origin: center;
  transition:
    opacity 0.4s cubic-bezier(0.77, 0, 0.18, 1),
    transform 0.4s cubic-bezier(0.77, 0, 0.18, 1),
    filter 0.4s cubic-bezier(0.77, 0, 0.18, 1);
}

.spin-up-enter-to,
.spin-up-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  filter: blur(0);
}

.spin-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.4);
  filter: blur(3px);
}

.spin-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.3);
  filter: blur(3px);
}
</style>
