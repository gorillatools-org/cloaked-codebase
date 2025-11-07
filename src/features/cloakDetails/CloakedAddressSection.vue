<script setup>
import { computed, reactive, ref, onMounted } from "vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import CloakDetailsInputRow from "@/features/cloakDetails/CloakDetailsInputRow.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import AddressService from "@/api/actions/address-service.js";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

const props = defineProps({
  cloak: { type: Object, default: null },
  readOnly: { type: Boolean, default: false },
});

const state = reactive({
  loading: false,
  loadingMessage: "",
  selectedAddress: "",
  isMenuOpen: false,
  isActionMenuOpen: false,
  copied: false,
  availableAddresses: [],
  fetchingAddresses: false,
});

const componentElement = ref(null);

const address = computed(
  () => state.selectedAddress || props.cloak?.address || ""
);

const hasAddress = computed(() => {
  return !!address.value;
});

function formatAddressForDisplay(addressObj, multiline = false) {
  if (typeof addressObj === "string") {
    return addressObj;
  }

  const parts = [
    addressObj.street_1,
    addressObj.street_2,
    addressObj.unit,
    addressObj.city,
    addressObj.state,
    addressObj.postal_code,
    addressObj.country || addressObj.country_code,
  ];

  const filteredParts = parts.filter((part) => part && part.trim() !== "");

  if (multiline) {
    // For multiline display, group logical address components
    const lines = [];

    // Line 1: Street address (street_1 and unit only)
    const streetParts = [addressObj.street_1, addressObj.unit].filter(
      (part) => part && part.trim() !== ""
    );
    if (streetParts.length > 0) {
      lines.push(streetParts.join(", "));
    }

    // Line 2: Street_2 by itself (if exists)
    if (addressObj.street_2 && addressObj.street_2.trim() !== "") {
      lines.push(addressObj.street_2);
    }

    // Line 3: City, State, Postal Code, Country
    const locationParts = [
      addressObj.city,
      addressObj.state,
      addressObj.postal_code,
      addressObj.country || addressObj.country_code,
    ].filter((part) => part && part.trim() !== "");
    if (locationParts.length > 0) {
      lines.push(locationParts.join(", "));
    }

    return lines.join("\n");
  }

  return filteredParts.join(", ");
}

async function selectAddress(selectedAddressItem) {
  if (!props.cloak?.id) {
    toast.error("No cloak ID available");
    return;
  }

  try {
    state.loading = true;
    state.loadingMessage = "Setting address...";

    const mailboxId = selectedAddressItem.id;

    const response = await AddressService.setAddressForIdentity(
      mailboxId,
      props.cloak.id.toString()
    );

    if (response && response.data) {
      // Use the address from the response
      state.selectedAddress = formatAddressForDisplay(response.data, true);
    } else {
      // Fallback to the selected address if response doesn't have address
      const addressObj = selectedAddressItem.address || selectedAddressItem;
      state.selectedAddress = formatAddressForDisplay(addressObj, true);
    }

    state.isMenuOpen = false;
  } catch {
    state.selectedAddress = "";
    toast.error("Failed to set address for identity. Please try again.");
    state.isMenuOpen = false;
  } finally {
    state.loading = false;
    state.loadingMessage = "";
  }
}

async function removeAddress() {
  if (!props.cloak?.id) {
    return;
  }

  try {
    state.loading = true;
    state.loadingMessage = "Removing address...";

    await AddressService.deleteAddressForIdentity(props.cloak.id.toString());

    state.selectedAddress = "";
    state.isMenuOpen = false;
    state.isActionMenuOpen = false;

    await fetchAvailableAddresses();
  } catch {
    toast.error("Failed to delete address. Please try again.");
  } finally {
    state.loading = false;
    state.loadingMessage = "";
  }
}

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(address.value);
    state.copied = true;
    state.isActionMenuOpen = false;
    setTimeout(() => {
      state.copied = false;
    }, 2000);
  } catch {
    toast.error("Failed to copy address to clipboard.");
  } finally {
    state.isActionMenuOpen = false;
  }
}

function handleAddressClick() {
  if (hasAddress.value) {
    state.isActionMenuOpen = !state.isActionMenuOpen;
  }
}

async function fetchAvailableAddresses() {
  state.fetchingAddresses = true;
  try {
    const response = await AddressService.getAvailableAddresses();
    state.availableAddresses = response.data || [];
  } catch {
    toast.error("Failed to fetch available addresses.");
    state.availableAddresses = [];
  } finally {
    state.fetchingAddresses = false;
  }
}

async function checkExistingIdentityAddress() {
  if (!props.cloak?.id) {
    return false;
  }

  try {
    const response = await AddressService.getAddressForIdentity(
      props.cloak.id.toString()
    );

    if (response && response.data) {
      // Set the existing address as selected, formatted for multiline display
      state.selectedAddress = formatAddressForDisplay(response.data, true);
      return true; // Address exists
    }
    return false; // No address found
  } catch {
    toast.error("Failed to check existing identity address");
    return false;
  }
}

onMounted(async () => {
  const hasExistingAddress = await checkExistingIdentityAddress();
  if (!hasExistingAddress) {
    fetchAvailableAddresses();
  }
});
</script>

