<script setup>
import { onUnmounted } from "vue";
import store from "@/store";
import SettingsChildPage from "./SettingsChildPage.vue";
import YourInformation from "@/routes/modals/preferences/YourInformation.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";

onUnmounted(() => {
  store.commit("setPreferenceRightPanel", {
    right: null,
  });
  store.commit("setPreferenceStep", {
    step: null,
  });
});
</script>
<template>
  <SettingsChildPage class="personal-information">
    <template #aside>
      <SettingsTitle>Personal information</SettingsTitle>
      <SettingsParagraph>
        Cloaked can save and fill your information for an easier browsing
        experience. Add your autofill information here.
      </SettingsParagraph>
    </template>

    <YourInformation />
  </SettingsChildPage>
</template>
