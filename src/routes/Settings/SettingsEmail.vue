<script setup>
import SettingsChildPage from "./SettingsChildPage.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
import CustomEmail from "@/routes/modals/preferences/CustomEmail.vue";
</script>
<template>
  <SettingsChildPage class="settings-account-page">
    <template #aside>
      <SettingsTitle>Email</SettingsTitle>
      <SettingsParagraph>Manage your email settings.</SettingsParagraph>
    </template>

    <CustomEmail />
  </SettingsChildPage>
</template>
