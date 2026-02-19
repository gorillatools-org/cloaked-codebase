<template>
  <div class="monitoring-scanning-item-icon" />
</template>

<style lang="scss" scoped>
.monitoring-scanning-item-icon {
  position: relative;
  width: 6px;
  height: 6px;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  @keyframes ping {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.3;
    }

    50%,
    100% {
      transform: translate(-50%, -50%) scale(3);
      opacity: 0;
    }
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
  }

  &::before,
  &::after {
    background-color: $color-foam-blue;
  }
}
</style>
