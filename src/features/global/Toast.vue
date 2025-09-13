<script setup>
import { computed } from "vue";
import { toastState } from "@/composables/useToast.js";

const message = computed(() => toastState.message);
const isError = computed(() => toastState.type === "error");
const show = computed(() => toastState.show);
</script>
<template>
  <Transition>
    <div
      v-if="show"
      class="toast-wrapper"
    >
      <!-- eslint-disable vue/no-v-html -->
      <div
        class="toast-item"
        :class="{ error: isError }"
        v-html="message"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.v-enter-active,
.v-leave-active {
  transition: opacity 500ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.toast-wrapper {
  position: fixed;
  bottom: 15px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000000;
  pointer-events: none;

  .toast-item {
    margin: 0 auto;
    background-color: $color-primary-100;
    color: $color-primary-1;
    padding: 16px 40px;
    border-radius: 8px;
    font-size: 14px;
  }
}

.error {
  color: $white !important;
  background-color: $color-alert !important;
}
</style>
