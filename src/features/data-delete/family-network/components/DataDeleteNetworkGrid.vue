<script setup lang="ts">
import DataDeleteNetworkDot from "@/features/data-delete/family-network/components/DataDeleteNetworkDot.vue";
import type { Dot } from "@/features/data-delete/family-network/types";

interface Props {
  dots: Dot[];
  dotRadius: number;
  centerId: string;
  canInteract: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  dotClick: [event: MouseEvent, dot: Dot];
}>();

function handleDotClick(event: MouseEvent, dot: Dot): void {
  emit("dotClick", event, dot);
}
</script>

<template>
  <g class="data-delete-network-grid">
    <DataDeleteNetworkDot
      v-for="dot in dots"
      :key="dot.id"
      :dot="dot"
      :dot-radius="dotRadius"
      :center-id="centerId"
      :can-interact="canInteract"
      @click="handleDotClick"
    />
  </g>
</template>
