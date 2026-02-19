<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  inject,
  onUnmounted,
  type ComputedRef,
} from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useRoute } from "vue-router";
import { useThumbsFeedbackTooltip } from "@/features/data-delete/composables/useThumbsFeedbackTooltip";

const props = defineProps({
  resultId: {
    type: String,
    required: true,
  },
});

const componentId = `thumbs-feedback-${crypto.randomUUID()}`;

const { requestTooltip, hideTooltip, canShowTooltip } =
  useThumbsFeedbackTooltip(componentId);

const selectedFeedback = ref<"up" | "down" | null>(null);
const hasSentFeedback = ref(false);
const isFeedbackSentMessageVisible = ref(false);

const route = useRoute();

const canShowThumbsFeedback = inject<ComputedRef<boolean>>(
  "canShowThumbsFeedback"
);

const isThumbsUpSelected = computed(() => selectedFeedback.value === "up");
const isThumbsDownSelected = computed(() => selectedFeedback.value === "down");

const handleFeedback = (type: "up" | "down") => {
  if (selectedFeedback.value) {
    return;
  }

  selectedFeedback.value = type;

  posthogCapture("user_tapped_data_deletion_search_results_feedback", {
    feedback: type === "up" ? "accurate" : "inaccurate",
    result_id: props.resultId,
    flow: route.path.replace("/", ""),
  });

  // UX purpose
  setTimeout(() => {
    hasSentFeedback.value = true;
    isFeedbackSentMessageVisible.value = true;

    setTimeout(() => {
      isFeedbackSentMessageVisible.value = false;
    }, 1500);
  }, 140);
};

watch(selectedFeedback, (newValue) => {
  if (newValue !== null) {
    hideTooltip();
  }
});

watch(
  () => canShowThumbsFeedback?.value,
  (value) => {
    if (value) {
      requestTooltip();
    } else {
      hideTooltip();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  hideTooltip();
});
</script>

<template>
  <div
    v-if="canShowThumbsFeedback"
    class="dd-thumbs-feedback"
    :class="{
      'dd-thumbs-feedback--feedback-selected': selectedFeedback !== null,
    }"
  >
    <transition
      name="fade"
      mode="out-in"
    >
      <div
        v-if="!isFeedbackSentMessageVisible"
        class="dd-thumbs-feedback__buttons"
      >
        <button
          v-if="!hasSentFeedback || (hasSentFeedback && isThumbsUpSelected)"
          type="button"
          class="dd-thumbs-feedback__button dd-thumbs-feedback__button--up"
          :class="{
            'dd-thumbs-feedback__button--selected': isThumbsUpSelected,
          }"
          aria-label="Thumbs up - This looks accurate"
          @click="handleFeedback('up')"
        >
          <BaseIcon
            :name="selectedFeedback === 'up' ? 'thumb-up-filled' : 'thumb-up'"
            class="dd-thumbs-feedback__icon"
          />
        </button>

        <button
          v-if="!hasSentFeedback || (hasSentFeedback && isThumbsDownSelected)"
          type="button"
          class="dd-thumbs-feedback__button dd-thumbs-feedback__button--down"
          :class="{
            'dd-thumbs-feedback__button--selected': isThumbsDownSelected,
          }"
          aria-label="Thumbs down - This looks inaccurate"
          @click="handleFeedback('down')"
        >
          <BaseIcon
            :name="
              selectedFeedback === 'down' ? 'thumb-down-filled' : 'thumb-down'
            "
            class="dd-thumbs-feedback__icon"
          />
        </button>
      </div>

      <div
        v-else-if="hasSentFeedback && isFeedbackSentMessageVisible"
        class="dd-thumbs-feedback__feedback-sent"
      >
        Saved
      </div>
    </transition>

    <div
      v-if="canShowTooltip"
      class="dd-thumbs-feedback__tooltip"
    >
      <div class="dd-thumbs-feedback__tooltip-content">
        Does this look right?
      </div>
      <div class="dd-thumbs-feedback__tooltip-arrow" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dd-thumbs-feedback {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  height: 30px;

  &__buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__button {
    all: unset;
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-base-black-10;
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease,
      transform 0.12s ease-out;
    color: $color-primary-100;
    transform-origin: center center;
    position: relative;

    @media screen and (min-width: $screen-sm) {
      width: 32px;
      height: 32px;
    }

    &:active {
      transform: scale(0.85);
    }

    .dd-thumbs-feedback--feedback-selected & {
      color: $color-primary-50;
    }

    &:not(&--selected):hover {
      opacity: 0.8;
    }

    &--up {
      &.dd-thumbs-feedback__button--selected {
        background-color: $color-status-success-15;
        color: $color-status-success;
      }
    }

    &--down {
      &.dd-thumbs-feedback__button--selected {
        background-color: $color-status-error-15;
        color: $color-status-error;
      }
    }

    &--selected {
      cursor: default;

      &:hover {
        transform: scale(1);
      }
    }
  }

  &__icon {
    font-size: 12px;
    stroke-width: 1.5;

    @media screen and (min-width: $screen-sm) {
      font-size: 14px;
    }
  }

  &__feedback-sent {
    background: $color-primary-100;
    color: $color-primary-1;
    padding: 5px 10px;
    border-radius: 12px;
    font-weight: 600;
    line-height: 1.4;
    white-space: wrap;
    font-size: 11px;
  }

  &__tooltip {
    position: absolute;
    bottom: calc(100% + 12px);
    left: 22%;
    transform: translateX(-50%);
    z-index: 11;
    opacity: 0;
    animation: tooltip-fade-in 0.3s ease-out forwards;
    animation-delay: 1s;

    &-content {
      background: $color-primary-100;
      color: $color-primary-1;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.4;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);

      @media screen and (min-width: $screen-sm) {
        font-size: 13px;
        padding: 10px 14px;
      }
    }

    &-arrow {
      position: absolute;
      top: 100%;
      left: 62%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid $color-primary-100;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    filter 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(2px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(2px);
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
