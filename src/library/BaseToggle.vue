<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <button
    class="base-toggle"
    :class="{ 'base-toggle--active': active }"
    type="button"
    aria-label="Toggle"
    :aria-pressed="active"
    v-bind="$attrs"
  >
    <span class="base-toggle__toggle" />
  </button>
</template>

<style lang="scss" scoped>
.base-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 18px;
  border-radius: 20px;
  background-color: $color-primary-20;
  position: relative;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;

  @include transition(all 0.2s ease-in-out);

  &__toggle {
    position: absolute;
    top: 50%;
    left: 2px;

    @include transform(translateY(-50%) translateX(0));

    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: $color-primary-1-light;

    @include transition(all 0.2s ease-in-out);

    box-shadow: 0 3px 10px rgb(0 0 0 / 8%);
  }

  &--active {
    background-color: $color-success;

    .base-toggle__toggle {
      @include transform(translateY(-50%) translateX(calc(100% - 5px)));
    }
  }
}
</style>
