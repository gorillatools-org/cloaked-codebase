<script setup>
import PersonalInfoService from "@/api/settings/personal-services";
import moment from "moment";
import { date } from "@/features/cloakDetails/CustomFields/CustomFieldForm/validations";

import { onMounted, reactive } from "vue";
import { useToast } from "@/composables/useToast.js";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import Button from "@/features/Button.vue";

const toast = useToast();

const emit = defineEmits(["toggleBack"]);

const props = defineProps({
  id: {
    type: Number,
    default: null,
  },
  birthday: {
    type: String,
    default: "",
  },
});

const state = reactive({
  value: props.birthday ? moment(props.birthday).format("YYYY-MM-DD") : "",
  error: false,
  errorMessage: "",
  loading: false,
});

onMounted(() => {
  window.document.title = "Birthday Preferences • Cloaked";
});

async function handleSave() {
  state.errorMessage = date(state.value)?.[0] ?? null;
  state.error = !!state.errorMessage;

  if (state.error) {
    return;
  }

  try {
    state.loading = true;

    let payload = {
      autofill_dob: moment(state.value).utc().format(),
    };

    if (props.id) {
      await PersonalInfoService.updateInfo(props.id, payload);
    } else {
      await PersonalInfoService.createInfo(payload);
    }

    toast.success("Birthday saved.");
    emit("toggleBack", {
      info_birthday: state.value,
    });
  } catch {
    toast.error("Error saving your birthday.");
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <PreferencesPanel>
    <template #header>
      <PreferencesHeader @go-back="(event) => emit('toggleBack', event)" />
    </template>

    <PreferencesTitle>Birthday</PreferencesTitle>
    <PreferencesInput
      label="Birthday (YYYY-MM-DD)"
      type="date"
      :value="state.value"
      :error="state.error"
      :error-message="state.errorMessage"
      @input="(event) => (state.value = event)"
      @save="handleSave"
    />

    <PreferencesFooter>
      <Button
        :disabled="state.loading"
        :loading="state.loading"
        @click="handleSave"
      >
        Save changes
      </Button>
    </PreferencesFooter>
  </PreferencesPanel>
</template>
