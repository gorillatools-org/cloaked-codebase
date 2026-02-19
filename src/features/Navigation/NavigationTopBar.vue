<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import CloakedLogo from "@/assets/icons/cloaked-logo-full.svg";
import NavigationDropdown from "@/features/Navigation/NavigationDropdown.vue";
import NavigationAdvancedToggle from "@/features/Navigation/NavigationAdvancedToggle.vue";
import NavigationSearchBar from "@/features/Navigation/NavigationSearchBar.vue";
import { useBasicMode } from "@/composables/useBasicMode";
import { useDisplay } from "@/composables/useDisplay";
import BaseIcon from "@/library/BaseIcon.vue";
import { useNavigationStore } from "@/pinia/navigation";

const route = useRoute();
const { isBasicModeEnabled } = useBasicMode();
const { isMobile } = useDisplay();
const navigationStore = useNavigationStore();

const basicModeEnabled = computed(() => isBasicModeEnabled.value);
const inbox = computed(() => route?.meta?.nav === "inbox");

const showSearchBar = computed(() => {
  const identitySearchPages = ["favorites", "ignored", "all", "category"];
  return identitySearchPages.includes(route.name?.toLowerCase()) || inbox.value;
});

const collapse = computed(() => {
  return navigationStore.collapse;
});

const toggleCollapse = () => {
  navigationStore.toggleCollapse();
};
</script>

<template>
  <div class="navigation-top-bar">
    <div class="navigation-top-bar__logo-container">
      <router-link
        :to="basicModeEnabled ? '/exposure-status' : '/'"
        class="navigation-top-bar__logo"
        tabindex="0"
      >
        <CloakedLogo class="navigation-top-bar__logo-image" />
      </router-link>

      <div
        class="navigation-top-bar__logo-expand-container"
        role="button"
        :aria-pressed="collapse.toString()"
        :aria-label="
          collapse ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'
        "
        tabindex="0"
        @click="toggleCollapse"
        @keydown.enter="toggleCollapse"
        @keydown.space.prevent="toggleCollapse"
      >
        <BaseIcon
          :name="collapse ? 'expand' : 'collapse'"
          class="navigation-top-bar__logo-expand"
        />
      </div>
    </div>

    <div
      v-if="!isMobile"
      class="navigation-top-bar__search"
    >
      <NavigationSearchBar
        v-if="showSearchBar"
        class="navigation-top-bar__search-bar"
      />
    </div>

    <div class="navigation-top-bar__actions">
      <NavigationAdvancedToggle v-if="!isMobile" />
      <NavigationDropdown />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  min-height: 60px;

  &__logo-container {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__logo-expand-container {
    display: none;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;

    &:hover {
      cursor: pointer;
      background-color: $color-primary-5;
    }

    @media all and (min-width: $screen-lg) {
      display: flex;
    }
  }

  &__logo {
    width: 96px;
    display: flex;
    height: auto;

    &-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 40px;
  }
}
</style>
