<script setup lang="ts">
import { reactive, watch, computed, useSlots, onUnmounted } from "vue";
import { useScrollLock } from "@vueuse/core";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import { useDevice } from "@/composables/useDevice";

const slots = useSlots();

const emit = defineEmits(["close"]);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  fullHeight: {
    type: Boolean,
    default: false,
  },
  showCloseInHeader: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [Number, String],
    default: null,
  },
  headerBorder: {
    type: Boolean,
    default: false,
  },
  withoutHeaderPadding: {
    type: Boolean,
    default: false,
  },
  withoutBodyPadding: {
    type: Boolean,
    default: false,
  },
  withoutFooterPadding: {
    type: Boolean,
    default: false,
  },
  footerBorder: {
    type: Boolean,
    default: false,
  },
  preventClose: {
    type: Boolean,
    default: false,
  },
  large: {
    type: Boolean,
    default: false,
  },
  preventEscapeOnInputFocus: {
    type: Boolean,
    default: false,
  },
  preventBodyScroll: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: "medium",
    validator(value: unknown) {
      return (
        typeof value === "string" &&
        ["large", "medium", "small"].includes(value)
      );
    },
  },
});

const { isIOS } = useDevice();
const isBodyScrollLocked = useScrollLock(document.body);

const state = reactive({
  isEnterState: false,
  isLeaveState: false,
  isInitialized: false,
});

const style = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    const isString = typeof props.width === "string";
    style.maxWidth = isString ? props.width : `${props.width}px`;
  }

  return style;
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown, true);
  isBodyScrollLocked.value = false;
});

function close() {
  if (props.preventClose) {
    return;
  }
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.show) {
    if (props.preventEscapeOnInputFocus && hasInputFocused()) {
      return;
    }

    event.stopPropagation();
    close();
  }
}

function hasInputFocused() {
  const active = document.activeElement as HTMLElement | null;
  return (
    active &&
    (active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable)
  );
}

watch(
  () => props.show,
  (value) => {
    if (value) {
      // Reset states
      state.isLeaveState = false;
      state.isEnterState = false;

      // Use requestAnimationFrame for smoother animation timing
      requestAnimationFrame(() => {
        state.isEnterState = true;
        state.isInitialized = true;
        document.addEventListener("keydown", handleKeydown, true);
      });
    } else {
      state.isEnterState = false;
      state.isLeaveState = true;
      document.removeEventListener("keydown", handleKeydown, true);
    }
  },
  { immediate: true }
);

