<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import { onMounted, useTemplateRef } from "vue";
import CloudflareCaptcha from "@/features/headless-signup/CloudflareCaptcha.vue";
import {
  PH_EVENT_USER_VIEWED_DATA_SCAN_PRE_SCAN_APP_DOWNLOAD,
  PH_EVENT_USER_CLICKED_DATA_SCAN_PRE_SCAN_APP_DOWNLOAD,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog";
import { useDeepLink } from "@/composables/useDeeplink";

type Props = {
  phoneNumber: string;
};

type Step = {
  icon?: BaseIconName;
  title: string;
  description: string;
  duration: string;
};

const props = defineProps<Props>();

const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");
const deepLink = useDeepLink();

let cloudflareToken: string = "-";

const steps: Step[] = [
  {
    title: "View your personalized report",
    description: "See what data is exposed and where.",
    duration: "1 minute",
  },
  {
    icon: "trash",
    title: "Remove your data",
    description:
      "Automatic data removal requests are submitted to exposed sites.",
    duration: "Instant setup",
  },
  {
    icon: "shield-tick",
    title: "Stay protected",
    description: "Continuously remove data and unlock additional protection.",
    duration: "Instant activation",
  },
];

onMounted(async () => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_SCAN_PRE_SCAN_APP_DOWNLOAD);

  if (!cloudflareCaptcha?.value) {
    return;
  }

  cloudflareToken = await cloudflareCaptcha.value.verify();
});

const handleCtaClick = async () => {
  if (deepLink.isCreatingDeepLink.value) {
    return;
  }

  const deepLinkResultType = await deepLink.openPhoneBasedDownloadAppDeepLink(
    props.phoneNumber,
    cloudflareToken
  );

  posthogCapture(PH_EVENT_USER_CLICKED_DATA_SCAN_PRE_SCAN_APP_DOWNLOAD, {
    deepLinkResultType: deepLinkResultType,
  });
};
</script>

<template>
  <div class="data-scan-app-download">
    <div class="data-scan-app-download__content">
      <div class="data-scan-app-download__top-section">
        <InlineSvg
          name="cloaked-logo-full"
          class="data-scan-app-download__logo"
        />
      </div>

      <div class="data-scan-app-download__header">
        <BaseText
          variant="headline-2-semibold"
          class="data-scan-app-download__header-title"
        >
          Generating Your
          <br />
          Exposure Report
        </BaseText>
        <BaseText
          variant="body-3-regular"
          class="data-scan-app-download__header-subtitle"
        >
          What happens next:
        </BaseText>
      </div>

      <div class="data-scan-app-download__timeline">
        <ul class="data-scan-app-download__timeline-list">
          <li
            v-for="(step, index) in steps"
            :key="index"
            class="data-scan-app-download__timeline-item"
            :style="{ '--i': String(index) }"
          >
            <div class="data-scan-app-download__timeline-item-inner">
              <div class="data-scan-app-download__timeline-indicator">
                <div class="data-scan-app-download__timeline-number">
                  <span
                    v-if="index === 0"
                    class="data-scan-app-download__timeline-spinner"
                  />
                  <BaseIcon
                    v-else
                    :name="step.icon || 'check'"
                    class="data-scan-app-download__timeline-icon"
                  />
                </div>
                <div
                  v-if="index !== steps.length - 1"
                  class="data-scan-app-download__timeline-line"
                />
              </div>

              <div class="data-scan-app-download__timeline-content">
                <BaseText
                  variant="headline-6-bold"
                  class="data-scan-app-download__timeline-title"
                >
                  {{ step.title }}
                </BaseText>
                <BaseText
                  variant="body-small-medium"
                  class="data-scan-app-download__timeline-description"
                >
                  {{ step.description }}
                </BaseText>
                <div class="data-scan-app-download__timeline-duration">
                  <BaseIcon
                    name="clock"
                    class="data-scan-app-download__timeline-duration-icon"
                  />
                  <BaseText
                    variant="body-small-semibold"
                    class="data-scan-app-download__timeline-duration-text"
                  >
                    {{ step.duration }}
                  </BaseText>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <footer class="data-scan-app-download__footer">
      <BaseButton
        size="lg"
        full-width
        :disabled="deepLink.isCreatingDeepLink.value"
        :loading="deepLink.isCreatingDeepLink.value"
        @click="handleCtaClick"
      >
        Download to view report
      </BaseButton>
    </footer>

    <CloudflareCaptcha ref="cloudflareCaptcha" />
  </div>
