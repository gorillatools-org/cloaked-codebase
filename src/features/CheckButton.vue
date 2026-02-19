<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

const emit = defineEmits(["input"]);

const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  square: {
    type: Boolean,
    default: false,
  },
});

function handleChange() {
  emit("input", !props.value);
}
</script>

<template>
  <label
    class="check-button"
    :class="{
      'check-button--checked': !!props.value,
      'check-button--disabled': props.disabled,
      'check-button--square': props.square,
    }"
    @click.stop="() => {}"
  >
    <input
      type="checkbox"
      :checked="!!props.value"
      :disabled="props.disabled"
      @change="handleChange"
    />

    <template v-if="!props.square">
      <InlineSvg
        v-if="!!props.value"
        name="check-active"
      />
      <InlineSvg
        v-else
        name="check-inactive"
      />
    </template>

    <template v-if="props.square">
      <InlineSvg
        v-if="!!props.value"
        name="check-square-active"
      />
      <InlineSvg
        v-else
        name="check-square-inactive"
      />
    </template>
  </label>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.check-button {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: relative;
  color: $color-primary-30;
  display: inline-block;

  svg {
    position: absolute;
    left: 0;
    top: 0;
    max-width: 100%;
  }

  input {
    visibility: hidden;

    &:checked {
      + ::before {
        border-color: currentcolor;
      }

      + ::after {
      }
    }
  }

  &--checked {
    color: $color-primary-100;
  }

  &--disabled {
    color: $color-primary-90;
  }

  &--square {
    width: 19px;
    height: 19px;
  }

  &:not(&--disabled):hover {
    cursor: pointer;
  }
}
</style>
