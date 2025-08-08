<script setup>
import { reactive, ref } from "vue";

/* eslint-disable import/no-restricted-paths */
import InlineSvg from "@/features/InlineSvg.vue";
import { useToast } from "@/composables/useToast.js";
import { tools } from "@/scripts/tools";
/* eslint-enable import/no-restricted-paths */

const toast = useToast();

const inputRef = ref(null);
defineExpose({ inputRef });

const props = defineProps({
  /* For ease of display in generation > display generated */
  value: {
    type: [String, Number],
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: "450px",
  },
  maxlength: {
    type: Number,
    default: 120,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  center: {
    type: Boolean,
    default: false,
  },
});

const state = reactive({
  isFocused: false,
});

function copyText() {
  if (props.readonly) {
    tools.copyToClipboard(props.value);
    toast.success("Copied to clipboard");
  }
}

function handleFocus() {
  if (!props.readonly) {
    return (state.isFocused = true);
  }
  copyText();
}
</script>
<template>
  <div
    class="widget-wrapper"
    :class="{ center: props.center, pointer: props.readonly }"
    @click="copyText"
  >
    <div
      class="widget"
      :class="{ widget__focus: state.isFocused, error: props.error }"
      :style="`max-width: ${props.maxWidth};`"
    >
      <div class="widget__wrap">
        <div
          :class="{ 'atom-input-visible': !!props.value, error: props.error }"
          class="atom-input-label"
        >
          {{ props.label }}
        </div>
        <div
          v-if="props.isLoading"
          class="widget__field-value"
        >
          Loading...
        </div>
        <div v-else-if="props.readonly">
          {{ props.value }}
        </div>
        <input
          v-else
          ref="inputRef"
          v-bind="$attrs"
          :value="props.value"
          :readonly="props.readonly"
          class="widget__input"
          :class="{ pointer: props.readonly }"
          :disabled="props.disabled || props.isLoading"
          @focus="handleFocus"
          @blur="state.isFocused = false"
        />
      </div>
      <slot />
      <InlineSvg
        v-if="props.readonly"
        name="copy"
      />
    </div>
    <div
      v-if="props.error"
      class="widget__error"
    >
      {{ props.errorMessage }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
// stylelint-disable
.widget-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  &.center {
    align-items: center;
  }

  &.pointer {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transition: all 0.3s ease;
      transform: scale(1.01);
    }
  }

  .widget {
    text-align: left;
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-radius: 16px;
    flex-direction: row;
    align-items: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    height: 64px;
    padding: 16px;
    border: solid 1px transparent;
    box-sizing: border-box;
    background: rgba($color-primary-100-light, 0.1);
    box-shadow: 0 10px 10px 0 rgba($color-primary-1-light, 0.1);
    transition: all 0.3s ease;

    @at-root .theme-dark & {
      background: rgba($color-primary-100-dark, 0.1);
      box-shadow: 0 10px 10px 0 rgba($color-primary-1-dark, 0.1);
    }

    &.error {
      border: solid 1px $color-alert;
    }

    &__input {
      width: 100%;
      background-color: transparent;
      color: $color-primary-100;
      border: none;
      display: block;
      transition: all 0.3s ease;
      outline: none;

      &.pointer {
        cursor: pointer;
      }
    }

    input[type="number"] {
      appearance: textfield;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }

    &__focus {
      transition: all 0.3s ease;
      border: solid 1px $color-primary-100;
    }

    &__wrap {
      display: flex;
      flex-direction: column;
      width: 100%;

      .atom-input-label {
        transition: all 0.3s ease;
        display: none;

        &.error {
          color: $color-alert;
        }

        &.atom-input-visible {
          transition: all 0.3s ease;
          display: block;
        }
      }
    }

    &__field-value {
      display: flex;
      margin: auto 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 90%;
    }

    &__error {
      font-size: 12px;
      color: $color-alert;
      margin-top: 8px;
      text-align: left;
    }
  }
}
</style>
