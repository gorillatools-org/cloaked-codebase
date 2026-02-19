<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { ref, computed, onMounted, markRaw } from "vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import CardPlaceholder, {
  type CardPlaceholderBrand,
} from "../CardsListing/CardPlaceholder.vue";
import AboutAutoPayModal from "@/features/modals/Wallet/AboutAutoPayModal.vue";
import store from "@/store";
import { useDevice } from "@/composables/useDevice";

const emit = defineEmits<{
  (e: "continue"): void;
}>();

const { isMobile } = useDevice();
const { fundingSources, getCardBrandImgURL, getProviderIcon } =
  useFundingSource();

const finalAnimation = ref(false);

onMounted(() => {
  // Used to trigger the final animation
  setTimeout(() => {
    finalAnimation.value = true;
  }, 1600);
});

const fundingSource = computed(() => {
  return fundingSources.value?.[0];
});

const fallbackIconName = computed(() => {
  return getProviderIcon(fundingSource.value?.provider);
});

const brandImgURL = computed(() => {
  return getCardBrandImgURL(fundingSource.value?.card_brand ?? "");
});

const cardBrand = computed(() => {
  return isCardBrandPlaceholderValid(
    fundingSource.value?.card_brand?.toLowerCase() ?? ""
  )
    ? (fundingSource.value?.card_brand?.toLowerCase() as CardPlaceholderBrand)
    : "generic";
});

function isCardBrandPlaceholderValid(
  brand: string
): brand is CardPlaceholderBrand {
  return [
    "amex",
    "visa",
    "mastercard",
    "discover",
    "cloaked",
    "generic",
  ].includes(brand);
}

const handleContinue = () => {
  emit("continue");
};

const openAboutAutoPayModal = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AboutAutoPayModal),
    },
  });
};
</script>
<template>
  <div
    class="pay-on-fs-linked-step-3"
    :class="{ 'pay-on-fs-linked-step-3--final-animation': finalAnimation }"
  >
    <BaseMedallion
      size="lg"
      color="primary-white"
      icon="check"
    >
      <div class="pay-on-fs-linked-step-3__medallion-content">
        <img
          v-if="brandImgURL"
          :src="brandImgURL"
          alt="brand"
          class="pay-on-fs-linked-step-3__medallion-brand-img"
        />
        <BaseIcon
          v-else
          :name="fallbackIconName"
          class="pay-on-fs-linked-step-3__medallion-brand-img-fallback"
        />
      </div>
    </BaseMedallion>

    <BaseText
      variant="headline-2-semibold"
      class="pay-on-fs-linked-step-3__title"
    >
      Your funding source is linked
    </BaseText>
    <BaseText
      variant="headline-6-medium"
      class="pay-on-fs-linked-step-3__description"
    >
      <strong>
        Virtual card payments are now linked to your
        <span class="pay-on-fs-linked-step-3__description-brand">
          {{ fundingSource?.card_brand }}
        </span>
        ending in
        {{ fundingSource?.pan_last_four }}.
      </strong>
      <template v-if="isMobile">
        <br />
        <br />
      </template>
      For your convenience,
      <!-- eslint-disable -->
      <span
        class="pay-on-fs-linked-step-3__description--underline"
        role="button"
        tabindex="0"
        @click="openAboutAutoPayModal"
        @keydown.enter="openAboutAutoPayModal"
        @keydown.space.prevent="openAboutAutoPayModal"
      >AutoPay</span>
      <!-- eslint-enable -->
      is enabled for linked payment methods. You may disable AutoPay in Settings
      anytime.
    </BaseText>
    <BaseButton
      variant="primary"
      background-color="purple-gradient"
      class="pay-on-fs-linked-step-3__button"
      @click="handleContinue"
    >
      Continue
    </BaseButton>

    <div class="pay-on-fs-linked-step-3__animated-container">
      <CardPlaceholder
        class="pay-on-fs-linked-step-3__card-placeholder pay-on-fs-linked-step-3__card-placeholder--fs"
        :brand="cardBrand"
        :last4="fundingSource?.pan_last_four"
      />
      <CardPlaceholder
        class="pay-on-fs-linked-step-3__card-placeholder pay-on-fs-linked-step-3__card-placeholder--cloaked"
        brand="cloaked"
        card-name="Cloaked"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
