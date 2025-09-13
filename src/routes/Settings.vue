<script setup>
import SettingsNavigation from "@/features/Settings/SettingsNavigation.vue";
</script>
<template>
  <div class="settings-page">
    <SettingsNavigation />

    <div class="settings-page__children">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.settings-page {
  display: flex;
  height: 100%;
  overflow: hidden;

  &__children {
    flex: 1 1 0;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
