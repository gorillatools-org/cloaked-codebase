<script setup>
import PersonalInfoService from "@/api/settings/personal-services";
import moment from "moment";
import { useDateOfBirthValidation } from "@/composables/validation/useDateOfBirthValidation";

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
  value: props.birthday ? moment(props.birthday).format("MM-DD-YYYY") : "",
  error: false,
  errorMessage: "",
  loading: false,
});

const {
  error: dateOfBirthError,
  validate: validateDateOfBirth,
  validateDebounced: validateDateOfBirthDebounced,
} = useDateOfBirthValidation(() => state.value, {
  isRequired: true,
});

function formatDobInput(raw) {
  const digits = String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

function onDobInput(newValue) {
  state.value = formatDobInput(newValue);
  validateDateOfBirthDebounced();
}

onMounted(() => {
  window.document.title = "Birthday Preferences • Cloaked";
});

async function handleSave() {
  validateDateOfBirth();
  state.errorMessage = dateOfBirthError.value;
  state.error = !!state.errorMessage;

  if (state.error) {
    return;
  }

  try {
    state.loading = true;

    let payload = {
      // API expects date-only format (YYYY-MM-DD)
      autofill_dob: moment(state.value, "MM-DD-YYYY", true).format(
        "YYYY-MM-DD"
      ),
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
      label="Birthday (MM-DD-YYYY)"
      :value="state.value"
      :error="state.error"
      :error-message="state.errorMessage"
      :max="10"
      :pattern="/[0-9-]/"
      placeholder="MM-DD-YYYY"
      @input="onDobInput"
      @blur="validateDateOfBirth"
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
