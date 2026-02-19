<script setup>
import { ref } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import MonitoringDetailHeader from "@/features/monitoring/MonitoringDetailHeader.vue";
import MonitoringSettingsBasic from "@/features/monitoring/MonitoringSettingsBasic.vue";
import MonitoringDetailHeaderBack from "@/features/monitoring/MonitoringDetailHeaderBack.vue";
import MonitoringSettingsPersonal from "@/features/monitoring/MonitoringSettingsPersonal.vue";
import MonitoringDetailHeaderClose from "@/features/monitoring/MonitoringDetailHeaderClose.vue";
import MonitoringDetailFooter from "@/features/monitoring/MonitoringDetailFooter.vue";
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
  <div class="page-monitoring-settings-all">
    <MonitoringDetailHeader>
      <MonitoringDetailHeaderBack>
        Add More Information
      </MonitoringDetailHeaderBack>
      <MonitoringDetailHeaderClose />
    </MonitoringDetailHeader>
    <MonitoringSettingsBasic
      ref="basicForm"
      v-model:names="names"
      v-model:date-of-birth="dateOfBirth"
      v-model:phone-numbers="phoneNumbers"
      v-model:email-addresses="emailAddresses"
      v-model:addresses="addresses"
      :is-submitting="isSubmitting"
      class="page-monitoring-settings-all__form"
      @add-names="$router.push({ name: 'MonitoringSettingsNames' })"
      @add-addresses="$router.push({ name: 'MonitoringSettingsAddress' })"
    />
    <MonitoringSettingsPersonal
      ref="personalForm"
      v-model:ssn="ssn"
      :ssn-submitted="ssnSubmitted"
      :is-submitting="isSubmitting"
    />
    <MonitoringDetailFooter>
      <BaseButton
        icon="check"
        size="md"
        full-width
        :loading="isSubmitting"
        @click="$emit('submit')"
        @keydown.enter="$emit('submit')"
      >
        {{ isSubmitting ? "Submitting" : "Submit" }}
      </BaseButton>
    </MonitoringDetailFooter>
  </div>
</template>

<style lang="scss" scoped>
.page-monitoring-settings-all {
  display: grid;
  row-gap: 24px;
  position: relative;
  height: 100%;
  grid-template-rows: min-content min-content 1fr;

  &__form {
    margin-top: -18px;
  }
}
</style>
