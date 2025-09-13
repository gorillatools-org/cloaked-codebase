<template>
  <div>
    <slot />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.subscribe-payment {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 94px + 8px;
  width: 100%;

  @media all and (min-width: $screen-xl) {
    padding-bottom: 0;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding-right: 10px;
      flex-wrap: wrap;
    }

    &-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      grid-column: 1/3;
      padding-top: 10px;
      font-size: 15px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      &-col {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-direction: column;
        gap: 2px;
        width: 100%;
      }

      &-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      &-footnote {
        color: $color-primary-70;
        font-size: 10px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        text-align: right;
      }

      &-header {
        font-size: 13px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
      }
    }
  }

  &__promo-toggle {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration-line: underline;
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;
    color: $color-primary-100;

    &:hover {
      opacity: 0.9;
    }
  }

  &__promo-code {
    grid-column: 1/3;

    &-heading {
      font-size: 13px;
      font-style: normal;
      font-weight: 400;
      line-height: 1.15;
    }

    &-input {
      margin: 4px 0 16px;
      display: block;
    }
  }

  &__secure-form {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    color: $color-primary-100;
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.4;

    &-icon {
      width: 14px;
      height: 15px;
    }
  }

  &__billing-cycle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__payment-type {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__provider-icon {
    width: 24px;
    height: 24px;
  }

  &__product-price {
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: block;
    margin-top: 4px;

    @media all and (min-width: $screen-xl) {
      font-size: 12px;
    }

    &--discounted {
      color: $color-success;

      @at-root .theme-light & {
        color: darken($color-success, 10%);
      }
    }

    &--skeleton {
      margin-top: 6px;
      height: 16px;
      border-radius: 8px;

      @include base-skeleton($color-primary-30);
    }
  }

  &__discount {
    padding: 2px 5px;
    border-radius: 100px;
    background-color: $color-success;
    font-size: 10px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    vertical-align: middle;
    display: inline-block;
    margin-left: 4px;

    &::before {
      content: "-";

      @media screen and (width >= 385px) {
        content: "Save";
      }
    }
  }

  &__details {
    &-title {
      font-size: 15px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      margin-top: 16px;
    }

    &-value {
      font-size: 15px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-align: right;
      margin-top: 16px;

      &--skeleton {
        display: block;
        height: 15px;
        border-radius: 8px;
        margin: 4px 0;

        @include base-skeleton($color-primary-20);
      }
    }

    &-note {
      font-size: 10px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      text-align: right;
      display: block;
    }
  }

  &__original-price {
    text-decoration: line-through;
  }

  &__total-price {
    &--skeleton {
      align-self: center;
      width: 60%;
      display: block;
      height: 14px;
      border-radius: 8px;
      margin: 2px 0;

      @include base-skeleton($color-primary-20);
    }
  }

  &__stripe-form {
    grid-column: 1/3;

    @at-root * + & {
      &:has(*) {
        margin-top: 16px;
      }
    }
  }

  &__subscribe {
    position: sticky;
    bottom: -9px;
    background: $color-base-white-100;
    padding: 24px 0;

    &-button-stripe {
      width: 100%;
    }

    &-button-paypal {
      min-height: 62px;

      &--disabled {
        opacity: 0.3;
      }
    }
  }

  &__error {
    color: $color-alert;
    text-align: center;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
  }

  &__full-width {
    grid-column: 1/3;
  }

  &__note {
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    margin-top: 16px;

    @media all and (min-width: $screen-xl) {
      font-size: 12px;
    }
  }

  &--annual-only {
    .subscribe-payment__details {
      &-title {
        margin-top: 0;
      }

      &-value {
        margin-top: 0;
      }
    }
  }
}
</style>
