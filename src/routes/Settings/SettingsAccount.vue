<script setup>
import SettingsChildPage from "./SettingsChildPage.vue";
import Account from "@/routes/modals/preferences/Account.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
</script>
<template>
  <SettingsChildPage class="settings-account-page">
    <template #aside>
      <SettingsTitle>Account</SettingsTitle>
      <SettingsParagraph>Manage your account settings.</SettingsParagraph>
    </template>

    <Account />
  </SettingsChildPage>
</template>
