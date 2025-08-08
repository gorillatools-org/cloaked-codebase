<script setup>
import { computed, ref, markRaw } from "vue";
import store from "@/store";
import { onClickOutside } from "@vueuse/core";
import { posthogCapture } from "@/scripts/posthog.js";
import { HELP_CENTER_BASE_URL, DOWNLOAD_APP_URL } from "@/scripts/constants";
import { isMobileDevice } from "@/scripts/regex";
import { logout } from "@/scripts/actions/auth";

import { useBasicMode } from "@/composables/useBasicMode";
import { useColorScheme } from "@/composables/useColorScheme";
import { useEncryptionGate } from "@/composables/useEncryptionGate";

import NavigationDropdownHeader from "@/features/Navigation/NavigationDropdownHeader.vue";
import NavigationDropdownMenuItem from "@/features/Navigation/NavigationDropdownMenuItem.vue";
import AdvancedModeModal from "@/features/homeV3/AdvancedModeModal.vue";
import IdentityTheftProtectionModal from "@/features/IdentityTheftProtection/IdentityTheftProtectionModal.vue";
import BaseAvatar from "@/library/BaseAvatar.vue";
import BaseText from "@/library/BaseText.vue";

const { isBasicModeEnabled, toggleBasicMode, isBasicModeAccessible } =
  useBasicMode();
const { colorScheme, setColorScheme } = useColorScheme();
const { withEncryptionGate } = useEncryptionGate();

const dropdownOpen = ref(false);
const dropdownRef = ref(null);
const isAdvancedModeModalOpen = ref(false);
const username = computed(() => store.getters["authentication/getUsername"]);

onClickOutside(dropdownRef, () => (dropdownOpen.value = false));

const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value);

const identityTheftProtectionModal = ref(false);

function toggleInsuranceModal() {
  identityTheftProtectionModal.value = !identityTheftProtectionModal.value;
  toggleDropdown();

  if (identityTheftProtectionModal.value) {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(IdentityTheftProtectionModal),
        props: {
          show: true,
        },
        events: {
          close: () => {
            identityTheftProtectionModal.value = false;
            store.dispatch("closeModal");
          },
        },
      },
    });
  } else {
    store.dispatch("closeModal");
  }
}

function toggleDownloadAppModal() {
  if (isMobileDevice) {
    window.open(DOWNLOAD_APP_URL, "_blank");
  } else {
    store.dispatch("toggleMobileAppModal", true);
    dropdownOpen.value = false;
  }
}

function openBasicModeModals() {
  dropdownOpen.value = false;
  if (!isBasicModeEnabled.value) {
    store.dispatch("openModal", {
      header: "Turn off advanced mode?",
      paragraphs: [
        "Everything you do in advanced mode will always be available if you turn it back on, including any Identities you create, emails and messages you send, etc.",
        "For additional help, you can reach out to support@cloaked.com",
      ],
      button: {
        text: "Yes, go back to basic mode",
        onClick: changeBasicMode,
      },
    });
  } else {
    isAdvancedModeModalOpen.value = true;
  }
}

const changeBasicMode = () => {
  toggleBasicMode();
  posthogCapture("users_switch_back_basicmode_cloakedv3");
};

const goToAdvancedMode = () => {
  isAdvancedModeModalOpen.value = false;
  withEncryptionGate(toggleBasicMode, { context: "advanced-mode" });
};

const toggleDarkMode = () => {
  dropdownOpen.value = false;
  setTimeout(
    () => setColorScheme(colorScheme.value === "dark" ? "light" : "dark"),
    100
  );
};
</script>

