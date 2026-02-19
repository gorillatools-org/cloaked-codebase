<script setup>
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteCardDivider from "@/features/data-delete/atoms/DataDeleteCardDivider.vue";
import DataDeleteCardInfo from "@/features/data-delete/atoms/DataDeleteCardInfo.vue";
import DataDeleteThreatTag from "@/features/data-delete/atoms/DataDeleteThreatTag.vue";
import DataDeleteThumbsFeedback from "@/features/data-delete/DataDeleteThumbsFeedback.vue";
import { computed, watch } from "vue";
import { useDateOfBirthParsing } from "@/features/data-delete/composables/useDateOfBirthParsing";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
});

const { dateOfBirth } = useDateOfBirthParsing(props.result);

const driversLicense = computed(() => props.result.driversLicenses?.[0]);

const currentAddress = computed(() => props.result.locations?.[0]);
const currentStreet = computed(() => currentAddress.value.street);
const currentCity = computed(() => {
  return [
    currentAddress.value?.city?.toLowerCase(),
    currentAddress.value?.state?.abbreviation,
  ]
    .filter((value) => !!value)
    .join(", ");
});

const previousAddresses = computed(() => {
  const previousStatesAbbreviations = props.result.locations
    ?.slice(1)
    .map((location) => location.state?.abbreviation);

  const states = Array.from(new Set(previousStatesAbbreviations));

  return {
    count: previousStatesAbbreviations.length,
    states: [states.slice(0, -1).join(", "), states[states.length - 1]]
      .filter((value) => !!value)
      .join(" and "),
  };
});

const isCardVisible = computed(
  () =>
    props.result.ssn ||
    dateOfBirth.value ||
    currentAddress.value ||
    driversLicense.value
);

const emit = defineEmits(["update:modelValue"]);
watch(
  () => isCardVisible.value,
  (isVisible) => emit("update:modelValue", !!isVisible),
  { immediate: true }
);
</script>

<template>
  <DataDeleteCard
    v-if="isCardVisible"
    type="alert"
    class="data-delete-results-high"
  >
    <div class="data-delete-results-high__header">
      <DataDeleteThreatTag threat-level="high" />
      <DataDeleteThumbsFeedback result-id="high-risk" />
    </div>
    <div
      v-if="result.ssn || dateOfBirth"
      class="data-delete-results-high__column"
    >
      <div v-if="result.ssn">
        <BaseText
          as="h3"
          variant="headline-4-bold"
          class="data-delete__subtitle"
        >
          SSN
        </BaseText>
        <BaseText
          variant="headline-3-bold"
          class="data-delete-results-high__data data-delete-results-high__data--large"
        >
          {{ result.ssn }}
        </BaseText>
      </div>
      <div v-if="dateOfBirth">
        <BaseText
          as="h3"
          class="data-delete__subtitle"
          variant="headline-4-bold"
        >
          Date of Birth
        </BaseText>
        <BaseText
          variant="headline-3-bold"
          class="data-delete-results-high__data data-delete-results-high__data--large"
        >
          {{ dateOfBirth }}
        </BaseText>
      </div>
    </div>
    <div v-if="currentAddress">
      <BaseText
        as="h3"
        class="data-delete__subtitle"
        variant="headline-4-bold"
      >
        Addresses
      </BaseText>
      <BaseText
        as="div"
        variant="headline-3-bold"
        class="data-delete-results-high__data data-delete-results-high__data--large data-delete__capitalized"
      >
        <template v-if="currentStreet">
          {{ currentStreet }}
        </template>
        <br v-if="currentStreet && currentCity" />
        <template v-if="currentCity">
          {{ currentCity }}
        </template>
      </BaseText>
      <BaseText
        v-if="previousAddresses.count"
        as="div"
        variant="body-small-medium"
        class="data-delete-results-high__data"
      >
        + {{ previousAddresses.count }} previous in
        {{ previousAddresses.states }}
      </BaseText>
    </div>
    <div v-if="driversLicense">
      <BaseText
        as="h3"
        class="data-delete__subtitle"
        variant="headline-4-bold"
      >
        Driver's License
      </BaseText>
      <BaseText
        variant="headline-3-bold"
        class="data-delete-results-high__data data-delete-results-high__data--large"
      >
        {{ driversLicense }}
      </BaseText>
    </div>
    <DataDeleteCardDivider />
    <DataDeleteCardInfo>
      Fraudsters with this information can apply for: a new bank account or
      Credit Card; a Driver's License; an IRS Tax Refund; even a job using your
      name.
    </DataDeleteCardInfo>
  </DataDeleteCard>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-results-high {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    width: 100%;
  }

  &__column {
    display: flex;
    align-items: start;
    width: 100%;
    flex-wrap: wrap;
    gap: 16px;

    & > * {
      flex: 1;
    }
  }

  &__data {
    color: $color-alert;
  }
}
</style>
