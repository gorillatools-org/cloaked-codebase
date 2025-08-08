<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import EnrollmentCard from "@/features/enrollment/EnrollmentCard.vue";
import EnrollmentCardHeader from "@/features/enrollment/EnrollmentCardHeader.vue";
import EnrollmentAgreement from "@/features/enrollment/EnrollmentAgreement.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import {
  useFormattedAddresses,
  useFormattedName,
  useFormattedPhones,
} from "@/features/enrollment/composables.js";

const props = defineProps({
  firstName: {
    type: String,
    default: null,
  },
  middleName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  birthYear: {
    type: String,
    default: null,
  },
  phoneNumbers: {
    type: Array,
    default: () => [],
  },
  emailAddresses: {
    type: Array,
    default: () => [],
  },
  addresses: {
    type: Array,
    default: () => [],
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["submit-removal"]);

const agreesWithTerms = defineModel("agreesWithTerms", { type: Boolean });

const formattedName = useFormattedName(
  props.firstName,
  props.middleName,
  props.lastName
);

const formattedPhones = useFormattedPhones(props.phoneNumbers);
const formattedAddresses = useFormattedAddresses(props.addresses);
</script>

<template>
  <div class="page-enrollment-confirm">
    <EnrollmentCard>
      <EnrollmentCardHeader>
        <template #hero-icon>
          <span class="page-enrollment-confirm__check">
            <InlineSvg
              name="check-mark-rounded-gradient"
              class="page-enrollment-confirm__check-icon"
            />
          </span>
        </template>
      </EnrollmentCardHeader>
      <BaseText
        as="h2"
        variant="headline-5-bold"
      >
        Confirm Your Data Removal Information
      </BaseText>
      <span v-if="formattedName">
        <BaseText
          as="h3"
          variant="body-3-semibold"
          class="page-enrollment-confirm__label"
        >
          Profile
        </BaseText>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="page-enrollment-confirm__value"
        >
          {{ formattedName }}
          <template v-if="birthYear">({{ birthYear }})</template>
        </BaseText>
      </span>
      <span v-if="formattedAddresses.length">
        <BaseText
          as="h3"
          variant="body-3-semibold"
          class="page-enrollment-confirm__label"
        >
          Locations
        </BaseText>
        <BaseText
          v-for="address in formattedAddresses"
          :key="address.display"
          as="p"
          variant="headline-6-medium"
          class="page-enrollment-confirm__value"
        >
          {{ address.display }}
        </BaseText>
      </span>
      <span v-if="phoneNumbers.length">
        <BaseText
          as="h3"
          variant="body-3-semibold"
          class="page-enrollment-confirm__label"
        >
          Phone Numbers
        </BaseText>
        <BaseText
          v-for="phoneNumber in formattedPhones"
          :key="phoneNumber.display"
          as="p"
          variant="headline-6-medium"
          class="page-enrollment-confirm__value"
        >
          {{ phoneNumber.display }}
        </BaseText>
      </span>
      <span v-if="emailAddresses.length">
        <BaseText
          as="h3"
          variant="body-3-semibold"
        >
          Emails
        </BaseText>
        <BaseText
          v-for="emailAddress in emailAddresses"
          :key="emailAddress"
          as="p"
          variant="headline-6-medium"
          class="page-enrollment-confirm__value"
        >
          {{ emailAddress }}
        </BaseText>
      </span>
    </EnrollmentCard>
    <EnrollmentAgreement
      v-model="agreesWithTerms"
      class="page-enrollment-confirm__agreement"
      :first-name="firstName"
      :middle-name="middleName"
      :last-name="lastName"
    />
    <BaseButton
      icon="check"
      size="md"
      full-width
      :disabled="!agreesWithTerms"
      :loading="isSubmitting"
      class="page-enrollment-confirm__confirm"
      @click="$emit('submit-removal')"
      @keydown.enter="$emit('submit-removal')"
    >
      Confirm and Protect
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.page-enrollment-confirm {
  &__value {
    opacity: 0.7;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-word;
  }

  &__check {
    margin: 6px;

    &-icon {
      width: 36px;
      height: 36px;
    }
  }

  &__agreement {
    margin-top: 16px;
  }

  &__confirm {
    margin-top: 16px;
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
  }
}
</style>
