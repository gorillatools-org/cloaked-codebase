<script setup>
import PersonalInfoService from "@/api/settings/personal-services";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

import { onMounted, reactive } from "vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import Button from "@/features/Button.vue";

const emit = defineEmits(["toggleBack"]);

const props = defineProps({
  id: {
    type: Number,
    default: null,
  },
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
});

const state = reactive({
  loading: false,
  firstName: props.firstName,
  lastName: props.lastName,
});

onMounted(() => {
  window.document.title = "Name Preference • Cloaked";
});

async function handleSave() {
  const payload = {
    autofill_first_name: state.firstName || "",
    autofill_last_name: state.lastName || "",
  };

  state.loading = true;

  if (props.id) {
    PersonalInfoService.updateInfo(props.id, payload)
      .then(() => {
        toast.success("Name saved.");
        toggleBack();
        state.loading = false;
      })
      .catch(() => {
        toast.error("Error saving your name.");
        state.loading = false;
      });
  } else {
    PersonalInfoService.createInfo(payload)
      .then(() => {
        toast.success("Name saved.");
        toggleBack();
        state.loading = false;
      })
      .catch(() => {
        toast.error("Error saving your name.");
        state.loading = false;
      });
  }
}

function toggleBack() {
  emit("toggleBack", {
    firstName: state.firstName,
    lastName: state.lastName,
  });
}
</script>

<template>
  <PreferencesPanel>
    <template #header>
      <PreferencesHeader @go-back="emit('toggleBack')" />
    </template>

    <PreferencesInput
      label="First name"
      placeholder="Enter Your First Name"
      tabindex="1"
      :value="state.firstName"
      :max="128"
      @input="(event) => (state.firstName = event)"
      @save="handleSave"
    />

    <PreferencesInput
      label="Last name"
      placeholder="Enter Your Last Name"
      tabindex="2"
      :value="state.lastName"
      :max="128"
      @input="(event) => (state.lastName = event)"
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
