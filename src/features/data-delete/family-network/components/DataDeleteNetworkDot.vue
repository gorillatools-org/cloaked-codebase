<script setup lang="ts">
import { computed } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { Dot } from "@/features/data-delete/family-network/types";

interface Props {
  dot: Dot;
  dotRadius: number;
  centerId: string;
  canInteract: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [event: MouseEvent, dot: Dot];
}>();

const isCenterDot = computed(() => props.dot.id === props.centerId);

const dotClasses = computed(() => [
  "data-delete-network-dot",
  {
    "data-delete-network-dot--center": isCenterDot.value,
    "data-delete-network-dot--clickable":
      props.canInteract && (props.dot.isHighlighted || props.dot.isExposed),
  },
]);

const groupClasses = computed(() => [
  "data-delete-network-dot__group",
  {
    "data-delete-network-dot__group--highlighted": props.dot.isHighlighted,
    "data-delete-network-dot__group--exposed": props.dot.isExposed,
  },
]);

const circleRadius = computed(() =>
  props.dot.isHighlighted || props.dot.isExposed ? 8 : props.dotRadius
);

const iconName = computed(() =>
  isCenterDot.value ? "profile-filled" : "plus"
);

function handleClick(event: MouseEvent): void {
  emit("click", event, props.dot);
}
</script>

<template>
  <g
    :transform="`translate(${dot.x}, ${dot.y})`"
    :class="dotClasses"
    :data-network-interactive="
      canInteract && (dot.isHighlighted || dot.isExposed) ? '' : undefined
    "
    @click="handleClick"
  >
    <g :class="groupClasses">
      <circle
        cx="0"
        cy="0"
        :r="circleRadius"
        class="data-delete-network-dot__circle"
      />
    </g>

    <foreignObject
      v-if="dot.isExposed"
      x="-12"
      y="-12"
      width="24"
      height="24"
      class="data-delete-network-dot__icon-wrapper"
    >
      <div class="data-delete-network-dot__icon">
        <BaseIcon :name="iconName" />
      </div>
    </foreignObject>
  </g>
</template>

<style lang="scss" scoped>
.data-delete-network-dot {
  cursor: default;

  &--clickable {
    cursor: pointer;
  }

  &__circle {
    fill: #ff550c;
    opacity: 0.3;
    transition:
      fill 0.3s ease-out,
      opacity 0.3s ease-out;
  }

  &__group {
    &--exposed {
      transition: transform 0.2s ease-out;
    }

    &--highlighted .data-delete-network-dot__circle {
      fill: white;
      animation: pulse 0.5s ease-out forwards;
    }

    &--exposed .data-delete-network-dot__circle {
      fill: $color-status-error !important;
      opacity: 1;
    }

    &--exposed:hover .data-delete-network-dot__circle {
      r: 22;
    }

    &--highlighted:hover .data-delete-network-dot__circle {
      r: 10;
      opacity: 1;
    }

    &--highlighted:active .data-delete-network-dot__circle {
      r: 9;
    }
  }

  &--center .data-delete-network-dot__group--exposed {
    transform: scale(2.5);

    @media screen and (min-width: $screen-lg) {
      transform: scale(4);
    }
  }

  &:not(&--center) .data-delete-network-dot__group--exposed {
    transform: scale(2.5);
  }

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 20px;
  }
}

@keyframes pulse {
  0% {
    r: 5;
    opacity: 0.5;
  }

  50% {
    r: 8;
    opacity: 1;
  }

  100% {
    r: 5;
    opacity: 1;
  }
}
</style>
