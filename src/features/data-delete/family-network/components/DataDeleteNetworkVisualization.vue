<script setup lang="ts">
import { ref, computed, nextTick, useTemplateRef } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useDevice } from "@/composables/useDevice";
import { useDataDeleteNetwork } from "@/features/data-delete/family-network/composables/useDataDeleteNetwork";
import DataDeleteNetworkConnections from "@/features/data-delete/family-network/components/DataDeleteNetworkConnections.vue";
import DataDeleteNetworkGrid from "@/features/data-delete/family-network/components/DataDeleteNetworkGrid.vue";
import DataDeleteNetworkTooltipsHtml from "@/features/data-delete/family-network/components/DataDeleteNetworkTooltipsHtml.vue";
import type { Dot } from "@/features/data-delete/family-network/types";

type Props = {
  canInteract?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  canInteract: true,
});

const { isMobile } = useDevice();
const containerRef = useTemplateRef<HTMLDivElement>("containerRef");
const containerSize = ref({ width: 0, height: 0 });
const isResizing = ref(false);
const hasInitialized = ref(false);

const networkConfig = computed(() => ({
  isMobile: isMobile.value,
  containerSize: containerSize.value,
}));

const {
  connections,
  connectionsWithPositions,
  dots,
  centerDot,
  highlightedDotsWithTooltips,
  zoomState,
  settings,
  containerSize: svgDimensions,
  centerId,
  isConnectionExposed,
  handleDotClick,
  handleTooltipClick,
  handleContainerClick,
  getAnimationDuration,
  connectWithContent,
  zoomToDot,
  resetZoom,
  setDotHighlight,
  setDotExposed,
} = useDataDeleteNetwork(networkConfig);

useResizeObserver(containerRef, async (entries) => {
  const entry = entries[0];
  if (!entry) return;

  const { width, height } = entry.contentRect;
  const sizeChanged =
    width !== containerSize.value.width ||
    height !== containerSize.value.height;

  if (!sizeChanged) return;

  const isInitialRender = !hasInitialized.value;
  if (isInitialRender) {
    hasInitialized.value = true;
  } else {
    isResizing.value = true;
  }

  containerSize.value = { width, height };
  resetZoom();

  if (!isInitialRender) {
    await nextTick();
    requestAnimationFrame(() => {
      isResizing.value = false;
    });
  }
});

function handleDotClickWrapper(event: MouseEvent, dot: Dot): void {
  if (props.canInteract) {
    handleDotClick(event, dot);
  }
}

function handleTooltipClickWrapper(dot: Dot): void {
  if (props.canInteract) {
    handleTooltipClick(dot);
  }
}

function handleContainerClickWrapper(event: MouseEvent): void {
  if (props.canInteract) {
    handleContainerClick(event);
  }
}

defineExpose({
  connectWithContent,
  zoomToDot,
  resetZoom,
  setDotHighlight,
  setDotExposed,
  connections,
  dots,
  centerDot,
});
</script>

<template>
  <div
    ref="containerRef"
    class="data-delete-network-visualization"
    :class="{ 'data-delete-network-visualization--resizing': isResizing }"
    @click="handleContainerClickWrapper"
  >
    <div
      class="data-delete-network-visualization__zoom-wrapper"
      :style="{
        transform: `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`,
      }"
    >
      <svg
        :width="svgDimensions.width"
        :height="svgDimensions.height"
        :viewBox="`0 0 ${svgDimensions.width} ${svgDimensions.height}`"
        class="data-delete-network-visualization__svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        shape-rendering="geometricPrecision"
      >
        <DataDeleteNetworkConnections
          :connections="connectionsWithPositions"
          :is-connection-exposed="isConnectionExposed"
          :get-animation-duration="getAnimationDuration"
        />

        <DataDeleteNetworkGrid
          :dots="dots"
          :dot-radius="settings.dotRadius"
          :center-id="centerId"
          :can-interact="canInteract"
          @dot-click="handleDotClickWrapper"
        />
      </svg>

      <DataDeleteNetworkTooltipsHtml
        :items="highlightedDotsWithTooltips"
        :can-interact="canInteract"
        :tooltip-scale="settings.tooltipScale"
        @tooltip-click="handleTooltipClickWrapper"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-network-visualization {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  @media screen and (min-width: $screen-md) {
    transform: scale(1.052) translateX(10px);
  }

  &__zoom-wrapper {
    transform-origin: 0 0;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    will-change: transform;
    backface-visibility: hidden;
    position: relative;
  }

  &--resizing {
    * {
      transition: none !important;
      animation: none !important;
    }
  }

  &__svg {
    position: relative;
    z-index: 1;
    pointer-events: none;
    border-radius: 8px;
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;

    * {
      pointer-events: auto;
    }
  }
}
</style>
