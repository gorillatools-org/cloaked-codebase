<script setup>
import DataDeleteInput from "@/features/data-delete/atoms/DataDeleteInput.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { ref } from "vue";

const isRevealed = ref(false);
</script>

<template>
  <DataDeleteInput
    v-bind="$attrs"
    :type="isRevealed ? 'text' : 'password'"
    class="data-delete-password"
  >
    <template #default>
      <slot />
    </template>
    <template #after>
      <slot name="after" />
    </template>
    <template #after-input>
      <Transition name="fade-100">
        <button
          v-show="$attrs.modelValue"
          type="button"
          class="data-delete-password__reveal-toggle"
          :class="
            isRevealed
              ? 'data-delete-password__reveal-toggle--revealed'
              : 'data-delete-password__reveal-toggle--hidden'
          "
          tabindex="-1"
          @click="isRevealed = !isRevealed"
        >
          <InlineSvg
            name="eye-slash"
            class="data-delete-password__icon-hide"
          />
          <InlineSvg
            name="eye"
            class="data-delete-password__icon-reveal"
          />
        </button>
      </Transition>
    </template>
  </DataDeleteInput>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-password {
  position: relative;

  &[type="password"]:not(:placeholder-shown) {
    font: caption;
    line-height: 1.3;
  }

  &__reveal-toggle {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 54px;
    height: 100%;
    background-color: transparent;
    border: none;
    opacity: 0.4;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-100;

    @media (min-width: $screen-md) {
      width: 70px;
      height: 70px;
    }

    &:hover {
      opacity: 0.3;
    }

    &:active {
      transform: translateY(-50%) scale(0.93);
    }

    .data-delete-password__icon-hide,
    .data-delete-password__icon-reveal {
      width: 30px;
      height: 30px;
    }

    &--revealed {
      .data-delete-password__icon-hide {
        display: block;
      }

      .data-delete-password__icon-reveal {
        display: none;
      }
    }

    &--hidden {
      .data-delete-password__icon-hide {
        display: none;
      }

      .data-delete-password__icon-reveal {
        display: block;
      }
    }
  }

  &.data-delete-input__input {
    padding-right: 70px;
  }
}
</style>
