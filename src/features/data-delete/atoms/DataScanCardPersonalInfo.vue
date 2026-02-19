<script setup lang="ts">
import { computed } from "vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeleteDivider from "@/features/data-delete/atoms/DataDeleteCardDivider.vue";
import DataScanWarning from "@/features/data-delete/atoms/DataScanWarning.vue";
import { useDateOfBirthParsing } from "@/features/data-delete/composables/useDateOfBirthParsing";
import { useRoute } from "vue-router";
import BaseButton from "@/library/BaseButton.vue";
import { formatPhone } from "@/scripts/format";
import { useNameParsing } from "@/features/data-delete/composables/useNameParsing";
import DataDeleteThumbsFeedback from "@/features/data-delete/DataDeleteThumbsFeedback.vue";

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["on-not-me"]);

const { dateOfBirth } = useDateOfBirthParsing(props.result);
const route = useRoute();

const driversLicense = computed(() => props.result.driversLicenses?.[0]);
const currentAddress = computed(() => props.result.locations?.[0]);

const previousAddresses = computed(() => {
  const locations = props.result.locations?.slice(1) ?? [];
  const stateAbbreviations = locations
    .map(
      (loc: { state?: { abbreviation?: string } }) => loc.state?.abbreviation
    )
    .filter(Boolean);
  const uniqueStates = Array.from(new Set(stateAbbreviations));

  if (uniqueStates.length === 0) return null;

  const statesText =
    uniqueStates.length === 1
      ? uniqueStates[0]
      : `${uniqueStates.slice(0, -1).join(", ")} and ${uniqueStates[uniqueStates.length - 1]}`;

  return `+ ${stateAbbreviations.length} previous in ${statesText}`;
});

const { name, nameAndAge } = useNameParsing(props.result);

const personalData = computed(() => {
  const address = currentAddress.value;
  const cityState = [address?.city?.toLowerCase(), address?.state?.abbreviation]
    .filter(Boolean)
    .join(", ");

  return {
    name: nameAndAge.value,
    ssn: props.result.ssn,
    dateOfBirth: dateOfBirth.value,
    currentPhone: route.query.phone ? formatPhone(route.query.phone) : null,
    additionalPhones: props.result.phones?.length ?? 0,
    driversLicense: driversLicense.value,
    currentAddress: [address?.street?.toLowerCase(), cityState]
      .filter(Boolean)
      .join(", "),
    previousAddresses: previousAddresses.value,
  };
});

const isCardVisible = computed(
  () =>
    !!(
      props.result.ssn ||
      dateOfBirth.value ||
      currentAddress.value ||
      driversLicense.value
    )
);

const fieldDefinitions = [
  { label: "SSN", key: "ssn", getValue: () => personalData.value.ssn },
  {
    label: "Date of Birth",
    key: "dob",
    getValue: () => personalData.value.dateOfBirth,
  },
  {
    label: "Current Phone Number",
    key: "phone",
    getValue: () => personalData.value.currentPhone,
    getAdditional: () =>
      personalData.value.additionalPhones > 0
        ? `+ ${personalData.value.additionalPhones} more phone ${personalData.value.additionalPhones === 1 ? "number" : "numbers"}`
        : null,
  },
  {
    label: "Driver's License",
    key: "license",
    getValue: () => personalData.value.driversLicense,
  },
  {
    label: "Current Address",
    key: "address",
    getValue: () => personalData.value.currentAddress,
    getAdditional: () => personalData.value.previousAddresses,
  },
];

const allFields = computed(() =>
  fieldDefinitions
    .map((def) => ({
      label: def.label,
      value: def.getValue(),
      key: def.key,
      additional: def.getAdditional?.() ?? null,
    }))
    .filter((field) => field.value)
);
</script>

