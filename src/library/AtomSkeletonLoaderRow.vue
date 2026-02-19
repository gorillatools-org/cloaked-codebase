<script setup>
const props = defineProps({
  numOfRows: {
    type: Number,
    default: 1,
  },
  height: {
    type: String,
    default: "100%", // ex: "100px" or "100%"
  },
  width: {
    type: String,
    default: "100%", // ex: "100px" or "100%"
  },
  gap: {
    type: String,
    default: "16px",
  },
});
</script>

<template>
  <div
    class="skeleton-loader-wrapper"
    :style="{ gap: props.gap }"
  >
    <div
      v-for="num in Array.from({ length: props.numOfRows }, (_, i) => i)"
      :key="`skeleton-loader-row-${num}`"
      class="skeleton-loader-row"
      :style="{ height: props.height, width: props.width }"
    />
  </div>
</template>
<style lang="scss" scoped>
.skeleton-loader-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  .skeleton-loader-row {
    display: inline-block;
    position: relative;
    overflow: hidden;
    background-color: $color-primary-10;
    border-radius: 16px;

    &::after {
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba($white, 0) 0,
        rgba($white, 0.2) 20%,
        rgba($white, 0.5) 60%,
        rgba($white, 0)
      );
      animation: shimmer 5s infinite;
      content: "";
    }

    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  }
}
</style>