$component-name: "pay-on-fs-linked-step-3";
$spring-ease: cubic-bezier(0.68, -1.3, 0.32, 1.3);

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  position: relative;
  overflow: hidden;
  padding: 0 20px;

  &__medallion {
    &-content {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: $color-white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    &-brand-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &-brand-img-fallback {
      color: $color-black;
    }
  }

  &__title {
    text-align: center;

    @media all and (width < $screen-sm) {
      font-size: 29px;
    }
  }

  &__description {
    text-align: center;
    max-width: 550px;

    &-brand {
      font-weight: bold;
      text-transform: capitalize;
    }

    &--underline {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  &__button {
    width: 100%;
    margin-top: 24px;
    position: relative;
    z-index: 1;

    @media screen and (min-width: $screen-md) {
      width: 345px;
    }
  }

  &__animated {
    &-container {
      flex-grow: 1;
      height: 100%;
      position: relative;
      width: 100%;
      transform: translateY(10px);

      @media (height <= 750px) {
        transform: translateY(12vh);
        scale: 0.9;
      }

      @media (height <= 600px) {
        display: none;
      }

      &::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%) translateY(45%);
        width: 40vw;
        height: 100%;
        border-radius: 50%;
        transform-origin: bottom left;
        filter: blur(72.02px);
        animation: scale-fade-in 0.4s ease-out;

        @at-root .theme-dark & {
          background: rgba($color-base-black-100-dark, 0.15);
        }

        @at-root .theme-light & {
          background: rgba($color-base-black-100-light, 0.2);
        }

        .#{$component-name}--leaving & {
          animation: scale-fade-out 0.35s cubic-bezier(1, 0, 0, 1) forwards;
          animation-delay: 0.1s;
        }
      }
    }
  }

  &__card-placeholder {
    width: 455px;
    position: absolute;
    scale: 0.6;
    translate: -80px 20%;
    display: none;

    @media all and (min-width: $screen-md) {
      display: flex;
      scale: 0.7;
      translate: -70px 0;
    }

    @media all and (min-width: $screen-xxl) {
      scale: 0.9;
      translate: -20px 0;
    }

    @media (height <= 750px) {
      scale: 0.6;
      translate: -90px 10%;
    }

    &--fs {
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 140%);
      animation: fs-popup 0.75s $spring-ease forwards;

      .#{$component-name}--final-animation & {
        animation: fs-slide 0.25s ease-out forwards;

        @media all and (min-width: $screen-lg) {
          animation: fs-slide 0.4s $spring-ease forwards;
        }
      }
    }

    &--cloaked {
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 140%);
      z-index: 1;
      animation: cloaked-popup 0.75s $spring-ease forwards;
      animation-delay: 0.55s;

      .#{$component-name}--final-animation & {
        animation: cloaked-slide-mobile 0.25s ease-out forwards;

        @media all and (min-width: $screen-lg) {
          animation: cloaked-slide 0.4s $spring-ease forwards;
        }
      }
    }
  }
}

@keyframes fs-popup {
  0% {
    transform: translate(-50%, 140%);
  }

  100% {
    transform: translate(-50%, -70px);
  }
}

@keyframes cloaked-popup {
  0% {
    transform: translate(-50%, 140%);
  }

  100% {
    transform: translate(-50%, -30px);
  }
}

@keyframes fs-slide {
  0% {
    transform: translate(-50%, -70px);
  }

  100% {
    transform: translate(calc(-50% - 100px), 25px) rotate(-20deg);
  }
}

@keyframes cloaked-slide {
  0% {
    transform: translate(-50%, -30px);
  }

  100% {
    transform: translate(calc(-50% + 50px), -100px) rotate(20deg);
  }
}

@keyframes cloaked-slide-mobile {
  0% {
    transform: translate(-50%, -30px);
  }

  100% {
    transform: translate(calc(-50% + 94px), -100px) rotate(20deg);
  }
}

@keyframes scale-fade-in {
  0% {
    scale: 0.1;
  }

  100% {
    scale: 1;
  }
}

@keyframes scale-fade-out {
  0% {
    scale: 1;
  }

  100% {
    scale: 0;
  }
}
</style>
