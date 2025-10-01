<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div
    class="app-modal-image"
    :style="{ 'background-image': 'url(' + props.src + ')' }"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.app-modal-image {
  height: 329px;
  width: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
