<script lang="ts" setup>
import { computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { useDevice } from "@/composables/useDevice";

export type StepState = "pending" | "active" | "done" | "warning" | "error";
export interface ProgressStep {
  id: string;
  label: string;
  shortLabel: string;
  state: StepState;
}

const props = defineProps<{ steps: ProgressStep[] }>();
const { isMobile } = useDevice();

const activeIndex = computed(() => {
  const idx = props.steps.findIndex((s) =>
    ["active", "warning", "error"].includes(s.state)
  );
  if (idx !== -1) return idx;
  const lastDone = [...props.steps].map((s) => s.state).lastIndexOf("done");
  if (lastDone === -1) return 0;
  return Math.min(lastDone + 1, props.steps.length - 1);
});

const targetPct = computed(() => {
  const total = Math.max(props.steps.length - 1, 1);
  const activeCenter = activeIndex.value >= 0 ? activeIndex.value : 0;

  return (activeCenter / total) * 100;
});

const stepOffsetPct = (index: number) => {
  const total = Math.max(props.steps.length - 1, 1);
  return (index / total) * 100;
};

const iconFor = (step: ProgressStep): string | null => {
  if (step.state === "done") return "check";
  if (step.state === "error") return "close";
  if (step.state === "warning") return "calendar";
  return null;
};
</script>

<template>
  <div class="vc-application-progress">
    <div class="vc-application-progress__track">
      <div
        class="vc-application-progress__track-fill"
        :style="{ width: targetPct + '%' }"
      />

      <div class="vc-application-progress__nodes">
        <div
          v-for="(step, index) in props.steps"
          :key="step.id"
          class="vc-application-progress__node"
          :class="[
            `vc-application-progress__node--${step.state}`,
            index === activeIndex
              ? 'vc-application-progress__node--active'
              : null,
          ]"
          :style="{ left: stepOffsetPct(index) + '%' }"
        >
          <span class="vc-application-progress__node-inner">
            <Transition
              name="icon"
              mode="out-in"
            >
              <BaseIcon
                v-if="iconFor(step)"
                :key="iconFor(step) || 'none'"
                class="vc-application-progress__node-icon"
                :name="iconFor(step) as any"
              />
            </Transition>
          </span>

          <BaseText
            variant="label-medium"
            class="vc-application-progress__label"
          >
            {{ isMobile ? step.shortLabel : step.label }}
          </BaseText>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-application-progress";

.#{$component-name} {
  position: relative;

  &__track {
    position: relative;
    height: 3px;
    background: $color-primary-20;
    border-radius: 6px;
  }

  &__track-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: $color-primary-100;
    border-radius: inherit;
    width: 0%;
    transition: width 450ms cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 1;
  }

  &__nodes {
    position: absolute;
    left: 0;
    top: -100%;
    width: 100%;
    z-index: 1;
  }

  &__node {
    position: absolute;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 8px;
    top: -4px;

    &-inner {
      display: grid;
      place-items: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: $color-primary-20;
      color: $color-base-white-100;
      transition:
        background-color 220ms ease,
        transform 220ms ease;
      pointer-events: none;
      position: relative;
      overflow: hidden;

      .#{$component-name}__node--active &,
      .#{$component-name}__node--done & {
        background: $color-primary-100;
      }

      .#{$component-name}__node--error & {
        background: $color-status-error;
      }

      .#{$component-name}__node--warning & {
        background: $color-status-yield;
      }
    }

    &-icon {
      font-size: 14px;
      color: $color-base-white-100;
      transition:
        color 220ms ease,
        transform 180ms ease,
        opacity 180ms ease;

      .#{$component-name}__node--done & {
        transform: translateX(-0.5px);
      }
    }
  }

  &__label {
    position: absolute;
    top: 25px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    color: $color-primary-50;
    transition: color 220ms ease;
  }

  &__node--active &__label {
    color: $color-primary-100;
  }

  &__node--warning &__label {
    color: $color-status-yield;
  }

  &__node--error &__label {
    color: $color-status-error;
  }
}

.icon-enter-active,
.icon-leave-active {
  transition: opacity 180ms ease;
}

.icon-enter-from,
.icon-leave-to {
  transform: scale(0.4);
  opacity: 0;
}

.icon-enter-to,
.icon-leave-from {
  transform: scale(1);
  opacity: 1;
}
</style>
