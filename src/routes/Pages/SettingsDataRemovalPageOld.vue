<script setup>
import SettingsChildPage from "@/routes/Settings/SettingsChildPage.vue";
import SettingsDataRemovalNameForm from "@/features/Settings/SettingsDataRemovalNameForm.vue";
import SettingsDataRemovalAddressForm from "@/features/Settings/SettingsDataRemovalAddressForm.vue";
import SettingsDataRemovalPhoneForm from "@/features/Settings/SettingsDataRemovalPhoneForm.vue";
import SettingsDataRemovalEmailForm from "@/features/Settings/SettingsDataRemovalEmailForm.vue";
import SettingsDataRemovalBirthYearForm from "@/features/Settings/SettingsDataRemovalBirthYearForm.vue";
import store from "@/store";
import DataDeleteService from "@/api/actions/data-delete-service.js";

import { onMounted, ref } from "vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
import DataDeleteUpgradeInvite from "@/features/data-delete/DataDeleteUpgradeInvite.vue";

const fullProfile = ref(store.getters["dataDelete/getEnrollmentProfile"]);

onMounted(() => {
  if (fullProfile.value === null) {
    DataDeleteService.getEnrollmentProfile().then(() => {
      fullProfile.value = store.getters["dataDelete/getEnrollmentProfile"];
    });
  }
});

function removeData(fieldType, index) {
  if (fieldType === "name") {
    if (index === 0) {
      fullProfile.value.name = fullProfile.value.other_names[0];
      fullProfile.value.other_names = fullProfile.value.other_names.slice(1);
    } else {
      // comparing to index-1 because first index in names display is fullProfile.value.name
      fullProfile.value.other_names = fullProfile.value.other_names.filter(
        (_, idx) => idx !== index - 1
      );
    }
    return handleSave();
  }
  fullProfile.value[fieldType] = fullProfile.value[fieldType].filter(
    (_, idx) => idx !== index
  );
  return handleSave();
}

function handleSave() {
  DataDeleteService.updateEnrollmentProfile(fullProfile.value);
}

function showConfirmationModal({ field, index, data, isFinalItem }) {
  if (isFinalItem) {
    if (field === "addresses") {
      field = "address";
    }
    if (field === "email_addresses") {
      field = "email";
    }
    if (field === "phone_numbers") {
      field = "phone";
    }
    return store.dispatch("openModal", {
      header: `At least one ${field} is required`,
      subheader: `Please add another ${field} before deleting this one.`,
    });
  }

  return store.dispatch("openModal", {
    header: `Delete "${data}"`,
    subheader:
      "By removing this item, Cloaked will stop scanning for it in the next scan.",
    button: {
      text: "Yes, delete",
      onClick: () => removeData(field, index),
    },
  });
}
</script>
<template>
  <SettingsChildPage>
    <template #aside>
      <DataDeleteUpgradeInvite />
      <SettingsTitle>Data Removal</SettingsTitle>
      <SettingsParagraph>
        Changes made here will take place on the next data removal scan, which
        occur every 30 days.
      </SettingsParagraph>
    </template>

    <div class="form-page-wrapper">
      <SettingsDataRemovalNameForm
        :fullProfile="fullProfile"
        @showConfirmationModal="showConfirmationModal"
        @updateProfile="fullProfile = $event"
      />
      <SettingsDataRemovalBirthYearForm
        :fullProfile="fullProfile"
        @updateProfile="fullProfile = $event"
      />
      <SettingsDataRemovalAddressForm
        :fullProfile="fullProfile"
        @showConfirmationModal="showConfirmationModal"
        @updateProfile="fullProfile = $event"
      />
      <SettingsDataRemovalPhoneForm
        :fullProfile="fullProfile"
        @showConfirmationModal="showConfirmationModal"
        @updateProfile="fullProfile = $event"
      />
      <SettingsDataRemovalEmailForm
        :fullProfile="fullProfile"
        @showConfirmationModal="showConfirmationModal"
        @updateProfile="fullProfile = $event"
      />
    </div>
  </SettingsChildPage>
</template>
<style scoped lang="scss">
.form-page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
  margin-top: 16px;
}
</style>
