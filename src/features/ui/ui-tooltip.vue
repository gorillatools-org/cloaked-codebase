<script setup>
import {
  nextTick,
  watch,
  reactive,
  onBeforeUnmount,
  ref,
  computed,
  onMounted,
  useAttrs,
} from "vue";
import BaseText from "@/library/BaseText.vue";

const tooltipWrapper = ref(null);
const tooltip = ref(null);

const props = defineProps({
  title: { type: String, default: "" },
  position: { type: String, default: "bottom" },
  alignX: { type: String, default: "left" },
  maxWidth: { type: [String, Number], default: null },
  width: { type: [String, Number], default: null },
  offsetX: { type: [Number, String], default: 0 },
  offsetY: { type: [Number, String], default: 0 },
  canShow: { type: Boolean, default: true },
  isOnSharedPage: { type: Boolean, default: false },
  isMultiline: { type: Boolean, default: false },
});
const attrs = useAttrs();

const POSITIONS = ["bottom", "top"];
const ALIGNMENTS_X = ["left", "center", "right"];

const state = reactive({
  hoverRect: {},
  tooltipPosition: {},
  isVisible: false,
  isEnterState: false,
  isLeaveState: false,
  leaveTimeoutId: null,
});

const style = computed(() => {
  const calculatedStyle = {};

  if (state.tooltipPosition.top && state.tooltipPosition.left) {
    calculatedStyle.top = `${state.tooltipPosition.top}px`;
    calculatedStyle.left = `${state.tooltipPosition.left}px`;
  }

  if (props.maxWidth) {
    calculatedStyle.maxWidth = `${props.maxWidth}px`;
  }

  if (props.width) {
    calculatedStyle.width = `${props.width}px`;
  }

  return calculatedStyle;
});

const isTouchDevice = computed(() => navigator.maxTouchPoints > 0);

watch(
  () => props.title,
  () => {
    if (!props.title) {
      hideTooltip();
    }
  },
  { deep: true }
);

watch(
  () => props.canShow,
  (value) => {
    if (!value) {
      hideTooltip();
    }
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("scroll", handleWindowScroll);
  if (isTouchDevice.value) {
    document.addEventListener("touchstart", handleOutsideTouch, true);
    document.addEventListener("click", handleOutsideTouch, true);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleWindowScroll);
  if (isTouchDevice.value) {
    document.removeEventListener("touchstart", handleOutsideTouch, true);
    document.removeEventListener("click", handleOutsideTouch, true);
  }
  hideTooltip();
});

function handleWindowScroll() {
  if (!state.isVisible) {
    return;
  }

  setPositions();
}

function handleMouseMove() {
  if (!state.isVisible) {
    return;
  }

  state.hoverRect = tooltipWrapper.value.getBoundingClientRect();

  nextTick().then(() => {
    setPositions();
  });
}

function handleMouseEnter() {
  if (!props.canShow || isTouchDevice.value) {
    return;
  }

  clearTimeout(state.leaveTimeoutId);

  state.isLeaveState = false;

  state.hoverRect = tooltipWrapper.value.getBoundingClientRect();

  showTooltip();

  nextTick()
    .then(setPositions)
    .then(() => {
      state.isEnterState = true;
    });
}

function handleTouch(event) {
  if (!props.canShow) {
    return;
  }

  // Prevent event from bubbling to document touch handler
  event.stopPropagation();

  clearTimeout(state.leaveTimeoutId);

  state.isLeaveState = false;

  state.hoverRect = tooltipWrapper.value.getBoundingClientRect();

  showTooltip();

  nextTick()
    .then(setPositions)
    .then(() => {
      state.isEnterState = true;
    });
}

function handleOutsideTouch(event) {
  if (
    state.isVisible &&
    tooltipWrapper.value &&
    tooltip.value &&
    !tooltipWrapper.value.contains(event.target) &&
    !tooltip.value.contains(event.target)
  ) {
    clearTimeout(state.leaveTimeoutId);
    state.isLeaveState = true;

    state.leaveTimeoutId = setTimeout(() => {
      state.isLeaveState = false;
      hideTooltip();
    }, 300);
  }
}

function handleMouseLeave() {
  state.isEnterState = false;
  state.isLeaveState = true;

  state.leaveTimeoutId = setTimeout(() => {
    state.isLeaveState = false;

    hideTooltip();
  }, 100);
}

