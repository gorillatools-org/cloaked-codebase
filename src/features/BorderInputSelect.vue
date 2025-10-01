<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import InputValidationError from "@/features/InputValidationError.vue";

defineProps({
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  value: {
    type: [String, Object],
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  errors: {
    type: Array,
    default: () => [],
  },
  dropdownWidth: {
    type: String,
    default: "190px",
  },
  placement: {
    type: String,
    default: "bottom-start",
  },
});

defineEmits(["input", "change"]);
</script>

<template>
  <div>
    <UiMenu
      :width="dropdownWidth"
      :placement="placement"
      has-content-click-close
    >
      <label
        class="border-input-select"
        :class="{ 'border-input-select--error': errors.length }"
      >
        <span
          v-if="label"
          class="border-input-select__label"
        >
          {{ label }}
        </span>
        <button class="border-input-select__button">
          <slot
            v-if="value"
            name="selected-value"
            :value="value"
            :options="options"
          >
            {{ value }}
          </slot>
          <span
            v-else
            class="border-input-select__placeholder"
          >
            {{ placeholder }}
          </span>
          <InlineSvg
            name="chevron"
            class="border-input-select__chevron"
          />
        </button>
      </label>
      <template #content>
        <span class="border-input-select__options">
          <template v-for="(option, index) in options">
            <span
              v-if="option?.code === 'divider'"
              :key="`divider-${index}`"
            >
              <div class="border-input-select__divider" />
            </span>
            <span
              v-else
              :key="index"
              class="border-input-select__options-item"
              @click="
                $emit('input', option);
                $emit('change', option);
              "
            >
              <slot
                name="option"
                :option="option"
              >
                {{ option }}
              </slot>
            </span>
          </template>
        </span>
      </template>
    </UiMenu>
    <slot
      v-for="error in errors"
      name="error"
      :error="error"
    >
      <InputValidationError :key="error">
        {{ error }}
      </InputValidationError>
    </slot>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.border-input-select {
  display: block;

  &__label {
    display: block;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    align-items: center;
    color: $color-primary-100;
  }

  &__button {
    padding: 20px;
    border: 1px solid $color-primary-10;
    border-radius: 15px;
    margin-top: 8px;
    width: 100%;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    background-color: $color-base-white-100;
    cursor: pointer;
    text-align: left;
    position: relative;
    min-height: 60px;

    &:focus {
      outline: 1px solid $color-primary-100;
    }

    @at-root .border-input-select--error & {
      border: 1px solid $color-alert;
    }
  }

  &__placeholder {
    color: $color-primary-50;
  }

  &__chevron {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__options {
    max-height: 300px;
    padding: 8px 0;

    &-item {
      display: flex;
      align-items: center;
      font-size: 13px;
      line-height: 20px;
      color: $color-primary-100;
      cursor: pointer;
      padding: 8px 12px;

      &:hover {
        background-color: $color-primary-10;
      }
    }
  }

  &__divider {
    height: 1px;
    width: 100%;
    background: $color-primary-10;
  }
}
</style>
