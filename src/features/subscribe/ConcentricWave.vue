<template>
  <div class="concentric-wave">
    <span class="concentric-wave__circle" />
    <span class="concentric-wave__circle" />
    <span class="concentric-wave__circle" />
  </div>
</template>

<style scoped lang="scss">
.concentric-wave {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  width: 120vh;
  height: 120vh;

  @media screen and (orientation: landscape) {
    width: 120vw;
    height: 120vw;
  }

  @keyframes appear {
    0% {
      opacity: 0;
      transform: translate3d(-50%, -50%, 0) scale(0);
    }

    100% {
      transform: translate3d(-50%, -50%, 0) scale(1);
      opacity: 0.3;
    }
  }

  @keyframes pulse {
    0% {
      transform: translate3d(-50%, -50%, 0) scale(1);
    }

    100% {
      transform: translate3d(-48%, -50.5%, 0) scale3d(1.01, 1.03, 1);
    }
  }

  &__circle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0) scale(0);
    border-radius: 50%;
    border: 5px solid $color-brand-1-100-dark;
    opacity: 0.3;
    pointer-events: none;
    mix-blend-mode: screen;

    @for $i from 1 through 3 {
      &:nth-of-type(#{$i}) {
        animation-name: appear, pulse;
        animation-timing-function: cubic-bezier(0, 0, 0.1, 1.1), linear;
        animation-duration: 350ms, 7000ms;
        animation-iteration-count: 1, infinite;
        animation-direction: normal, alternate;
        animation-fill-mode: forwards, forwards;
        animation-delay:
          100ms + $i * 20ms,
          $i * 2000ms;
        width: $i * calc(100% / 3);
        height: $i * calc(100% / 3);

        @media screen and (orientation: landscape) {
          width: 40% + $i * calc(60% / 3);
          height: 40% + $i * calc(60% / 3);
        }
      }
    }
  }
}
</style>
