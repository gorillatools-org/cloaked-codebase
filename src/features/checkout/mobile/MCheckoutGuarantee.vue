<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";

type Props = {
  text?: string;
  description?: string;
};

withDefaults(defineProps<Props>(), {
  text: "30-day money-back guarantee",
  description: "Switch plans anytime",
});
</script>

<template>
  <div class="mobile-checkout-guarantee">
    <InlineSvg
      name="shield-lightening"
      class="mobile-checkout-guarantee__icon"
    />
    <div class="mobile-checkout-guarantee__texts-container">
      <div class="mobile-checkout-guarantee__title-container">
        <BaseText
          as="span"
          variant="footnote-emphasized"
        >
          {{ text }}
        </BaseText>
      </div>

      <BaseText
        class="mobile-checkout-guarantee__description"
        as="span"
        variant="footnote-regular"
      >
        {{ description }}
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mobile-checkout-guarantee {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: $color-status-positive;
  border: 1px solid $color-overlay-status-positive-20;
  color: $color-base-black-100;
  position: relative;
  overflow: hidden;

  @at-root .theme-dark & {
    background-color: $color-overlay-status-positive-20;
    border: 1px solid $color-status-positive;
  }

  &__texts-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-left: -26px; // Used to center the texts
  }

  &__icon {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -30%;
    width: 20px;
    height: 200%;
    background: linear-gradient(
      90deg,
      rgb(255 255 255 / 0%) 0%,
      rgb(255 255 255 / 45%) 50%,
      rgb(255 255 255 / 0%) 100%
    );
    transform: translateX(0) rotate(25deg);
    pointer-events: none;
    animation: guarantee-shine 5s cubic-bezier(0.23, 1, 0.32, 1) infinite;
  }
}

@keyframes guarantee-shine {
  0%,
  50% {
    transform: translateX(-150%) rotate(25deg);
    opacity: 0.3;
  }

  55% {
    opacity: 0.6;
  }

  100% {
    transform: translateX(115vw) rotate(25deg);
    opacity: 0;
  }
}
</style>
