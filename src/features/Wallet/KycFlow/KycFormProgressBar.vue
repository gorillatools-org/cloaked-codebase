<script setup>
const props = defineProps({
  maxSteps: {
    type: Number,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div
    class="progress"
    :class="{ hidden: currentStep === 4 }"
  >
    <h1>{{ props.title }}</h1>
    <div class="progress-bar">
      <div
        class="progress-bar__inner"
        :style="{ width: (props.currentStep / props.maxSteps) * 100 + '%' }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.progress {
  &.hidden {
    display: none;
  }

  h1 {
    color: $color-primary-100;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    margin-bottom: 21px;
    text-align: center;
  }

  .progress-bar {
    width: 100%;
    border-radius: 48px;
    background-color: $color-primary-30;
    height: 5px;
    position: relative;
    overflow: hidden;

    .progress-bar__inner {
      height: 100%;
      border-radius: 48px;
      background-color: $color-primary-100;
      position: absolute;
      top: 0;
      left: 0;

      @include transition(all 0.3s ease-in-out);
    }
  }
}
</style>
