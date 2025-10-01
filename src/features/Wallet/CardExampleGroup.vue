<script setup>
import inlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="cards">
    <div class="card-group">
      <span
        v-for="index in 4"
        :key="index"
      >
        <inlineSvg name="cloaked-icon" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.cards {
  width: 580px;
  height: 400px;
  z-index: 2;
  transition: all 0.5s ease;
  opacity: 1;
  transition-delay: 0.5s;
  display: flex;
  align-items: center;
  justify-content: space-around;

  .card-group {
    @include transform(rotate(15deg));

    border-radius: 24px;
    position: relative;

    span {
      display: inline-block;
      width: 448px;
      height: 268px;
      background: linear-gradient(
          102deg,
          rgb(255 255 255 / 30%) 17.47%,
          rgb(0 0 0 / 30%) 40%
        ),
        radial-gradient(
          205.42% 113.22% at 35.57% 56.14%,
          #242424 0%,
          #545454 100%
        );
      background-blend-mode: multiply, normal;
      box-shadow: 0 17.07568px 24.95676px 0 rgb(0 0 0 / 10%);
      border-radius: 36.4516px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -216px;
      margin-top: -125px;
      animation: move 10s ease infinite;

      svg {
        color: $white;
      }

      @include keyframes(move) {
        0% {
          @include transform(translateX(0));
        }

        50% {
          @include transform(translateX(-30px));
        }

        100% {
          @include transform(translateX(0));
        }
      }

      &:nth-of-type(1) {
        top: calc(50% - 290px);
        left: calc(50% + 170px);
        animation-delay: 5s;
      }

      &:nth-of-type(3) {
        left: calc(50% + 475px);
      }

      &:nth-of-type(4) {
        top: calc(50% + 290px);
        left: calc(50% + 170px);
        animation-delay: 2.5s;
      }

      svg {
        position: absolute;
        top: 50%;
        left: 50%;

        @include transform(translate(-50%, -50%));

        width: 114px;
        height: auto;

        .background {
          fill: $color-primary-1;
        }

        .foreground {
          fill: $color-primary-90;
        }
      }

      .mastercard {
        position: absolute;
        right: 20px;
        bottom: 35px;

        &::before,
        &::after {
          content: "";
          position: absolute;
          right: 50%;
          top: 50%;

          @include transform(translate(-50%, -50%));

          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid $color-primary-10;
        }

        &::before {
          right: calc(50% - 12px);
        }

        &::after {
          right: calc(50% + 12px);
        }
      }
    }
  }
}
</style>
