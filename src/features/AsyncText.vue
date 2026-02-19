<script setup>
import { reactive, onMounted } from "vue";
import UiTooltip from "@/features/ui/ui-tooltip";

const props = defineProps({
  getValue: {
    type: [String, Function],
    required: true,
  },
  format: {
    type: Function,
    default: undefined,
  },
  tooltipMessage: { type: String, default: "" },
});

const state = reactive({
  value: null,
});

onMounted(() => {
  if (typeof props.getValue === "string") {
    state.value = props.getValue;
  } else if (typeof props.getValue === "function") {
    props.getValue().then((value) => {
      state.value = props.format ? props.format(value) : value;
    });
  }
});
</script>

<template>
  <UiTooltip
    v-if="Boolean(props.tooltipMessage)"
    :title="props.tooltipMessage"
  >
    <span class="hash-hover">{{ state.value }}</span>
  </UiTooltip>

  <span v-else>{{ state.value }}</span>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
span {
  color: $color-primary-100;
}

.hash-hover {
  cursor: pointer;
}
</style>
