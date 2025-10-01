<script setup>
import CheckboxChecked from "@/assets/icons/checkbox-checked.svg";
import CheckboxUnchecked from "@/assets/icons/checkbox-unchecked.svg";
import CheckboxSome from "@/assets/icons/checkbox-some.svg";
import { computed } from "vue";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  values: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const areAllSelected = computed(
  () =>
    props.values.length &&
    props.values.every((id) => props.modelValue?.includes(id))
);
const areSomeSelected = computed(
  () =>
    !areAllSelected.value &&
    props.values.some((id) => props.modelValue?.includes(id))
);

function onToggleAll() {
  if (props.disabled) {
    return;
  }

  if (areAllSelected.value) {
    emit(
      "update:modelValue",
      props.modelValue?.filter((selectedValue) =>
        props.values?.every((value) => value !== selectedValue)
      )
    );
    return;
  }

  emit(
    "update:modelValue",
    Array.from(new Set([...props.modelValue, ...props.values]))
  );
}
</script>

<template>
  <button
    class="review-toggle-all"
    :class="{ 'review-toggle-all--disabled': disabled }"
    @click.prevent="onToggleAll"
  >
    <CheckboxChecked
      v-if="areAllSelected"
      class="review-toggle-all__icon"
    />
    <CheckboxSome
      v-else-if="areSomeSelected"
      class="review-toggle-all__icon"
    />
    <CheckboxUnchecked
      v-else
      class="review-toggle-all__icon"
    />
  </button>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.review-toggle-all {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  background-color: transparent;
  color: $color-primary-100;

  &:hover {
    .review-toggle-all__icon {
      opacity: 0.9;
    }
  }

  &--disabled {
    opacity: 1;
    color: $color-primary-50;
    cursor: not-allowed;

    .review-toggle-all__icon {
      opacity: 1 !important;
    }
  }
}
</style>
