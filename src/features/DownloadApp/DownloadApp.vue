<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useScroll, useElementSize, templateRef } from "@vueuse/core";
import {
  PH_EVENT_USER_CLICKED_DOWNLOAD_APP,
  PH_EVENT_USER_VIEWED_DOWNLOAD_APP_SCREEN,
} from "@/scripts/posthogEvents.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { useColorScheme } from "@/composables/useColorScheme";
import Button from "@/features/Button.vue";
import BaseText from "@/library/BaseText.vue";
import store from "@/store";
import { useDeepLink } from "@/composables/useDeeplink";

import exposureDarkImage from "@/assets/images/download-app/exposure-dark-mode.webp";
import exposureLightImage from "@/assets/images/download-app/exposure-light-mode.webp";
import callGuardDarkImage from "@/assets/images/download-app/call-guard-dark-mode.webp";
import callGuardLightImage from "@/assets/images/download-app/call-guard-light-mode.webp";
import ssnDarkImage from "@/assets/images/download-app/ssn-dark-mode.webp";
import ssnLightImage from "@/assets/images/download-app/ssn-light-mode.webp";

const currentSlide = ref(0);

const scrollContainer = templateRef<HTMLElement>("scrollContainer");
const firstSlideElement = ref<HTMLElement | null>(null);

const { width: containerWidth } = useElementSize(scrollContainer);
const { width: slideWidth } = useElementSize(firstSlideElement);

const { x } = useScroll(scrollContainer);
const { colorScheme } = useColorScheme();

const { isCreatingDeepLink, openDownloadAppDeepLink } = useDeepLink();

const username = computed(() => store.getters["authentication/getUsername"]);

const slides = computed(() => {
  const isDark = colorScheme.value === "dark";
  return [
    {
      image: isDark ? exposureDarkImage : exposureLightImage,
      alt: "Exposure Status",
      caption: "Track digital health status",
    },
    {
      image: isDark ? callGuardDarkImage : callGuardLightImage,
      alt: "Call Guard",
      caption: "Block spam calls",
    },
    {
      image: isDark ? ssnDarkImage : ssnLightImage,
      alt: "Identity Monitoring",
      caption: "Automate ongoing protection",
    },
  ];
});

onMounted(() => {
  // Trigger scroll-snap to center first slide instantly
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ left: 0, behavior: "instant" });
  }

  posthogCapture(PH_EVENT_USER_VIEWED_DOWNLOAD_APP_SCREEN);
});

function slideToIndex(index: number) {
  currentSlide.value = index;
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft = index * slideWidth.value;
  }
}

const createDeepLink = async () => {
  if (isCreatingDeepLink.value) {
    return;
  }

  const result = await openDownloadAppDeepLink(username.value);

  posthogCapture(PH_EVENT_USER_CLICKED_DOWNLOAD_APP, {
    source: "download_app_screen",
    isDeepLink: result === "deeplink",
  });
};

watch([x, containerWidth, slideWidth], () => {
  if (
    !scrollContainer.value ||
    !containerWidth.value ||
    !slideWidth.value ||
    !firstSlideElement.value
  ) {
    return;
  }

  // Use first slide, but all slides have the same space
  const gap = parseFloat(getComputedStyle(scrollContainer.value).gap);
  const slideSpace = firstSlideElement.value.offsetLeft;

  // Slide has a space, so we should subtract it to get the scroll position from the start of the container
  const slideWithGap = slideWidth.value + gap;
  const finalScrollX = x.value - slideSpace;

  currentSlide.value = Math.max(
    0,
    Math.min(Math.round(finalScrollX / slideWithGap), slides.value.length - 1)
  );
});
</script>

