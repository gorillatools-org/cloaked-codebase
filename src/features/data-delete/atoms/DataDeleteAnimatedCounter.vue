<script setup lang="ts">
import NumberFlow, { continuous, type Format } from "@number-flow/vue";

type Props = {
  color?: "green" | "red" | "gray";
  textColor?: "default" | "white";
  format?: Format;
  value: number;
};

withDefaults(defineProps<Props>(), {
  color: "green",
  textColor: "default",
  format: undefined,
});
</script>

<template>
  <div
    class="data-delete-animated-counter"
    :class="[
      `data-delete-animated-counter--${color}`,
      `data-delete-animated-counter--text-${textColor}`,
    ]"
  >
    <NumberFlow
      class="data-delete-animated-counter__number-flow"
      :value="value"
      :format="format"
      :plugins="[continuous]"
    />
  </div>
</template>

<style scoped lang="scss">
.data-delete-animated-counter {
  &__number-flow {
    font-size: 28px;
    font-weight: 600;
    text-align: center;
    height: 45px;

    .data-delete-animated-counter--green & {
      color: $color-status-success;
    }

    .data-delete-animated-counter--red & {
      color: $color-status-error;
    }

    .data-delete-animated-counter--gray & {
      color: $color-primary-50;
    }
  }

  &__number-flow::part(number) {
    mask-image: unset;
  }

  &__number-flow::part(digit),
  &__number-flow::part(integer-digit) {
    text-align: center;
    width: 32px;
    height: 36px;
    border-radius: 8px;
    margin-left: 7px;
    overflow: hidden;
    transition:
      color 0.5s ease,
      background-color 0.5s ease,
      border 0.5s ease;
  }

  &__number-flow::part(symbol) {
    margin-left: 3px;
    transform: translate(2px, -8px);
    transition: color 0.5s ease;
  }

  &--red &__number-flow::part(digit),
  &--red &__number-flow::part(integer-digit) {
    color: $color-status-error;
    background-color: rgba($color-status-error, 0.3);
    border: 1px solid $color-status-error;
  }

  &--green &__number-flow::part(digit),
  &--green &__number-flow::part(integer-digit) {
    color: $color-status-success;
    background-color: rgba($color-status-success, 0.3);
    border: 1px solid $color-status-success;
  }

  &--gray &__number-flow::part(digit),
  &--gray &__number-flow::part(integer-digit) {
    color: $color-primary-50;
    background-color: rgba($color-primary-50, 0.3);
    border: 1px solid $color-primary-50;
  }

  &--text-white &__number-flow::part(digit),
  &--text-white &__number-flow::part(integer-digit) {
    color: $color-white;
  }
}
</style>
