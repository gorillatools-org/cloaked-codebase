<script setup>
import { useAttrs } from "vue";
const props = defineProps({
  width: {
    type: Number,
    default: 512,
  },
  height: {
    type: Number,
    default: 372,
  },
  type: {
    type: String,
    default: "video/mp4",
  },
  src: {
    type: String,
    required: true,
  },
});
const attrs = useAttrs();
</script>

<template>
  <video
    v-bind="attrs"
    :key="props.src"
    :width="props.width"
    :height="props.height"
    class="app-modal-video"
  >
    <source
      :src="props.src"
      :type="props.type"
    />
    Your browser does not support the video tag.
  </video>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.app-modal-video {
  object-fit: fill;
  width: 100%;
  height: auto;
}
</style>
