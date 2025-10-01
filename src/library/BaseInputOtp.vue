<script setup>
import { ref, computed } from "vue";
import BaseText from "@/library/BaseText.vue";

defineOptions({
  inheritAttrs: false,
});

const inputRef = ref(null);
defineExpose({ inputRef });

const model = defineModel({ type: String });

const focusState = computed((oldValue) => {
  const lengthChange = Math.abs(model.value.length - oldValue?.length || 0);

  return {
    length: model.value.length,
    style: {
      transition: `transform ${0.1 + (lengthChange - 1) * 0.025}s ease-out`,
      transform: `translateX(calc(${Math.min(
        model.value.length,
        5
      )} * (100% + 4px)))`,
    },
  };
});
</script>

<template>
  <label
    class="base-input-otp"
    :class="$attrs.class"
    :style="$attrs.style"
  >
    <input
      v-bind="{ ...$attrs, class: null, style: null }"
      ref="inputRef"
      v-model="model"
      type="text"
      maxlength="6"
      inputmode="numeric"
      autocomplete="one-time-code"
      class="base-input-otp__input"
    />
    <BaseText
      v-for="i in 6"
      :key="i"
      variant="headline-3-bold"
      class="base-input-otp__placeholder"
    >
      {{ model[i - 1] }}
    </BaseText>
    <span
      class="base-input-otp__focus"
      :style="focusState.style"
    />
  </label>
</template>

<style lang="scss" scoped>
.base-input-otp {
  position: relative;
  height: 64px;
  width: 100%;
  display: flex;
  gap: 4px;
  cursor: pointer;

  &__input {
    position: absolute;
    inset: 0;
    opacity: 0;
    z-index: 1;
    caret-color: transparent;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__focus {
    position: absolute;
    left: 0;
    top: 0;
    width: calc((100% - 5 * 4px) / 6);
    height: 100%;
    border-radius: $input-border-radius;
    display: block;
    background-color: transparent;
    border: 1px solid $color-primary-20;

    @at-root .base-input-otp__input:focus ~ & {
      opacity: 1;
      border: 1px solid $color-primary-100;
    }

    @at-root .base-input-otp__input:disabled ~ & {
      cursor: not-allowed;
    }
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex: 1;
    border-radius: $input-border-radius;
    color: $color-primary-100;
    background-color: $color-primary-10;
    border: 1px solid $color-primary-20;
  }
}
</style>
