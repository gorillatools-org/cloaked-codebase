<script setup lang="ts">
import useFundingSource from "@/composables/Wallet/useFundingSource";
import { computed, defineAsyncComponent, onMounted } from "vue";
import cloaked from "@/assets/icons/creditCards/cloaked.png";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseIcon from "@/library/BaseIcon.vue";

export type CardPlaceholderBrand =
  | "amex"
  | "visa"
  | "mastercard"
  | "discover"
  | "cloaked"
  | "generic";

const props = withDefaults(
  defineProps<{
    brand: CardPlaceholderBrand;
    last4?: string;
    cardName?: string;
    amountText?: string;
  }>(),
  {
    brand: "cloaked",
    last4: undefined,
    cardName: undefined,
    amountText: undefined,
  }
);

const { getCardBrandImgURL } = useFundingSource();

onMounted(() => {
  if (props.cardName && props.amountText) {
    console.warn(
      "'cardName' and 'amount' cannot be used together. 'cardName' will be used instead of 'amount'."
    );
  }
});

const showMedallion = computed(() => {
  return props.brand !== "generic";
});

const isBlackTextColor = computed(() => {
  return props.brand === "amex";
});

const cardBrandFullNameAssetPath = computed(() => {
  switch (props.brand) {
    case "visa":
      return defineAsyncComponent(
        () => import(`@/assets/icons/creditCards/visa.svg`)
      );
    case "cloaked":
      return defineAsyncComponent(
        () => import(`@/assets/icons/mastercard.svg`)
      );
    case "amex":
      return defineAsyncComponent(
        () => import(`@/assets/images/card-brands/amex-full-name.svg`)
      );
    case "mastercard":
      return defineAsyncComponent(
        () => import(`@/assets/images/card-brands/mastercard-full-name.svg`)
      );
    case "discover":
      return defineAsyncComponent(
        () => import(`@/assets/images/card-brands/discover-full-name.svg`)
      );
    default:
      return "";
  }
});

const cardBrandImgURL = computed(() => {
  if (props.brand === "cloaked") {
    return cloaked;
  }
  return getCardBrandImgURL(props.brand);
});
</script>
<template>
  <div
    :class="[
      'card-placeholder',
      `card-placeholder--${brand}`,
      { 'card-placeholder--black-text': isBlackTextColor },
    ]"
  >
    <header class="card-placeholder__header">
      <div
        v-if="showMedallion"
        class="card-placeholder__header-brand-container"
      >
        <img
          v-if="cardBrandImgURL"
          :src="cardBrandImgURL"
          alt="Card brand"
          class="card-placeholder__header-brand-image"
        />
      </div>
      <div
        v-else
        class="card-placeholder__header-medallion-container"
      >
        <BaseMedallion
          size="lg"
          icon="wallet"
          color="safe-zone-blue"
          class="card-placeholder__header-medallion"
        >
          <div class="card-placeholder__header-medallion-content">
            <BaseIcon name="wallet" />
          </div>
        </BaseMedallion>
      </div>
      <p
        v-if="cardName || amountText"
        class="card-placeholder__header-title"
        :class="{
          'card-placeholder__header-title--amount': !!amountText && !cardName,
        }"
      >
        {{ cardName || amountText }}
      </p>
    </header>

    <div class="card-placeholder__numbers-container">
      <p class="card-placeholder__masked-number">
        •••• •••• ••••
        <span
          v-if="last4"
          class="card-placeholder__last4"
        >
          {{ last4 }}
        </span>
        <template v-else>••••</template>
      </p>
    </div>

    <footer class="card-placeholder__footer">
      <div class="card-placeholder__exp-container">
        <div class="card-placeholder__exp-data">
          <p class="card-placeholder__exp-data-label">Exp. Date</p>
          <p
            class="card-placeholder__exp-data-value card-placeholder__masked-number"
          >
            ••/••
          </p>
        </div>
        <div class="card-placeholder__exp-data">
          <p class="card-placeholder__exp-data-label">CVV2</p>
          <p
            class="card-placeholder__exp-data-value card-placeholder__masked-number"
          >
            •••
          </p>
        </div>
      </div>
      <div class="card-placeholder__footer-full-name-container">
        <component
          :is="cardBrandFullNameAssetPath"
          class="card-placeholder__footer-full-name-img"
        />
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
$component-name: "card-placeholder";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  border-radius: 40px;
  padding: 22px 29px;
  gap: 25px;
  width: 100%;
  color: #fff;
  border: 1.5px solid $color-base-black-20;
  box-shadow: 0 13.735px 32.964px 0 rgba(0 0 0 / 15%);

  &--black-text {
    color: #000;
  }

  &--visa {
    background-color: #1e39d6;
  }

  &--amex {
    background-color: #ecedee;
  }

  &--mastercard {
    background-color: #ff5f00;
  }

  &--discover {
    background-color: #23233f;
  }

  &--generic {
    background: $gradient-blue;
  }

  &--cloaked {
    background: linear-gradient(
      250deg,
      rgba(51 51 51 / 80%) -32.94%,
      rgba(0 0 0 / 80%) 92.73%
    );
    border: 1.5px solid $color-primary-70;
    backdrop-filter: blur(10.3px);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-brand {
      &-container {
        width: 86px;
        height: 86px;
        border-radius: 50%;
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .#{$component-name}--cloaked & {
          background: rgba($color-white, 10%);
          box-shadow: 0 18.85px 18.542px 18.542px rgba(0 0 0 / 20%);
        }
      }

      &-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;

        .#{$component-name}--cloaked & {
          transform: scale(1.22) rotate(-16deg);
        }
      }
    }

    &-title {
      font-size: 24.93px;
      font-weight: 700;

      &--amount {
        font-size: 30px;
      }
    }

    &-medallion {
      border-radius: 50%;
      box-shadow: 0 6.735px 32.964px 0 rgba(0 0 0 / 10%);

      &-content {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
        color: $color-safe-zone-blue;
      }
    }
  }

  &__masked-number {
    font-family: monospace;
    font-size: 26px;
    letter-spacing: -0.277px;
  }

  &__last4 {
    font-size: 25px;
  }

  &__footer {
    display: flex;
    align-items: center;
    height: 53px;

    &-full-name {
      &-container {
        width: 88px;
        height: 88px;
      }

      &-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;

        .#{$component-name}--visa & {
          filter: brightness(0) invert(1);
        }

        .#{$component-name}--cloaked & {
          transform: scale(0.8);
          opacity: 0.5;
        }

        .#{$component-name}--amex,
        .#{$component-name}--mastercard & {
          transform: scale(1.2);
        }
      }
    }
  }

  &__exp-container {
    display: flex;
    align-items: center;
    flex-grow: 1;
    gap: 40px;
  }

  &__exp-data {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;

    &-label {
      font-size: 16.62px;
      letter-spacing: 0.4px;
      color: $color-base-white-50-light;

      .#{$component-name}--black-text & {
        color: $color-base-black-50-light;
      }
    }

    &-value {
      font-size: 21px;
    }
  }
}
</style>
