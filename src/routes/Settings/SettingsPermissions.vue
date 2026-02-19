<script setup>
import SettingsChildPage from "./SettingsChildPage.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
import BaseToggle from "@/library/BaseToggle.vue";
import BaseText from "@/library/BaseText.vue";
import store from "@/store";
import { computed } from "vue";
import PersonalServices from "@/api/settings/personal-services";
import { useToast } from "@/composables/useToast.js";

const { toast } = useToast();

const isSessionReplayEnabled = computed(() => {
  return !!store.getters["settings/getPermissions"]
    ?.permission_allow_session_replay;
});

async function handleSessionReplayToggleChange() {
  const newPermissionValue = !isSessionReplayEnabled.value;
  const previousPermissions = store.getters["settings/getPermissions"];
  store.dispatch("settings/savePermissions", {
    ...previousPermissions,
    permission_allow_session_replay: newPermissionValue,
  });
  try {
    await PersonalServices.updateUserProfile({
      permission_allow_session_replay: newPermissionValue,
    });
  } catch {
    // Revert the store state on error
    store.dispatch("settings/savePermissions", previousPermissions);
    // Optionally show an error message to the user
    toast.error("Failed to update permissions. Please try again.");
  }
}
</script>
<template>
  <SettingsChildPage class="settings-account-page">
    <template #aside>
      <SettingsTitle>Permissions</SettingsTitle>
      <SettingsParagraph>Manage your Cloaked permissions.</SettingsParagraph>
    </template>

    <div class="settings-permissions-page">
      <div class="settings-permissions-page__toggle">
        <BaseToggle
          :active="isSessionReplayEnabled"
          class="settings-permissions-page__toggle-toggle"
          @click="handleSessionReplayToggleChange"
        />
        <BaseText variant="body-3-regular">
          Allow Cloaked to share usage data with Sentry to help improve our
          products.
        </BaseText>
      </div>
    </div>
  </SettingsChildPage>
</template>

<style lang="scss" scoped>
.settings-permissions-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;

  &__toggle {
    display: flex;
    align-items: center;
    gap: 12px;

    &-toggle {
      flex-shrink: 0;
    }
  }
}
</style>
