<script setup>
import { onMounted } from "vue";

const emit = defineEmits(["mounted"]);

onMounted(() => {
  emit("mounted");
});
</script>

<template>
  <div class="mount-event">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.mount-event {
  height: 100%;
}
</style>