<template>
  <div class="download-app">
    <div class="download-app__content">
      <BaseText
        variant="headline-2-semibold"
        class="download-app__title"
      >
        Access more protection in the app
      </BaseText>

      <div
        class="download-app__carousel"
        :style="{ '--active-index': currentSlide }"
      >
        <div class="download-app__slides">
          <div
            ref="scrollContainer"
            class="download-app__slides-container"
          >
            <div
              v-for="(slide, index) in slides"
              :key="index"
              :ref="
                index === 0
                  ? (el) => {
                      firstSlideElement = el as HTMLElement;
                    }
                  : undefined
              "
              class="download-app__slide"
              :class="{ 'download-app__slide--active': currentSlide === index }"
            >
              <img
                :src="slide.image"
                :alt="slide.alt"
                class="download-app__slide-image"
              />
              <BaseText
                class="download-app__slide-caption"
                variant="body-2-semibold"
              >
                {{ slide.caption }}
              </BaseText>
            </div>
          </div>
        </div>

        <div class="download-app__carousel-dots">
          <button
            v-for="(_, index) in slides"
            :key="index"
            :style="{ '--dot-index': index }"
            class="download-app__carousel-dot"
            @click="slideToIndex(index)"
          />
        </div>
      </div>
      <footer class="download-app__footer">
        <Button
          class="download-app__download-button"
          :disabled="isCreatingDeepLink"
          :loading="isCreatingDeepLink"
          @click="createDeepLink"
        >
          Download Cloaked
        </Button>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  overflow: visible;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: $color-base-white-100;
  padding: 30px 0;

  --slide-width: 65%;
  --side-padding: calc((100% - var(--slide-width)) / 2);

  @media screen and (min-width: $screen-lg) {
    --slide-width: 70%;
  }

  &__title {
    text-align: center;
    max-width: 280px;

    @media screen and (min-width: $screen-lg) {
      max-width: 500px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    position: relative;
    margin: auto;
  }

  &__carousel {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 18px;
    margin-top: 14px;

    &-dots {
      --dot-width: 24px;
      --dot-height: 4px;
      --dot-gap: 8px;

      display: flex;
      gap: var(--dot-gap);
      justify-content: center;
      align-items: center;
    }

    &-dot {
      position: relative;
      width: var(--dot-width);
      height: var(--dot-height);
      border-radius: 2px;
      border: none;
      padding: 0;
      background-color: $color-primary-30;
      cursor: pointer;
      overflow: hidden;

      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: var(--dot-width);
        height: 100%;
        background-color: $color-primary-100;
        border-radius: inherit;
        /* stylelint-disable scss/operator-no-newline-after */
        transform: translateX(
          calc(
            (var(--active-index) - var(--dot-index)) *
              (var(--dot-width) + var(--dot-gap))
          )
        );
        /* stylelint-enable scss/operator-no-newline-after */
        transition: transform 0.3s ease-in-out;
      }
    }
  }

  &__slides {
    position: relative;
    width: 100%;
    max-width: 500px;

    // Gradient to hide the bottom of the slides
    &::before {
      content: "";
      position: absolute;
      width: 100%;
      min-width: 100%;
      min-height: 100px;
      bottom: 20px;
      left: 0;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(to top, $color-base-white-100, transparent);
    }

    &-container {
      display: flex;
      width: 100%;
      gap: 36px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      scrollbar-width: none;

      // Spacers to allow first/last slides to center
      &::before,
      &::after {
        content: "";
        min-width: var(--side-padding);
      }

      &::-webkit-scrollbar {
        display: none;
      }

      @media screen and (min-width: $screen-lg) {
        gap: 0;
      }
    }
  }

  &__slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    flex: 0 0 var(--slide-width);
    opacity: 0.5;
    transform: scale(0.98);
    transform-origin: center;
    will-change: opacity, transform;
    transition:
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;

    &--active {
      opacity: 1;
      transform: scale(1);
    }

    &-image {
      max-width: 100%;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    width: 100%;
    max-width: 500px;
    padding: 0 50px;
    margin-top: 24px;
  }

  &__download-button {
    width: 100%;
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
