<script setup lang="ts">
import DataDeleteAnimatedCounter from "@/features/data-delete/atoms/DataDeleteAnimatedCounter.vue";
import BaseText from "@/library/BaseText.vue";
import { computed } from "vue";
import Button from "@/features/Button.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import BaseIcon from "@/library/BaseIcon.vue";

type Props = {
  name: string;
  description: string;
  counter: number;
  complete: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "view-full-report"): void;
}>();

const color = computed(() => (props.counter <= 0 ? "gray" : "red"));
</script>

<template>
  <div
    class="data-delete-network-exposure"
    :class="`data-delete-network-exposure--${color}`"
  >
    <div class="data-delete-network-exposure__content">
      <div class="data-delete-network-exposure__title-wrapper">
        <Transition name="spin-up">
          <BaseText
            key="running"
            variant="headline-6-bold"
            class="data-delete-network-exposure__title"
          >
            Your exposures found
          </BaseText>
        </Transition>
      </div>
      <div class="data-delete-network-exposure__counter-wrapper">
        <DataDeleteAnimatedCounter
          :color="color"
          :format="{ minimumIntegerDigits: 2, useGrouping: false }"
          :value="props.counter"
          :text-color="complete ? 'white' : 'default'"
        />
        <UiTooltip
          v-if="counter > 0"
          title="This is an estimate of data risks Cloaked has found so far. View your full scan report for details. "
          max-width="230"
        >
          <BaseIcon
            name="info"
            class="data-delete-network-exposure__counter-tooltip-icon"
          />
        </UiTooltip>
      </div>

      <Transition name="slide-up">
        <div
          v-if="props.name"
          class="data-delete-network-exposure__transition-wrapper"
        >
          <div class="data-delete-network-exposure__transition-inner">
            <BaseText
              variant="headline-5-bold"
              class="data-delete-network-exposure__name"
            >
              {{ props.name }}
            </BaseText>
          </div>
        </div>
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="props.description"
          class="data-delete-network-exposure__transition-wrapper"
        >
          <div class="data-delete-network-exposure__transition-inner">
            <BaseText
              variant="body-small-semibold"
              class="data-delete-network-exposure__description"
            >
              {{ props.description }}
            </BaseText>
          </div>
        </div>
      </Transition>
      <Transition name="slide-up-no-blur">
        <div
          v-if="complete"
          class="data-delete-network-exposure__transition-wrapper"
        >
          <div class="data-delete-network-exposure__transition-inner">
            <Button
              variant="primary"
              size="2xl"
              full-width
              class="data-delete-network-exposure__button"
              @click="emit('view-full-report')"
            >
              View Full Scan Report
            </Button>
          </div>
        </div>
      </Transition>
      <slot name="bottom-content" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-network-exposure {
  backdrop-filter: blur(9.5px);
  background: $color-base-white-10;
  border: 1px solid $color-base-black-20;
  border-radius: 16px;
  box-shadow: 0 20px 44px 0 rgba($color-black, 0.45);
  background-blend-mode: overlay;
  padding: 16px;

  @media screen and (min-width: $screen-md) {
    background: rgba($color-black, 0.45);
    padding: 24px 48px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  &__transition-wrapper {
    display: grid;
    width: 100%;
    overflow: hidden;
  }

  &__transition-inner {
    min-height: 0;
    display: flex;
    justify-content: center;
  }

  &__name {
    text-align: center;
    text-transform: capitalize;
  }

  &__description {
    text-align: center;
    color: $color-base-black-80;
  }

  &__title {
    transition: color 0.2s ease-out;

    .data-delete-network-exposure--green & {
      color: $color-status-success;
    }

    .data-delete-network-exposure--red & {
      color: $color-status-error;
    }

    &--complete {
      color: $color-white !important;
    }

    &-wrapper {
      position: relative;
      width: 100%;
      min-height: 1.5em;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
  }

  &__counter {
    &-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    &-tooltip-icon {
      font-size: 18px;
      color: $color-base-black-100;
    }
  }

  &__button {
    font-size: 15px;
    height: 50px;
    font-weight: 600;
  }
}

.slide-up-enter-active {
  transition:
    opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  grid-template-rows: 0fr;
  filter: blur(10px);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  grid-template-rows: 1fr;
  filter: blur(0);
}

.slide-up-no-blur-enter-active,
.slide-up-no-blur-leave-active {
  transition:
    opacity 0.5s cubic-bezier(0.86, 0, 0.07, 1),
    transform 0.5s cubic-bezier(0.86, 0, 0.07, 1),
    grid-template-rows 0.5s cubic-bezier(0.86, 0, 0.07, 1);
  transition-delay: 0.7s;
}

.slide-up-no-blur-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.85);
  grid-template-rows: 0fr;
}

.slide-up-no-blur-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  grid-template-rows: 1fr;
}

.slide-up-no-blur-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  grid-template-rows: 1fr;
}

.slide-up-no-blur-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.85);
  grid-template-rows: 0fr;
}

.spin-up-enter-active,
.spin-up-leave-active {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  width: max-content;
  transform-origin: center;
  transition:
    opacity 0.4s cubic-bezier(0.77, 0, 0.18, 1),
    transform 0.4s cubic-bezier(0.77, 0, 0.18, 1),
    filter 0.4s cubic-bezier(0.77, 0, 0.18, 1);
}

.spin-up-enter-to,
.spin-up-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  filter: blur(0);
}

.spin-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.4);
  filter: blur(3px);
}

.spin-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.3);
  filter: blur(3px);
}
</style>
