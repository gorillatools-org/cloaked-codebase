<script setup lang="ts">
import { computed, inject } from "vue";
import type {
  Dot,
  TooltipItem,
} from "@/features/data-delete/family-network/types";
import BaseIcon from "@/library/BaseIcon.vue";
import { networkVisualizationFlagKey } from "@/features/data-delete/injectionKeys";

interface Props {
  items: TooltipItem[];
  canInteract: boolean;
  tooltipScale: number;
  showRelation?: boolean;
}

const emit = defineEmits<{
  tooltipClick: [dot: Dot];
}>();

const props = withDefaults(defineProps<Props>(), {
  showRelation: false,
});

const networkVisualizationFlag = inject(networkVisualizationFlagKey);

const getTooltipName = (item: TooltipItem) => {
  if (
    networkVisualizationFlag?.flag?.value ===
      "network-visualization-relation-only" &&
    item.content.type === "relative" &&
    item.content.relation
  ) {
    return item.content.relation;
  }

  return item.content.name;
};

const tooltipPositions = computed(() =>
  props.items.map((item) => ({
    ...item,
    transform: `translate(${item.position.x}px, ${item.position.y}px) translate(-50%, 0%) scale(${props.tooltipScale})`,
  }))
);

function handleTooltipClick(dot: Dot): void {
  emit("tooltipClick", dot);
}
</script>

<template>
  <div class="data-delete-network-tooltips-html">
    <div
      v-for="item in tooltipPositions"
      :key="item.dot.id"
      class="data-delete-network-tooltips-html__tooltip"
      :class="{
        'data-delete-network-tooltips-html__tooltip--interactive': canInteract,
      }"
      :data-network-interactive="canInteract ? '' : undefined"
      :style="{ transform: item.transform }"
      @click.stop="handleTooltipClick(item.dot)"
    >
      <div class="data-delete-network-tooltips-html__content">
        <BaseIcon
          v-if="item.content?.icon"
          :name="item.content?.icon"
          class="data-delete-network-tooltips-html__icon"
        />
        <div
          v-if="item.content.label"
          class="data-delete-network-tooltips-html__label"
        >
          {{ item.content.label }}
        </div>
        <div class="data-delete-network-tooltips-html__name">
          {{ getTooltipName(item) }}
        </div>
        <div
          v-if="item.content.relation && props.showRelation"
          class="data-delete-network-tooltips-html__relation"
        >
          {{ item.content.relation }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-network-tooltips-html {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;

  &__tooltip {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: center top;
    will-change: transform;
    backface-visibility: hidden;
    pointer-events: auto;
    z-index: 10;

    &--interactive {
      cursor: pointer;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    align-items: center;
    border: 1px solid $color-base-black-30;
    border-radius: 18px;
    padding: 8px 16px;
    width: fit-content;
    box-sizing: border-box;
    background: $color-base-white-30;
    box-shadow: 0 10px 24px 0 rgb(0 0 0 / 15%);
    backdrop-filter: blur(7.5px);
    white-space: nowrap;
    animation: tooltip-appear 0.3s ease-out forwards;

    @media screen and (min-width: $screen-lg) {
      gap: 6px;
      padding: 14px 20px;
      border-radius: 20px;
    }
  }

  &__icon {
    font-size: 14px;

    @media screen and (min-width: $screen-lg) {
      font-size: 20px;
    }
  }

  &__label {
    color: $color-base-black-50;
    font-size: 11px;
    font-weight: 400;
    text-align: center;
    text-transform: capitalize;

    @media screen and (min-width: $screen-lg) {
      font-size: 15px;
    }
  }

  &__name {
    font-size: 14px;
    font-weight: 700;
    text-align: center;
    line-height: 1.1;
    text-transform: capitalize;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media screen and (min-width: $screen-lg) {
      font-size: 18px;
      max-width: 200px;
    }
  }

  &__relation {
    color: $color-base-black-50;
    font-size: 13px;
    font-weight: 400;
    text-align: center;
    line-height: 1.1;
    text-transform: capitalize;

    @media screen and (min-width: $screen-lg) {
      font-size: 17px;
    }
  }
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
