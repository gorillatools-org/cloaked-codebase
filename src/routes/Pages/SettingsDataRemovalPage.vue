<script setup>
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import SettingsDataRemovalPageNew from "@/routes/Pages/SettingsDataRemovalPageNew.vue";
import SettingsDataRemovalPageOld from "@/routes/Pages/SettingsDataRemovalPageOld.vue";

const { featureFlag: isIdentityMonitoringEnabled, hasLoadedFeatureFlag } =
  usePostHogFeatureFlag("identity-monitoring-enabled");
</script>

<template>
  <div v-if="hasLoadedFeatureFlag">
    <SettingsDataRemovalPageNew v-if="isIdentityMonitoringEnabled" />
    <SettingsDataRemovalPageOld v-else />
  </div>
</template>
