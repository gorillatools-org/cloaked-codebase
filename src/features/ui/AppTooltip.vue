<script setup>
import { useAttrs } from "vue";
import Popper from "@/features/Popper.vue";
import BaseText from "@/library/BaseText.vue";

const attrs = useAttrs();
</script>

<template>
  <Popper
    v-bind="attrs"
    :has-click-open="false"
    :has-click-close="false"
    :has-outside-click-close="false"
    :has-mouse-enter-open="true"
    :has-mouse-leave-close="true"
    transition="fade-top-200"
    class="app-tooltip"
  >
    <slot />
    <template #content>
      <BaseText
        variant="caption-semibold"
        as="div"
        class="app-tooltip__content"
      >
        <slot name="content" />
      </BaseText>
    </template>
  </Popper>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.app-tooltip {
  &__content {
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
  }
}
</style>
