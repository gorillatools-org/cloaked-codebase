<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes.ts";

type StepDurationColor = "spam-protection" | "safe-zone-green";

export type TimelineStepItem = {
  title: string;
  description: string;
  isCompleted?: boolean;
  duration: string;
  durationColor?: StepDurationColor;
  icon?: BaseIconName;
};

const getDurationColorClass = (color?: StepDurationColor) => {
  return `vc-steps-timeline__item-duration--${color || "spam-protection"}`;
};

withDefaults(
  defineProps<{ steps: TimelineStepItem[]; initialDelay?: number }>(),
  {
    initialDelay: 0.2,
  }
);
</script>

<template>
  <div
    class="vc-steps-timeline"
    :style="{
      '--steps-count': String(steps.length),
      '--initial-delay': String(initialDelay) + 's',
    }"
  >
    <ul class="vc-steps-timeline__list">
      <li
        v-for="(step, index) in steps"
        :key="index"
        :class="[
          'vc-steps-timeline__item',
          { 'vc-steps-timeline__item--completed': step.isCompleted },
        ]"
        :style="{ '--i': String(index) }"
      >
        <div class="vc-steps-timeline__item-indicator">
          <div class="vc-steps-timeline__item-number">
            <BaseIcon
              v-if="step.icon || step.isCompleted"
              :name="step.icon || 'check'"
              class="vc-steps-timeline__item-indicator-icon"
            />
            <BaseText
              v-else
              variant="body-3-semibold"
              class="vc-steps-timeline__item-number-text"
            >
              {{ index + 1 }}
            </BaseText>
          </div>

          <div
            v-if="index !== steps.length - 1"
            class="vc-steps-timeline__item-line"
          ></div>
        </div>

        <div class="vc-steps-timeline__item-content">
          <BaseText
            variant="headline-6-bold"
            class="vc-steps-timeline__item-title"
          >
            {{ step.title }}
          </BaseText>
          <BaseText
            variant="body-small-medium"
            class="vc-steps-timeline__item-description"
          >
            {{ step.description }}
          </BaseText>
          <div
            :class="[
              'vc-steps-timeline__item-duration',
              getDurationColorClass(step.durationColor),
            ]"
          >
            <BaseIcon
              v-if="!step.isCompleted"
              name="clock"
              class="vc-steps-timeline__item-duration-icon"
            />
            <BaseText
              variant="body-small-semibold"
              class="vc-steps-timeline__item-duration-text"
            >
              {{ step.duration }}
            </BaseText>
          </div>
        </div>
      </li>
    </ul>
    <slot name="footer" />
  </div>
</template>

<style scoped lang="scss">
$spring-ease: cubic-bezier(0.68, -1.3, 0.32, 1.3);

.vc-steps-timeline {
  display: flex;
  flex-direction: column;
  background-color: $color-base-white-80;
  border-radius: 24px;
  border: 1px solid $color-base-black-10;
  padding: 20px;
  box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);
  margin-top: 16px;
  gap: 8px;

  /* Local animation variables */
  --initial-delay: var(--initial-delay, 0.2s);
  --fade-duration: 0.24s;
  --text-gap: 0.06s;
  --line-duration: 0.25s;
  --row-open-duration: 0.18s;
  --row-open-offset: 0.04s;
  --step-stagger: calc(
    (var(--text-gap) * 2) + var(--fade-duration) + var(--line-duration)
  );

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    /* Per-item animation variables */
    --item-delay: calc(var(--initial-delay) + (var(--i) * var(--step-stagger)));
    --title-delay: calc(
      var(--item-delay) + var(--row-open-offset) + var(--text-gap) * 0
    );
    --description-delay: calc(
      var(--item-delay) + var(--row-open-offset) + var(--text-gap) * 1
    );
    --duration-delay: calc(
      var(--item-delay) + var(--row-open-offset) + var(--text-gap) * 2
    );

    display: flex;
    gap: 16px;
    overflow: hidden;
    max-height: 0;
    animation: open-item var(--row-open-duration) ease-out forwards;
    animation-delay: var(--item-delay);

    &-indicator {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 4px;

      &-icon {
        font-size: 19px;
        opacity: 0;
        transform: scale(0);
        animation: scale-in 350ms $spring-ease forwards;
        animation-delay: calc(var(--item-delay) + var(--row-open-offset));

        .vc-steps-timeline__item--completed & {
          color: $color-white;
        }
      }
    }

    &-number {
      border-radius: 50%;
      border: 1px solid $color-base-black-100;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: fade-in-up var(--fade-duration) ease-out forwards;
      animation-delay: calc(var(--item-delay) + var(--row-open-offset));

      .vc-steps-timeline__item--completed & {
        background-color: $color-spam-protection;
        border-color: $color-spam-protection;
      }

      &-text {
        margin-top: 2px;
      }
    }

    &-line {
      display: flex;
      min-width: 2px;
      height: 0;
      background-color: $color-primary-30;
      overflow: hidden;
      animation: grow-line var(--line-duration) $spring-ease forwards;
      /* stylelint-disable scss/operator-no-newline-after */
      animation-delay: calc(
        var(--item-delay) + var(--row-open-offset) + (var(--text-gap) * 2) +
          var(--fade-duration) + 0.02s
      );
      /* stylelint-enable scss/operator-no-newline-after */
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 4px;
    }

    &-title,
    &-description,
    &-duration {
      opacity: 0;
      animation: fade-in-up var(--fade-duration) ease-out forwards;
    }

    &-title {
      animation-delay: var(--title-delay);

      .vc-steps-timeline__item--completed & {
        color: $color-primary-70;
      }
    }

    &-description {
      animation-delay: var(--description-delay);
      color: $color-primary-70;
    }

    &-duration {
      display: flex;
      align-items: center;
      gap: 4px;
      color: $color-spam-protection;
      animation-delay: var(--duration-delay);

      &--safe-zone-green {
        color: $color-safe-zone-green;
      }

      &-icon {
        width: 16px;
        margin-top: -2px;
      }
    }
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(6px);
    visibility: hidden;
  }

  to {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes grow-line {
  from {
    height: 0;
  }

  to {
    height: 44px;
  }
}

@keyframes open-item {
  from {
    max-height: 0;
  }

  to {
    max-height: 220px;
  }
}
</style>
