<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { debounce } from "lodash-es";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { useGooglePlaces } from "@/composables/useGooglePlaces.js";
import { displayAddress } from "@/features/enrollment/composables.js";
import { getFormattedAddressValue } from "@/features/enrollment/utils";
import type { EnrollmentAddress } from "@/routes/enrollmentV2/PageExposureStatusEnrollExposures.vue";

const model = defineModel<EnrollmentAddress | null>({ required: true });
const input = ref(model.value ? getFormattedAddressValue(model.value) : "");

const isFocused = ref(false);

const { addresses, fetchAddresses, clearAddresses } = useGooglePlaces();

const isAwaitingSearch = ref(false);
const hasCompletedSearch = ref(false);

const fetchAddressesDebounced = debounce(async () => {
  try {
    await fetchAddresses(input.value);
  } finally {
    isAwaitingSearch.value = false;
    hasCompletedSearch.value = true;
  }
}, 2500);

const awaitSearchDebounced = debounce(() => {
  isAwaitingSearch.value = true;
}, 500);

watch(input, () => {
  if (model.value && input.value === getFormattedAddressValue(model.value)) {
    return;
  }

  if (input.value.length >= 5) {
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
  focusedAddress && onSelect(focusedAddress);
};

const onSelect = (address: EnrollmentAddress) => {
  input.value = getFormattedAddressValue(address);
  model.value = address;
  hasCompletedSearch.value = false;
  clearAddresses();
};
</script>

<template>
  <BaseInput
    v-model="input"
    class="chat-input-address"
    @focus="isFocused = true"
    @blur="
      isFocused = false;
      focusedItem = -1;
    "
    @keydown.down.prevent="onDown"
    @keydown.up.prevent="onUp"
    @keydown.enter.prevent="onEnter"
  >
    <template #after="{ error }">
      <div
        v-if="error || isDropdownOpen"
        class="chat-input-address__after"
      >
        <div
          v-if="isDropdownOpen"
          class="chat-input-address__results"
        >
          <BaseText
            v-if="isAwaitingSearch"
            class="chat-input-address__results-item"
            variant="body-3-semibold"
          >
            <InlineSvg
              name="spinner"
              class="chat-input-address__results-icon"
            />
            Searching addresses...
          </BaseText>
          <BaseText
            v-if="hasCompletedSearch && !addresses.length"
            class="chat-input-address__results-item"
            variant="body-3-semibold"
          >
            <BaseIcon
              name="close"
              class="chat-input-address__results-icon"
            />
            No results found, try being more specific
          </BaseText>
          <BaseText
            v-for="(addressResult, index) in addresses"
            v-else
            :key="index"
            variant="body-3-semibold"
            class="chat-input-address__results-item chat-input-address__results-item--interactive"
            :class="{
              'chat-input-address__results-item--focused':
                focusedItem === index,
            }"
            @mousedown.prevent="onSelect(addressResult)"
          >
            <BaseIcon
              name="location"
              class="chat-input-address__results-icon"
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
.chat-input-address {
  &:deep(
      .base-input__input:has(
          ~ .chat-input-address__after .chat-input-address__results
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
    background-color: $color-base-black-5;
    color: $color-base-black-100;
    border: 1px solid $color-base-black-70;
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
      border: 1px solid $color-base-black-10;
      color: $color-base-black-100;

      @media all and (min-width: $screen-md) {
        padding: 12px 16px;
      }

      &:last-child {
        border-bottom: none;
      }

      &--interactive {
        cursor: pointer;

        &:hover {
          background-color: $color-base-black-10;
        }
      }

      &--focused {
        background-color: $color-base-black-10;
      }
    }

    &-icon {
      place-self: center;
    }
  }
}
</style>
