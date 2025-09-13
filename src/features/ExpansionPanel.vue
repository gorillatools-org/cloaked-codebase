<script setup>
import ArrowButton from "@/features/ArrowButton";

import { reactive, computed, ref } from "vue";

const props = defineProps({
  buttonText: { type: String, required: true },
  duration: { type: Number, required: false, default: null },
});

const slotWrapper = ref(null);

const emit = defineEmits(["onClick"]);

const state = reactive({
  isOpen: false,
  height: 0,
});

function handleOnClick(e) {
  state.isOpen = !state.isOpen;

  if (state.isOpen && slotWrapper.value?.children[0]?.scrollHeight) {
    state.height = slotWrapper.value.children[0].scrollHeight;
  } else {
    state.height = 0;
  }

  emit("onClick", e);
}
const contentStyles = computed(() => {
  return `
      transition: height ${props.duration || 200}ms ease;
    -moz-transition: height ${props.duration || 200}ms ease;
    -webkit-transition: height ${props.duration || 200}ms ease;
    -o-transition: height ${props.duration || 200}ms ease;
    overflow: hidden;
    height: ${state.height}px;
      `;
});
</script>

<template>
  <div class="expansion-panel">
    <div>
      <span
        class="button-label"
        @click="handleOnClick"
      >
        {{ props.buttonText }}
      </span>
      <ArrowButton
        :is-open="state.isOpen"
        class="dark-arrow"
        @click="handleOnClick"
      />
    </div>
    <div
      ref="slotWrapper"
      :style="contentStyles"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.expansion-panel {
  color: $color-primary-100;

  .button-label {
    color: $color-primary-100;
  }

  svg {
    color: $color-primary-100;
  }
}

.button-label {
  text-decoration: underline;
  font-family: $global-font;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
}

.dark-arrow {
  color: $color-primary-90;
}
</style>
