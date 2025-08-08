<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import CloakedLogo from "@/assets/images/CloakedLogo.svg";
import NavigationDropdown from "@/features/Navigation/NavigationDropdown.vue";
import NavigationAdvancedToggle from "@/features/Navigation/NavigationAdvancedToggle.vue";
import NavigationSearchBar from "@/features/Navigation/NavigationSearchBar.vue";
import { useBasicMode } from "@/composables/useBasicMode";
import { isMobileDevice } from "@/scripts/regex";

const route = useRoute();
const { isBasicModeAccessible, isBasicModeEnabled } = useBasicMode();

const basicModeEnabled = computed(
  () => isBasicModeAccessible.value && isBasicModeEnabled.value
);
const inbox = computed(() => route?.meta?.nav === "inbox");

const showSearchBar = computed(() => {
  const identitySearchPages = ["favorites", "ignored", "all", "category"];
  return identitySearchPages.includes(route.name?.toLowerCase()) || inbox.value;
});
</script>

<template>
  <div class="navigation-top-bar">
    <router-link
      :to="basicModeEnabled ? '/summary' : '/'"
      class="navigation-top-bar__logo"
      tabindex="0"
    >
      <CloakedLogo class="navigation-top-bar__logo-image" />
    </router-link>

    <div
      v-if="!isMobileDevice"
      class="navigation-top-bar__search"
    >
      <NavigationSearchBar
        v-if="showSearchBar"
        class="navigation-top-bar__search-bar"
      />
    </div>

    <div class="navigation-top-bar__actions">
      <NavigationAdvancedToggle
        v-if="isBasicModeAccessible && !isMobileDevice"
      />
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
