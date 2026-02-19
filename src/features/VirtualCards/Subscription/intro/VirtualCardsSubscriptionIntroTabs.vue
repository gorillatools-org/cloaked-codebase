<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue";
import { useSlots } from "vue";

interface Props {
  heightPx?: number;
  gapPx?: number;
  ariaLabel?: string;
  labels?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  heightPx: 6,
  gapPx: 16,
  ariaLabel: "Tabs",
  labels: () => [],
});

const emit = defineEmits<{
  (
    e: "change",
    payload: {
      previousIndex: number;
      newIndex: number;
      direction: "forward" | "backward";
    }
  ): void;
}>();

const step = defineModel<number | undefined>("step");

const { ariaLabel } = toRefs(props);
const slots = useSlots();

const segmentRefs = ref<HTMLElement[]>([]);
const currentIndex = ref<number>(step.value ?? 0);
const lastIndex = ref<number>(currentIndex.value);
const direction = ref<"forward" | "backward">("forward");
const isTransitioning = ref<boolean>(false);

const uid = crypto.randomUUID();
const getTabId = (idx: number) => `${uid}-tab-${idx}`;
const getPanelId = (idx: number) => `${uid}-panel-${idx}`;
const labelFor = (idx: number) => props.labels?.[idx] ?? `Step ${idx + 1}`;

const tabCount = computed<number>(() => slotNames.value.length);

const transitionName = computed<string>(() =>
  direction.value === "forward" ? "move-forward" : "move-back"
);

const slotNames = computed<string[]>(() => {
  const all = Object.keys(slots);
  const tabSlots = all.filter((n) => n.startsWith("tab-"));
  if (tabSlots.length === 0) {
    return slots.default ? ["default"] : [];
  }
  return tabSlots
    .map((name) => ({ name, index: Number(name.split("-")[1] ?? 0) }))
    .sort((a, b) => a.index - b.index)
    .map((x) => x.name);
});

const rootCssVars = computed<Record<string, string>>(() => ({
  "--count": String(tabCount.value || 1),
  "--gap": `${props.gapPx}px`,
  "--height": `${props.heightPx}px`,
  "--segment-width": "56px",
}));

const indicatorStyle = computed<Record<string, string>>(() => ({
  left: `calc(50% - ((var(--count) * var(--segment-width) + (var(--count) - 1) * var(--gap)) / 2) + (var(--segment-width) + var(--gap)) * ${currentIndex.value})`,
  width: "var(--segment-width)",
}));

function select(idx: number) {
  if (idx === currentIndex.value) return;
  const previous = currentIndex.value;
  lastIndex.value = previous;

  const newDirection: "forward" | "backward" =
    idx > previous ? "forward" : "backward";
  direction.value = newDirection;
  currentIndex.value = idx;

  step.value = idx;

  emit("change", {
    previousIndex: previous,
    newIndex: idx,
    direction: newDirection,
  });
}

function setSegmentRef(el: HTMLElement | null, idx: number) {
  if (!el) return;
  segmentRefs.value[idx] = el;
}

watch([() => step.value, () => tabCount.value], ([incoming]) => {
  if (typeof incoming !== "number") return;

  const prev = currentIndex.value;
  const clamped = Math.min(
    Math.max(incoming, 0),
    Math.max(tabCount.value - 1, 0)
  );

  if (clamped === prev) return;

  lastIndex.value = prev;
  direction.value = clamped > prev ? "forward" : "backward";
  currentIndex.value = clamped;
});

function handleBeforeLeave() {
  isTransitioning.value = true;
}

function handleAfterEnter() {
  isTransitioning.value = false;
}
</script>

<template>
  <div
    class="vc-subs-intro-tabs"
    :class="{ 'vc-subs-intro-tabs--is-transitioning': isTransitioning }"
    :style="rootCssVars"
  >
    <div
      class="vc-subs-intro-tabs__track"
      role="tablist"
      :aria-label="ariaLabel"
      aria-orientation="horizontal"
    >
      <button
        v-for="(_, idx) in tabCount"
        :id="getTabId(idx)"
        :key="idx"
        :ref="(el) => setSegmentRef(el as HTMLElement, idx)"
        class="vc-subs-intro-tabs__segment"
        role="tab"
        :aria-selected="currentIndex === idx"
        :tabindex="currentIndex === idx ? 0 : -1"
        :aria-controls="getPanelId(idx)"
        :aria-label="labelFor(idx)"
        @click="select(idx)"
      />

      <div
        class="vc-subs-intro-tabs__indicator"
        :style="indicatorStyle"
        aria-hidden="true"
      />
    </div>

    <div class="vc-subs-intro-tabs__viewport">
      <Transition
        :name="transitionName"
        mode="out-in"
        @before-leave="handleBeforeLeave"
        @after-enter="handleAfterEnter"
      >
        <div
          :id="getPanelId(currentIndex)"
          :key="currentIndex"
          class="vc-subs-intro-tabs__panel"
          role="tabpanel"
          :aria-labelledby="getTabId(currentIndex)"
        >
          <slot :name="slotNames[currentIndex]" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-subs-intro-tabs";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;

  &__track {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
    height: var(--height);
    margin: 8px 0 16px;
    width: 100%;
  }

  &__segment {
    appearance: none;
    border: none;
    padding: 0;
    height: var(--height);
    width: 56px;
    border-radius: 90px;
    background: $color-primary-30;
    cursor: pointer;
  }

  &__indicator {
    position: absolute;
    top: 0;
    left: 0;
    height: var(--height);
    background: $color-primary-100;
    border-radius: 90px;
    transition:
      left 220ms cubic-bezier(0.22, 1, 0.36, 1),
      width 220ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: left, width;
    pointer-events: none;
  }

  &__panel {
    width: 100%;
    height: 100%;
    overflow: auto;

    .#{$component-name}--is-transitioning & {
      overflow: hidden;
    }
  }

  &__viewport {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }
}

/* move-like transitions for forward/back directions */
.move-forward-enter-active,
.move-forward-leave-active,
.move-back-enter-active,
.move-back-leave-active {
  transition:
    transform 200ms cubic-bezier(0.77, 0, 0.18, 1),
    opacity 200ms cubic-bezier(0.77, 0, 0.18, 1),
    filter 150ms cubic-bezier(0.77, 0, 0.18, 1);
  will-change: transform, opacity, filter;
}

.move-forward-enter-from {
  opacity: 0;
  transform: translateX(24px);
  filter: blur(2px);
}

.move-forward-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.move-forward-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.move-forward-leave-to {
  opacity: 0;
  transform: translateX(-24px);
  filter: blur(2px);
}

.move-back-enter-from {
  opacity: 0;
  transform: translateX(-24px);
  filter: blur(2px);
}

.move-back-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.move-back-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.move-back-leave-to {
  opacity: 0;
  transform: translateX(24px);
  filter: blur(2px);
}
</style>
