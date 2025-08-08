<script setup>
// eslint-disable-next-line import/no-restricted-paths
import InlineSvg from "@/features/InlineSvg.vue";
import { ref, watch } from "vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  label: {
    type: String,
    required: false,
    default: null,
  },
  value: {
    type: String,
    required: false,
    default: null,
  },
  placeholder: {
    type: String,
    required: false,
    default: "Select",
  },
  maxHeight: {
    type: String, // ex: '100px'
    required: false,
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  dropdownWidth: {
    type: String, // ex: '100px'
    required: false,
    default: null,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["select"]);

const dropdownRef = ref(null);

const selectValue = ref(props.value);

function handleSelect(value) {
  emit("select", value);
}

watch(
  () => props.value,
  (newValue) => {
    selectValue.value = newValue;
  }
);
</script>
<template>
  <div
    ref="dropdownRef"
    class="atom-dropdown-wrapper"
    :class="{ error: props.error }"
  >
    <BaseText
      v-if="props.label"
      as="div"
      variant="body-small-medium"
      class="atom-input-wrapper--label"
    >
      {{ props.label }}
    </BaseText>

    <div class="atom-input-wrapper__select">
      <select
        v-model="selectValue"
        class="atom-input-wrapper atom-input-wrapper__select--select"
        @change="handleSelect($event.target.value)"
      >
        <option
          value=""
          disabled
          selected
          class="atom-input-wrapper__select--placeholder"
        >
          Select an option
        </option>
        <option
          v-for="(option, index) in props.options"
          :key="index"
          :value="option"
          class="atom-input-wrapper__select--option"
        >
          {{ option }}
        </option>
      </select>

      <InlineSvg
        class="atom-input-wrapper__select--icon"
        name="chevron-down"
      />
    </div>

    <BaseText
      v-if="props.error && props.errorMessage"
      as="div"
      variant="body-small-medium"
      class="atom-input-wrapper--label error"
    >
      {{ props.errorMessage }}
    </BaseText>
  </div>
</template>
<style scoped lang="scss">
// stylelint-disable
.atom-dropdown-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  color: $color-primary-100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.error {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: $color-alert;

    .atom-input-wrapper--label {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: $color-alert;
    }

    .atom-input-wrapper {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-color: $color-alert;
    }
  }

  .atom-input-wrapper__select {
    position: relative;

    &--select {
      width: 100%;
      padding: 8px 16px;
      font-size: 15px;
      font-weight: 500;
      color: $color-primary-100;
      outline: none;
      border-radius: 10px;
      height: $input-height;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      background: transparent;
      border: 1px solid $color-primary-30;
      font-family: $global-font;
      appearance: none;
      position: relative;

      &:has(option[disabled]:checked) {
        color: $color-primary-30;
      }
    }

    &--icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: $color-primary-100;
    }

    @at-root .theme-dark & {
      background: transparent;
    }

    .placeholder {
      color: $color-primary-30;
    }
  }
}
</style>
