<script setup>
const props = defineProps({
  width: {
    type: String,
    default: "512px",
  },
});
</script>
<template>
  <div
    class="app-modal-content"
    :style="`width: ${props.width}`"
  >
    <slot />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.app-modal-content {
  max-height: calc(100vh - 64px);
  max-width: calc(100vw - 64px);
  overflow: auto;
  background: $color-primary-1;
  border: 1px solid $color-primary-10;
  color: $color-primary-100;
  border-radius: 28px;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style>