</template>

<style lang="scss" scoped>
$spring-ease: cubic-bezier(0.68, -1.3, 0.32, 1.3);

.data-scan-app-download {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  color: $color-primary-100;
  overflow-y: auto;

  --initial-delay: 0.25s;
  --row-grow: 520ms;
  --fade: 260ms;
  --gap: 110ms;
  --icon-pop: 460ms;
  --line: 520ms;
  --pause-between: 650ms;

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    gap: 20px;
    justify-content: center;
    padding-bottom: 24px;
  }

  &__top-section {
    width: 100%;
    max-width: 400px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__logo {
    height: 24px;
    width: auto;
    color: $color-primary-100;
    margin-top: 32px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 400px;
    gap: 12px;
  }

  &__header-title {
    color: $color-primary-100;
  }

  &__header-subtitle {
    color: $color-primary-70;
  }

  &__timeline {
    width: 100%;
    max-width: 400px;
    background-color: $color-primary-10;
    border: 1px solid $color-primary-20;
    border-radius: 16px;
    padding: 20px;
  }

  &__timeline-header {
    color: $color-primary-100;
    display: block;
    margin-bottom: 15px;
  }

  &__timeline-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__timeline-item {
    --delay: calc(var(--initial-delay) + (var(--i) * var(--pause-between)));

    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    opacity: 0;
    transform: translateY(10px);
    will-change: grid-template-rows, transform, opacity;
    animation: row-grow var(--row-grow) cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: var(--delay);
  }

  &__timeline-item-inner {
    min-height: 0;
    overflow: hidden;
    display: flex;
    gap: 16px;
  }

  &__timeline-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  &__timeline-number {
    position: relative;
    border-radius: 50%;
    background-color: $color-cloaked;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(6px);
    animation: fade-up var(--fade) ease-out forwards;
    animation-delay: calc(var(--delay) + 120ms);
  }

  &__timeline-number::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0.9);
    animation: ring 760ms ease-out forwards;
    animation-delay: calc(var(--delay) + 160ms);
    pointer-events: none;
  }

  &__timeline-icon {
    font-size: 18px;
    color: $color-primary-100;
    opacity: 0;
    transform: scale(0.6);
    animation: pop-in var(--icon-pop) $spring-ease forwards;
    animation-delay: calc(var(--delay) + 150ms);
  }

  &__timeline-spinner {
    display: block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba($color-white, 0.3);
    border-top-color: $color-primary-100;
    border-radius: 50%;
    animation:
      spinner-fade-in 300ms ease-out forwards,
      spin 1s linear infinite;
    animation-delay: calc(var(--delay) + 150ms), calc(var(--delay) + 150ms);
  }

  &__timeline-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
    padding-bottom: 12px;
  }

  &__timeline-title,
  &__timeline-description,
  &__timeline-duration {
    opacity: 0;
    transform: translateY(6px);
    animation: fade-up var(--fade) ease-out forwards;
    animation-delay: calc(var(--delay) + 340ms);
  }

  &__timeline-title {
    color: $color-primary-100;
  }

  &__timeline-description {
    color: $color-primary-70;
    animation-delay: calc(var(--delay) + 340ms + var(--gap));
  }

  &__timeline-duration {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $color-cloaked;
    animation-delay: calc(var(--delay) + 340ms + (var(--gap) * 2));
  }

  &__timeline-duration-icon {
    width: 16px;
    margin-top: -2px;
  }

  &__timeline-line {
    width: 2px;
    flex: 1;
    background-color: $color-primary-30;
    margin-top: 4px;
    margin-bottom: 4px;
    transform-origin: top;
    transform: scaleY(0);
    opacity: 0.9;
    animation: line-draw var(--line) cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: calc(var(--delay) + 340ms + (var(--gap) * 2) + 120ms);
  }

  &__footer {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
    background: linear-gradient(
      to bottom,
      transparent 0%,
      $color-primary-1 30%
    );
  }
}

@keyframes row-grow {
  0% {
    grid-template-rows: 0fr;
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    grid-template-rows: 1fr;
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }

  70% {
    opacity: 1;
    transform: scale(1.08);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes line-draw {
  from {
    transform: scaleY(0);
  }

  to {
    transform: scaleY(1);
  }
}

@keyframes ring {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }

  40% {
    opacity: 0.22;
    transform: scale(1.15);
  }

  100% {
    opacity: 0;
    transform: scale(1.35);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinner-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
