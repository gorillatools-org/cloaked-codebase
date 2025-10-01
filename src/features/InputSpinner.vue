<script setup>
import SmallSpinner from "@/assets/icons/small-spinner.png";
import { computed } from "vue";

const style = computed(() => {
  return {
    backgroundImage: `url(${SmallSpinner})`,
  };
});
</script>

<template>
  <div
    class="input-spinner"
    :style="style"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.input-spinner {
  width: 24px;
  height: 24px;
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position: center;
  animation: input-spinner-spin 0.4s linear infinite;

  @keyframes input-spinner-spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
