<script setup>
import MonitoringDetailHeader from "@/features/monitoring/MonitoringDetailHeader.vue";
import MonitoringDetailHeaderBack from "@/features/monitoring/MonitoringDetailHeaderBack.vue";
import MonitoringDetailHeaderClose from "@/features/monitoring/MonitoringDetailHeaderClose.vue";
import MonitoringDetailFooter from "@/features/monitoring/MonitoringDetailFooter.vue";
import BaseButton from "@/library/BaseButton.vue";
import MonitoringSettingsBasicNames from "@/features/monitoring/MonitoringSettingsBasicNames.vue";
import { ref } from "vue";

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
  <div class="page-monitoring-settings-names">
    <MonitoringDetailHeader>
      <MonitoringDetailHeaderBack to="MonitoringSettings">
        Add Name
      </MonitoringDetailHeaderBack>
      <MonitoringDetailHeaderClose to="MonitoringSettings" />
    </MonitoringDetailHeader>
    <MonitoringSettingsBasicNames
      ref="nameForm"
      v-model:names="names"
      v-model:prefix="prefix"
      v-model:suffix="suffix"
      v-model:first-name="firstName"
      v-model:middle-name="middleName"
      v-model:last-name="lastName"
      class="page-monitoring-settings-names__form"
      @add-name="onAddName"
      @remove-name="onRemoveName"
    />
    <MonitoringDetailFooter>
      <BaseButton
        icon="check"
        size="md"
        full-width
        @click="onAddName"
        @keydown.enter="onAddName"
      >
        Add Name
      </BaseButton>
    </MonitoringDetailFooter>
  </div>
</template>

<style lang="scss" scoped>
.page-monitoring-settings-names {
  display: grid;
  row-gap: 24px;
  position: relative;
  height: 100%;
  grid-template-rows: min-content 1fr;

  &__form {
    margin-top: -18px;
  }
}
</style>
