<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  useTemplateRef,
} from "vue";
import BaseText from "@/library/BaseText.vue";

export type TabItem = {
  id: string;
  label?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

type Props = {
  items: TabItem[];
  height?: number;
  fullWidth?: boolean;
  width?: string | number;
  ariaLabel?: string;
  hideTrackWhenSingle?: boolean;
  disabled?: boolean;
  loading?: boolean;
  backgroundColor?: "primary-1" | "primary-5" | "primary-10";
};

const emit = defineEmits<{
  (e: "select", id: string): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  height: 40,
  fullWidth: true,
  width: "100%",
  ariaLabel: "Tabs",
  hideTrackWhenSingle: false,
  disabled: false,
  loading: false,
  backgroundColor: "primary-1",
});

const current = defineModel<string>();

const trackEl = useTemplateRef<HTMLElement>("trackEl");
const btnRefs = ref<HTMLElement[]>([]);
const indicatorLeft = ref(0);
const indicatorWidth = ref(0);
const hasInitialMeasurement = ref(false);
const ready = ref(false);

onMounted(() => {
  if (!current.value && props.items[0]) current.value = props.items[0].id;

  setTimeout(() => {
    ready.value = true;
  }, 300);

  window.addEventListener("resize", measure, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", measure);
});

const cssVars = computed(() => ({ "--tabs-h": `${props.height}px` }));
const trackStyle = computed(() => ({
  width: props.fullWidth
    ? "100%"
    : typeof props.width === "number"
      ? `${props.width}px`
      : props.width,
}));

const selectedId = computed<string | undefined>({
  get() {
    return current.value ?? props.items[0]?.id;
  },
  set(newSelectedId) {
    current.value = newSelectedId;
  },
});

function select(id: string) {
  if (props.disabled || props.loading) return;

  const item = props.items.find((i) => i.id === id);
  if (!item || item.disabled) return;

  selectedId.value = id;
  emit("select", id);
  nextTick(measure);
}

function measure() {
  if (!trackEl.value || !selectedId.value) return;

  const btn = btnRefs.value.find((el) => el?.id === `tab-${selectedId.value}`);
  if (!btn) return;

  indicatorLeft.value = btn.offsetLeft;
  indicatorWidth.value = btn.offsetWidth;

  if (!hasInitialMeasurement.value) {
    hasInitialMeasurement.value = true;
  }
}

watch(
  () => [current.value, btnRefs.value.length],
  () => {
    if (
      current.value &&
      btnRefs.value.length === props.items.length &&
      trackEl.value
    ) {
      nextTick(() => {
        requestAnimationFrame(measure);
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="vc-base-tabs"
    :class="[
      {
        'vc-base-tabs--loading': loading,
        'vc-base-tabs--full-width': fullWidth,
        'vc-base-tabs--ready': ready,
      },
    ]"
    :style="cssVars"
  >
    <div
      v-if="hideTrackWhenSingle ? items.length > 1 : true"
      ref="trackEl"
      class="vc-base-tabs__track"
      :class="[`vc-base-tabs__track--${backgroundColor}`]"
      :style="trackStyle"
      role="tablist"
      :aria-label="ariaLabel"
      aria-orientation="horizontal"
    >
      <button
        v-for="(item, index) in items"
        :id="`tab-${item.id}`"
        :key="item.id"
        ref="btnRefs"
        ref_for
        class="vc-base-tabs__btn"
        role="tab"
        :aria-selected="selectedId === item.id"
        :aria-controls="`panel-${item.id}`"
        :aria-label="item.ariaLabel || item.label"
        :disabled="disabled || item.disabled || loading"
        @keydown.enter="select(item.id)"
        @keydown.space.prevent="select(item.id)"
        @mousedown.prevent="select(item.id)"
      >
        <slot
          name="label"
          :item="item"
          :index="index"
          :selected="selectedId === item.id"
        >
          <BaseText
            class="vc-base-tabs__btn-text"
            variant="body-small-semibold"
          >
            {{ item.label ?? `Tab ${index + 1}` }}
          </BaseText>
        </slot>
      </button>

      <div
        class="vc-base-tabs__indicator"
        :class="{ 'vc-base-tabs__indicator--visible': hasInitialMeasurement }"
        :style="{
          transform: `translateX(${indicatorLeft}px)`,
          width: indicatorWidth + 'px',
          height: 'var(--tabs-h)',
        }"
        aria-hidden="true"
      />
    </div>

    <div class="vc-base-tabs__viewport">
      <div
        v-for="it in items"
        v-show="selectedId === it.id"
        :id="`panel-${it.id}`"
        :key="it.id"
        class="vc-base-tabs__panel"
        role="tabpanel"
        :aria-labelledby="`tab-${it.id}`"
      >
        <slot :name="`panel-${it.id}`" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@mixin value-skeleton {
  @at-root .theme-dark & {
    @include base-skeleton($color-primary-10, 0.5, #000, 0.5);
  }

  @at-root .theme-light & {
    @include base-skeleton($color-primary-10, 0.6);
  }
}

.vc-base-tabs {
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
    overflow: hidden;

    &--primary-1 {
      background-color: $color-primary-1;
    }

    &--primary-5 {
      background-color: $color-primary-5;
    }

    &--primary-10 {
      background-color: $color-primary-10;
    }

    .vc-base-tabs--loading & {
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

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }

    &-text {
      color: $color-primary-70;
      position: relative;
      z-index: 2;
      transition: color 0.12s ease-in-out;
    }

    &[aria-selected="true"] &-text {
      color: $color-primary-100;
    }
  }

  &__indicator {
    position: absolute;
    inset-block: 0;
    left: 0;
    border-radius: 999px;
    background-color: $color-primary-1;
    border: 1px solid $color-base-black-15;
    will-change: transform, width;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.15s ease,
      visibility 0s 0.15s;

    &--visible {
      visibility: visible;
      opacity: 1;
      transition:
        opacity 0.15s ease,
        visibility 0s 0s;
    }

    @at-root .theme-dark & {
      background-color: $color-primary-100-light;
    }

    @at-root .theme-light & {
      background-color: $color-primary-100-dark;
    }

    .vc-base-tabs--loading & {
      @include value-skeleton;

      background-color: $color-primary-20 !important;
    }

    .vc-base-tabs--ready & {
      transition:
        transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
        width 200ms ease,
        opacity 0.1s ease;
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
