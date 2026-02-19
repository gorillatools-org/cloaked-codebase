<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { debounce } from "lodash-es";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { useGooglePlaces } from "@/composables/useGooglePlaces.js";
import { displayAddress } from "@/features/enrollment/composables.js";

defineOptions({ inheritAttrs: false });

export interface AddressAutocomplete {
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Props {
  title: string;
  titleAfter?: string;
  error?: string | null;
  placeholder?: string;
  requiredMark?: boolean;
  clearOnSelect?: boolean;
  countries?: string[];
}

interface Emits {
  (event: "click-action", address: AddressAutocomplete): void;
  (event: "click-title-after"): void;
  (event: "blur"): void;
  (event: "enter"): void;
}

const props = withDefaults(defineProps<Props>(), {
  titleAfter: "",
  error: null,
  placeholder: "",
  requiredMark: false,
  clearOnSelect: false,
  countries: () => ["us", "ca"],
});

const emit = defineEmits<Emits>();

const model = defineModel({ type: String });

const { addresses, fetchAddresses, clearAddresses } = useGooglePlaces(
  props.countries
);
const MIN_SEARCH_LENGTH = 5;
const isFocused = ref(false);
const focusedItem = ref(-1);
const isTyping = ref(false);
const isAwaitingSearch = ref(false);
const hasCompletedSearch = ref(false);

const baseInputRef =
  useTemplateRef<InstanceType<typeof BaseInput>>("baseInputRef");

const isDropdownOpen = computed(
  () =>
    isFocused.value &&
    isTyping.value &&
    model.value &&
    model.value.length >= MIN_SEARCH_LENGTH &&
    (hasCompletedSearch.value || isAwaitingSearch.value)
);

const fetchAddressesDebounced = debounce(async () => {
  try {
    await fetchAddresses(model.value);
  } finally {
    isAwaitingSearch.value = false;
    hasCompletedSearch.value = true;
  }
}, 2500);

const awaitSearchDebounced = debounce(() => {
  isAwaitingSearch.value = true;
  clearAddresses();
}, 300);

const onDown = () => {
  focusedItem.value =
    focusedItem.value < addresses.value.length - 1 ? focusedItem.value + 1 : 0;
};

const onUp = () => {
  focusedItem.value =
    focusedItem.value > 0 ? focusedItem.value - 1 : addresses.value.length - 1;
};

const onEnter = (event: KeyboardEvent) => {
  // If dropdown is open and there's a focused address, select it
  if (isDropdownOpen.value && focusedItem.value >= 0) {
    const focusedAddress = addresses.value[focusedItem.value];
    if (focusedAddress) {
      event.preventDefault();
      onAdd(focusedAddress);
      return;
    }
  }
  // Otherwise, emit enter event to move to next field
  event.preventDefault();
  emit("enter");
};

const onAdd = (address: AddressAutocomplete): void => {
  emit("click-action", address);
  model.value = props.clearOnSelect ? "" : displayAddress(address);
  hasCompletedSearch.value = false;
  focusedItem.value = -1;

  nextTick(() => {
    isTyping.value = false;
    clearAddresses();
  });
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleBlur = () => {
  isFocused.value = false;
  focusedItem.value = -1;
  emit("blur");
};

watch(model, (value, oldValue) => {
  isTyping.value = true;

  if (value === oldValue || !isFocused.value) {
    return;
  }

  if (model.value && model.value.length >= MIN_SEARCH_LENGTH) {
    isFocused.value = true;
    awaitSearchDebounced();
    fetchAddressesDebounced();
  } else {
    clearAddresses();
  }
});

defineExpose({
  focus: () => baseInputRef.value?.focus(),
  get input() {
    return baseInputRef.value?.input;
  },
});
</script>

<template>
  <BaseInput
    ref="baseInputRef"
    v-model="model"
    :title="props.title"
    :error="props.error"
    :placeholder="props.placeholder"
    :required-mark="props.requiredMark"
    class="vc-address-input"
    v-bind="$attrs"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown.down.prevent="onDown"
    @keydown.up.prevent="onUp"
    @keydown.enter="onEnter"
  >
    <template #label-after>
      <span
        v-if="titleAfter"
        class="vc-address-input__label-after"
        @click="emit('click-title-after')"
      >
        {{ titleAfter }}
      </span>
    </template>
    <template #after="{ error: slotError }">
      <div
        v-if="isDropdownOpen"
        class="vc-address-input__after"
      >
        <div
          v-if="isDropdownOpen"
          class="vc-address-input__results vc-address-input__results--absolute"
        >
          <BaseText
            v-if="isAwaitingSearch"
            class="vc-address-input__results-item"
            variant="body-3-semibold"
          >
            <InlineSvg
              name="spinner"
              class="vc-address-input__results-icon"
            />
            Searching addresses...
          </BaseText>
          <BaseText
            v-if="hasCompletedSearch && !isAwaitingSearch && !addresses.length"
            class="vc-address-input__results-item"
            variant="body-3-semibold"
          >
            <BaseIcon
              name="close"
              class="vc-address-input__results-icon"
            />
            No results found, try being more specific
          </BaseText>
          <BaseText
            v-for="(addressResult, index) in addresses"
            v-else
            :key="index"
            variant="body-3-semibold"
            class="vc-address-input__results-item vc-address-input__results-item--interactive"
            :class="{
              'vc-address-input__results-item--focused': focusedItem === index,
            }"
            @mousedown.prevent="onAdd(addressResult)"
          >
            <BaseIcon
              name="location"
              class="vc-address-input__results-icon"
            />
            {{ displayAddress(addressResult) }}
          </BaseText>
        </div>
      </div>
      <transition
        v-else
        name="error-fade"
      >
        <BaseInputFeedback
          v-if="slotError"
          :message="slotError"
          variant="error"
          class="base-input__feedback"
        />
      </transition>
    </template>
    <template
      v-if="$slots.left"
      #left
    >
      <slot name="left" />
    </template>
    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>
  </BaseInput>
</template>

<style scoped lang="scss">
.vc-address-input {
  &__label-after {
    cursor: pointer;
    color: $color-primary-100;

    &:hover {
      text-decoration: underline;
    }
  }

  &:deep(
      .base-input__input:has(
          ~ .vc-address-input__after .vc-address-input__results
        )
    ) {
    border-radius: 16px 16px 0 0;

    @media all and (min-width: $screen-md) {
      border-radius: 12px 12px 0 0;
    }
  }

  &__after {
    grid-column: 1 / -1;
    position: relative;
  }

  &__results {
    margin-top: -4px;
    border-radius: 0 0 16px 16px;
    background-color: $color-primary-1;
    color: $color-primary-100;
    border: 1px solid $color-primary-100;
    border-top: 0;
    max-height: 200px;
    overflow: auto;
    width: 100%;

    @media all and (min-width: $screen-md) {
      border-radius: 0 0 12px 12px;
      max-height: unset;
      overflow: hidden;
    }

    &--absolute {
      position: absolute;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 3;
    }

    &-item {
      display: grid;
      grid-template-columns: 16px 1fr;
      align-items: center;
      padding: 16px;
      gap: 8px;
      border-bottom: 1px solid $color-primary-20;
      color: $color-primary-100;

      @media all and (min-width: $screen-md) {
        padding: 12px 16px;
      }

      &:last-child {
        border-bottom: none;
      }

      &--interactive {
        cursor: pointer;

        &:hover {
          background-color: $color-primary-10;
        }
      }

      &--focused {
        background-color: $color-primary-10;
      }
    }

    &-icon {
      place-self: center;
    }
  }
}

.error-fade-enter-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}

.error-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}

.error-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
  margin-top: 4px;
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
