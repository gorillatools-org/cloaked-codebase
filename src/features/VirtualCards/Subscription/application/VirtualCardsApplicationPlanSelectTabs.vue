<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  useSlots,
  watch,
  nextTick,
} from "vue";
import BaseText from "@/library/BaseText.vue";

type Props = {
  modelValue?: number;
  labels?: string[];
  skeleton?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  width?: string | number;
  ariaLabel?: string;
  height?: number;
  hideTrackWhenOneTab?: boolean;
};

const emit = defineEmits<{ (e: "update:modelValue", value: number): void }>();

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  labels: () => [],
  skeleton: false,
  disabled: false,
  fullWidth: true,
  width: "100%",
  ariaLabel: "Tabs",
  height: 40,
  hideTrackWhenOneTab: false,
});

const slots = useSlots();
const current = ref(props.modelValue);
const btnRefs = ref<HTMLElement[]>([]);
const indicatorLeft = ref(0);
const indicatorWidth = ref(0);

onMounted(() => {
  window.addEventListener("resize", onResize, { passive: true });
  nextTick(() => updateIndicator());
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

const slotsCount = computed(
  () => Object.keys(slots).filter((k) => k.startsWith("tab-")).length
);

const total = computed(() => Math.max(props.labels.length, slotsCount.value));

const indexes = computed(() =>
  Array.from({ length: total.value }, (_, i) => i)
);

function setBtnRef(el: HTMLElement, idx: number) {
  if (el) {
    btnRefs.value[idx] = el;
    if (idx === current.value) updateIndicator();
  }
}

function tabId(i: number) {
  return `vcapstabs-${i}`;
}

function panelId(i: number) {
  return `vcapspanel-${i}`;
}

function select(i: number) {
  if (!props.disabled && !props.skeleton) {
    current.value = i;
    emit("update:modelValue", i);
  }
}

const rootStyle = computed(() => ({ "--tabs-h": `${props.height}px` }));

const trackStyle = computed(() => ({
  width: props.fullWidth
    ? "100%"
    : typeof props.width === "number"
      ? `${props.width}px`
      : props.width,
}));

const indicatorStyle = computed(() => {
  return {
    transform: `translateX(${indicatorLeft.value}px)`,
    width: `${indicatorWidth.value}px`,
    height: `var(--tabs-h)`,
  };
});

function updateIndicator() {
  const btn = btnRefs.value[current.value];
  if (!btn) return;
  indicatorLeft.value = btn.offsetLeft;
  indicatorWidth.value = btn.offsetWidth;
}

function onResize() {
  updateIndicator();
}

// Sync external modelValue changes
watch(
  () => props.modelValue,
  (value) => {
    current.value = value;
    nextTick(() => updateIndicator());
  }
);

// Recompute when current tab changes
watch(current, () => {
  nextTick(() => updateIndicator());
});

// Recompute when button refs structure changes
watch(
  btnRefs,
  () => {
    nextTick(() => updateIndicator());
  },
  { deep: true }
);
</script>

<template>
  <div
    class="vc-application-plan-select-tabs"
    :class="[
      {
        'vc-application-plan-select-tabs--skeleton': skeleton,
        'vc-application-plan-select-tabs--full-width': fullWidth,
      },
    ]"
    :style="rootStyle"
  >
    <div
      v-if="hideTrackWhenOneTab ? labels.length > 1 : true"
      class="vc-application-plan-select-tabs__track"
      :style="trackStyle"
      role="tablist"
      :aria-label="ariaLabel"
      aria-orientation="horizontal"
    >
      <template v-if="!skeleton">
        <button
          v-for="i in indexes"
          :id="tabId(i)"
          :key="i"
          :ref="(el) => setBtnRef(el as HTMLElement, i)"
          class="vc-application-plan-select-tabs__btn"
          role="tab"
          :aria-selected="current === i"
          :tabindex="current === i ? 0 : -1"
          :aria-controls="panelId(i)"
          :disabled="skeleton || disabled"
          @click="select(i)"
        >
          <slot
            :name="`label-${i}`"
            :selected="current === i"
            :index="i"
          >
            <BaseText
              class="vc-application-plan-select-tabs__btn-text"
              variant="body-3-semibold"
            >
              {{ labels[i] ?? `Tab ${i + 1}` }}
            </BaseText>
          </slot>
        </button>
      </template>

      <div
        class="vc-application-plan-select-tabs__indicator"
        :style="indicatorStyle"
        aria-hidden="true"
      />
    </div>

    <div class="vc-application-plan-select-tabs__viewport">
      <div
        :id="panelId(current)"
        :key="current"
        class="vc-application-plan-select-tabs__panel"
        role="tabpanel"
        :aria-labelledby="tabId(current)"
      >
        <slot :name="`tab-${current}`" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$component-name: "vc-application-plan-select-tabs";

@mixin value-skeleton {
  @at-root .theme-dark & {
    @include base-skeleton($color-primary-10, 0.5, #000, 0.5);
  }

  @at-root .theme-light & {
    @include base-skeleton($color-primary-10, 0.6);
  }
}

.#{$component-name} {
  display: flex;
  flex-direction: column;
  width: 100%;

  &__track {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--tabs-h);
    border-radius: 999px;
    background-color: $color-primary-10;
    overflow: hidden;

    .#{$component-name}--skeleton & {
      @include value-skeleton;
    }
  }

  &__btn {
    flex: 1 1 0;
    height: 100%;
    padding: 0 18px;
    appearance: none;
    background: transparent;
    border: 0;
    cursor: pointer;
    border-radius: 999px;

    &[aria-selected="true"] &-text {
      color: $color-primary-100;
    }

    &-text {
      color: $color-primary-70;
      position: relative;
      z-index: 1;
      transition: color 0.12s ease-in-out;
    }

    &:disabled {
      cursor: default;
      opacity: 0.7;
    }
  }

  &__indicator {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 50%;
    border-radius: 999px;
    background-color: $color-base-white-100;
    border: 1px solid $color-base-black-15;
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      width 200ms ease;
    will-change: transform, width;
    pointer-events: none;

    .#{$component-name}--skeleton & {
      @include value-skeleton;

      background-color: $color-primary-20 !important;
    }
  }

  &__viewport {
    width: 100%;
  }

  &__panel {
    width: 100%;
  }
}
</style>