<template>
  <div
    ref="dropdownRef"
    class="navigation-dropdown"
  >
    <div
      class="navigation-dropdown__button"
      @click="toggleDropdown"
    >
      <BaseText
        as="div"
        variant="body-3-semibold"
        class="navigation-dropdown__button__username"
      >
        {{ username }}
      </BaseText>

      <BaseAvatar
        size="large"
        :username="username"
        class="navigation-dropdown__button__avatar"
      />
    </div>

    <div
      :class="[
        'navigation-dropdown__dropdown',
        { 'navigation-dropdown__dropdown--open': dropdownOpen },
      ]"
    >
      <NavigationDropdownHeader @toggle-dropdown="toggleDropdown" />

      <div class="navigation-dropdown__dropdown__group">
        <NavigationDropdownMenuItem
          :name="isMobileDevice ? 'Subscription' : 'Settings'"
          type="page-link"
          :to="isMobileDevice ? '/settings/subscription' : '/settings'"
          icon="setting"
          @click="toggleDropdown"
        />
        <NavigationDropdownMenuItem
          v-if="!isBasicModeEnabled && !isMobileDevice"
          name="Import passwords"
          type="page-link"
          to="/import"
          icon="key"
          @click="toggleDropdown"
        />
        <NavigationDropdownMenuItem
          name="Invite a friend"
          type="page-link"
          to="/referrals"
          icon="gift"
          @click="toggleDropdown"
        />
        <NavigationDropdownMenuItem
          name="Identity theft protection"
          icon="shield-tick"
          type="page-link"
          @click="toggleInsuranceModal"
        />
      </div>

      <div class="navigation-dropdown__dropdown__group">
        <NavigationDropdownMenuItem
          v-if="!isBasicModeEnabled && !isMobileDevice"
          name="Download extension"
          type="external-link"
          icon="monitor"
          :href="DOWNLOAD_APP_URL"
        />
        <NavigationDropdownMenuItem
          name="Download mobile app"
          type="external-link"
          icon="mobile"
          @click="toggleDownloadAppModal"
        />
      </div>

      <div class="navigation-dropdown__dropdown__group">
        <NavigationDropdownMenuItem
          name="Dark mode"
          icon="moon"
          type="toggle-button"
          :toggle="colorScheme === 'dark'"
          @click="toggleDarkMode"
        />
        <NavigationDropdownMenuItem
          v-if="isBasicModeAccessible && !isMobileDevice"
          name="Advanced features"
          icon="bolt"
          type="toggle-button"
          :toggle="!isBasicModeEnabled"
          @click="openBasicModeModals"
        />
      </div>

      <div
        class="navigation-dropdown__dropdown__group navigation-dropdown__dropdown__group--no-background"
      >
        <NavigationDropdownMenuItem
          name="Get help or share feedback"
          type="external-link"
          :href="HELP_CENTER_BASE_URL"
          icon="info"
          noBackground
          noRightIcon
        />
        <NavigationDropdownMenuItem
          name="Log out"
          type="page-link"
          icon="power-off"
          noBackground
          noRightIcon
          alert
          @click="logout()"
        />
      </div>
    </div>

    <AdvancedModeModal
      :value="isAdvancedModeModalOpen"
      @close="isAdvancedModeModalOpen = false"
      @goToAdvancedMode="goToAdvancedMode"
    />
  </div>
</template>

<style lang="scss" scoped>
.navigation-dropdown {
  position: relative;
  z-index: 100;
  display: inline-block;

  &__button {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;

    &__avatar {
      position: relative;

      &:after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        @include transform(translate(-50%, -50%));
        width: calc(100% + 8px);
        height: calc(100% + 8px);
        border-radius: 50%;
        background-color: $color-primary-100;
        opacity: 0.15;
        z-index: -1;
      }
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: -8px;
    width: 240px;
    border-radius: 20px;
    background-color: $color-primary-1;
    border: 1px solid $color-primary-20;
    box-shadow: 0px 10px 24px 0px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    @include transition(all 0.2s cubic-bezier(0.4, 0, 0.2, 1));
    @include transform(translateY(-10px));
    padding-bottom: 12px;

    &--open {
      opacity: 1;
      @include transform(translateX(0));
      pointer-events: auto;
      visibility: visible;
    }

    &__group {
      margin: 8px 8px 0 8px;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0px 5px 20px 0px rgba(0, 0, 0, 0.05);

      &--no-background {
        background-color: transparent;
        border: none;
        box-shadow: none;
      }
    }
  }
}
</style>
