<script setup></script>
<template>
  <div class="gradient-box-wrapper">
    <slot />
  </div>
</template>
<style scoped lang="scss">
.gradient-box-wrapper {
  padding: 24px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  max-width: 550px;
  width: 100%;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(22px);
    border-radius: 20px;
    z-index: -1;
    pointer-events: none;

    @at-root .theme-dark & {
      background-color: rgba($white, 0.1);
      border: 0.976px solid rgba($white, 0.15);
    }

    @at-root .theme-light & {
      background-color: rgba($black, 0.1);
      border: 0.976px solid rgba($black, 0.15);
    }
  }
}
</style>
