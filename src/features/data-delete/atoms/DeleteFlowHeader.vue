<script setup>
const props = defineProps({
  center: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div
    class="delete-flow-page-header"
    :class="{ center: props.center }"
  >
    <slot />
  </div>
</template>
<style scoped lang="scss">
.delete-flow-page-header {
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: 40px;
  text-align: center;
  color: $color-primary-100;
  width: 100%;

  &.center {
    text-align: center;
  }
}
</style>
