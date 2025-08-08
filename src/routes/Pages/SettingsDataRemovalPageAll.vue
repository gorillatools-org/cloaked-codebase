<script setup>
import { ref } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import MonitoringSettingsBasic from "@/features/monitoring/MonitoringSettingsBasic.vue";
import MonitoringSettingsPersonal from "@/features/monitoring/MonitoringSettingsPersonal.vue";
import { getFormattedSsnValue } from "@/features/enrollment/utils.js";

defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  ssnSubmitted: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["submit"]);

const names = defineModel("names", { type: Array });
const dateOfBirth = defineModel("dateOfBirth", { type: String });
const phoneNumbers = defineModel("phoneNumbers", { type: Array });
const emailAddresses = defineModel("emailAddresses", { type: Array });
const addresses = defineModel("addresses", { type: Array });
const ssn = defineModel("ssn", {
  type: String,
  get: getFormattedSsnValue,
});

const basicForm = ref(null);
const personalForm = ref(null);

const validateForm = () => {
  const isBasicFormValid = basicForm.value.validateForm();
  const isPersonalFormValid = personalForm.value.validateForm();

  return isBasicFormValid && isPersonalFormValid;
};

defineExpose({ validateForm });
</script>

<template>
  <div class="settings-data-removal-all">
    <div class="settings-data-removal-all__form">
      <MonitoringSettingsBasic
        ref="basicForm"
        v-model:names="names"
        v-model:date-of-birth="dateOfBirth"
        v-model:phone-numbers="phoneNumbers"
        v-model:email-addresses="emailAddresses"
        v-model:addresses="addresses"
        :is-submitting="isSubmitting"
        class="page-monitoring-settings-all__form"
        @add-names="$router.push({ name: 'settings.dataRemoval.names' })"
        @add-addresses="
          $router.push({ name: 'settings.dataRemoval.addresses' })
        "
      />
      <MonitoringSettingsPersonal
        ref="personalForm"
        v-model:ssn="ssn"
        :ssn-submitted="ssnSubmitted"
        :is-submitting="isSubmitting"
      />
      <BaseButton
        icon="check"
        size="md"
        full-width
        :loading="isSubmitting"
        class="settings-data-removal-all__submit"
        @click="$emit('submit')"
        @keydown.enter="$emit('submit')"
      >
        {{ isSubmitting ? "Submitting" : "Submit" }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-data-removal-all {
  max-width: 650px;

  &__form {
    display: grid;
    row-gap: 24px;
    margin-top: 24px;
  }

  &__submit {
    position: sticky;
    bottom: 24px;
  }
}
</style>
