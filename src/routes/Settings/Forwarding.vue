<script setup>
import SettingsChildPage from "@/routes/Settings/SettingsChildPage.vue";
import Forwarding from "@/routes/modals/preferences/Forwarding.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
</script>
<template>
  <SettingsChildPage>
    <template #aside>
      <SettingsTitle>Forwarding</SettingsTitle>
      <SettingsParagraph>
        The following preferences will be used on all new Cloaked identities.
        You can always override these default settings on individual identities.
      </SettingsParagraph>
    </template>

    <Forwarding />
  </SettingsChildPage>
</template>
