<script setup>
import { computed, ref, watch } from "vue";
import { debounce } from "lodash-es";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { useGooglePlaces } from "@/composables/useGooglePlaces.js";
import { displayAddress } from "@/features/enrollment/composables.js";

const emit = defineEmits(["click-action"]);

const model = defineModel({ type: String });

const isFocused = ref(false);

const { addresses, fetchAddresses, clearAddresses } = useGooglePlaces();

const isAwaitingSearch = ref(false);
const hasCompletedSearch = ref(false);

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
}, 500);

watch(model, () => {
  if (model.value.length >= 5) {
    awaitSearchDebounced();
    fetchAddressesDebounced();
  }
});

const isDropdownOpen = computed(
  () => isFocused.value && (hasCompletedSearch.value || isAwaitingSearch.value)
);

const focusedItem = ref(-1);

const onDown = () => {
  focusedItem.value =
    focusedItem.value < addresses.value.length - 1 ? focusedItem.value + 1 : 0;
};

const onUp = () => {
  focusedItem.value =
    focusedItem.value > 0 ? focusedItem.value - 1 : addresses.value.length - 1;
};

const onEnter = () => {
  const focusedAddress = addresses.value[focusedItem.value];
  focusedAddress && onAdd(focusedAddress);
};

const onAdd = (address) => {
  emit("click-action", address);
  model.value = "";
  hasCompletedSearch.value = false;
  clearAddresses();
};
</script>

<template>
  <BaseInput
    v-model="model"
    class="enrollment-address-input"
    @focus="isFocused = true"
    @blur="
      isFocused = false;
      focusedItem = -1;
    "
    @keydown.down.prevent="onDown"
    @keydown.up.prevent="onUp"
    @keydown.enter="onEnter"
  >
    <template #after="{ error }">
      <div
        v-if="error || isDropdownOpen"
        class="enrollment-address-input__after"
      >
        <div
          v-if="isDropdownOpen"
          class="enrollment-address-input__results"
        >
          <BaseText
            v-if="isAwaitingSearch"
            class="enrollment-address-input__results-item"
            variant="body-3-semibold"
          >
            <InlineSvg
              name="spinner"
              class="enrollment-address-input__results-icon"
            />
            Searching addresses...
          </BaseText>
          <BaseText
            v-if="hasCompletedSearch && !addresses.length"
            class="enrollment-address-input__results-item"
            variant="body-3-semibold"
          >
            <BaseIcon
              name="close"
              class="enrollment-address-input__results-icon"
            />
            No results found, try being more specific
          </BaseText>
          <BaseText
            v-for="(addressResult, index) in addresses"
            v-else
            :key="index"
            variant="body-3-semibold"
            class="enrollment-address-input__results-item enrollment-address-input__results-item--interactive"
            :class="{
              'enrollment-address-input__results-item--focused':
                focusedItem === index,
            }"
            @mousedown.prevent="onAdd(addressResult)"
          >
            <BaseIcon
              name="location"
              class="enrollment-address-input__results-icon"
            />
            {{ displayAddress(addressResult) }}
          </BaseText>
        </div>
        <BaseInputFeedback
          v-if="error"
          :message="error"
          variant="error"
        />
      </div>
    </template>
  </BaseInput>
</template>

<style scoped lang="scss">
.enrollment-address-input {
  &:deep(
      .base-input__input:has(
          ~ .enrollment-address-input__after .enrollment-address-input__results
        )
    ) {
    border-radius: 16px 16px 0 0;

    @media all and (min-width: $screen-md) {
      border-radius: 12px 12px 0 0;
    }
  }

  &__after {
    grid-column: 1/5;
  }

  &__results {
    margin-top: -4px;
    border-radius: 0 0 16px 16px;
    background-color: $color-primary-1;
    color: $color-primary-100;
    border: 1px solid $color-primary-100;
    border-top: 0;
    overflow: hidden;

    @media all and (min-width: $screen-md) {
      border-radius: 0 0 12px 12px;
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
</style>
