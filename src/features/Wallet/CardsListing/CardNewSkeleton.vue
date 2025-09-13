<template>
  <div class="card-skeleton">
    <header class="card-skeleton__header">
      <BaseIcon
        name="plus"
        class="card-skeleton__header-icon"
      />
      <div class="card-skeleton__header-infos">
        <div
          style="width: 113px"
          class="card-skeleton__placeholder card-skeleton__placeholder--20"
        ></div>
        <div
          style="width: 88px"
          class="card-skeleton__placeholder card-skeleton__placeholder--20"
        ></div>
      </div>
    </header>
    <div class="card-skeleton__content">
      <div
        v-for="i in 4"
        :key="i"
        style="width: 55px"
        class="card-skeleton__placeholder card-skeleton__placeholder--25"
      ></div>
    </div>
    <footer class="card-skeleton__footer">
      <div class="card-skeleton__footer-infos">
        <div
          style="width: 51px"
          class="card-skeleton__placeholder card-skeleton__placeholder--20"
        ></div>
        <div
          style="width: 31px"
          class="card-skeleton__placeholder card-skeleton__placeholder--20"
        ></div>
      </div>
      <div class="card-skeleton__footer-brand">
        <InlineSvg
          class="card-skeleton__footer-brand-logo"
          name="mastercard"
        />
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import BaseIcon from "@/library/BaseIcon.vue";
</script>
<style lang="scss" scoped>
$component-name: "card-skeleton";
$card-border-radius: 12px;

.card-skeleton {
  width: 100%;
  padding: 20px;
  border-radius: $card-border-radius;
  position: relative;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: $card-border-radius;
    background: radial-gradient(
      157.8% 94.4% at 54.96% 48%,
      black 34.38%,
      black 100%
    );
    opacity: 0.2;
    transition: opacity 0.2s ease-in-out;

    @at-root .theme-dark & {
      background: radial-gradient(
        157.8% 94.4% at 54.96% 48%,
        white 34.38%,
        white 100%
      );
    }
  }

  &:hover {
    &::before {
      opacity: 0.15;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-icon {
      font-size: 25px;
      color: $color-primary-70;
      font-weight: 600;
      transition: scale 0.2s ease-in-out;

      .#{$component-name}:hover & {
        scale: 1.3;
      }
    }

    &-infos {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 7px;
    }
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 40px;
  }

  &__footer {
    display: flex;
    align-items: flex-end;
    margin-top: 20px;
    height: 100%;

    &-infos {
      display: flex;
      height: 100%;
      gap: 64px;
      padding-bottom: 10px;
      flex-grow: 1;
    }

    &-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;

      &-logo {
        max-width: 100%;
        max-height: 100%;
        opacity: 0.2;

        @at-root .theme-dark & {
          opacity: 0.1;
        }
      }
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    background-color: $color-primary-100;
    opacity: 0.1;
    border-radius: 14px;

    &--20 {
      min-height: 20px;
    }

    &--25 {
      min-height: 25px;
    }
  }
}
</style>
