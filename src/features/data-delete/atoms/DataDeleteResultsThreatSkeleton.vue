<template>
  <div class="threat-skeleton">
    <div class="threat-skeleton__title" />
    <div class="threat-skeleton__meter">
      <div class="threat-skeleton__fill" />
      <div class="threat-skeleton__knob" />
    </div>
    <div class="threat-skeleton__subtitle" />
    <div class="threat-skeleton__cta" />
  </div>
</template>

<style lang="scss" scoped>
@mixin skeleton {
  @at-root .theme-dark & {
    @include base-skeleton(
      $color-primary-10-light,
      0.05,
      $color-primary-10-dark,
      0.5
    );
  }

  @at-root .theme-light & {
    @include base-skeleton($color-primary-10);
  }
}

.threat-skeleton {
  display: grid;
  gap: 34px;
  padding-bottom: 1rem;

  @media all and (min-width: $screen-sm) {
    gap: 28px;
    padding-bottom: 0;
  }

  &__title {
    width: 60%;
    height: 28px;
    border-radius: 999px;
    margin: 0 auto;

    @include skeleton;
  }

  &__meter {
    position: relative;
    height: 12px;
    border-radius: 999px;
    overflow: hidden;

    @include skeleton;
  }

  &__fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 72%;

    @include skeleton;
  }

  &__knob {
    position: absolute;
    top: 50%;
    left: 72%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    border-radius: 999px;

    @include skeleton;
  }

  &__cta {
    height: 52px;
    width: 100%;
    border-radius: 999px;
    margin-top: 4px;
    display: none;

    @include skeleton;

    @media all and (min-width: $screen-sm) {
      display: block;
    }
  }

  &__subtitle {
    width: 70%;
    height: 14px;
    border-radius: 999px;
    margin: 0 auto;

    @include skeleton;
  }
}
</style>
