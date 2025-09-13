<script setup>
const props = defineProps({
  small: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div class="skeleton-loader">
    <div class="skeleton-box header" />
    <div class="skeleton-box-wrapper">
      <div
        v-if="!props.small"
        class="row"
      >
        <span class="skeleton-box small" />
        <span class="skeleton-box small" />
        <span class="skeleton-box small" />
        <span class="skeleton-box small" />
      </div>
      <div class="skeleton-box small" />
      <div class="skeleton-box large" />
      <div
        v-if="!props.small"
        class="skeleton-box large"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.skeleton-loader {
  width: 100%;
  margin-top: 16px;
  .skeleton-box-wrapper {
    width: 100%;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: flex-start;
    padding: 24px;
    border: 1px solid $color-primary-10;
  }
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 100%;
  justify-content: space-between;
}

.skeleton-box {
  display: inline-block;
  position: relative;
  overflow: hidden;
  background-color: $color-primary-10;

  &.header {
    width: 200px;
    height: 40px;
    margin-bottom: 16px;
    border-radius: 99px;
  }
  &.small {
    width: 100%;
    height: 25px;
    border-radius: 99px;
  }
  &.large {
    width: 100%;
    height: 100px;
    border-radius: 12px;
  }

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
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
</style>
