<script setup>
import { lowerCase } from "lodash-es";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { reactive, computed, watch, ref } from "vue";
import BaseText from "@/library/BaseText.vue";

const emit = defineEmits(["input", "option", "save", "focus", "blur"]);

const props = defineProps({
  value: {
    type: [String, Number],
    default: "",
  },
  pattern: RegExp,
  max: { type: Number, default: null },
  label: { type: String, default: null },
  placeholder: { type: String, default: null },
  format: { type: Function, default: null },
  type: {
    type: String,
    default: "text",
  },
  options: {
    type: Array,
    default: null,
  },
  error: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const input = ref(null);

const state = reactive({
  passwordIsVisible: false,
  menuIsVisible: false,
  innerValue: "",
  active: 0,
  hasChanges: false,
});

const innerValueDisplay = computed(() => {
  if (props.format) {
    return props.format(state.innerValue);
  }
  return state.innerValue;
});

const inputs = computed(() => {
  return document.getElementsByClassName("pref-input-items");
});

const hasActions = computed(() => {
  return props.type === "password";
});

const hasMenu = computed(() => {
  return props.options && props.options.length;
});

const visibleOptions = computed(() => {
  if (!props.options) {
    return [];
  }

  return props.options
    .filter((option) => {
      if (!state.hasChanges) {
        return true;
      }

      const a = lowerCase(option);
      const b = lowerCase(state.innerValue);

      return a.includes(b);
    })
    .map((o) => ({ title: o }));
});

function findIndex(target) {
  return [].findIndex.call(inputs.value, (e) => e === target);
}
function moveFocus(index) {
  if (inputs.value[index]) {
    inputs.value[index].focus();
  }
}
function moveNext(event) {
  const index = findIndex(event.target);
  moveFocus(index + 1);
}
function movePrev(event) {
  const index = findIndex(event.target);
  moveFocus(index - 1);
}
function handleKeydown(event) {
  if (props.pattern && event.key && !event.metaKey) {
    if (!event.key.match(props.pattern)) {
      event.preventDefault();
      return false;
    }
  }
}
function handleInput(event) {
  state.hasChanges = true;

  if (hasMenu.value && !state.menuIsVisible) {
    state.menuIsVisible = true;
  }
  let value = event.target.value;
  if (props.max) {
    value = value.slice(0, props.max);
  }
  emit("input", value);
  state.innerValue = value;
}

function togglePasswordReveal() {
  state.passwordIsVisible = !state.passwordIsVisible;
}

function handleFocus() {
  emit("focus");
  if (hasMenu.value) {
    state.menuIsVisible = true;
  }
}

function handleBlur() {
  state.menuIsVisible = false;
  emit("blur");
}

function handleEnter(event) {
  if (hasMenu.value && visibleOptions.value.length) {
    emit("option", visibleOptions.value[state.active].title);

    state.menuIsVisible = false;
  }

  if (hasMenu.value && !visibleOptions.value.length) {
    emit("option", state.innerValue);
  }
  const index = findIndex(event.target);
  if (index === inputs.value.length - 1) {
    emit("save");
  } else {
    moveNext(event);
  }
}

function handleSelect(item) {
  emit("option", item.title);
  state.menuIsVisible = false;
}

function handleDown() {
  const max = visibleOptions.value.length - 1;
  state.active += 1;

  if (state.active > max) {
    state.active = max;
  }
}

function handleUp() {
  state.active -= 1;

  if (state.active < 0) {
    state.active = 0;
  }
}

function handleEsc() {
  state.menuIsVisible = false;
  state.innerValue = props.value;
  state.hasChanges = false;
}

watch(
  () => props.type,
  () => {
    state.passwordIsVisible = false;
  },
  { deep: true }
);

watch(
  () => props.value,
  () => {
    state.innerValue = props.value;
    state.hasChanges = false;
  },
  { immediate: true, deep: true }
);

watch(
  () => visibleOptions.value,
  () => {
    state.active = 0;
  },
  { deep: true }
);
</script>

<template>
  <div
    class="preferences-input"
    :class="{
      'preferences-input--error': props.error,
      'preferences-input--has-actions': hasActions,
      'preferences-input--has-menu': hasMenu,
    }"
    @click="state.menuIsVisible = true"
  >
    <BaseText
      variant="body-small-medium"
      as="label"
    >
      {{ props.label }}
    </BaseText>

    <div class="preferences-input__wrapper">
      <input
        ref="input"
        class="pref-input-items"
        :placeholder="props.placeholder"
        :readonly="props.readonly"
        :disabled="props.disabled"
        autocomplete="off"
        data-lpignore="true"
        data-form-type="other"
        :type="
          props.type === 'password' && !state.passwordIsVisible
            ? 'password'
            : 'text'
        "
        :value="innerValueDisplay"
        :maxlength="props.max"
        @input="handleInput"
        @keypress="handleKeydown"
        @keydown.esc.stop="handleEsc"
        @keydown.enter="handleEnter"
        @keydown.down="handleDown"
        @keydown.up="handleUp"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.prevent.tab.exact="moveNext"
        @keydown.prevent.shift.tab="movePrev"
      />
      <div
        v-if="props.type === 'password' || $slots.actions || hasMenu"
        class="preferences-input__actions"
      >
        <slot name="actions" />

        <button
          v-if="props.type === 'password'"
          class="preferences-input__password-reveal"
          @click="togglePasswordReveal"
        >
          <InlineSvg
            v-if="state.passwordIsVisible"
            name="eye-slash"
          />
          <InlineSvg
            v-else
            name="eye"
          />
        </button>
        <button
          v-if="hasMenu"
          class="preferences-input__down-chevron"
        >
          <InlineSvg name="chevron-down" />
        </button>
      </div>

      <UiMenu
        v-if="hasMenu"
        :value="state.menuIsVisible && !!visibleOptions.length"
        placement="bottom-end"
        width="300px"
        height="350px"
        @close="state.menuIsVisible = false"
      >
        <template #content>
          <div
            v-for="(option, index) in visibleOptions"
            :key="`${index}-${option.title}`"
          >
            <UiMenuSeparator v-if="option.title === 'divider'" />
            <UiMenuButton
              v-else
              :title="option.title"
              @click="handleSelect(option)"
            />
          </div>
        </template>
      </UiMenu>
    </div>
    <BaseText
      v-if="props.error && props.errorMessage"
      as="div"
      variant="body-small-medium"
      class="errorMessage"
    >
      {{ props.errorMessage }}
    </BaseText>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.preferences-input {
  display: flex;
  flex-direction: column;
  width: 100%;
  --input-padding: 16px;
  --actions-width: 60px;

  &__wrapper {
    width: 100%;
    height: 60px;
    position: relative;
  }

  label {
    color: $color-primary-100;
    display: inline-block;
    margin-bottom: 5px;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .hidden_custom_input_cloaked {
    height: 1px;
    opacity: 0.01;
    padding: 0 !important;
    margin: 0 !important;
    position: absolute;
  }
  input {
    height: 60px;
    width: 100%;
    background: $color-primary-10;
    border: 2px solid $color-primary-10;
    border-radius: 10px;
    padding: 0 var(--input-padding);
    box-shadow: inset 0px 0px 0px 1px var(--inner-border-color);
    color: $color-primary-100;
  }
  .preferences-input__wrapper:focus-within {
    input {
      outline: none;
      --inner-border-color: $color-primary-100;
    }
  }

  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="date"]::-webkit-inner-spin-button {
    display: none;
  }

  &__actions {
    position: absolute;
    right: 0;
    top: 0;
    width: var(--actions-width);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__password-reveal {
    background: none;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;

    svg {
      width: 28px;
      height: 28px;
      color: $color-primary-100;
    }
    &:hover {
      cursor: pointer;
    }
  }

  &__down-chevron {
    background: none;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;

    svg {
      width: 20px;
      height: 20px;
      color: $color-primary-100;
    }
    &:hover {
      cursor: pointer;
    }
  }

  &--has-menu {
    cursor: pointer;
    input {
      cursor: pointer;
    }
  }

  &--has-actions {
    input {
      padding-right: calc(var(--input-padding) + var(--actions-width));
    }
  }

  &--error {
    input {
      outline: none;
      border: 1px solid $color-alert;
      color: $color-alert;
    }

    input {
      &:focus {
        border: 1px solid $color-alert;
      }
    }
    .errorMessage {
      color: $color-alert;
      margin-top: 4px;
      height: 18px;
      position: relative;
      bottom: -4px;
    }
  }

  + .preferences-input {
    margin-top: 13px;
  }
}
</style>
