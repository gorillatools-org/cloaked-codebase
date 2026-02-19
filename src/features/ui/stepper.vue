<script setup>
const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  steps: {
    type: Array,
    default: () => [],
  },
});
</script>
<template>
  <ul class="stepper">
    <li
      v-for="(step, index) in props.steps"
      :key="index"
      class="stepper__item"
      :class="{
        'stepper__item--done': index <= props.value,
        'stepper__item--active': index === props.value,
      }"
    >
      <span class="stepper__item-text">
        {{ step }}
      </span>
    </li>
  </ul>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.stepper {
  display: flex;
  align-items: center;

  &__item {
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-70;
    position: relative;
    margin-left: 50px;

    &::before {
      content: "";
      width: 8px;
      height: 8px;
      background: $color-primary-10;
      border-radius: 100%;
      position: absolute;
      right: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }

    &::after {
      content: "";
      width: 18px;
      height: 2px;
      background: $color-primary-10;
      position: absolute;
      right: calc(100% + 24px);
      top: 50%;
      transform: translateY(-50%);
    }

    &:first-child {
      margin-left: 16px;

      &::after {
        display: none;
      }
    }

    &--done {
      color: $color-primary-100;

      &::before {
        background: $color-success;
      }
    }

    &--active {
      font-weight: 500;

      &::before {
        background: $color-primary-100;
      }
    }
  }
}
</style>
