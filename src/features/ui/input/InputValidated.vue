<script setup>
import { computed, reactive, useAttrs } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  label: {
    type: String,
    default: "",
  },
  value: {
    type: String,
    default: "",
  },
  validators: {
    type: Array,
    default: () => [],
  },
});

const attrs = useAttrs();

const state = reactive({
  internalPasswordType: "password",
});

const emit = defineEmits(["input"]);

const addEnter = (e) => {
  emit("input", e.target.value + "\n");
};

const errors = computed(() => {
  const errors = [];

  props.validators.forEach((validatorFunction) => {
    const result = validatorFunction(props.value);
    if (result) {
      errors.push(result);
    }
  });

  return errors;
});
</script>
<template>
  <label
    class="validated-input"
    :class="{ 'validated-input--error': errors.length > 0 }"
  >
    {{ props.label }}
    <textarea
      v-if="props.type === 'textarea'"
      v-bind="attrs"
      class="validated-input__input"
      multiline
      :value="props.value"
      @input="$emit('input', $event.target.value)"
      @keydown.enter.exact.prevent="addEnter"
    />
    <span
      v-else-if="props.type === 'password'"
      class="validated-input__password"
    >
      <input
        v-bind="attrs"
        :type="state.internalPasswordType"
        class="validated-input__input"
        :value="props.value"
        @input="$emit('input', $event.target.value)"
      />
      <a
        v-if="state.internalPasswordType === 'password'"
        @click="state.internalPasswordType = 'text'"
      >
        <InlineSvg
          name="eye"
          class="validated-input__password-icon"
        />
      </a>
      <a
        v-else
        @click="state.internalPasswordType = 'password'"
      >
        <InlineSvg
          name="eye-slash"
          class="validated-input__password-icon"
        />
      </a>
    </span>
    <input
      v-else
      v-bind="attrs"
      :type="props.type"
      class="validated-input__input"
      :value="props.value"
      @input="$emit('input', $event.target.value)"
    />
    <span
      v-if="errors.length > 0"
      class="validated-input__error"
    >
      {{ errors[0] }}
    </span>
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.validated-input {
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  color: $color-primary-100;
  margin-top: 26px;

  textarea {
    resize: none;
    white-space: pre-line;
  }

  .validated-input__password {
    display: flex;

    a {
      background-color: transparent;
      border: none;
      font-size: 10px;
      display: inline-block;
      position: relative;
      top: 3px;
    }
  }

  &__input {
    width: 100%;
    font-family: $global-font;
    font-style: normal;
    padding: 12px;
    background: $color-primary-5;
    border: 1px solid $color-primary-5;
    border-radius: 8px;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-100;
    margin-top: 6px;

    &:focus {
      border: 1px solid #6251f8;
      outline: none;
    }

    @at-root .validated-input--error & {
      border: 1px solid $color-alert;
    }
  }

  &__error {
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: $color-alert;
    margin-top: 7px;
  }

  &__password {
    position: relative;

    .validated-input__input {
      padding-right: 48px;
    }

    &-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }
}
</style>