watch(
  () => props.preventBodyScroll && props.show,
  (shouldLock) => {
    // Don't lock body scroll on iOS - it breaks inner scrolling with the keyboard
    if (isIOS?.value) {
      isBodyScrollLocked.value = false;
    } else {
      isBodyScrollLocked.value = shouldLock;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="modal-container"
    :class="{
      active: props.show,
      initialized: state.isInitialized,
      'modal-container--enter-state': state.isEnterState,
      'modal-container--leave-state': state.isLeaveState,
    }"
  >
    <div
      class="content"
      :class="{
        fullHeight: props.fullHeight,
        [props.large ? 'large' : props.size]: true,
      }"
      :style="style"
    >
      <header
        v-if="slots.header"
        class="modal-header"
        :class="{
          'modal-header--bordered': props.headerBorder,
          'modal-header--no-padding': props.withoutHeaderPadding,
        }"
      >
        <BaseText
          as="div"
          variant="headline-4-bold"
          class="modal-header__title"
        >
          <slot name="header" />
        </BaseText>

        <div
          v-if="props.showCloseInHeader"
          class="close"
          @click="close"
        >
          <InlineSvg name="modal-x" />
        </div>
      </header>

      <BaseText
        v-if="slots.body"
        ref="modal_body"
        as="section"
        variant="body-2-semibold"
        class="modal-body"
        :class="{ 'modal-body--no-padding': props.withoutBodyPadding }"
      >
        <slot name="body" />
      </BaseText>

      <section
        v-if="slots.input"
        ref="modal_input"
        class="modal-input"
      >
        <slot name="input" />
      </section>

      <footer
        v-if="slots.footer"
        class="modal-footer"
        :class="{
          'modal-footer--bordered': props.footerBorder,
          'modal-footer--no-padding': props.withoutFooterPadding,
        }"
      >
        <slot name="footer" />
      </footer>
    </div>

    <div
      class="background"
      @click="close"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  padding: unset;

  // Mobile-only tweaks (<= $screen-md)
  @media (max-width: $screen-md) {
    height: 100dvh;
    padding: 16px 10px;

    .content {
      max-height: calc(100dvh - 32px);
      overflow: hidden;
    }

    .modal-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  // iOS-specific overrides: avoid nested scroll; scroll the overlay instead
  @supports (-webkit-touch-callout: none) {
    @media (max-width: $screen-md) {
      overflow-y: auto;
      overscroll-behavior: contain;

      .content {
        max-height: none; // let content define height; container scrolls
      }

      .modal-body {
        overflow-y: visible; // avoid inner scroll wars
      }
    }
  }

  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;

  &.active {
    opacity: 1;
    visibility: visible;
  }

  &.initialized {
    .content {
      transition: all 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
  }

  .close {
    color: rgb(25 30 35 / 60%);
    width: 24px;
    height: 30px; // h1 line-height
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;

    &:hover {
      cursor: pointer;
    }
  }

  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    min-height: 100px;
    max-width: 425px;
    max-height: calc(100% - 96px);
    background: $color-primary-1;
    border-radius: 28px;
    border: 1px solid $color-primary-10;
    display: flex;
    flex-direction: column;
    box-shadow: 0 30px 120px rgba($black, 0.25);

    // Initial state - invisible and slightly scaled down
    opacity: 0;
    @include transform(scale(0.95));

    // Remove conflicting transitions - let animations handle the timing
    transition: none;

    &.large {
      max-width: 670px;
    }

    &.medium {
      max-width: 500px;

      .modal-body {
        padding: 36px 36px;
        overflow-x: hidden;

        &--no-padding {
          padding: 0;
        }
      }
    }

    &.small {
      max-width: 320px;
    }

    &.fullHeight {
      height: 620px;
    }

    .modal-header {
      margin-top: 0;
      padding: 32px 32px 8px;
      display: flex;
      align-items: center;
      color: $color-primary-100;

      &__title {
        flex: 1 1 0;
        color: $color-primary-100;
      }

      &--bordered {
        border-bottom: 1px solid $color-primary-10;
        padding-bottom: 16px;
        padding-top: 24px;
      }

      &--no-padding {
        padding: 0;
      }
    }

    .modal-body {
      @include custom-scroll-bar;

      padding-right: 10px;
      position: relative;
      padding: 8px 32px;
      overflow: auto;
      color: $color-primary-100;

      + p {
        margin-top: 16px;
      }

      &--no-padding {
        padding: 0;
      }
    }

    .modal-input {
      padding: 8px 32px;
    }

    .modal-footer {
      margin-top: auto;
      display: flex;
      justify-content: flex-end;
      padding: 12px 32px 28px;
      gap: 6px;

      &--top {
        border-bottom: 1px solid $color-primary-10;
      }

      &--no-padding {
        padding: 0;
      }
    }
  }

  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba($color-primary-1-dark, 0.65);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 1;
  }

  &--enter-state {
    .content {
      animation: modal-template-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
        forwards;
    }
  }

  &--leave-state {
    .content {
      animation: modal-template-leave 0.25s ease-in forwards;
    }
  }

  @keyframes modal-template-enter {
    0% {
      opacity: 0;
      @include transform(scale(0.95) translateY(20px));
    }

    50% {
      opacity: 0.8;
    }

    100% {
      opacity: 1;
      @include transform(scale(1) translateY(0));
    }
  }

  @keyframes modal-template-leave {
    0% {
      opacity: 1;
      @include transform(scale(1) translateY(0));
    }

    100% {
      opacity: 0;
      @include transform(scale(0.95) translateY(-10px));
    }
  }
}
</style>
