<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import AtomInput from "@/library/AtomInput.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { computed, ref, watch } from "vue";
import { debounce } from "lodash-es";
import { useGooglePlaces } from "@/composables/useGooglePlaces.js";
import { formatAddressFromObject } from "@/scripts/format.js";
import { displayAddress } from "@/features/enrollment/composables.js";

defineOptions({ inheritAttrs: false });

defineProps({
  error: {
    type: String,
    default: null,
  },
});

const address = defineModel({ type: Object });

const addressDisplay = computed(() =>
  address.value ? formatAddressFromObject(address.value) : null
);

const input = ref("");
const inputField = ref(null);
const isInputFieldFocused = ref(false);

const selectAddress = (result) => {
  address.value = result;
};

const clearAddress = () => {
  address.value = null;

  requestAnimationFrame(() => {
    inputField?.value?.atomInputRef.focus();
  });
};

const reset = () => {
  address.value = null;
  input.value = "";
  hasCompletedSearch.value = false;

  requestAnimationFrame(() => {
    inputField?.value?.atomInputRef.focus();
  });
};

const {
  isFetching: isFetchingAddresses,
  addresses,
  fetchAddresses,
} = useGooglePlaces();

const isAwaitingSearch = ref(false);
const hasCompletedSearch = ref(false);

const fetchAddressesDebounced = debounce(async () => {
  await fetchAddresses(input.value);
  isAwaitingSearch.value = false;
  hasCompletedSearch.value = true;
}, 2500);

const awaitSearchDebounced = debounce(() => {
  isAwaitingSearch.value = true;
}, 500);

watch(input, () => {
  if (input.value.length >= 5 && !address.value) {
    awaitSearchDebounced();
    fetchAddressesDebounced();
  }
});

defineExpose({
  reset,
  inputField,
});
</script>

<template>
  <div class="address-wrapper">
    <AtomInput
      ref="inputField"
      class="form-input capitalize"
      type="text"
      v-bind="$attrs"
      :disabled="!!address"
      :error="!!error"
      :errorMessage="error"
      :value="addressDisplay ?? input"
      @input="input = $event.target.value"
      @focus="isInputFieldFocused = true"
      @blur="isInputFieldFocused = false"
    >
      <template
        v-if="isAwaitingSearch || isFetchingAddresses || address"
        #endIcon
      >
        <button
          v-if="isAwaitingSearch || isFetchingAddresses"
          class="form-input-button"
        >
          <InlineSvg
            name="spinner"
            class="form-input-icon"
          />
        </button>
        <button
          v-else-if="address"
          class="form-input-button"
          @click="clearAddress"
        >
          <InlineSvg
            name="close-outline"
            class="form-input-icon"
          />
        </button>
      </template>
    </AtomInput>
    <div
      v-if="!address && isInputFieldFocused && hasCompletedSearch"
      class="address-result-list"
    >
      <div
        v-if="!addresses.length"
        class="no-results"
      >
        No results found, try being more specific
      </div>
      <div
        v-for="addressResult in addresses"
        :key="addressResult"
        class="address-result"
        @mousedown="selectAddress(addressResult)"
      >
        <BaseIcon
          name="location"
          class="address-result__location"
        />
        {{ displayAddress(addressResult) }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.address-wrapper {
  width: 100%;
}

.form-input {
  &:deep(.atom-input-wrapper--input:has(~ .end-icon)) {
    padding-right: 50px;
  }

  &.capitalize {
    &:deep(.atom-input-wrapper--input) {
      text-transform: capitalize;
    }
  }

  &:deep(.atom-input-wrapper--input) {
    background-color: rgba($white, 0.1) !important;
    border: 1px solid rgba($white, 0.1) !important;

    &::placeholder {
      color: $color-primary-70 !important;
    }

    @at-root .theme-light & {
      border: 1px solid rgba($black, 0.1) !important;
      background-color: rgba($black, 0.1) !important;
    }
  }

  &:deep(.atom-input-wrapper) {
    background-color: rgba($white, 0.1) !important;
    border: 1px solid rgba($white, 0.1) !important;

    .placeholder {
      color: $color-primary-70 !important;
    }

    @at-root .theme-light & {
      border: 1px solid rgba($black, 0.1) !important;
      background-color: rgba($black, 0.1) !important;
    }
  }

  &-guide {
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    opacity: 0.5;
  }

  &-button {
    height: 46px;
    width: 46px;
    margin-right: -10px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.8;

    &:hover {
      opacity: 0.6;
    }
  }

  &-icon {
    color: $color-primary-100;
    width: 18px;
    height: 18px;
  }
}

.address-result-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 5px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba($color-primary-100-dark, 0.2);

  &.error {
    margin-top: -25px;
  }

  .address-result {
    padding: 15px 10px;
    color: $color-primary-100;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    width: 100%;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    cursor: pointer;
    transform: scale(1);
    transition: all 0.3s;
    border-top: 1px solid rgba($black, 0.2);

    &:hover {
      background: rgba($color-primary-100-dark, 0.1);
      transition: all 0.3s;
    }

    &:first-of-type {
      border: none;
    }

    &__location {
      font-size: 16px;
      opacity: 0.4;
    }
  }

  .no-results {
    padding: 15px 16px;
    color: $color-primary-100;
    font-size: 12px;
  }
}
</style>
