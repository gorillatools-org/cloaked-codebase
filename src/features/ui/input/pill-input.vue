<script setup>
import RemoveIcon from "@/assets/icons/remove.svg";
import { phone, formatMultiplePillEntries } from "@/scripts/validation";
import { formatPhoneStringBasic, formatPhone } from "@/scripts/format";
import { nextTick, reactive, ref, watch } from "vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  filter: {
    type: Function,
    default: null,
  },
  defaultValue: {
    type: Array,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const state = reactive({
  disabled: false,
  pills: props.defaultValue ? props.defaultValue : [],
  value: "",
});

const emit = defineEmits(["value"]);

const input = ref(null);

watch(
  () => state.pills,
  (value) => {
    if (!state.disabled) {
      state.value = "";
      emit("value", value);
    }
  },
  { deep: true }
);

const formatValue = (item) => {
  if (phone(item)) {
    return formatPhone(item);
  }
  return item;
};

const selectInput = () => {
  if (input.value) {
    input.value.focus();
  }
};

const remove = (k) => {
  state.pills = [...state.pills].filter((a, b) => b !== k);
};
const setValue = (value) => {
  state.pills = value;
};

const onblur = () => {
  if (state.value.trim()) {
    let value = state.value.trim();
    /* if incoming emails or phone numbers are copy/pasted without commas or spaces */
    value = formatMultiplePillEntries(value);
    if (typeof value === "object") {
      value.forEach((item) => {
        if (phone(item)) {
          item = formatPhoneStringBasic(item);
        }
        state.pills = [
          ...state.pills,
          {
            value: item,
            status: props.filter ? props.filter(item) : true,
          },
        ];
      });
    } else {
      if (phone(value)) {
        value = formatPhoneStringBasic(value);
      }
      state.pills = [
        ...state.pills,
        {
          value: value,
          status: props.filter ? props.filter(value) : true,
        },
      ];
    }
  }
};

const recalculate = () => {
  state.disabled = true;
  nextTick(() => {
    state.pills = [...state.pills].map((item) => ({
      value: item.value,
      status: props.filter ? props.filter(item.value) : true,
    }));
    nextTick(() => {
      state.disabled = false;
    });
  });
};

const onkey = (event) => {
  if (
    event.key.toLowerCase().match(/[\s\b,]/) ||
    event.key.toLowerCase() === "enter" ||
    event.key.toLowerCase() === "tab"
  ) {
    if (state.value.trim().length > 0) {
      let value = state.value.trim();
      /* if incoming emails or phone numbers are copy/pasted without commas or spaces */
      value = formatMultiplePillEntries(value);
      if (typeof value === "object") {
        value.forEach((item) => {
          if (phone(item)) {
            item = formatPhoneStringBasic(item);
          }
          state.pills = [
            ...state.pills,
            {
              value: item,
              status: props.filter ? props.filter(item) : true,
            },
          ];
        });
      } else {
        if (phone(value)) {
          value = formatPhoneStringBasic(value);
        }
        state.pills = [
          ...state.pills,
          {
            value: value,
            status: props.filter ? props.filter(value) : true,
          },
        ];
      }
      event.preventDefault();
    }
  }
  if (event.key.toLowerCase() === "backspace") {
    if (state.value.length === 0) {
      const copy = [...state.pills];
      copy.pop();
      state.pills = copy.map((value) => ({
        ...value,
        status: props.filter ? props.filter(value) : true,
      }));
    }
  }
};

defineExpose({
  setValue,
  recalculate,
  selectInput,
});
</script>
<template>
  <div
    class="pill-input"
    @click="selectInput"
  >
    <div
      v-if="state.pills.length"
      class="pill-display"
    >
      <div
        v-for="(pill, k) in state.pills"
        :key="k"
        class="pill"
        :class="{ pill_error: !pill.status }"
        :aria-id="`Pill-${pill?.value || ''}`"
      >
        <BaseText variant="body-small-medium">
          {{ formatValue(pill.display) || formatValue(pill.value) }}
        </BaseText>
        <button @click="remove(k)">
          <RemoveIcon />
        </button>
      </div>
      <div class="actual">
        <BaseText
          variant="body-2-semibold"
          as="div"
        >
          {{ state.value }}
        </BaseText>
        <div class="border" />
      </div>
    </div>
    <input
      ref="input"
      type="text"
      tabindex="0"
      :placeholder="state.pills.length ? '' : 'Enter any phone number or email'"
      :value="state.value"
      :class="{ hidden: state.pills.length }"
      @input="(event) => (state.value = event.target.value)"
      @keydown="onkey"
      @blur="onblur"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.pill-input {
  overflow: hidden;
  width: 100%;
  background-color: transparent;
  border-radius: 8px;
  padding: 3px 7px;
  min-height: 36px;
  border: none;
  color: $color-primary-100;
  display: flex;
  align-items: center;
  cursor: text;

  .pill-display {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;

    .pill {
      background-color: $color-primary-10;

      &:hover {
        svg {
          cursor: pointer;
        }
      }

      padding: 3px 5px 3px 10px;
      color: $color-primary-100;
      border-radius: 999px;
      display: flex;
      gap: 5px;
      align-items: center;

      &.pill_error {
        background-color: $color-alert;
        color: $color-primary-1;

        svg {
          path {
            fill: #fff !important;
          }

          fill: #fff !important;
        }
      }

      button {
        background-color: transparent;
        border: none;
        display: inline-block;
        text-transform: uppercase;
        height: 14px;
        width: 14px;
        margin-right: 8px;
        margin-bottom: 1px;
        text-align: center;
        cursor: pointer;
        z-index: 1;
      }
    }
  }

  input {
    position: absolute;
    color: $color-primary-100;
    outline: none;
    border: none;
    background-color: transparent;
    width: calc(100% - 60px);
    align-self: center;

    &.hidden {
      color: transparent;
      caret-color: transparent;
    }
  }

  .actual {
    position: relative;
    left: -4px;
    padding: 3px 2px;
    min-width: 2px;
    height: 100%;
    display: flex;
    align-items: center;

    .border {
      position: relative;
      top: 2px;
      left: 2px;
      height: 17px;
      width: 1px;
      background-color: transparent;
    }
  }

  &:focus-within {
    .actual {
      .border {
        animation-name: blinking;
        animation-duration: 1s;
        animation-iteration-count: infinite;
      }
    }
  }
}

@keyframes blinking {
  50% {
    background-color: $color-primary-100;
  }
}
</style>
