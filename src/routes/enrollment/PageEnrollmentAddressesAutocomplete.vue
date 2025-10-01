<script setup>
import { onMounted, ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import EnrollmentCard from "@/features/enrollment/EnrollmentCard.vue";
import EnrollmentCardHeader from "@/features/enrollment/EnrollmentCardHeader.vue";
import EnrollmentTag from "@/features/enrollment/EnrollmentTag.vue";
import EnrollmentTags from "@/features/enrollment/EnrollmentTags.vue";
import EnrollmentAddressInput from "@/features/enrollment/EnrollmentAddressInput.vue";
import { useFormattedAddresses } from "@/features/enrollment/composables.js";
import EnrollmentAddInfo from "@/features/enrollment/EnrollmentAddInfo.vue";
import { posthogCapture } from "@/scripts/posthog.js";

onMounted(() =>
  posthogCapture("user_viewed_enrollment_form_addresses_autocomplete")
);

defineEmits(["next"]);

const addresses = defineModel("addresses", { type: Array });

const onAddAddress = (address) => {
  addresses.value.push(address);
};

const onRemoveAddress = (address) => {
  addresses.value = addresses.value.filter((item) => item !== address);
};

const formattedAddresses = useFormattedAddresses(addresses);

const address = ref("");
const addressError = ref(null);

const validateForm = () => {
  if (addresses.value.length === 0) {
    addressError.value = address.value
      ? "Please select an address from the list"
      : "At least one address required";
  }

  return !addressError.value;
};

defineExpose({ validateForm });
</script>

<template>
  <div>
    <EnrollmentCard>
      <EnrollmentCardHeader />
      <BaseText
        as="h2"
        variant="headline-5-bold"
      >
        Basic Information
      </BaseText>
      <EnrollmentAddressInput
        v-model="address"
        :error="addressError"
        title="Addresses*"
        placeholder="123 Main St Boston"
        autocomplete="street-address"
        @input="addressError = null"
        @blur="addressError = null"
        @click-action="onAddAddress"
      />
      <EnrollmentTags>
        <EnrollmentTag
          v-for="existingAddress in formattedAddresses"
          :key="existingAddress"
          tabindex="0"
          @click="onRemoveAddress(existingAddress.address)"
          @keydown.delete="onRemoveAddress(existingAddress.address)"
        >
          {{ existingAddress.display }}
        </EnrollmentTag>
      </EnrollmentTags>
      <EnrollmentAddInfo
        subtitle="Enter address manually"
        icon="location"
        @click="$router.push({ name: 'EnrollmentAddressesManual' })"
        @keydown.enter="$router.push({ name: 'EnrollmentAddressesManual' })"
      />
    </EnrollmentCard>
    <BaseButton
      icon="arrow-right"
      size="md"
      full-width
      class="page-enrollment-addresses-autocomplete__next"
      @click="$emit('next')"
      @keydown.enter="$emit('next')"
    >
      Continue
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.page-enrollment-addresses-autocomplete {
  &__next {
    margin-top: 16px;

    &:focus {
      outline: 1px solid $color-primary-100;
    }
  }
}
</style>
