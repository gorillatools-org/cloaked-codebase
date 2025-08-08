<script setup></script>
<template>
  <div class="atom-page-wrapper">
    <div class="overlay" />
    <slot />
  </div>
</template>
<style scoped lang="scss">
// stylelint-disable
.atom-page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: $black;
  z-index: -1;
  overflow: hidden;

  .overlay {
    pointer-events: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    transform-origin: center;
    width: 809px;
    height: 940px;
    flex-shrink: 0;
    border-radius: 59.159px;
    opacity: 0.25;
    background: linear-gradient(
      6deg,
      #ff7a00 5.3%,
      #f0536b 26.61%,
      #8e83ea 56.26%,
      #00c49a 82.21%,
      #29bee8 94.26%
    );
    mix-blend-mode: screen;
    filter: blur(160px);
    animation: moveBackground 32s linear infinite reverse;

    @media (pointer: fine) {
      width: 90%;
      height: 90%;
    }
  }
}

@keyframes moveBackground {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  33% {
    transform: translate(-40%, -60%) rotate(20deg);
  }

  66% {
    transform: translate(-45%, -55%) rotate(-20deg);
  }

  100% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}
</style>
