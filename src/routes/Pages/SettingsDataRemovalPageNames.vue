<script setup>
import MonitoringSettingsBasicNames from "@/features/monitoring/MonitoringSettingsBasicNames.vue";
import BaseButton from "@/library/BaseButton.vue";
import { ref } from "vue";
import MonitoringDetailHeaderBack from "@/features/monitoring/MonitoringDetailHeaderBack.vue";

const names = defineModel("names", { type: Array });

const prefix = ref("");
const suffix = ref("");
const firstName = ref("");
const middleName = ref("");
const lastName = ref("");

const nameForm = ref(null);

const onAddName = () => {
  const isValid = nameForm.value?.validateForm();

  if (isValid) {
    names.value.push({
      prefix: prefix.value,
      first: firstName.value,
      middle: middleName.value,
      last: lastName.value,
      suffix: suffix.value,
    });

    firstName.value = "";
    middleName.value = "";
    lastName.value = "";
    prefix.value = "";
    suffix.value = "";
  }
};

const onRemoveName = (name) => {
  names.value = names.value.filter(
    (existingName) =>
      existingName.first !== name.first ||
      existingName.last !== name.last ||
      existingName.middle !== name.middle ||
      existingName.prefix !== name.prefix ||
      existingName.suffix !== name.suffix
  );
};
</script>

<template>
  <div class="settings-data-removal-names">
    <MonitoringDetailHeaderBack to="settings.dataRemoval.all">
      Add Name
    </MonitoringDetailHeaderBack>
    <MonitoringSettingsBasicNames
      ref="nameForm"
      v-model:names="names"
      v-model:prefix="prefix"
      v-model:suffix="suffix"
      v-model:first-name="firstName"
      v-model:middle-name="middleName"
      v-model:last-name="lastName"
      class="settings-data-removal-names__form"
      @add-name="onAddName"
      @remove-name="onRemoveName"
    />
    <BaseButton
      icon="check"
      size="md"
      full-width
      @click="onAddName"
      @keydown.enter="onAddName"
    >
      Add Name
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.settings-data-removal-names {
  margin-top: 24px;

  &__form {
    margin-top: 20px;
  }
}
</style>
