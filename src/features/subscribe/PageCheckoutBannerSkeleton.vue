<template>
  <div class="checkout-banner-skeleton">
    <div
      class="checkout-banner-skeleton__icon checkout-banner-skeleton__skeleton"
    />

    <div class="checkout-banner-skeleton__content">
      <div
        class="checkout-banner-skeleton__line checkout-banner-skeleton__line--title checkout-banner-skeleton__skeleton"
      />
      <div
        class="checkout-banner-skeleton__line checkout-banner-skeleton__line--subtitle checkout-banner-skeleton__skeleton"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checkout-banner-skeleton {
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: $color-base-black-10-dark;
  border: $color-base-black-10-dark;
  box-shadow: 0 4px 24px 0 $color-base-white-5-dark;
  cursor: wait;

  &__skeleton {
    @at-root .theme-dark & {
      @include base-skeleton(
        $color-primary-10-light,
        0.05,
        $color-primary-10-dark,
        0.5
      );
    }

    @at-root .theme-light & {
      @include base-skeleton($color-primary-20);
    }
  }

  @at-root .theme-light & {
    background-color: $color-base-white-100-light;
    border: $color-base-white-100-light;
  }

  &__icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 999px;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__line {
    height: 16px;
    border-radius: 999px;

    &--title {
      width: 80%;
      height: 18px;
    }

    &--subtitle {
      width: 45%;
      margin-top: 4px;
    }
  }
}
</style>
