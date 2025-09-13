<script setup>
import SettingsChildPage from "./SettingsChildPage.vue";
import RecoveryPhrase from "@/features/Settings/RecoveryPhrase";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
</script>
<template>
  <SettingsChildPage class="forwarding-page">
    <template #aside>
      <SettingsTitle>Recovery kit</SettingsTitle>
      <SettingsParagraph>Save your recovery kit</SettingsParagraph>
    </template>

    <RecoveryPhrase />
  </SettingsChildPage>
</template>
