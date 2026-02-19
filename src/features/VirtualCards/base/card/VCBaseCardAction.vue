<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";
import type { VCBaseCardInfoProps } from "./VCBaseCardInfo.vue";
import VCBaseCardInfo from "./VCBaseCardInfo.vue";

const props = defineProps<VCBaseCardInfoProps & { hideChevron?: boolean }>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  emit("click", event);
};
</script>

<template>
  <VCBaseCardInfo
    v-bind="props"
    :clickable="true"
    class="vc-base-card-action"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <template #icon>
      <slot name="icon" />
    </template>
    <template #description>
      <slot name="description" />
    </template>
    <template
      v-if="$slots.left"
      #left
    >
      <slot name="left" />
    </template>
    <template #right>
      <BaseIcon
        v-if="!props.hideChevron"
        :class="{
          'vc-base-card-action__icon--no-effect': props.border?.focused,
        }"
        name="chevron-right"
        class="vc-base-card-action__icon"
        aria-hidden="true"
      />
    </template>
  </VCBaseCardInfo>
</template>

<style scoped lang="scss">
.vc-base-card-action {
  &__icon {
    font-size: 20px;
    position: relative;
    line-height: 1;
    display: inline-block;
    transition: transform 0.12s ease-out;

    .vc-base-card-action:hover &:not(&--no-effect) {
      transform: translateX(3px);
      transition-delay: 0.1s;
    }
  }
}
</style>
