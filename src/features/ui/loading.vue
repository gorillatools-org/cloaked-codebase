<script setup>
import Logo from "@/assets/icons/cloaked.svg";
</script>

<template>
  <section class="loading">
    <span>
      <Logo />
    </span>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
section.loading {
  width: 100%;
  height: 100%;
  background: $color-base-white-100;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    position: fixed;
    width: 60px;
    height: 60px;
    top: 50%;
    left: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: $color-info;
    border-radius: 50%;
    box-shadow: 0 0 0;

    @include animation(1.3s ease infinite pulse);
    @include transform(translate(-50%, -50%));

    .loaded & {
      opacity: 0;
      visibility: hidden;

      @include transition-delay(0.2s);
    }

    svg {
      width: 30px;
      height: auto;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(#ff550c, 0.6);
      }

      100% {
        box-shadow: 0 0 0 24px rgba(#ff550c, 0);
      }
    }
  }
}
</style>
