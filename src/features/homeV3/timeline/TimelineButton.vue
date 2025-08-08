<script setup>
import { computed, ref } from "vue";
import ChevronRight from "@/assets/icons/chevron-right.svg";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hasOnClick: {
    type: Boolean,
    default: false,
  },
});

const open = ref(true);

const emit = defineEmits(["click"]);

const isClickable = computed(() => !props.disabled && props.hasOnClick);

function handleClick(event) {
  if (isClickable.value) {
    open.value = !open.value;
    emit("click", event);
  }
}
</script>

<template>
  <button
    class="timeline-button-container"
    :class="{ 'not-clickable': !isClickable }"
    :disabled="disabled"
    @click="handleClick"
  >
    <p>{{ text }}</p>
    <ChevronRight
      v-if="isClickable"
      :class="{ down: open }"
      class="chevron"
    />
  </button>
</template>

<style scoped lang="scss">
.timeline-button-container {
  background: $color-primary-100;
  color: $color-primary-1;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  border: none;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 10px;
  line-clamp: 1;
  overflow: hidden;

  &:not(.not-clickable) {
    cursor: pointer;
  }

  &.not-clickable {
    cursor: default;
  }

  &:disabled {
    background: $color-primary-50;
    cursor: not-allowed;
  }

  p {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .chevron {
    color: $color-primary-1;
    transition: transform 0.25s ease;

    &.down {
      transform: rotate(90deg);
    }
  }
}
</style>
