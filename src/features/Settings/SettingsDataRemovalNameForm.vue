<script setup>
import { computed, ref, reactive } from "vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import AtomInput from "@/library/AtomInput.vue";
import AtomTagButton from "@/library/AtomTagButton.vue";
import Button from "@/features/Button.vue";
import AtomMultipleInputRow from "@/library/AtomMultipleInputRow.vue";
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

const emit = defineEmits(["showConfirmationModal", "updateProfile"]);

const inputFieldName = reactive({
  first: "",
  middle: "",
  last: "",
  prefix: "",
  suffix: "",
});
const nameErrors = ref([]);

const allNames = computed(() => {
  const names = [];
  if (props.fullProfile?.name) {
    const fullName = nameParser(props.fullProfile.name);
    names.push(fullName);
  }
  if (props.fullProfile?.other_names) {
    props.fullProfile?.other_names.forEach((nameObj) => {
      const fullName = nameParser(nameObj);
      names.push(fullName);
    });
  }
  return names;
});

const isNameFormDisabled = computed(() => {
  return [
    inputFieldName.first,
    inputFieldName.last,
    inputFieldName.prefix,
    inputFieldName.suffix,
    inputFieldName.middle,
  ].every((name) => !name);
});

function nameParser(nameObject) {
  "nameParser", nameObject;
  const nameParts = [];
  if (nameObject?.prefix) {
    nameParts.push(nameObject?.prefix.toLowerCase());
  }
  if (nameObject?.first) {
    nameParts.push(nameObject?.first.toLowerCase());
  }
  if (nameObject?.middle) {
    nameParts.push(nameObject?.middle.toLowerCase());
  }
  if (nameObject?.last) {
    nameParts.push(nameObject?.last.toLowerCase());
  }
  if (nameObject?.suffix) {
    if (
      ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"].includes(
        nameObject?.suffix?.toUpperCase()
      )
    ) {
      nameParts.push(nameObject?.suffix.toUpperCase());
    } else {
      nameParts.push(nameObject?.suffix.toLowerCase());
    }
  }
  return nameParts.join(" ");
}

function addName() {
  nameErrors.value = [];
  if (!inputFieldName?.first || !inputFieldName?.last) {
    if (!inputFieldName?.first) {
      nameErrors.value = [...nameErrors.value, "first"];
    }
    if (!inputFieldName?.last) {
      nameErrors.value = [...nameErrors.value, "last"];
    }
    return;
  } else {
    nameErrors.value = [];
  }

  const fullProfileCopy = { ...props.fullProfile };
  const newNameObject = {
    first: inputFieldName.first ? inputFieldName.first : undefined,
    middle: inputFieldName.middle ? inputFieldName.middle : undefined,
    last: inputFieldName.last ? inputFieldName.last : undefined,
    prefix: inputFieldName.prefix ? inputFieldName.prefix : undefined,
    suffix: inputFieldName.suffix ? inputFieldName.suffix : undefined,
  };
  fullProfileCopy.other_names = [...fullProfileCopy.other_names, newNameObject];
  DataDeleteService.updateEnrollmentProfile(fullProfileCopy)
    .then(() => {
      inputFieldName.first = "";
      inputFieldName.middle = "";
      inputFieldName.last = "";
      inputFieldName.prefix = "";
      inputFieldName.suffix = "";
      emit("updateProfile", fullProfileCopy);
      toast.success("Name added successfully");
    })
    .catch(() => {
      toast.error("Failed to add name");
    });
}
</script>
<template>
  <SettingsDataRemovalFormWrapper>
    <template #header>
      <BaseText
        as="h1"
        variant="headline-4-bold"
      >
        Name
      </BaseText>
      <Button
        type="primary"
        class="save-button"
        :disabled="isNameFormDisabled"
        @click="addName"
      >
        Add name
      </Button>
    </template>
    <AtomMultipleInputRow>
      <AtomInput
        label="Prefix"
        :value="inputFieldName.prefix"
        placeholder="E.g. Mr, Mrs, Lord"
        type="text"
        @input="inputFieldName.prefix = $event.target.value"
      />
      <AtomInput
        label="Suffix"
        :value="inputFieldName.suffix"
        placeholder="E.g. Senior, Junior, III"
        type="text"
        @input="inputFieldName.suffix = $event.target.value"
      />
    </AtomMultipleInputRow>
    <AtomMultipleInputRow>
      <AtomInput
        label="First (required)"
        :value="inputFieldName.first"
        placeholder="First name"
        type="text"
        :error="nameErrors.includes('first')"
        errorMessage="First name is required"
        @input="inputFieldName.first = $event.target.value"
      />
      <AtomInput
        label="Middle"
        :value="inputFieldName.middle"
        placeholder="Middle name"
        type="text"
        @input="inputFieldName.middle = $event.target.value"
      />
    </AtomMultipleInputRow>
    <AtomMultipleInputRow>
      <AtomInput
        label="Last (required)"
        :value="inputFieldName.last"
        placeholder="Last name"
        type="text"
        :error="nameErrors.includes('last')"
        errorMessage="Last name is required"
        @input="inputFieldName.last = $event.target.value"
        @keydown.enter.exact.stop.prevent="addName"
      />
    </AtomMultipleInputRow>
    <template #tags>
      <AtomTagButton
        v-for="(name, idx) in allNames"
        :key="`${idx}-${name}`"
        icon="close-outline"
        @click="
          emit('showConfirmationModal', {
            field: 'name',
            index: idx,
            data: name,
            isFinalItem: allNames.length === 1,
          })
        "
      >
        {{ name }}
      </AtomTagButton>
    </template>
  </SettingsDataRemovalFormWrapper>
</template>
