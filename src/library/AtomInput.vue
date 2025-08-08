<script setup>
import { ref } from "vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  label: {
    type: String,
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

const atomInputRef = ref(null);

defineExpose({
  atomInputRef,
});
</script>

<template>
  <div
    class="atom-input-wrapper"
    :class="{ error: props.error }"
  >
    <BaseText
      v-if="props.label"
      variant="body-small-medium"
      class="atom-input-wrapper--label"
    >
      {{ props.label }}
    </BaseText>
    <div class="input-row">
      <input
        v-bind="$attrs"
        ref="atomInputRef"
        class="atom-input-wrapper--input"
      />
      <template v-if="$slots.endIcon">
        <div class="end-icon">
          <slot name="endIcon" />
        </div>
      </template>
    </div>
    <BaseText
      v-if="props.error && props.errorMessage"
      variant="body-small-medium"
      class="atom-input-wrapper--label error"
    >
      {{ props.errorMessage }}
    </BaseText>
  </div>
</template>

<style scoped lang="scss">
// stylelint-disable
.atom-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .atom-input-wrapper--label {
    color: $color-primary-100;
  }

  .input-row {
    position: relative;

    .atom-input-wrapper--input {
      width: 100%;
      padding: 8px 16px;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      color: $color-primary-100;
      outline: none;
      border-radius: 10px;
      background: $color-primary-1;
      border: 1px solid $color-primary-30;
      height: $input-height;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @at-root .theme-dark & {
        background: transparent;
      }

      &:focus {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid $color-primary-100;
      }

      /* Hides up/down selectors in number input Chrome, Safari, Edge, Opera */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type="number"] {
        appearance: textfield;
      }

      &::placeholder {
        color: $color-primary-30;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .end-icon {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &.error {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: $color-alert;

    .atom-input-wrapper--label {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: $color-alert;
    }

    .input-row {
      .atom-input-wrapper--input {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-color: $color-alert;
      }
    }
  }
}
</style>
