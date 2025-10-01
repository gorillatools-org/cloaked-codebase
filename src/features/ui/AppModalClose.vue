<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { useAttrs } from "vue";

const props = defineProps({
  isAbsolute: {
    type: Boolean,
    default: false,
  },
});
const attrs = useAttrs();

const emit = defineEmits(["close", "input"]);

function onClose() {
  emit("close");
  emit("input", false);
}
</script>

<template>
  <button
    v-bind="attrs"
    class="app-close-button"
    @click="onClose"
  >
    <InlineSvg
      name="modal-x"
      class="app-modal-close"
      :class="{ 'app-modal-close--absolute': props.isAbsolute }"
      @click="onClose"
    />
  </button>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.app-close-button {
  margin: 0;
  padding: 0;
  border: none;
  background-color: transparent;
}

.app-modal-close {
  padding: 24px;
  box-sizing: content-box;
  cursor: pointer;
  color: $color-primary-100;

  &:hover {
    opacity: 0.8;
  }

  &--absolute {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