<template>
  <DataDeleteCard
    v-if="isCardVisible"
    class="personal-info-card"
  >
    <header class="personal-info-card__header">
      <div class="personal-info-card__header__head">
        <div class="personal-info-card__header__left">
          <div
            class="personal-info-card__header-icon"
            aria-hidden="true"
          >
            <BaseIcon
              name="profile-filled"
              class="personal-info-card--icon"
            />
          </div>
          <BaseText
            as="h2"
            variant="headline-5-bold"
            class="personal-info-card__title"
          >
            Your Personal Data
          </BaseText>
        </div>
        <DataDeleteThumbsFeedback result-id="personal-info" />
      </div>

      <div class="personal-info-card__subtitle-row">
        <BaseText
          v-if="name"
          as="h3"
          variant="headline-3-bold"
          class="personal-info-card__subtitle"
        >
          {{ personalData.name }}
        </BaseText>
        <BaseButton
          v-if="!isForcingNewSearch"
          as="button"
          variant="text"
          class="personal-info-card__not-you"
          @click="emit('on-not-me')"
        >
          Not you?
        </BaseButton>
      </div>
    </header>

    <DataDeleteCard
      type="alert"
      class="personal-info-card__data-box"
    >
      <div class="personal-info-card__grid">
        <template
          v-for="(field, index) in allFields"
          :key="field.key"
        >
          <DataDeleteDivider
            v-if="
              field.value &&
              (field.additional ||
                field.key === 'phone' ||
                field.key === 'license' ||
                field.key === 'address')
            "
            class="personal-info-card__divider"
          />
          <div
            v-if="field.value"
            class="personal-info-card__field"
            :class="{
              'personal-info-card__field--full':
                field.additional ||
                field.key === 'phone' ||
                field.key === 'license' ||
                field.key === 'address',
              'personal-info-card__field--first': index < 2,
            }"
          >
            <BaseText
              as="label"
              variant="headline-6-bold"
            >
              {{ field.label }}
            </BaseText>
            <BaseText
              as="p"
              variant="headline-4-bold"
              class="personal-info-card__value--danger"
            >
              {{ field.value }}
            </BaseText>
            <BaseText
              v-if="field.additional"
              as="p"
              variant="body-3-regular"
              class="personal-info-card__additional"
            >
              {{ field.additional }}
            </BaseText>
          </div>
        </template>
      </div>
    </DataDeleteCard>

    <DataScanWarning
      message="Fraudsters with this information can apply for: Global Entry Status; a REAL ID License; an IRS Tax Refund; even a new bank account or Credit Card."
    />
  </DataDeleteCard>
</template>

<style lang="scss" scoped>
.personal-info-card {
  margin-block: 8px;
  transition: border-color 250ms ease;
  padding: 20px;

  &--icon {
    font-size: 20px;
  }

  &.data-delete-card {
    background: $color-base-black-5;
    border: 1px solid $color-base-black-15;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;

    &__head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    &__left {
      display: flex;
      gap: 16px;
      align-items: center;
    }
  }

  &__header-icon {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    display: grid;
    place-items: center;
    background-color: $color-status-error;
  }

  &__title {
    color: $color-primary-100;
    font-size: 16px;

    @media screen and (min-width: $screen-sm) {
      font-size: 18px;
    }
  }

  &__subtitle-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;

    @media screen and (min-width: $screen-sm) {
      gap: 16px;
    }
  }

  &__subtitle {
    color: $color-primary-100;
    text-transform: capitalize;
  }

  &__not-you {
    all: unset;
    cursor: pointer;
    text-decoration: underline;
    flex-shrink: 0;
    font-weight: 600;
    color: $color-primary-70;
    font-size: 15px;
    width: max-content;

    &.base-button--text {
      &:hover {
        color: $color-primary-100;
        background-color: transparent;
      }
    }

    :deep(.base-text) {
      padding: 0;

      @media screen and (min-width: $screen-sm) {
        padding: 0 6px;
      }
    }
  }

  &__data-box.data-delete-card {
    transition: border-color 250ms ease;
    background: $color-status-error-15;
    border: 1px solid $color-status-error;
    margin-bottom: 16px;
  }

  &__grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0;
    color: $color-base-black-80;

    &--collapsed {
      :deep(.personal-info-card__field) {
        padding: 0;
      }
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 2px;

    &--first {
      padding-top: 0;
    }

    &--full {
      grid-column: 1 / -1;
    }
  }

  &__divider {
    grid-column: 1 / -1;
    margin: 12px 0;

    &:first-child {
      display: none;
    }
  }

  &__value--danger {
    color: $color-status-error;
    text-transform: capitalize;
  }

  &__additional {
    color: $color-base-black-60;
    margin-top: 8px;
  }
}
</style>
