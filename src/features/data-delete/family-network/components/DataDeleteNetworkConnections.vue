<script setup lang="ts">
import type { Connection } from "@/features/data-delete/family-network/types";

interface Props {
  connections: Connection[];
  isConnectionExposed: (connection: Connection) => boolean;
  getAnimationDuration: (length: number) => number;
}

defineProps<Props>();
</script>

<template>
  <g class="data-delete-network-connections">
    <line
      v-for="conn in connections"
      :key="conn.id"
      :x1="conn.fromX"
      :y1="conn.fromY"
      :x2="conn.toX"
      :y2="conn.toY"
      :class="[
        'data-delete-network-connections__line',
        {
          'data-delete-network-connections__line--exposed':
            isConnectionExposed(conn),
        },
      ]"
      :style="{
        '--line-length': conn.length,
        '--animation-duration': `${getAnimationDuration(conn.length)}s`,
      }"
    />
  </g>
</template>

<style lang="scss" scoped>
.data-delete-network-connections {
  pointer-events: none;

  &__line {
    stroke: white;
    stroke-width: 2;
    fill: none;
    stroke-dasharray: var(--line-length);
    stroke-dashoffset: var(--line-length);
    animation: draw-line var(--animation-duration) ease-out forwards;
    transition: stroke 0.3s ease-out;

    &--exposed {
      stroke: $color-status-error;
    }
  }
}

@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
