<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

const emit = defineEmits(["update"]);
const props = defineProps({
  checked: { type: Boolean, default: false },
  name: { type: String, default: "" },
  value: { type: [String, Number], default: "" },
});

function handleClick() {
  emit("update", props.value);
}
</script>

<template>
  <label
    class="radio-button"
    :class="{
      'radio-button--checked': props.checked,
    }"
    @click="handleClick"
  >
    <input
      type="radio"
      :name="props.name"
      :value="props.value"
      :checked="props.checked"
    />
    <InlineSvg
      v-if="props.checked"
      name="radio-active"
    />
    <InlineSvg
      v-else
      name="radio-inactive"
    />
  </label>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.radio-button {
  width: 19px;
  height: 22px;
  position: relative;
  color: $color-primary-100;
  display: flex;
  align-items: center;
  justify-content: center;

  input {
    visibility: hidden;
    position: absolute;
  }

  &--checked {
    color: $color-primary-100;
  }

  &:hover {
    cursor: pointer;
  }
}
</style>
