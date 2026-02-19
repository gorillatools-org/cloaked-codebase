<script setup>
import { useAttrs } from "vue";
import Popper from "@/features/Popper.vue";
import InlineSvg from "@/features/InlineSvg.vue";
const attrs = useAttrs();
</script>

<template>
  <Popper
    v-bind="attrs"
    width="250px"
    placement="left"
    :offset-along="12"
    :offset-away="16"
  >
    <slot />
    <template #content>
      <div class="app-tooltip-intro__content">
        <slot name="content" />
        <InlineSvg
          name="chevron-tooltip"
          class="app-tooltip-intro__chevron"
        />
      </div>
    </template>
  </Popper>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.app-tooltip-intro {
  &__content {
    font-size: 14px;
    font-weight: 400;
    line-height: 21px;
    padding: 12px 16px;
    background-color: $color-primary-100;
    color: $color-primary-1;
    border-radius: 8px;

    button {
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

  &__chevron {
    color: $color-primary-100;
    position: absolute;
    left: 100%;
    top: 22px;
  }
}
</style>
