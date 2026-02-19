<script setup lang="ts">
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { useColorScheme } from "@/composables/useColorScheme.ts";
import DataDeleteNetworkVisualization from "@/features/data-delete/family-network/components/DataDeleteNetworkVisualization.vue";
import DataDeleteNetworkThreatProgress from "@/features/data-delete/family-network/components/DataDeleteNetworkThreatProgress.vue";
import DataDeleteNetworkExposure from "@/features/data-delete/family-network/components/DataDeleteNetworkExposure.vue";
import type { DataDeleteSearchResult } from "@/types/data-delete-search";
import { useDataDeleteThreatLevel } from "@/features/data-delete/composables/useDataDeleteThreatLevel";
import { useDataDeleteNetworkConnections } from "@/features/data-delete/family-network/composables/useDataDeleteNetworkConnections";
import { posthogCapture } from "@/scripts/posthog";
import {
  PH_EVENT_USER_CLICKED_DATA_DELETION_NETWORK_SKIP_BUTTON,
  PH_EVENT_USER_CLICKED_DATA_DELETION_NETWORK_VIEW_FULL_REPORT_BUTTON,
  PH_EVENT_USER_VIEWED_DATA_DELETION_NETWORK,
} from "@/scripts/posthogEvents";
import BaseText from "@/library/BaseText.vue";

type Props = {
  searchResult: DataDeleteSearchResult;
  brokersNames?: string[];
  exposuresCount?: number;
};

const ANIMATION_TIMINGS = {
  CONNECTION_DELAY: 300,
  ZOOM_DELAY: 200,
  ZOOM_DURATION: 1500,
} as const;

const props = withDefaults(defineProps<Props>(), {
  brokersNames: undefined,
  exposuresCount: undefined,
});

const emit = defineEmits<{
  (e: "view-full-report"): void;
}>();

const { setColorScheme } = useColorScheme();
const { threatLevel, threatPercentage } = useDataDeleteThreatLevel(
  computed(() => props.searchResult)
);
const { totalConnections, generateTooltipContent } =
  useDataDeleteNetworkConnections(
    computed(() => props.searchResult),
    computed(() => props.brokersNames)
  );

const networkRef = ref<InstanceType<typeof DataDeleteNetworkVisualization>>();
const isEntranceAnimationComplete = ref(false);
const isExpanding = ref(false);
const isExiting = ref(false);
const canShowSkipButton = ref(false);
const progress = reactive({
  value: 0,
  title: "Scanning your digital footprint...",
});
const exposure = reactive({
  name: "",
  description: "",
  counter: 0,
  incrementStep: 0,
});

onBeforeMount(() => setColorScheme("dark"));

onMounted(() => {
  startInAnimation();
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_NETWORK, {
    relativesCount: props.searchResult.relatives?.length ?? 0,
    brokersCount: props.brokersNames?.length ?? 0,
  });
});

const startInAnimation = async () => {
  if (!networkRef.value || isEntranceAnimationComplete.value) return;

  await expandNetworkAnimation();
  await revealCenterDot();
  await animateConnections();
  finishEntranceAnimation();
};

