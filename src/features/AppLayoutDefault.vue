<script setup>
import { computed } from "vue";
import NavigationTopBar from "@/features/Navigation/NavigationTopBar.vue";
import NavigationSidebar from "@/features/Navigation/NavigationSidebar.vue";
import NavigationTopBanners from "@/features/Navigation/NavigationTopBannersOld.vue";
import { useDisplay } from "@/composables/useDisplay";
import { useNavigationStore } from "@/pinia/navigation";

const { isMobile } = useDisplay();

const collapse = computed(() => {
  return useNavigationStore().collapse;
});
</script>

<template>
  <div
    class="app-layout"
    role="application"
  >
    <NavigationTopBanners />
    <NavigationTopBar
      class="app-layout__header"
      role="banner"
      tabindex="-1"
    />
    <div class="app-layout__body">
      <div
        v-if="!isMobile"
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
  height: 100dvh;
  display: flex;
  flex-direction: column;

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
