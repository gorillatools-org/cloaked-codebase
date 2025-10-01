<script setup>
defineProps({
  value: {
    type: Number,
    required: true,
  },
  tabs: {
    type: Array,
    default: () => [],
  },
});
defineEmits(["input"]);
</script>
<template>
  <ul class="tabs">
    <li
      v-for="(tab, index) in tabs"
      :key="index"
      class="tabs__item"
      :class="{ 'tabs__item--active': index === value }"
      @click="$emit('input', index)"
    >
      <slot :tab="tab">
        {{ tab }}
      </slot>
    </li>
  </ul>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.tabs {
  display: flex;

  &__item {
    margin-left: 24px;
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-50;
    cursor: pointer;
    height: 48px;
    display: flex;
    align-items: center;
    border-bottom: 3px solid transparent;

    &:hover {
      color: $color-primary-30;
    }

    &:first-child {
      margin-left: 0;
    }

    &--active {
      color: $color-primary-100;
      border-bottom: 3px solid $color-primary-50;

      &:hover {
        color: $color-primary-50;
        border-bottom: 3px solid $color-primary-50;
      }
    }
  }
}
</style>
