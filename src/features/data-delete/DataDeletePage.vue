<template>
  <div
    class="data-delete"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
@import "@/assets/scss/animations";

.data-delete {
  color: $color-primary-100;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;

  &__page {
    position: relative;
    z-index: 2;
    padding: 40px 22px 25px;
  }

  &__title {
    text-align: center;
    margin-top: 8px;

    &-icon {
      width: 32px;
      height: 32px;

      @media all and (min-width: $screen-xl) {
        width: 72px;
        height: 72px;
      }
    }
  }

  &__subtitle {
    margin-bottom: 2px;
  }

  &__text {
    opacity: 0.9;
    margin-top: 8px;
  }

  &__capitalized {
    text-transform: capitalize;
  }
}
</style>
