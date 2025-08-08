<script setup>
import { ref } from "vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import AtomInput from "@/library/AtomInput.vue";
import AtomTagButton from "@/library/AtomTagButton.vue";
import Button from "@/features/Button.vue";
import { phone as phoneValidation } from "@/scripts/validation";
import SettingsDataRemovalFormWrapper from "@/features/Settings/SettingsDataRemovalFormWrapper.vue";
import BaseText from "@/library/BaseText.vue";
import { useToast } from "@/composables/useToast.js";
import { format } from "@/scripts/format";
const toast = useToast();

const props = defineProps({
  fullProfile: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["showConfirmationModal", "updateProfile"]);

const inputFieldPhone = ref("");
const phoneError = ref(false);

function savePhone() {
  if (!inputFieldPhone.value || !phoneValidation(inputFieldPhone.value)) {
    phoneError.value = true;
    return;
  } else {
    phoneError.value = false;
  }

  const fullProfileCopy = { ...props.fullProfile };
  fullProfileCopy.phone_numbers = [
    ...fullProfileCopy.phone_numbers,
    format.formatPhoneStringBasic(inputFieldPhone.value),
  ];
  return DataDeleteService.updateEnrollmentProfile(fullProfileCopy)
    .then(() => {
      inputFieldPhone.value = "";
      emit("updateProfile", fullProfileCopy);
      toast.success("Phone number added successfully");
    })
    .catch(() => {
      toast.error("Failed to add phone number");
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
        Phone number
      </BaseText>
      <Button
        type="primary"
        class="save-button"
        :disabled="!inputFieldPhone.length"
        @click="savePhone"
      >
        Add phone number
      </Button>
    </template>
    <AtomInput
      label="U.S. or Canadian Phone number"
      placeholder="Enter phone number"
      type="tel"
      :error="phoneError"
      errorMessage="Please enter a valid U.S. or Canadian phone number"
      :value="inputFieldPhone"
      @input="inputFieldPhone = $event.target.value"
      @keydown.enter.exact.stop.prevent="savePhone"
    />
    <template #tags>
      <AtomTagButton
        v-for="(phone, idx) in fullProfile?.phone_numbers"
        :key="`${idx}-${phone}`"
        icon="close-outline"
        @click="
          emit('showConfirmationModal', {
            field: 'phone_numbers',
            index: idx,
            data: phone,
          })
        "
      >
        {{ format.phone_format(phone) }}
      </AtomTagButton>
    </template>
  </SettingsDataRemovalFormWrapper>
</template>