<template>
  <div
    ref="componentElement"
    class="cloaked-address-section"
    :class="{ 'read-only': props.readOnly }"
  >
    <CloakDetailsInputRow
      :value="address"
      label="Address"
      placeholder="Select an address"
      :loading-message="state.loadingMessage"
      :loading="state.loading"
      :is-menu-open="state.isMenuOpen && !hasAddress"
      :tooltip-message="hasAddress ? 'Click for options' : ''"
      :show-copy-tooltip="hasAddress"
      :class="{ 'multiline-address': hasAddress }"
      tabindex="0"
      @click-input-wrapper="handleAddressClick"
    >
      <template #input-before>
        <UiMenu
          v-if="!hasAddress"
          max-height="200px"
          placement="left-start"
          class="cloaked-address-section__menu"
          :has-outside-click-close="false"
          :value="state.isMenuOpen"
          @input="(event) => (state.isMenuOpen = event)"
        >
          <div class="address-menu-activator" />

          <template #content>
            <!-- Available addresses from API -->
            <UiMenuButton
              v-for="apiAddr in state.availableAddresses"
              :key="apiAddr.id"
              :title="formatAddressForDisplay(apiAddr.address)"
              tabindex="0"
              @click="() => selectAddress(apiAddr)"
              @keydown.enter="() => selectAddress(apiAddr)"
              @keydown.space="() => selectAddress(apiAddr)"
            />

            <!-- Show when no addresses available -->
            <UiMenuButton
              v-if="
                state.availableAddresses.length === 0 &&
                !state.fetchingAddresses
              "
              title="No Addresses Available"
              :disabled="true"
              style="font-style: italic; cursor: default"
              tabindex="-1"
            />
          </template>
        </UiMenu>

        <!-- Action Menu for existing addresses -->
        <UiMenu
          v-if="hasAddress"
          width="150px"
          placement="bottom-start"
          class="cloaked-address-section__action-menu"
          :value="state.isActionMenuOpen"
          @input="(event) => (state.isActionMenuOpen = event)"
        >
          <div class="action-menu-activator" />

          <template #content>
            <UiMenuButton
              title="Copy"
              tabindex="0"
              @click="copyAddress"
              @keydown.enter="copyAddress"
              @keydown.space="copyAddress"
            >
              <template #icon>
                <InlineSvg name="copy" />
              </template>
            </UiMenuButton>
            <UiMenuSeparator />
            <UiMenuButton
              title="Delete"
              tabindex="0"
              @click="removeAddress"
              @keydown.enter="removeAddress"
              @keydown.space="removeAddress"
            >
              <template #icon>
                <InlineSvg
                  name="delete-trash"
                  style="width: 16px; height: 16px"
                />
              </template>
            </UiMenuButton>
          </template>
        </UiMenu>
      </template>

      <template #icon>
        <button
          class="cloaked-address-section__icon-button"
          tabindex="-1"
        >
          <InlineSvg
            v-if="props.readOnly"
            name="lock"
          />
          <InlineSvg
            v-else-if="hasAddress"
            name="mailbox"
          />
          <InlineSvg
            v-else
            name="plus"
          />
        </button>
      </template>

      <template #input>
        <button
          id="cloaked-address-button"
          class="address-button"
          :class="{
            'address-button--active': hasAddress,
          }"
        >
          <span>{{ address || "Select an address" }}</span>
        </button>
      </template>
    </CloakDetailsInputRow>
  </div>
</template>

<style lang="scss" scoped>
.read-only {
  pointer-events: none;
}

.cloaked-address-section {
  width: 100%;
  position: relative;

  // Override CloakDetailsInputRow height when multiline
  :deep(.multiline-address) {
    .cloak-details-input-row__input-wrapper {
      min-height: 70px;
      align-items: center;
      padding: 8px 4px 8px 10px;
    }
  }

  // Default state - normal height and centering
  :deep(.cloak-details-input-row__input-wrapper) {
    align-items: center;
    min-height: 48px;
    padding: 0 4px 0 10px;
  }

  &__menu {
    position: absolute;
    inset: 0;
    z-index: 100;

    .popper__activator {
      position: absolute;
      inset: 0;
      cursor: pointer;
    }
  }

  &__action-menu {
    position: absolute;
    inset: 0;
    z-index: 100;

    .popper__activator {
      position: absolute;
      inset: 0;
      cursor: pointer;
    }
  }

  &__icon-button {
    border: none;
    background: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      cursor: pointer;
    }
  }

  .address-button {
    background: none;
    border: none;
    gap: 4px;
    padding: 0;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    display: flex;
    align-items: center;
    overflow: hidden;
    width: 100%;
    color: $color-primary-50;
    height: 100%;

    :deep(svg) {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    :deep(span) {
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      white-space: pre-line;
      word-break: break-word;
    }

    &--active {
      color: $color-primary-100;
    }

    &:hover {
      color: $color-primary-100;
      cursor: pointer;
    }

    &:focus-visible {
      outline: none;
    }
  }

  .ui-menu {
    width: 100%;
    display: flex;
  }
}

.address-menu-activator {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.action-menu-activator {
  position: absolute;
  inset: 0;
  cursor: pointer;
}
</style>
