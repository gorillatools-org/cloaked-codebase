<script setup>
import BaseInput from "@/library/BaseInput.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import EnrollmentTags from "@/features/enrollment/EnrollmentTags.vue";
import EnrollmentTag from "@/features/enrollment/EnrollmentTag.vue";
import { usePersonalNameValidation } from "@/composables/validation/usePersonalNameValidation.js";

const names = defineModel("names", { type: Array });
const prefix = defineModel("prefix", { type: String });
const suffix = defineModel("suffix", { type: String });
const firstName = defineModel("firstName", { type: String });
const middleName = defineModel("middleName", { type: String });
const lastName = defineModel("lastName", { type: String });

defineEmits(["remove-name", "add-name"]);

const {
  error: firstNameError,
  validate: validateFirstName,
  validateDebounced: validateFirstNameDebounced,
} = usePersonalNameValidation(firstName);

const {
  error: middleNameError,
  validate: validateMiddleName,
  validateDebounced: validateMiddleNameDebounced,
} = usePersonalNameValidation(middleName, { isRequired: false });

const {
  error: lastNameError,
  validate: validateLastName,
  validateDebounced: validateLastNameDebounced,
} = usePersonalNameValidation(lastName);

const validateForm = () => {
  validateFirstName();
  validateMiddleName();
  validateLastName();

  return (
    !firstNameError.value && !middleNameError.value && !lastNameError.value
  );
};

defineExpose({ validateForm });
</script>

<template>
  <div class="monitoring-settings-basic-names">
    <div class="monitoring-settings-basic-names__form">
      <BaseText
        as="h4"
        variant="body-small-medium"
      >
        Please enter your name(s)
      </BaseText>
      <BaseSheet
        spacing-x="sm"
        spacing-y="lg"
        elevation="md"
        class="monitoring-settings-basic-names__sheet"
      >
        <BaseInput
          v-model="prefix"
          title="Prefix"
          placeholder="Mr."
          autocomplete="off"
          class="monitoring-settings-basic-names__prefix"
          @keydown.enter="$emit('add-name')"
        />
        <BaseInput
          v-model="suffix"
          title="Suffix"
          placeholder="Sr."
          autocomplete="off"
          class="monitoring-settings-basic-names__suffix"
          @keydown.enter="$emit('add-name')"
        />
        <BaseInput
          v-model="firstName"
          :error="firstNameError"
          title="First Name*"
          placeholder="John"
          autocomplete="given-name"
          class="monitoring-settings-basic-names__first-name"
          @blur="validateFirstName"
          @input="validateFirstNameDebounced"
          @keydown.enter="$emit('add-name')"
        />
        <BaseInput
          v-model="middleName"
          :error="middleNameError"
          title="Middle Name"
          placeholder="William"
          autocomplete="additional-name"
          class="monitoring-settings-basic-names__middle-name"
          @blur="validateMiddleName"
          @input="validateMiddleNameDebounced"
          @keydown.enter="$emit('add-name')"
        />
        <BaseInput
          v-model="lastName"
          :error="lastNameError"
          title="Last Name*"
          placeholder="Appleseed"
          autocomplete="family-name"
          class="monitoring-settings-basic-names__last-name"
          @blur="validateLastName"
          @input="validateLastNameDebounced"
          @keydown.enter="$emit('add-name')"
        />
        <EnrollmentTags class="monitoring-settings-basic-names__tags">
          <EnrollmentTag
            v-for="(name, index) in names"
            :key="index"
            tabindex="0"
            @keydown.delete="$emit('remove-name', name)"
            @click="$emit('remove-name', name)"
          >
            {{
              [name.prefix, name.first, name.middle, name.last, name.suffix]
                .filter(Boolean)
                .join(" ")
            }}
          </EnrollmentTag>
        </EnrollmentTags>
      </BaseSheet>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.monitoring-settings-basic-names {
  display: grid;
  row-gap: 24px;
  position: relative;
  height: 100%;
  grid-template-rows: min-content 1fr;

  &__sheet {
    display: grid;
    row-gap: 16px;
    column-gap: 6px;
    margin-top: 8px;
    align-items: start;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "prefix suffix" "first-name first-name" "middle-name middle-name" "last-name last-name";
  }

  &__prefix {
    grid-area: prefix;
  }

  &__suffix {
    grid-area: suffix;
  }

  &__first-name {
    grid-area: first-name;
  }

  &__middle-name {
    grid-area: middle-name;
  }

  &__last-name {
    grid-area: last-name;
  }

  &__tags {
    grid-column: 1/3;
  }
}
</style>
