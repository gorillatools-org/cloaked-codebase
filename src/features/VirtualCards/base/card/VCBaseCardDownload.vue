<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";
import type { VCBaseCardInfoProps } from "./VCBaseCardInfo.vue";
import VCBaseCardInfo from "./VCBaseCardInfo.vue";

export type VCBaseCardDownloadProps = VCBaseCardInfoProps & {
  loading?: boolean;
  disabled?: boolean;
};

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const props = withDefaults(defineProps<VCBaseCardDownloadProps>(), {
  loading: false,
});

const handleClick = (event: MouseEvent) => {
  if (props.loading) return;
  emit("click", event);
};
</script>

<template>
  <VCBaseCardInfo
    v-bind="props"
    :clickable="!disabled && !loading"
    class="vc-base-card-download"
    :class="{
      'vc-base-card-download--disabled': disabled,
      'vc-base-card-download--loading': loading,
    }"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <template #right>
      <div class="vc-base-card-download__icon-container">
        <transition
          name="switch"
          mode="out-in"
        >
          <span
            v-if="loading"
            key="spinner"
            class="vc-base-card-download__spinner"
            aria-hidden="true"
          />
          <BaseIcon
            v-else
            key="download"
            name="download-file"
            class="vc-base-card-download__download-icon"
            aria-hidden="true"
          />
        </transition>
      </div>
    </template>
  </VCBaseCardInfo>
</template>

<style scoped lang="scss">
.vc-base-card-download {
  &__icon-container {
    position: relative;
    display: inline-flex;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__download-icon {
    font-size: 18px;
    font-weight: 400;
    color: $color-primary-100;
    display: inline-block;
    will-change: opacity, transform, filter;
  }

  &__spinner {
    display: block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    color: $color-primary-100;
    animation: rotate 0.45s linear infinite;
  }

  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &--loading {
    cursor: wait;
  }
}

.switch-enter-from,
.switch-leave-to {
  opacity: 0.6;
  filter: blur(1.2px);
  transform: translateY(1px) scale(0.8);
  transform-origin: center;
}

.switch-enter-to,
.switch-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  transform-origin: center;
}

.switch-enter-active,
.switch-leave-active {
  transition:
    opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
