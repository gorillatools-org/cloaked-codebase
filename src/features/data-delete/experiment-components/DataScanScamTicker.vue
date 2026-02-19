<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import DataScanAnimatedLogo from "@/features/data-delete/atoms/DataScanAnimatedLogo.vue";
import { useDisplay } from "@/composables/useDisplay";

const { isMobile } = useDisplay();

const isVisible = ref(false);
const animationFinished = ref(false);
const marqueeElements = computed(() => (isMobile.value ? 4 : 1));

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 30);
  setTimeout(() => {
    animationFinished.value = true;
  }, 60);
});
</script>

<template>
  <div
    class="data-scan-scam-ticker"
    :class="{
      'data-scan-scam-ticker--animation-finished': animationFinished,
    }"
  >
    <DataScanAnimatedLogo
      :animation-finished="animationFinished"
      :delay-offset="0.25"
    />
    <div
      class="data-scan-scam-ticker__track"
      :class="{
        'data-scan-scam-ticker__track--running': isVisible && isMobile,
      }"
    >
      <div
        v-for="key in marqueeElements"
        :key="key"
        class="data-scan-scam-ticker__content"
      >
        <BaseText
          variant="headline-6-medium"
          class="data-scan-scam-ticker__copy"
        >
          Keep this code to yourself - Cloaked will never ask you to send or
          share it.
        </BaseText>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-scan-scam-ticker {
  --transition-delay: 40ms;
  --transition-duration: 0.6s;
  --transition-duration-fast: 0.4s;
  --easing-smooth: cubic-bezier(0.075, 0.82, 0.165, 1);
  --easing-natural: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  position: relative;
  background: $color-base-black-5-dark;
  width: 100%;
  margin: 0 auto;
  padding-inline: 14px;
  z-index: 10;
  overflow: hidden;
  white-space: nowrap;
  height: 0;
  min-height: 0;
  opacity: 0;
  display: flex;
  align-items: center;
  transition:
    min-height var(--transition-duration) var(--easing-natural),
    height var(--transition-duration) var(--easing-natural),
    opacity 0.5s var(--easing-smooth);

  &--animation-finished {
    min-height: 80px;
    height: 80px;
    opacity: 1;
    transition:
      min-height var(--transition-duration) var(--easing-natural),
      height var(--transition-duration) var(--easing-natural),
      opacity 0.5s var(--easing-smooth);
    transition-delay: 0;
  }

  @media all and (min-width: $screen-md) {
    padding-inline: 16px;
  }

  &__content {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding-right: 8px;
    flex: 0 0 auto;
    opacity: 0;
    transition:
      transform var(--transition-duration) var(--easing-natural),
      opacity var(--transition-duration-fast) var(--easing-smooth);
    transition-delay: var(--transition-delay);

    .data-scan-scam-ticker--animation-finished & {
      opacity: 1;
    }

    &::after {
      content: "";
      display: inline-block;
      width: 4px;
      height: 4px;
      flex-shrink: 0;
      background-color: $color-base-white-50-light;
      border-radius: 50%;
      margin-left: 4px;
    }

    &:only-child {
      padding-right: 0;

      &::after {
        display: none;
      }
    }
  }

  &__track {
    display: inline-flex;
    align-items: baseline;
    width: 100%;
    transition: padding-top var(--transition-duration) var(--easing-natural);
    transition-delay: var(--transition-delay);

    .data-scan-scam-ticker--animation-finished & {
      padding-top: 40px;
      transition: padding-top var(--transition-duration) var(--easing-natural);
      transition-delay: var(--transition-delay);
    }

    @media all and (min-width: $screen-md) {
      justify-content: center;
    }

    &--running {
      .data-scan-scam-ticker {
        &__content {
          animation: data-scan-scam-ticker-marquee 24s linear 1s infinite;
        }
      }
    }
  }

  &__copy {
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    margin: 0;
    flex-shrink: 0;
    color: $color-base-black-100-dark;

    &--rose {
      color: $color-spirit-rose;
      font-weight: 700;
    }

    @media all and (min-width: $screen-md) {
      font-size: 15px;
    }
  }
}

@keyframes data-scan-scam-ticker-marquee {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-100%);
  }
}
</style>
