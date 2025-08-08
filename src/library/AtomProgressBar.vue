<script setup>
const props = defineProps({
  percent: {
    type: Number, // 0 - 100
    required: true,
    validation: (value) => value >= 0 && value <= 100,
  },
  topColor: {
    type: String, // ex: "#FF0000"
    required: false,
    default: null,
  },
  bottomColor: {
    type: String, // ex: "#FF0000"
    required: false,
    default: null,
  },
  height: {
    type: String,
    default: "4px",
  },
});
</script>

<template>
  <div class="progress-bar-wrapper">
    <div
      class="background-line"
      :style="{
        background: props.bottomColor,
        height: props.height,
      }"
    >
      <div
        class="top-line"
        :style="{
          width: `${props.percent}%`,
          background: props.topColor,
          height: props.height,
        }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
// stylelint-disable
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  width: 100%;

  .background-line {
    border-radius: 99px;
    width: 100%;
    background-color: $color-primary-30;
    position: relative;
    overflow: hidden;

    .top-line {
      height: 100%;
      border-radius: 99px;
      top: 0;
      left: 0;
      background-color: $color-primary-100;
      position: absolute;
    }
  }
}
</style>
