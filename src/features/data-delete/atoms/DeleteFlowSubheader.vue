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
    class="delete-flow-page-subheader"
    :class="{ center: props.center }"
  >
    <slot />
  </div>
</template>
<style scoped lang="scss">
.delete-flow-page-subheader {
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: $color-primary-70;

  &.center {
    text-align: center;
  }
}
</style>
