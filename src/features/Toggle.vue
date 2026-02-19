<script setup>
const props = defineProps({
  status: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div
    class="toggle"
    :class="{ active: props.status }"
  >
    <span />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
div.toggle {
  display: flex;
  align-items: center;
  background-color: $color-primary-10;
  border: 1px solid $color-primary-10;
  border-radius: 15px;
  width: 39px;

  &.active {
    background-color: $color-success;
    border: 1px solid $color-success;

    span {
      transform: translateX(16px);
    }
  }

  > span {
    background-color: $color-primary-1;
    width: 21px;
    height: 21px;
    border-radius: 45px;
    display: inline-block;
  }
}
</style>