function setPositions() {
  const position = {
    left: getLeftPosition(props.alignX) + Number(props.offsetX),
    top: getTopPosition(props.position) + Number(props.offsetY),
  };

  const { innerWidth, innerHeight } = window;

  const tooltipRect = tooltip.value.getBoundingClientRect();

  if (position.top < 0) {
    position.top = getTopPosition("bottom");
  } else {
    if (position.top + tooltipRect.height > innerHeight) {
      position.top = getTopPosition("top");
    }
  }

  // check if tooltip overflows to the right
  if (position.left + tooltipRect.width > innerWidth) {
    position.left = getLeftPosition("right");
  } else {
    // check if tooltip overflows left
    if (position.left < 0) {
      position.left = getLeftPosition("left");
    }
  }

  state.tooltipPosition = position;

  return nextTick();
}

function getTopPosition(position) {
  if (!POSITIONS.includes(position)) {
    return 0;
  }

  const tooltipRect = tooltip.value.getBoundingClientRect();
  const { y, height } = state.hoverRect;

  switch (position) {
    case "bottom":
      return y + height;
    case "top":
      return y - tooltipRect.height;
  }

  return 0;
}

function getLeftPosition(alignX) {
  if (!ALIGNMENTS_X.includes(alignX)) {
    return 0;
  }

  const tooltipRect = tooltip.value.getBoundingClientRect();
  const { x, width } = state.hoverRect;

  switch (alignX) {
    case "left":
      return x;
    case "center":
      return x - tooltipRect.width / 2 + width / 2;
    case "right":
      return x - tooltipRect.width + width;
  }
}

function showTooltip() {
  const conditions = [props.canShow, props.title];

  if (conditions.every(Boolean)) {
    moveToBody().then(() => {
      state.isVisible = true;
    });
  }
}

function hideTooltip() {
  if (!state.isVisible) {
    return;
  }

  state.isVisible = false;
  moveBack();
}

function moveToBody() {
  return nextTick().then(() => {
    document.body.appendChild(tooltip.value);
  });
}

function moveBack() {
  tooltipWrapper.value.appendChild(tooltip.value);
  state.tooltipPosition = {};
  state.isEnterState = false;
  state.isLeaveState = false;
}
</script>

<template>
  <div
    v-bind="attrs"
    ref="tooltipWrapper"
    class="ui-tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @touchstart="handleTouch"
  >
    <slot />

    <div
      ref="tooltip"
      class="ui-tooltip"
      :class="{
        'ui-tooltip--visible': state.isVisible,
        'ui-tooltip--enter-state': state.isEnterState,
        'ui-tooltip--leave-state': state.isLeaveState,
      }"
      :style="style"
    >
      <BaseText
        as="div"
        variant="caption-semibold"
        class="ui-tooltip__content"
        :class="{
          'ui-tooltip__content--shared-page': props.isOnSharedPage,
          'ui-tooltip__content--multiline': props.isMultiline,
        }"
      >
        <slot name="content">
          {{ props.title }}
        </slot>
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.ui-tooltip-wrapper {
  display: inline-flex;
  align-items: center;

  .ui-tooltip {
    display: none;
  }
}

.ui-tooltip {
  visibility: hidden;
  padding: 4px;
  position: fixed;
  pointer-events: none;
  z-index: -1;

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: $color-primary-90;
    border-radius: 6px;
    box-shadow:
      -22.9px -8.90123px 26.7037px rgb(1 2 24 / 5%),
      13.3518px 12.35px 26.7037px rgb(1 2 24 / 16%);
    backdrop-filter: blur(50px);
    padding: 10px;
    line-height: 16px;
    color: $color-primary-1;

    &--multiline {
      white-space: pre-line;
    }

    &--shared-page {
      background: $color-primary-90-light;
      color: $color-background-light;
    }
  }

  svg {
    max-height: 24px;
    max-width: 24px;
    fill: currentcolor;
  }

  &--visible {
    visibility: visible;
    z-index: 10000;
  }

  &--enter-state {
    animation: ui-tooltip-enter 0.3s ease-in-out;
  }

  &--leave-state {
    animation: ui-tooltip-leave 0.3s ease-in-out;
  }

  @keyframes ui-tooltip-enter {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ui-tooltip-leave {
    0% {
      opacity: 1;
      transform: translateY(0);
    }

    100% {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
}
</style>
