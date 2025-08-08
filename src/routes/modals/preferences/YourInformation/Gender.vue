<script setup>
import PersonalInfoService from "@/api/settings/personal-services";

import { onMounted, reactive } from "vue";
import { useToast } from "@/composables/useToast.js";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesRadio from "@/routes/modals/preferences/PreferencesRadio.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import Button from "@/features/Button.vue";

const toast = useToast();

const emit = defineEmits(["toggleBack"]);

const props = defineProps({
  id: {
    type: Number,
    default: null,
  },
  gender: {
    type: String,
    default: "",
  },
});

const state = reactive({
  value: props.gender,
  loading: false,
});

onMounted(() => {
  window.document.title = "Gender Preference • Cloaked";
});

function toggle_back(data) {
  emit("toggleBack", data);
}

async function handleSave() {
  let payload = {
    autofill_sex: state.value,
  };

  state.loading = true;

  if (props.id) {
    PersonalInfoService.updateInfo(props.id, payload)
      .then(() => {
        emit("toggleBack", {
          gender: state.value,
        });

        toast.success("Gender saved.");
        state.loading = false;
      })
      .catch(() => {
        toast.error("Error saving your gender.");
        state.loading = false;
      });
  } else {
    PersonalInfoService.createInfo(payload)
      .then(() => {
        emit("toggleBack", {
          gender: state.value,
        });
        toast.success("Gender saved.");
        state.loading = false;
      })
      .catch(() => {
        toast.error("Error saving your gender.");
        state.loading = false;
      });
  }
}

function handleUpdate(value) {
  state.value = value;
}
</script>

<template>
  <PreferencesPanel>
    <template #header>
      <PreferencesHeader @go-back="toggle_back" />
    </template>

    <PreferencesTitle>Gender</PreferencesTitle>

    <PreferencesRadio
      label="Female"
      :value="state.value"
      input-value="female"
      group-name="gender"
      :disabled="false"
      @update="handleUpdate"
    />

    <PreferencesRadio
      label="Male"
      :value="state.value"
      input-value="male"
      group-name="gender"
      :disabled="false"
      @update="handleUpdate"
    />

    <PreferencesRadio
      label="Non-binary"
      :value="state.value"
      input-value="non-binary"
      group-name="gender"
      :disabled="false"
      @update="handleUpdate"
    />

    <PreferencesRadio
      label="Prefer not to answer"
      :value="state.value"
      input-value="not specified"
      group-name="gender"
      :disabled="false"
      @update="handleUpdate"
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
