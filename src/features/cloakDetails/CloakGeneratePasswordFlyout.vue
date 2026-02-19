<script setup>
import CheckButton from "@/features/CheckButton.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";

import InlineSvg from "@/features/InlineSvg.vue";
import { reactive, watch, ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

const emit = defineEmits(["generate", "close"]);

const target = ref(null);

onClickOutside(target, (event) => {
  if (event.layerX > 0) {
    emit("close");
  }
});

const props = defineProps({
  visible: { type: Boolean, default: false },
  value: { type: String, default: "" },
  showGenerateOptions: { type: Boolean, default: false },
});

const state = reactive({
  letters: true,
  numbers: true,
  symbols: true,
  similar: false,
  size: 20,
  words: false,
  disabled: [],
  previousSize: 20,
  strength: 0,
});

const canGeneratePassword = computed(() => {
  return state.letters || state.numbers || state.symbols;
});

function onlyNumbers(event) {
  if (event.key.match(/^[0-9]$/) || event.key === "Backspace") {
    return event;
  }

  event.preventDefault();
}
function setLength(add) {
  const minPasswordLength = state.words ? 3 : 8;

  let pwdLength = parseInt(state.size, 10) + add;

  if (pwdLength < minPasswordLength) {
    pwdLength = minPasswordLength;
  } else if (pwdLength > 128) {
    pwdLength = 128;
  }

  state.size = pwdLength;
}
function handleGenerate() {
  const settings = {
    size: parseInt(state.size, 10),
    letters: state.letters,
    numbers: state.numbers,
    symbols: state.symbols,
    similar: state.similar,
    words: state.words,
  };
  const withinWordMinMax =
    settings.words && settings.size >= 3 && settings.size <= 10;
  const withinLetterMinMax =
    !settings.words && settings.size >= 8 && settings.size <= 128;
  if (withinWordMinMax || withinLetterMinMax) {
    emit("generate", settings);
    emit("close");
  } else {
    // NOTE: min and max sizes match extension
    const minSize = state.words ? 3 : 8;
    const maxSize = state.words ? 10 : 128;
    toast.error(
      `Password ${
        state.words ? "word count" : "length"
      } must be between ${minSize} and ${maxSize}.`
    );
  }
}

watch(
  () => props.value,
  async (newValue) => {
    if (newValue) {
      const { default: zxcvbn } = await import(
        /* webpackChunkName: "zxcvbn" */ "zxcvbn"
      );
      const calc = zxcvbn(newValue);
      state.strength = calc.score;
      return;
    }

    state.strength = 0;
  },
  { deep: true }
);
watch(
  () => state.words,
  (newValue) => {
    if (newValue) {
      state.numbers = false;
      state.disabled = ["letters", "numbers"];
      state.previousSize = state.size;
      state.size = 3;
    } else {
      state.disabled = [];
      state.size = state.previousSize;
    }
  },
  { deep: true }
);
</script>

<template>
  <UiMenu
    v-if="props.visible"
    ref="target"
    :value="props.visible"
    placement="left-start"
    width="250px"
    class="cloak-generate-password-flyout"
  >
    <template #content>
      <template v-if="props.showGenerateOptions">
        <UiMenuButton
          aria-id="ToggleLettersPassword"
          title="Letters (e.g. Aa)"
          :disabled="state.disabled.includes('letters')"
          @click="state.letters = !state.letters"
        >
          <template #icon>
            <CheckButton
              :value="state.letters"
              :disabled="state.disabled.includes('letters')"
              @input="(event) => (state.letters = event)"
            />
          </template>
        </UiMenuButton>

        <UiMenuButton
          aria-id="ToggleDigitsPassword"
          title="Digits (e.g. 123)"
          :disabled="state.disabled.includes('numbers')"
          @click="state.numbers = !state.numbers"
        >
          <template #icon>
            <CheckButton
              :value="state.numbers"
              :disabled="state.disabled.includes('numbers')"
              @input="(event) => (state.numbers = event)"
            />
          </template>
        </UiMenuButton>

        <UiMenuButton
          aria-id="ToggleSymbolsPassword"
          title="Symbols (!*$?#)"
          @click="state.symbols = !state.symbols"
        >
          <template #icon>
            <CheckButton
              :value="state.symbols"
              :disabled="state.disabled.includes('symbols')"
              @input="(event) => (state.symbols = event)"
            />
          </template>
        </UiMenuButton>

        <UiMenuButton
          aria-id="ToggleEasyToRememberPassword"
          title="Easy to remember"
          @click="state.words = !state.words"
        >
          <template #icon>
            <CheckButton
              :value="state.words"
              :disabled="state.disabled.includes('words')"
              @input="(event) => (state.words = event)"
            />
          </template>
        </UiMenuButton>

        <UiMenuSeparator />

        <div class="password-length">
          <div class="password-length__label">
            <span>
              {{ state.words ? "Word Count" : "Length" }}
            </span>
          </div>

          <div
            class="password-length__controls"
            @click.stop="() => {}"
          >
            <button
              class="password-length__button"
              @click="setLength(-1)"
            >
              <InlineSvg
                name="minus"
                style="display: inline-block; vertical-align: middle"
              />
            </button>

            <input
              v-model="state.size"
              aria-id="PasswordLengthInput"
              type="text"
              min="8"
              max="128"
              maxlength="3"
              @keydown="onlyNumbers"
            />

            <button
              class="password-length__button"
              @click="setLength(1)"
            >
              <InlineSvg
                name="plus"
                style="display: inline-block; vertical-align: middle"
              />
            </button>
          </div>
        </div>

        <UiMenuSeparator />

        <UiMenuButton
          aria-id="GenerateNewPasswordButton"
          title="Generate new password"
          :disabled="!canGeneratePassword"
          @click.stop.prevent="handleGenerate"
          @click="handleGenerate"
        >
          <template #icon>
            <InlineSvg
              name="generate"
              style="width: auto; height: auto"
            />
          </template>
        </UiMenuButton>
      </template>
    </template>
  </UiMenu>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.cloak-generate-password-flyout {
  position: absolute;
  inset: 0;

  .popper__activator {
    position: absolute;
    inset: 0;
    cursor: pointer;
  }

  .strength-menu-title {
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-70;
    margin: 0;
    padding: 6px 10px 0;
  }

  .strength-meter {
    font-size: 12px;
    padding: 0 10px 4px;

    --progress-length: 0%;

    &__progress {
      height: 6px;
      width: 100%;
      background: $color-primary-20;
      border-radius: 2px;
      position: relative;
      overflow: hidden;

      &::after {
        display: block;
        content: "";
        top: 0;
        left: 0;
        width: var(--progress-length);
        height: 100%;
        background-color: $color-alert;
        transition: all 0.2s ease-in-out;
      }
    }

    &__message {
      font-weight: 500;
      font-size: 10px;
      line-height: 15px;
      color: $color-primary-100;
      margin-top: 6px;
    }

    &--none {
      --progress-length: 0%;
    }

    &--low {
      --progress-length: 20%;

      .strength-meter__progress {
        &::after {
          background-color: $color-alert;
        }
      }
    }

    &--medium {
      --progress-length: 70%;

      .strength-meter__progress {
        &::after {
          background-color: $color-warning;
        }
      }
    }

    &--high {
      --progress-length: 100%;

      .strength-meter__progress {
        &::after {
          background-color: $color-success;
        }
      }
    }
  }
}

.password-length {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  align-items: center;

  &__label {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    background-color: transparent;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;

    input {
      width: 36px;
      height: 24px;
      text-align: center;
      border: 1px solid $color-primary-10;
      border-radius: 2px;
      font-weight: 600;
      font-size: 12px;
      line-height: 18px;
      color: $color-primary-100;
      background-color: transparent;

      &:focus {
        outline: none;
        border-color: $color-primary-100;
      }
    }
  }
}

.password-length__button {
  display: inline-block;
  visibility: middle;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border: none;
  padding: 0;
  color: $color-primary-100;
  background-color: transparent;

  &:hover {
    cursor: pointer;
  }
}
</style>
