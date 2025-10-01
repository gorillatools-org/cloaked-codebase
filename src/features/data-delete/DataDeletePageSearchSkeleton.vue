<template>
  <div class="data-delete-search-skeleton">
    <div class="data-delete-search-skeleton__icon" />
    <div class="data-delete-search-skeleton__title" />
    <div class="data-delete-search-skeleton__text" />
    <div class="data-delete-search-skeleton__text" />
    <div class="data-delete-search-skeleton__card" />
    <div class="data-delete-search-skeleton__text" />
    <div class="data-delete-search-skeleton__text" />
    <div class="data-delete-search-skeleton__footer" />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.data-delete-search-skeleton {
  margin: 0 auto;
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex-grow: 1;

  @media (min-width: $screen-xl) {
    margin-top: clamp(0px, 5vh, 250px);
  }

  @mixin search-skeleton {
    @at-root .theme-dark & {
      @include base-skeleton($color-primary-10, 0.5, #000, 0.1);
    }

    @at-root .theme-light & {
      @include base-skeleton($color-primary-10);
    }
  }

  &__icon {
    display: block;
    height: 40px;
    width: 40px;
    border-radius: 100px;

    @include search-skeleton;
  }

  &__text {
    display: block;
    width: 100%;
    height: 13px;
    border-radius: 100px;

    @include search-skeleton;

    & + & {
      width: 85%;
    }
  }

  &__title {
    display: block;
    width: 90%;
    height: 36px;
    border-radius: 100px;

    @include search-skeleton;
  }

  &__card {
    display: block;
    width: 100%;
    height: 300px;
    border-radius: 16px;
    margin: 16px 0;

    @include search-skeleton;
  }

  &__footer {
    @extend .data-delete-search-skeleton__text;

    margin-top: auto;
  }
}
</style>
