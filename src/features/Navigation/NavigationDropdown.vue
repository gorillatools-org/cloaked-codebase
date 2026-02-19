<script setup>
import { computed, ref, markRaw, onMounted } from "vue";
import store from "@/store";
import { onClickOutside } from "@vueuse/core";
import { posthogCapture } from "@/scripts/posthog.js";
import { HELP_CENTER_BASE_URL, DOWNLOAD_APP_URL } from "@/scripts/constants";
import { logout } from "@/scripts/actions/auth";

import { useBasicMode } from "@/composables/useBasicMode";
import { useColorScheme } from "@/composables/useColorScheme";
import { useDisplay } from "@/composables/useDisplay";

import NavigationDropdownHeader from "@/features/Navigation/NavigationDropdownHeader.vue";
import NavigationDropdownMenuItem from "@/features/Navigation/NavigationDropdownMenuItem.vue";
import AdvancedModeModal from "@/features/AdvancedMode/AdvancedModeModal.vue";
import BasicModeModal from "@/features/AdvancedMode/BasicModeModal.vue";
import IdentityTheftProtectionModal from "@/features/IdentityTheftProtection/IdentityTheftProtectionModal.vue";
import ShareFeedbackModal from "@/features/feedback/ShareFeedbackModal.vue";
import BaseAvatar from "@/library/BaseAvatar.vue";
import BaseText from "@/library/BaseText.vue";

const { isBasicModeEnabled } = useBasicMode();
const { colorScheme, setColorScheme } = useColorScheme();
const { isMobile } = useDisplay();

const dropdownOpen = ref(false);
const dropdownRef = ref(null);
const isAdvancedModeModalOpen = ref(false);
const isBasicModeModalOpen = ref(false);
const username = computed(() => store.getters["authentication/getUsername"]);

onClickOutside(dropdownRef, () => (dropdownOpen.value = false));

const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value);

const identityTheftProtectionModal = ref(false);
const shareFeedbackModal = ref(false);
const isSentryAvailable = ref(false);

const checkSentryAvailability = () => {
  const isBrave =
    !!(navigator.brave && navigator.brave.isBrave) ||
    navigator.userAgent.includes("Brave");

  if (isBrave) {
    isSentryAvailable.value = false;
  } else {
    isSentryAvailable.value = true;
  }
};

onMounted(() => {
  checkSentryAvailability();
});

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

function toggleShareFeedbackModal() {
  shareFeedbackModal.value = !shareFeedbackModal.value;
  toggleDropdown();

  if (shareFeedbackModal.value) {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(ShareFeedbackModal),
        props: {
          show: true,
          isReportMode: false,
        },
        events: {
          close: () => {
            shareFeedbackModal.value = false;
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
  if (isMobile.value) {
    window.open(DOWNLOAD_APP_URL, "_blank");
  } else {
    store.dispatch("toggleMobileAppModal", true);
    dropdownOpen.value = false;
  }
}

function openBasicModeModals() {
  dropdownOpen.value = false;
  if (!isBasicModeEnabled.value) {
    // Use the new BasicModeModal instead of generic modal
    isBasicModeModalOpen.value = true;
  } else {
    // Analytics will be handled by the modal when user clicks "Try Advanced"
    isAdvancedModeModalOpen.value = true;
  }
}

const goToAdvancedMode = () => {
  // Modal handles its own closing and mode switching now
  // This is just for cleanup in case modal doesn't close itself
  isAdvancedModeModalOpen.value = false;
};

const goToBasicMode = () => {
  // Modal handles its own closing and mode switching now
  // This is just for cleanup in case modal doesn't close itself
  isBasicModeModalOpen.value = false;
};

const closeBasicModeModal = () => {
  isBasicModeModalOpen.value = false;
  posthogCapture("dashboard_user_closes_basic_mode_modal");
};

const toggleDarkMode = () => {
  dropdownOpen.value = false;
  setTimeout(
    () => setColorScheme(colorScheme.value === "dark" ? "light" : "dark"),
    100
  );
};

async function onClickLogout() {
  try {
    await Promise.race([
      posthogCapture("user_clicked_dashboard_logout"),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  } catch {
    // Prevent analytics failures from blocking logout
  }
  logout();
}
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
          :name="isMobile ? 'Subscription' : 'Settings'"
          type="page-link"
          :to="isMobile ? '/settings/subscription' : '/settings'"
          icon="setting"
          @click="toggleDropdown"
        />
        <NavigationDropdownMenuItem
          v-if="!isBasicModeEnabled && !isMobile"
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
          v-if="!isBasicModeEnabled && !isMobile"
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
          v-if="!isMobile"
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
          name="Get help"
          type="external-link"
          :href="HELP_CENTER_BASE_URL"
          icon="help"
          no-background
          no-right-icon
        />
        <NavigationDropdownMenuItem
          v-if="isSentryAvailable"
          name="Share feedback"
          type="page-link"
          icon="text"
          no-background
          no-right-icon
          @click="toggleShareFeedbackModal"
        />
        <NavigationDropdownMenuItem
          name="Log out"
          type="page-link"
          icon="power-off"
          no-background
          no-right-icon
          alert
          @click="onClickLogout()"
        />
      </div>
    </div>

    <AdvancedModeModal
      v-model="isAdvancedModeModalOpen"
      @go-to-advanced-mode="goToAdvancedMode"
    />

    <BasicModeModal
      v-model="isBasicModeModalOpen"
      @close="closeBasicModeModal"
      @go-to-basic-mode="goToBasicMode"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.navigation-dropdown {
  position: relative;
  z-index: 450;
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
    z-index: 450;
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
