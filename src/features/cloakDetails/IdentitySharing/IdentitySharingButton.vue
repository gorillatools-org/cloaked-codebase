<script setup>
import Popper from "@/features/Popper.vue";
import inlineSvg from "@/features/InlineSvg.vue";

defineProps({
  isShared: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  hasAnnouncementTooltip: {
    type: Boolean,
    default: false,
  },
});
defineEmits(["input"]);
</script>

<template>
  <Popper
    v-bind="$attrs"
    :width="hasAnnouncementTooltip ? '250px' : 'initial'"
    :offset-along="hasAnnouncementTooltip ? 10 : 0"
    :offset-away="hasAnnouncementTooltip ? 16 : 2"
    :placement="hasAnnouncementTooltip ? 'left' : 'bottom-end'"
    :has-click-open="false"
    :has-click-close="false"
    :has-outside-click-close="false"
    :has-mouse-enter-open="!hasAnnouncementTooltip"
    :has-mouse-leave-close="!hasAnnouncementTooltip"
    :transition="hasAnnouncementTooltip ? 'fade-100' : 'fade-top-200'"
  >
    <button
      v-bind="$attrs"
      class="identity-sharing-button"
      :class="{
        'identity-sharing-button--shared': isShared,
        'identity-sharing-button--active': isActive || $attrs.value,
      }"
    >
      <inlineSvg
        name="share"
        class="identity-sharing-button__icon"
      />
    </button>
    <template #content>
      <div
        v-if="hasAnnouncementTooltip"
        class="identity-sharing-button__tooltip--announcement"
      >
        <inlineSvg
          name="chevron-tooltip"
          class="identity-sharing-button__tooltip-chevron"
        />
        Tap the link icon to generate a share link and password.
        <br />
        <button
          class="identity-sharing-button__tooltip-button"
          @click="$emit('input', false)"
        >
          Got it
        </button>
      </div>
      <div
        v-else-if="isShared"
        class="identity-sharing-button__tooltip"
      >
        Identity is currently being shared
      </div>
      <div
        v-else
        class="identity-sharing-button__tooltip"
      >
        Share identity
      </div>
    </template>
  </Popper>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.identity-sharing-button {
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $color-primary-100;
  background-color: $color-primary-5;
  border-radius: 100%;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  &--shared {
    background-color: $color-warning;
    color: $color-primary-100-light;
  }

  &--active,
  &:hover {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    color: $color-primary-1;
    background-color: $color-primary-100;
  }

  &__icon {
    width: 17px;
    height: 20px;
  }

  &__tooltip {
    background: $color-primary-90;
    color: $color-primary-1;
    border-radius: 6px;
    box-shadow:
      -22.9px -8.90123px 26.7037px rgb(1 2 24 / 5%),
      13.3518px 12.35px 26.7037px rgb(1 2 24 / 16%);
    padding: 10px;
    line-height: 16px;
    font-size: 11px;
    font-weight: 500;

    &--announcement {
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      padding: 12px 16px;
      background-color: $color-primary-100;
      color: $color-primary-1;
      border-radius: 8px;
    }

    &-chevron {
      color: $color-primary-100;
      position: absolute;
      left: 100%;
      top: 22px;
    }

    &-button {
      background: none;
      padding: 0;
      border: none;
      margin-top: 8px;
      text-decoration: underline;
      color: $color-primary-1;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