const startOutAnimation = async (isSkipping: boolean = false) => {
  isExiting.value = true;
  await wait(700);

  posthogCapture(
    isSkipping
      ? PH_EVENT_USER_CLICKED_DATA_DELETION_NETWORK_SKIP_BUTTON
      : PH_EVENT_USER_CLICKED_DATA_DELETION_NETWORK_VIEW_FULL_REPORT_BUTTON
  );
  emit("view-full-report");
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const expandNetworkAnimation = async () => {
  await wait(50);
  isExpanding.value = true;
  await wait(2500);
};

const revealCenterDot = async () => {
  const network = networkRef.value;
  const centerDot = network?.centerDot;
  if (!network || !centerDot) return;

  network.setDotHighlight(centerDot.id, true);
  await wait(1100);

  if (!props.searchResult) return;
  exposure.name = `${props.searchResult.name?.toLowerCase()}, ${props.searchResult.age}`;
  incrementExposureCounter();

  network.setDotExposed(centerDot.id, true);
  await wait(1100);

  exposure.description = props.searchResult.ssn
    ? `SSN exposed: ${props.searchResult.ssn}`
    : "";
  canShowSkipButton.value = true;
  incrementExposureCounter();
  await wait(500);
};

const animateConnections = async () => {
  const connectionsCount = totalConnections.value;

  if (connectionsCount === 0) {
    finishEntranceAnimation();
    return;
  }

  for (let i = 0; i < connectionsCount; i++) {
    progress.value =
      (((i + 1) / connectionsCount) * threatPercentage.value) / 100;
    progress.title =
      i === 0
        ? "Tracing connected exposures..."
        : "Finding records linked to you...";

    await wait(300);
    await createConnectionWithZoom(i);
  }

  if ((props.exposuresCount || 0) > 0) {
    exposure.counter = props.exposuresCount || exposure.counter;
  }
};

const createConnectionWithZoom = async (index: number) => {
  const { CONNECTION_DELAY, ZOOM_DELAY, ZOOM_DURATION } = ANIMATION_TIMINGS;

  if (!networkRef.value) {
    await wait(100);
    return;
  }

  const content = generateTooltipContent(index);
  const success = Boolean(networkRef.value.connectWithContent(content));

  if (!success) {
    await wait(100);
    return;
  }

  await wait(CONNECTION_DELAY + ZOOM_DELAY);
  incrementExposureCounter();
  zoomToLastConnection();
  await wait(ZOOM_DURATION);
};

const zoomToLastConnection = () => {
  const connections = networkRef.value?.connections;
  const lastConnection = connections?.[connections.length - 1];
  if (!lastConnection) return;

  const connectedDot = networkRef.value?.dots.find(
    (dot) => dot.id === lastConnection.to
  );

  if (connectedDot) {
    networkRef.value?.zoomToDot(connectedDot);
  }
};

function finishEntranceAnimation() {
  const levelClass = `data-delete-network-page__threat-level data-delete-network-page__threat-level--${threatLevel.value}`;
  progress.title = `Threat Level: <span class="${levelClass}">${threatLevel.value}</span>`;
  progress.value = threatPercentage.value / 100;

  canShowSkipButton.value = false;
  networkRef.value?.resetZoom();
  isEntranceAnimationComplete.value = true;
}

const incrementExposureCounter = () => {
  if (props.exposuresCount && props.exposuresCount > 0) {
    const totalIncrements = 2 + totalConnections.value; // 2 initial increments before loop + connections in loop
    const incrementPerStep = Math.floor(props.exposuresCount / totalIncrements);
    const remainder = props.exposuresCount % totalIncrements;
    const additionalRemainder = exposure.incrementStep < remainder ? 1 : 0;

    const increment = incrementPerStep + additionalRemainder;
    exposure.counter += increment;
    exposure.incrementStep++;
  } else {
    exposure.counter += Math.floor(Math.random() * 43);
  }
};

watch(
  () => props.exposuresCount,
  (count) => {
    if (!isEntranceAnimationComplete.value) {
      return;
    }

    if (count && count > exposure.counter) {
      exposure.counter = count;
    }
  }
);
</script>

<template>
  <div
    class="data-delete-network-page"
    :class="{
      'data-delete-network-page--expand': isExpanding,
      'data-delete-network-page--complete': isEntranceAnimationComplete,
      'data-delete-network-page--exiting': isExiting,
      'data-delete-network-page--show-skip-button': canShowSkipButton,
    }"
  >
    <div class="data-delete-network-page__content">
      <DataDeleteNetworkThreatProgress
        :hide-icon="!isEntranceAnimationComplete"
        :progress="progress.value"
        :title="progress.title"
        class="data-delete-network-page__threat-progress"
      />
      <div class="data-delete-network-page__network-container">
        <div class="data-delete-network-page__network-shadow"></div>
        <DataDeleteNetworkVisualization
          ref="networkRef"
          :can-interact="false"
        />
      </div>

      <DataDeleteNetworkExposure
        class="data-delete-network-page__exposure-counter"
        :complete="isEntranceAnimationComplete"
        :name="exposure.name"
        :description="exposure.description"
        :counter="exposure.counter"
        @view-full-report="startOutAnimation"
      >
        <template #bottom-content>
          <span
            role="button"
            tabindex="0"
            class="data-delete-network-page__exposure-skip-btn"
            @click="startOutAnimation(true)"
            @keydown.enter="startOutAnimation(true)"
            @keydown.space.prevent="startOutAnimation(true)"
          >
            <BaseText
              v-if="!isEntranceAnimationComplete"
              variant="label-medium"
              class="data-delete-network-page__exposure-skip-btn-text"
            >
              Skip
            </BaseText>
          </span>
        </template>
      </DataDeleteNetworkExposure>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-network-page {
  @include cloaked-gradient-background;

  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  position: relative;
  filter: contrast(1);
  overflow: hidden;
  transition:
    filter 0.8s cubic-bezier(0.86, 0, 0.07, 1),
    opacity 0.8s cubic-bezier(0.86, 0, 0.07, 1);

  &--expand {
    filter: contrast(1.1);
  }

  &--exiting {
    filter: contrast(1);
    opacity: 0;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: inset 0 -40px 30px 10px rgba($color-black, 0.3);

    @media screen and (min-width: $screen-lg) {
      box-shadow: inset 0 -40px 80px 10px rgba($color-black, 0.4);
    }
  }

  &__content {
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
  }

  &__network {
    &-container {
      height: 100%;
      width: 100%;
      position: relative;
      transform-origin: center center;
      transform: scale(0.8);
      opacity: 0;
      transition:
        transform 2s ease-out 0.3s,
        opacity 0s ease-out 0.3s;

      .data-delete-network-page--expand & {
        transform: scale(1);
        animation: expand-clip-path 4s ease-out 0.3s;
        opacity: 1;
      }

      .data-delete-network-page--complete & {
        transition: transform 0.5s cubic-bezier(0.86, 0, 0.07, 1) 0.7s;
        transform: translateY(calc(-70px - 4dvh));

        @media screen and (min-width: $screen-lg) {
          transform: unset;
        }
      }
    }

    &-shadow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 200dvmax;
      height: 200dvmax;
      border-radius: 50%;
      opacity: 0.6;
      z-index: 1000;
      box-shadow: inset 0 0 300px 70px rgba($color-white, 0.3);
      pointer-events: none;

      .data-delete-network-page--expand & {
        animation: expand-shadow 2.9s ease-out 0.3s;
      }
    }
  }

  &__threat-progress {
    position: absolute;
    top: 16px;
    left: 16px;
    width: calc(100% - 32px);
    z-index: 1000;
    animation: slide-in-from-top 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)
      forwards;
    opacity: 0;
    transform: translateY(-100%);

    @media screen and (min-width: $screen-lg) {
      top: 24px;
      left: 24px;
      width: 400px;
    }
  }

  &__exposure {
    &-skip-btn {
      overflow: hidden;
      display: block;
      width: 100%;
      text-decoration: underline;
      color: $color-primary-50;
      cursor: pointer;
      text-align: center;
      opacity: 0;
      max-height: 0;
      height: 0;
      transition:
        opacity 0.15s ease-in,
        max-height 0.15s ease-in,
        height 0.15s ease-in;

      &:hover {
        opacity: 0.8;
      }

      .data-delete-network-page--show-skip-button & {
        opacity: 1;
        height: 18px;
        max-height: 18px;
      }
    }

    &-counter {
      position: absolute;
      display: flex;
      flex-direction: column;
      bottom: 16px;
      right: 16px;
      gap: 8px;
      width: calc(100% - 32px);
      z-index: 1000;
      animation: slide-in-from-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
        1s forwards;
      opacity: 0;
      transform: translateY(100%);

      @media screen and (min-width: $screen-lg) {
        top: 24px;
        bottom: unset;
        right: 24px;
        width: 40dvw;
        max-width: 400px;
        animation: slide-in-from-top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
          0.7s forwards;
        transform: translate(100%, -100%);
      }
    }
  }

  :deep(.data-delete-network-page__threat-level) {
    text-transform: capitalize;
  }

  :deep(.data-delete-network-page__threat-level--high),
  :deep(.data-delete-network-page__threat-level--unknown) {
    color: $color-alert;
  }

  :deep(.data-delete-network-page__threat-level--medium) {
    color: $color-info;
  }

  :deep(.data-delete-network-page__threat-level--low) {
    color: $color-warning;
  }
}

@keyframes slide-in-from-top {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-from-bottom {
  from {
    opacity: 0;
    transform: translateY(100%);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes expand-clip-path {
  from {
    clip-path: circle(0% at 50% 50%);
  }

  to {
    clip-path: circle(150% at 50% 50%);
  }
}

@keyframes expand-shadow {
  from {
    transform: translate(-50%, -50%) scale(0);
  }

  to {
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>

<!-- This is required to override the margin-top: 0 from the DataDeletePage component -->
<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete__page:has(.data-delete-network-page) {
  margin: 0 !important;
}
</style>
