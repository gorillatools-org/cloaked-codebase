<script setup>
import { ref } from "vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import AtomInput from "@/library/AtomInput.vue";
import AtomTagButton from "@/library/AtomTagButton.vue";
import Button from "@/features/Button.vue";
import { email as emailValidation } from "@/scripts/validation";
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

const inputFieldEmail = ref("");
const emailError = ref(false);

function saveEmail() {
  if (!inputFieldEmail.value || !emailValidation(inputFieldEmail.value)) {
    emailError.value = true;
    return;
  } else {
    emailError.value = false;
  }

  const fullProfileCopy = { ...props.fullProfile };
  fullProfileCopy.email_addresses = [
    ...fullProfileCopy.email_addresses,
    inputFieldEmail.value,
  ];
  return DataDeleteService.updateEnrollmentProfile(fullProfileCopy)
    .then(() => {
      inputFieldEmail.value = "";
      emit("updateProfile", fullProfileCopy);
      toast.success("Email address added successfully");
    })
    .catch(() => {
      toast.error("Failed to add email address");
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
        Email address
      </BaseText>
      <Button
        type="primary"
        class="save-button"
        :disabled="!inputFieldEmail"
        @click="saveEmail"
      >
        Add email address
      </Button>
    </template>
    <AtomInput
      label="Email address"
      placeholder="Enter email address"
      type="email"
      :error="emailError"
      errorMessage="Please enter a valid email address"
      :value="inputFieldEmail"
      @input="inputFieldEmail = $event.target.value"
      @keydown.enter.exact.stop.prevent="saveEmail"
    />
    <template #tags>
      <AtomTagButton
        v-for="(email, idx) in fullProfile?.email_addresses"
        :key="`${idx}-${email}`"
        icon="close-outline"
        textTransform="lowercase"
        @click="
          emit('showConfirmationModal', {
            field: 'email_addresses',
            index: idx,
            data: email,
          })
        "
      >
        {{ email }}
      </AtomTagButton>
    </template>
  </SettingsDataRemovalFormWrapper>
</template>
