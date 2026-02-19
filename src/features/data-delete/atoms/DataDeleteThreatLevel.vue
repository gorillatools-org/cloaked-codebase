<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import DataDeleteThreatLevelModal from "@/features/data-delete/atoms/DataDeleteThreatLevelModal.vue";
import DataDeleteThreatProgress from "@/features/data-delete/atoms/DataDeleteThreatProgress.vue";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

defineProps({
  threatLevel: {
    type: String,
    default: "low",
    validator: (value) => ["low", "medium", "high", "unknown"].includes(value),
  },
  hasModal: {
    type: Boolean,
    default: true,
  },
  animationDelay: {
    type: Number,
    default: 50,
  },
});

const threatLevelHeading = ref(null);
const threatLevelWidth = ref(0);

const onWindowResize = () => {
  threatLevelWidth.value = threatLevelHeading.value?.$el?.offsetWidth ?? 0;
};

onMounted(() => {
  window.addEventListener("resize", onWindowResize, { passive: true });
  onWindowResize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

const threatLevelToProgress = {
  low: 0.3,
  medium: 0.6,
  high: 0.9,
  unknown: 1,
};

const isModalOpen = ref(false);

const { isMobile } = useDisplay();
</script>

<template>
  <div class="threat-level">
    <div
      class="threat-level__content"
      :class="{
        'threat-level__content--modal-open': isModalOpen,
        'threat-level__content--has-modal': hasModal,
      }"
      @click="isModalOpen = hasModal"
    >
      <BaseText
        ref="threatLevelHeading"
        as="h1"
        :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
        class="data-delete__title threat-level__title"
      >
        Threat Level:
        <span
          class="threat-level__level"
          :class="`threat-level__level--${threatLevel}`"
        >
          {{ threatLevel }}
          <InlineSvg
            v-if="hasModal"
            name="help"
            class="threat-level__icon"
          />
        </span>
      </BaseText>
      <div class="threat-level__progress-wrapper">
        <DataDeleteThreatProgress
          :progress="threatLevelToProgress[threatLevel]"
          :width="threatLevelWidth"
          class="threat-level__progress"
          :animation-delay="animationDelay"
          :style="{ animationDelay: `${Math.max(animationDelay + 100, 0)}ms` }"
          @click="isModalOpen = true"
        />
      </div>
    </div>

    <DataDeleteThreatLevelModal
      v-if="hasModal"
      v-model="isModalOpen"
      :threat-level="threatLevel"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.threat-level {
  width: 100%;

  &__content {
    &--has-modal {
      cursor: pointer;
    }
  }

  &__level {
    text-transform: capitalize;

    &--low {
      color: $color-warning;
    }

    &--medium {
      color: $color-info;
    }

    &--high {
      color: $color-alert;
    }

    &--unknown {
      color: $color-alert;
      cursor: default;
    }
  }

  &__title {
    transition: opacity 100ms ease-in-out;

    @at-root .threat-level__content--has-modal:hover &,
      .threat-level__content--modal-open & {
      opacity: 0.8;
    }
  }

  @keyframes help-bounce {
    0% {
      opacity: 0;
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }

    33% {
      opacity: 1;
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }

    66% {
      opacity: 1;
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    color: $color-primary-100;
    opacity: 0;
    animation: help-bounce 700ms 1s forwards;

    @media all and (min-width: $screen-xl) {
      width: 32px;
      height: 32px;
    }
  }

  &__progress {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);

    &-wrapper {
      opacity: 0;
      height: 25px;
      position: relative;
      margin-top: 8px;
      animation: appear-bottom-5 0.2s forwards ease-out;

      @media all and (min-width: $screen-xl) {
        margin-top: 16px;
      }
    }
  }
}
</style>
