<script setup>
import BaseSheet from "@/library/BaseSheet.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { useSsnValidation } from "@/composables/validation/useSsnValidation.js";
import { getFormattedSsnValue } from "@/features/enrollment/utils.js";

defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  ssnSubmitted: {
    type: Boolean,
    default: false,
  },
});

const ssn = defineModel("ssn", {
  type: String,
  get: getFormattedSsnValue,
});

const {
  error: ssnError,
  validate: validateSsn,
  validateDebounced: validateSsnDebounced,
} = useSsnValidation(ssn, { isRequired: false });

const validateForm = () => {
  validateSsn();

  return !ssnError.value;
};

defineExpose({ validateForm });
</script>

<template>
  <section class="monitoring-settings-personal">
    <BaseText
      as="h4"
      variant="body-small-medium"
    >
      Personally Identifiable Information
    </BaseText>
    <BaseSheet
      spacing-x="sm"
      spacing-y="lg"
      elevation="md"
      class="monitoring-settings-personal__sheet"
    >
      <div v-if="ssnSubmitted">
        <BaseText
          as="span"
          variant="body-small-medium"
          class="monitoring-settings-personal__field-title"
        >
          Social Security Number
        </BaseText>
        <BaseText
          variant="body-3-semibold"
          class="monitoring-settings-personal__field-submitted"
        >
          <BaseIcon name="lock-filled" />
          SSN securely submitted
        </BaseText>
      </div>
      <BaseInput
        v-else
        v-model="ssn"
        :error="ssnError"
        :disabled="isSubmitting"
        title="Social Security Number"
        placeholder="123-45-6789"
        inputmode="numeric"
        :maxlength="11"
        secret
        @blur="validateSsn"
        @input="validateSsnDebounced"
      />
    </BaseSheet>
  </section>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.monitoring-settings-personal {
  &__sheet {
    display: grid;
    row-gap: 16px;
    column-gap: 6px;
    margin-top: 8px;
  }

  &__field {
    &-title {
      color: $color-primary-50;
    }

    &-submitted {
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 5px 10px;
      height: 40px;
      background-color: $color-caribbean-green-15;
      border: 1px solid $color-caribbean-green;
      margin-top: 4px;
    }
  }
}
</style>
