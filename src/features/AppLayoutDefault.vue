<script setup>
import { computed } from "vue";
import store from "@/store";
import NavigationTopBar from "@/features/Navigation/NavigationTopBar.vue";
import NavigationSidebar from "@/features/Navigation/NavigationSidebar.vue";
import NavigationTopBanners from "@/features/Navigation/NavigationTopBannersOld.vue";
import { useDisplay } from "@/composables/useDisplay";
import { useNavigationStore } from "@/pinia/navigation";

const { isMobile } = useDisplay();

const collapse = computed(() => {
  return useNavigationStore().collapse;
});

const isWebviewMode = computed(() => {
  return store.state.ui.webviewMode;
});
</script>

<template>
  <div
    class="app-layout"
    :class="{ 'app-layout--webview': isWebviewMode }"
    role="application"
  >
    <NavigationTopBanners v-if="!isWebviewMode" />
    <NavigationTopBar
      v-if="!isWebviewMode"
      class="app-layout__header"
      role="banner"
      tabindex="-1"
    />
    <div class="app-layout__body">
      <div
        v-if="!isMobile && !isWebviewMode"
        class="app-layout__sidebar"
        :class="{ 'app-layout__sidebar--collapsed': collapse }"
      >
        <NavigationSidebar />
      </div>
      <div
        class="app-layout__content"
        tabindex="-1"
      >
        <main
          class="app-layout__inner"
          role="main"
          tabindex="-1"
        >
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  overflow: hidden;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;

  @media screen and (min-width: $screen-md) {
    min-height: unset;
    height: 100dvh;
  }

  &__header {
    flex-shrink: 0;
  }

  &__body {
    flex-grow: 1;
    display: flex;
    overflow: hidden;
    gap: 8px;
  }

  &__sidebar {
    overflow: hidden;
    flex: 0 0 240px;

    &--collapsed {
      flex: 0 0 80px;
    }
  }

  &__content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__inner {
    flex-grow: 1;
    overflow: hidden;

    & > * {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
