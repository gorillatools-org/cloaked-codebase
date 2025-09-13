<script setup>
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseButton from "@/library/BaseButton.vue";
import EnrollmentCard from "@/features/enrollment/EnrollmentCard.vue";
import EnrollmentCardHeader from "@/features/enrollment/EnrollmentCardHeader.vue";
import EnrollmentBackground from "@/features/enrollment/EnrollmentBackground.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { getFormattedSsnValue } from "@/features/enrollment/utils.js";
import { useSsnValidation } from "@/composables/validation/useSsnValidation.js";
import { onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";

onMounted(() => posthogCapture("user_viewed_enrollment_form_ssn"));

defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["submit-monitoring", "skip-ssn"]);

const ssn = defineModel("ssn", {
  type: String,
  get: getFormattedSsnValue,
});

const {
  error: ssnError,
  validate: validateSsn,
  validateDebounced: validateSsnDebounced,
} = useSsnValidation(ssn);

const validateForm = () => {
  validateSsn();

  return !ssnError.value;
};

defineExpose({ validateForm });
</script>

<template>
  <div class="page-enrollment-personal">
    <EnrollmentBackground
      type="monitoring"
      animated
    />
    <EnrollmentCard>
      <EnrollmentCardHeader>
        <template #hero-icon>
          <BaseIcon
            name="shield-tick-filled-1"
            class="page-enrollment-personal__shield"
          />
        </template>
      </EnrollmentCardHeader>
      <BaseText
        as="h2"
        variant="headline-5-bold"
      >
        Monitor your Personally Identifiable Information
      </BaseText>
      <BaseInput
        v-model="ssn"
        :error="ssnError"
        title="Social Security Number*"
        placeholder="123-45-6789"
        inputmode="numeric"
        :maxlength="11"
        autocomplete="off"
        secret
        @blur="validateSsn"
        @input="validateSsnDebounced"
        @keydown.enter="$emit('submit-monitoring')"
      />
    </EnrollmentCard>
    <BaseButton
      icon="check"
      size="md"
      full-width
      :loading="isSubmitting && ssn"
      class="page-enrollment-personal__confirm"
      @click="$emit('submit-monitoring')"
      @keydown.enter="$emit('submit-monitoring')"
    >
      Confirm and Protect
    </BaseButton>
    <BaseText
      as="button"
      variant="body-3-semibold"
      class="page-enrollment-personal__next"
      @click="$emit('skip-ssn')"
      @keydown.enter="$emit('skip-ssn')"
    >
      Continue without SSN
      <span
        v-if="isSubmitting && !ssn"
        class="page-enrollment-personal__spinner"
      >
        <InlineSvg
          name="spinner"
          class="page-enrollment-personal__spinner-icon"
        />
      </span>
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-enrollment-personal {
  &__shield {
    font-size: 40px;
    margin: 6px;
  }

  &__next {
    background: none;
    border: none;
    width: 100%;
    height: 44px;
    cursor: pointer;
    border-radius: 100px;
    text-decoration: underline;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    &:focus {
      outline: 1px solid $color-primary-100;
    }

    &:hover {
      opacity: 0.8;
    }

    .page-enrollment-personal__spinner {
      width: 14px;
      height: 14px;

      &-icon {
        width: 14px;
        height: 14px;
      }
    }
  }

  &__confirm {
    margin-top: 16px;
    margin-bottom: 8px;
    background-color: $color-success;

    :deep(.base-button__icon) {
      background-color: $color-base-white-15-light;
    }

    &:focus {
      outline: 1px solid $color-success;
    }
  }

  &__spinner {
    width: 16px;
    height: 16px;

    &-icon {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
