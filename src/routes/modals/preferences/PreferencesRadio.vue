<script setup>
import ValueDisplay from "@/features/ui/value-display.vue";
import RadioButton from "@/features/RadioButton.vue";
import InlineSvg from "@/features/InlineSvg.vue";

const emit = defineEmits(["update", "delete"]);

const props = defineProps({
  inputValue: { type: [String, Number, Boolean], default: null },
  value: { type: [String, Number, Boolean], default: null },
  label: { type: String, default: null },
  subLabel: { type: String, default: null },
  groupName: { type: String, default: null },
  disabled: Boolean,
  deletable: Boolean,
});

function handleClick() {
  if (props.disabled || props.value === props.inputValue) {
    return;
  }
  emit("update", props.inputValue);
}

function handleDelete() {
  emit("delete", props.inputValue);
}
</script>

<template>
  <ValueDisplay
    class="preferences-radio"
    :label="props.label"
    :value="props.subLabel"
    :disabled="props.disabled"
    dark-label
    light-value
    @click="handleClick"
  >
    <template #actions>
      <button
        v-if="props.deletable"
        class="value-display__action-button value-display__action-button--delete"
        @click.stop="handleDelete"
      >
        <InlineSvg name="trash-outline" />
      </button>

      <RadioButton
        :name="props.groupName"
        :checked="props.value === props.inputValue"
        :value="props.inputValue"
        :disabled="props.disabled"
      />
    </template>
  </ValueDisplay>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.preferences-radio {
  .value-display__action-button--delete {
    display: none;
  }

  &:not(.value-display--disabled):hover {
    .value-display__action-button--delete {
      display: flex;
    }
  }
}
</style>
