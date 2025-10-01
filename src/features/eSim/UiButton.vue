<script setup>
import inlineSvg from "@/features/InlineSvg.vue";
import Spinner from "@/assets/icons/spinner.svg";

const props = defineProps({
  gradient: {
    type: Boolean,
    default: false,
  },
  imgName: {
    type: String,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: "100%",
  },
});
</script>
<template>
  <button
    tabindex="0"
    class="dd-onboarding-ui-button"
    :class="{ gradient: props.gradient, disabled: props.disabled }"
    :style="{ width: props.width }"
    :disabled="props.disabled"
    role="button"
  >
    <Spinner v-if="props.loading" />
    <span
      v-else
      class="button-inner-wrapper"
    >
      <slot />
      <inlineSvg
        v-if="props.imgName"
        :name="props.imgName"
      />
    </span>
  </button>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.dd-onboarding-ui-button {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 54px;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: $color-primary-1;
  border-radius: 99px;
  border: 1px solid $color-primary-100;
  background: $color-primary-100;
  max-width: 344px;
  flex-shrink: 0;
  transition: all 0.3s ease;

  &.gradient {
    background: $cloaked-gradient;
    color: $white;
    height: 55px;
    border: none;
  }

  &.disabled {
    cursor: not-allowed;
    background: $color-primary-20;
    border: 1px solid $color-primary-10;
    z-index: 2;
    transition: all 0.3s ease;

    &.gradient {
      transition: all 0.3s ease;
      border: none;
      background: linear-gradient(
        90deg,
        #ffd0a5 0%,
        #ffbeb5 50.45%,
        #ecddf4 100%
      );

      @at-root .theme-dark & {
        background: linear-gradient(
          90deg,
          #5c391e 0%,
          #642b2d 50.45%,
          #553a4d 100%
        );
      }
    }
  }

  .button-inner-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;

    svg {
      height: 15px;
      width: auto;
    }
  }

  &:hover {
    transform: scale(1.02);
    transition: all 0.3s ease;
  }
}
</style>
