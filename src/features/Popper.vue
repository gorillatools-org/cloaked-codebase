<script setup>
import { createPopper as initializePopper } from "@popperjs/core";
import { vOnClickOutside } from "@vueuse/components";
import {
  ref,
  watch,
  onBeforeUnmount,
  computed,
  nextTick,
  onUpdated,
  useAttrs,
} from "vue";

const props = defineProps({
  value: {
    type: Boolean,
    default: null,
  },
  placement: {
    type: String,
    default: "bottom",
    validator: (value) =>
      [
        "bottom",
        "bottom-start",
        "bottom-end",
        "top",
        "top-start",
        "top-end",
        "left",
        "left-start",
        "left-end",
        "right",
        "right-start",
        "right-end",
      ].includes(value),
  },
  strategy: {
    type: String,
    default: "fixed",
    validator: (value) => ["fixed", "absolute"].includes(value),
  },
  offsetAway: {
    type: Number,
    default: 2,
  },
  offsetAlong: {
    type: Number,
    default: 0,
  },
  transition: {
    type: String,
    default: "fade-100",
  },
  teleport: {
    type: [String, null],
    default: null,
  },
  zIndex: {
    type: Number,
    default: 4000,
  },
  width: {
    type: String,
    default: "initial",
  },
  height: {
    type: String,
    default: "initial",
  },
  maxHeight: {
    type: String,
    default: "unset",
  },
  hasClickOpen: {
    type: Boolean,
    default: true,
  },
  hasClickClose: {
    type: Boolean,
    default: true,
  },
  hasMouseEnterOpen: {
    type: Boolean,
    default: false,
  },
  hasMouseLeaveClose: {
    type: Boolean,
    default: false,
  },
  hasRightClickOpen: {
    type: Boolean,
    default: false,
  },
  hasOutsideClickClose: {
    type: Boolean,
    default: true,
  },
  hasContentClickClose: {
    type: Boolean,
    default: true,
  },
  hasEventOffset: {
    type: Boolean,
    default: false,
  },
  overflow: {
    type: String,
    required: false,
    default: undefined,
  },
});

const attrs = useAttrs();

const uniqueKey = ref(self.crypto.randomUUID());
const internalValue = ref(props.value ?? false);
const lastActivatorEvent = ref(null);

const activator = ref(null);
const content = ref(null);
const slot = ref(null);

let popper = null;
const popperOptions = computed(() => ({
  placement:
    props.hasEventOffset && lastActivatorEvent.value
      ? "bottom-start"
      : props.placement,
  strategy: props.strategy,
  modifiers: [
    {
      name: "offset",
      options: {
        offset: (popper) => [
          props.hasEventOffset && lastActivatorEvent.value
            ? lastActivatorEvent.value.offsetX
            : props.offsetAlong,
          props.hasEventOffset && lastActivatorEvent.value
            ? lastActivatorEvent.value.offsetY - popper.reference.height
            : props.offsetAway,
        ],
      },
    },
  ],
}));

const createPopper = () => {
  nextTick(() => {
    if (!popper) {
      popper = initializePopper(
        activator.value,
        content.value,
        popperOptions.value
      );
    }
  });
};

const destroyPopper = () =>
  nextTick(() => {
    popper?.destroy();
    popper = null;
  });

const updatePopperOptions = () =>
  nextTick(() => popper?.setOptions(popperOptions.value));

watch(() => props.placement, updatePopperOptions, { deep: true });
watch(() => props.strategy, updatePopperOptions, { deep: true });
watch(() => props.offsetAway, updatePopperOptions, { deep: true });
watch(() => props.offsetAlong, updatePopperOptions, { deep: true });
watch(
  () => props.value,
  (newValue) => {
    internalValue.value = newValue;
  },
  { deep: true }
);
watch(
  () => internalValue.value,
  (newValue) => {
    if (newValue) {
      createPopper();
    } else {
      destroyPopper();
      lastActivatorEvent.value = null;
    }
  },
  { immediate: true, deep: true }
);

onBeforeUnmount(destroyPopper);

const emit = defineEmits(["input", "open", "close", "click"]);

const open = ({ offsetX, offsetY }) => {
  lastActivatorEvent.value = { offsetX, offsetY };

  if (internalValue.value) {
    return;
  }

  if (props.value === null) {
    internalValue.value = true;
  }

  emit("input", true);
  emit("open");
};

const close = () => {
  if (!internalValue.value) {
    return;
  }

  if (props.value === null) {
    internalValue.value = false;
  }

  emit("input", false);
  emit("close");
};

const onClick = (event) => {
  if (internalValue.value) {
    props.hasClickClose && close();
  } else {
    props.hasClickOpen && open(event);
  }
};

const onContextMenu = (event) => {
  if (!props.hasRightClickOpen) {
    return;
  }

  internalValue.value || open(event);
};

const onMouseEnter = (event) => props.hasMouseEnterOpen && open(event);

const onMouseLeave = () => props.hasMouseLeaveClose && close();

const onOutsideClick = () => {
  if (props.hasOutsideClickClose) {
    close();
  }
};

const onContentClick = () => props.hasContentClickClose && close();

onUpdated(() => {
  // consider updating only after inner html changes
  if (slot.value) {
    popper?.forceUpdate();
  }
});
</script>

<template>
  <div
    v-on-click-outside="onOutsideClick"
    v-bind="attrs"
    class="popper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      ref="activator"
      class="popper__activator"
      @click.stop.prevent="onClick"
      @contextmenu.prevent="onContextMenu"
    >
      <slot name="default" />
    </div>
    <Teleport
      v-if="internalValue"
      to="#root"
      @click="emit('click')"
    >
      <div
        ref="content"
        :key="uniqueKey"
        :style="{ width, height, maxHeight, zIndex }"
        class="popper__content"
        @click="onContentClick"
      >
        <div
          v-show="internalValue"
          ref="slot"
          :style="{
            width,
            height,
            maxHeight,
            overflow: overflow || (maxHeight !== 'unset' ? 'scroll' : 'auto'),
          }"
        >
          <slot name="content" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.popper__content {
  box-shadow:
    -22.9px -8.90123px 26.7037px $color-base-white-5,
    13.3518px 12.35px 26.7037px $color-base-white-5;
  border-radius: 8px;
}
</style>
