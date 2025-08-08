<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import router from "@/routes/router";
import { isMobileDevice } from "@/scripts/regex";

defineEmits(["click"]);

const props = defineProps({
  position: {
    type: Number,
    required: true,
  },
  hasOnClick: {
    type: Boolean,
    default: false,
  },
  day: {
    type: Number,
    default: 0,
  },
  exposures: {
    type: Number,
    default: 0,
  },
  text: {
    type: String,
    required: false,
    default: null,
  },
  callout: {
    type: Object,
    required: false,
    default: null,
  },
});

function handleClick() {
  if (props.hasOnClick && !isMobileDevice) {
    router.push({ name: "DataRemove" });
  }
}
</script>

<template>
  <div class="timeline-day">
    <div class="checkmark-section">
      <InlineSvg
        name="check-mark-rounded"
        class="checkmark-icon"
        :class="{ visible: props.exposures !== 0 }"
      />
      <div
        class="line"
        :class="{ visible: props.exposures !== 0 }"
      />
    </div>
    <div
      class="timeline-day-container"
      :class="{ clickable: props.hasOnClick }"
      @click="handleClick"
    >
      <div class="title-container">
        <p class="title">Day {{ props.day }}</p>
        <div class="exposure-count">
          <p
            v-if="props.exposures !== 0"
            class="exposure-paragraph"
          >
            {{ props.exposures > 0 ? "Exposures found" : "Exposures removed" }}:
            {{ Math.abs(exposures).toLocaleString() }}
          </p>
          <InlineSvg
            v-if="props.hasOnClick && !isMobileDevice"
            name="chevron-right"
            class="chevron"
          />
        </div>
      </div>
      <p
        v-if="text"
        class="text"
      >
        {{ props.text }}
      </p>
      <div
        v-if="!!props.callout && Object.keys(props.callout).length"
        class="callout"
      >
        <p class="callout-title">
          {{ props.callout.title }}
        </p>
        <div class="percent">
          <p class="title">{{ props.callout.percent }}%</p>
          <p class="subtitle">
            {{ props.callout.subtitle }}
          </p>
        </div>
        <p class="description">
          {{ props.callout.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline-day {
  display: flex;
  flex-direction: row;
  width: 100%;

  &:first-child {
    margin-top: 6px;
  }

  .checkmark-section {
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 34px;
    position: relative;

    .checkmark-icon {
      height: 40px;
      color: $color-primary-100;
      visibility: hidden;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);

      &.visible {
        visibility: visible;
      }
    }

    .line {
      width: 4px;
      height: calc(100% - 38px);
      background: $color-primary-100;
      border-radius: 2px;
      margin-bottom: 8px;
      visibility: hidden;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);

      &.visible {
        visibility: visible;
      }
    }
  }
}

.timeline-day-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: calc(100% - 50px);
  margin-left: 16px;
  margin-bottom: 16px;

  .title-container {
    display: flex;
    justify-content: space-between;

    .title {
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      color: $color-primary-100;
    }

    .exposure-count {
      display: flex;
      align-items: center;
      gap: 8px;

      .exposure-paragraph {
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
        color: $color-primary-100;
      }
    }
  }

  &.clickable {
    cursor: pointer;
  }

  .chevron {
    color: $color-primary-100;
  }

  .text {
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    color: $color-primary-70;
  }

  .callout {
    width: 100%;
    padding: 16px 20px;
    border-radius: 12px;
    backdrop-filter: blur(34px);
    box-shadow: 0 14px 34px 0 rgba($black, 0.25);
    background: $color-primary-1-dark;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .callout-title {
      font-size: 15px;
      font-weight: 600;
      line-height: 22.5px;
      color: $color-primary-1-light;
    }

    .percent {
      display: flex;
      align-items: end;
      gap: 8px;

      .title {
        font-size: 32px;
        font-weight: 600;
        line-height: 40px;
        background: linear-gradient(
          157.46deg,
          #00ba4a -88.41%,
          #49ff67 8.36%,
          #00ba4a 78.87%
        );
        background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        font-size: 12px;
        font-weight: 600;
        line-height: 28px;
        background: linear-gradient(
          157.46deg,
          #00ba4a -88.41%,
          #49ff67 8.36%,
          #00ba4a 78.87%
        );
        background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .description {
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      color: $color-primary-20-light;
    }
  }
}
</style>
