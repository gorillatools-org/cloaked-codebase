<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, useTemplateRef } from "vue";
import VCRightPanelCloseButton from "../right-panels/VCRightPanelCloseButton.vue";
import BaseText from "@/library/BaseText.vue";

export type VCBaseRightPanelHeaderType = {
  title: string;
  showCloseButton: boolean;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  header?: VCBaseRightPanelHeaderType;
  width?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 500,
  header: () => ({
    title: "",
    showCloseButton: true,
  }),
});

let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
const isInternallyOpen = ref(false);
const contentRef = useTemplateRef<HTMLDivElement>("contentRef");

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  clearTimeout(timeout);
  window.removeEventListener("keydown", handleKeydown);
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.isOpen) {
    close();
  }
}

function close() {
  isInternallyOpen.value = false;
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    props.onClose();
    contentRef.value?.scrollTo({ top: 0 });
  }, 300); // Wait for the close animation to complete
}

watch(
  () => props.isOpen,
  () => {
    if (!props.isOpen) {
      isInternallyOpen.value = false;
      return;
    }

    clearTimeout(timeout);
    isInternallyOpen.value = true;
  },
  { immediate: true }
);

defineExpose({
  close,
});
</script>

<template>
  <div>
    <div
      class="vc-base-right-panel"
      :class="{ 'vc-base-right-panel--active': isInternallyOpen }"
      :style="{ width: `${props.width}px` }"
      tabindex="0"
    >
      <header
        v-if="props.header.showCloseButton || props.header.title"
        class="vc-base-right-panel__header"
      >
        <VCRightPanelCloseButton
          v-if="props.header.showCloseButton"
          @close="close"
        />
        <BaseText variant="body-2-semibold">{{ props.header.title }}</BaseText>
        <slot name="header-actions">
          <span />
        </slot>
      </header>
      <div
        ref="contentRef"
        class="vc-base-right-panel__content"
      >
        <slot />
      </div>
    </div>
    <div
      class="vc-base-right-panel__overlay"
      :class="{ 'vc-base-right-panel__overlay--active': isInternallyOpen }"
      @click="close"
    />
  </div>
</template>

<style lang="scss" scoped>
.vc-base-right-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  height: 100vh;
  z-index: 451;
  background-color: $color-primary-5;
  border-radius: 20px 0 0 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.86, 0, 0.07, 1);

  @include custom-scroll-bar;
  @include transform(translateX(calc(100% + 50px)));

  &--active {
    @include transform(translateX(0));
  }

  &__header {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: $color-primary-5;
    padding: 24px;
    flex-shrink: 0;
  }

  &__content {
    padding: 24px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 104;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.3s ease-in-out,
      visibility 0.3s ease-in-out;
    visibility: hidden;
    background: rgba($black, 0.5);

    &--active {
      opacity: 1;
      pointer-events: all;
      visibility: visible;
    }
  }
}
</style>
