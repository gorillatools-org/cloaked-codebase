<template>
  <div class="call-guard-loading">
    <span class="call-guard-loading__loader" />
  </div>
</template>

<style scoped lang="scss">
.call-guard-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex-direction: column;

  &__loader {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: $color-primary-90;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    animation: rotate 0.5s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
