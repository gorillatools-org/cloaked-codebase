<script setup>
import { ref, watch, nextTick } from "vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import AtomInput from "@/library/AtomInput.vue";
import Button from "@/features/Button.vue";
import SettingsDataRemovalFormWrapper from "@/features/Settings/SettingsDataRemovalFormWrapper.vue";
import BaseText from "@/library/BaseText.vue";
import { useToast } from "@/composables/useToast.js";
const toast = useToast();

const props = defineProps({
  fullProfile: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["updateProfile"]);

const inputFieldBirthYear = ref("");
const birthYearError = ref("");

const CURRENT_YEAR = new Date().getFullYear();

function validateBirthYear(birthYear) {
  if (birthYear < 1900 || CURRENT_YEAR - birthYear < 0) {
    birthYearError.value = "Please enter a valid birth year.";
  } else if (CURRENT_YEAR - birthYear > 0 && CURRENT_YEAR - birthYear <= 13) {
    birthYearError.value =
      "Cloaked isn't intended for use by individuals under 13 years of age. Please reach out to support to continue.";
  } else if (CURRENT_YEAR - birthYear < 18) {
    birthYearError.value =
      "Data deletion enrollment is not supported for users under the age of 18.";
  } else {
    birthYearError.value = "";
  }
}

function saveBirthYear() {
  const fullProfileCopy = { ...props.fullProfile };
  fullProfileCopy.birth_year = inputFieldBirthYear.value;
  DataDeleteService.updateEnrollmentProfile(fullProfileCopy)
    .then(() => {
      emit("updateProfile", fullProfileCopy);
      toast.success("Birth year saved");
    })
    .catch(() => {
      toast.error("Failed to save birth year");
    });
}

const unwatchBirthYear = watch(
  () => props.fullProfile,
  (newValue) => {
    if (newValue?.birth_year) {
      inputFieldBirthYear.value = newValue?.birth_year;
      nextTick(() => unwatchBirthYear());
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => inputFieldBirthYear.value,
  (newValue) => {
    validateBirthYear(newValue);
  }
);
</script>
<template>
  <SettingsDataRemovalFormWrapper>
    <template #header>
      <BaseText
        as="h1"
        variant="headline-4-bold"
      >
        Birth year
      </BaseText>
      <Button
        type="primary"
        class="save-button"
        :disabled="
          !!birthYearError || fullProfile?.birth_year === inputFieldBirthYear
        "
        @click="saveBirthYear"
      >
        Save birth year
      </Button>
    </template>
    <AtomInput
      label="Birth year"
      :value="inputFieldBirthYear"
      placeholder="Enter birth year"
      type="number"
      :error="!!birthYearError"
      :errorMessage="birthYearError"
      @input="inputFieldBirthYear = $event.target.value"
      @keydown.enter.exact.stop.prevent="saveBirthYear"
    />
  </SettingsDataRemovalFormWrapper>
</template>
