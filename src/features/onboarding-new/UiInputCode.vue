<script setup>
import { reactive, ref, watch, onMounted } from "vue";

const emit = defineEmits(["input", "keydown"]);

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});

const inputRef = ref(null);

const state = reactive({
  isFocused: false,
  focusStyle: {},
});

onMounted(() => {
  inputRef.value?.focus();
});

watch(
  () => props.value,
  (newValue, oldValue) => {
    const lengthChange = Math.abs(newValue?.length - oldValue?.length || 0);

    state.focusStyle = {
      transition: `all ${0.1 + (lengthChange - 1) * 0.025}s ease-out`,
      transform: `translateX(${Math.min(newValue?.length, 5) * 76}px)`,
    };
  },
  { immediate: true }
);
</script>

<template>
  <span
    class="onboarding-input-code"
    :class="{ 'onboarding-input-code--focused': state.isFocused }"
  >
    <input
      ref="inputRef"
      :value="props.value"
      type="number"
      class="onboarding-input-code__input"
      @focus="state.isFocused = true"
      @blur="state.isFocused = false"
      @input="emit('input', $event)"
      @keydown="$emit('keydown', $event)"
    />
    <span class="onboarding-input-code__background">
      <span
        class="onboarding-input-code__focus"
        :style="state.focusStyle"
      />
      <span
        v-for="i in 6"
        :key="i"
        class="onboarding-input-code__placeholder"
        :class="{
          'onboarding-input-code__placeholder--focused':
            i - 1 === Math.min(props.value.length, 5) && state.isFocused,
        }"
      >
        {{ props.value[i - 1] }}
      </span>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.onboarding-input-code {
  display: block;
  margin: 0;
  position: relative;
  height: 64px;
  width: 100%;

  /* Hides up/down selectors in number input Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    appearance: textfield;
  }

  &__input {
    position: absolute;

    /* color + caret-color must be transparent (+ opacity cannot be zero)
    to visually hide the input field but still allow
    touch copy/pasting on mobile. */
    opacity: 0.1;
    color: transparent;
    caret-color: transparent;
    background-color: transparent;
    z-index: 1;
    inset: 0;
    border: none;
    height: 60px;
    width: 100%;
    user-select: auto;
    user-select: auto;
    user-select: auto;
    user-select: auto;
    user-select: auto;
    user-select: auto;

    &:focus {
      outline: none;
    }
  }

  &__background {
    display: flex;
    justify-content: space-between;
    position: absolute;
    inset: 0;
  }

  &__focus {
    position: absolute;
    left: 1px;
    top: 1px;
    width: 100%; // 100% - total of gaps
    height: calc(100% - 2px);
    border: none;
    border-radius: 10px;
    opacity: 0;
    display: block;

    @at-root .onboarding-input-code--focused & {
      opacity: 1;
    }
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: calc((100% - 20px) / 6);
    border-radius: 12px;
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    background: rgba($color-primary-100-light, 0.2);

    @at-root .theme-dark & {
      background: rgba($color-primary-100-dark, 0.2);
    }

    &--focused {
      background: $color-primary-10;
      caret-color: $color-primary-100;
      border: 1px solid $color-primary-100;
    }
  }
}
</style>
