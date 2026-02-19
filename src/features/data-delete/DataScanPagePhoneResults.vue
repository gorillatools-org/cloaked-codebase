<script setup>
import { ref, computed } from "vue";
import DataDeleteThreatLevel from "@/features/data-delete/atoms/DataDeleteThreatLevel.vue";
import DataScanCardFinancialData from "@/features/data-delete/atoms/DataScanCardFinancialData.vue";
import DataScanCardPasswords from "@/features/data-delete/atoms/DataScanCardPasswords.vue";
import DataScanCardContact from "@/features/data-delete/atoms/DataScanCardContact.vue";
import DataScanCardPersonalInfo from "@/features/data-delete/atoms/DataScanCardPersonalInfo.vue";
import DataScanCardFamily from "@/features/data-delete/atoms/DataScanCardFamily.vue";
import DataDeleteCompanyHeader from "@/features/data-delete/atoms/DataDeleteCompanyHeader.vue";
import BaseText from "@/library/BaseText.vue";
import DataScanPageHeader from "@/features/data-delete/DataScanPageHeader.vue";

const props = defineProps({
  searchResults: {
    type: Array,
    default: () => [],
  },
  breachData: {
    type: Object,
    default: null,
  },
  totalBreachesCount: {
    type: Number,
    default: 0,
  },
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["force-new-search", "setup"]);

const bestMatch = computed(() => props.searchResults[0] ?? null);

const isThreatLevelHigh = computed(
  () =>
    bestMatch.value.ssn ||
    bestMatch.value.DOB?.year ||
    bestMatch.value.locations?.[0] ||
    bestMatch.value.driversLicenses?.[0]
);

const isThreatLevelMedium = ref(false);

const threatLevel = computed(() => {
  if (isThreatLevelHigh.value) {
    return "high";
  }
  if (isThreatLevelMedium.value) {
    return "medium";
  }
  return "low";
});

const onNotMe = () => {
  emit("force-new-search");
};

const onDelete = () => {
  localStorage.setItem("checkoutScanBreachesCount", props.totalBreachesCount);
  localStorage.setItem("checkoutScanBreachesThreatLevel", threatLevel.value);
  emit("setup");
};

const pastPhonesFromDataScan = computed(() => {
  if (!props.breachData?.contacts) return [];
  return props.breachData?.contacts
    .filter((item) => item.phone)
    .map((item) => item.phone);
});

const pastPhones = computed(() => {
  return [
    ...new Set([
      ...(pastPhonesFromDataScan?.value ?? []),
      ...(bestMatch.value?.phones ?? []),
    ]),
  ];
});
</script>

<template>
  <DataScanPageHeader @delete="onDelete" />
  <DataDeleteCompanyHeader />
  <div>
    <DataDeleteThreatLevel
      class="data-delete-results__scan-threat"
      :threat-level="threatLevel"
      :animation-delay="200"
      :has-modal="false"
    />
    <BaseText
      v-if="totalBreachesCount > 0"
      as="p"
      variant="headline-3-medium"
      class="data-delete-results__scan__info"
    >
      Your personal information was
      <BaseText
        as="span"
        variant="headline-3-bold"
      >
        exposed
      </BaseText>
      <BaseText
        as="span"
        variant="headline-3-medium"
        class="data-delete-results__scan__info__comma"
      >
        ,
      </BaseText>
      <BaseText
        as="span"
        variant="headline-3-bold"
      >
        {{ totalBreachesCount }}
      </BaseText>
      compromised
      {{ totalBreachesCount === 1 ? "record" : "records" }}
      found
    </BaseText>
    <BaseText
      v-else
      as="p"
      variant="headline-3-medium"
      class="data-delete-results__scan__info"
    >
      No compromised records
    </BaseText>
    <div
      v-if="bestMatch"
      class="data-delete-results data-delete-phone-results"
    >
      <div class="data-delete-results__column">
        <DataScanCardFinancialData
          v-if="
            breachData &&
            (breachData.mortgages?.length ||
              breachData.properties?.length ||
              breachData.registered_vehicles?.length)
          "
          :breach-data="breachData"
        />
        <DataScanCardPasswords
          v-if="breachData?.passwords?.length"
          :breaches="breachData?.passwords"
        />
        <DataScanCardContact
          v-if="pastPhones.length"
          :phones="pastPhones"
        />
      </div>
      <div class="data-delete-results__column">
        <DataScanCardPersonalInfo
          :result="bestMatch"
          :is-forcing-new-search="isForcingNewSearch"
          @on-not-me="onNotMe"
        />
        <DataScanCardFamily
          v-if="bestMatch.relatives?.length"
          v-model="isThreatLevelMedium"
          :result="bestMatch"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-results {
  @media all and (min-width: $screen-xl) {
    padding-top: 0;
  }

  & &__column {
    align-self: center;
    width: 100%;
    position: relative;
    top: 0;
    margin-top: 0;

    & > :deep(.data-delete-card) {
      border-radius: 24px;
    }

    @media all and (min-width: $screen-xl) {
      align-self: auto;
    }
  }

  & &__supporting-text {
    animation: appear-bottom-5 0.3s forwards ease-out;
    animation-delay: 0.5s;
    opacity: 0;
  }

  &__scan-threat {
    max-width: 1014px;
    margin: 0 auto;

    @media screen and (min-width: $screen-sm) {
      margin: 16px auto 0;
    }

    :deep(.base-text--headline-2-semibold.threat-level__title) {
      font-size: 1.5rem;
      margin-top: 0;

      @media screen and (min-width: $screen-sm) {
        font-size: 2rem;
        font-weight: 600;
        line-height: 120%;
      }
    }
  }

  &__scan {
    &__info {
      text-align: center;
      max-width: 450px;
      margin: 6px auto 0;
      font-size: 18px;

      :deep(.base-text--headline-3-bold) {
        font-size: 18px;
      }

      &__comma {
        margin-left: -4px;
      }

      @media screen and (min-width: $screen-sm) {
        font-size: 24px;
        margin: 16px auto 0;

        :deep(.base-text--headline-3-bold) {
          font-size: 24px;
        }
      }

      @media screen and (min-width: $screen-xl) {
        margin: 36px auto 0;
      }

      .base-text--headline-3-bold {
        color: $color-status-error;
      }
    }
  }
}

.data-delete-phone-results {
  max-width: 1014px;
  margin: 16px auto 0;
  flex-direction: column-reverse;

  @media screen and (min-width: $screen-sm) {
    margin: 24px auto 0;
  }

  @media all and (min-width: $screen-xl) {
    flex-direction: row-reverse;
    gap: 36px;
    margin: 36px auto 0;
  }

  &__cta {
    margin-top: 16px;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.65s forwards ease-out;

    &-button {
      width: 100%;
    }

    &-link {
      display: inline-grid;
      grid-template-columns: 44px 1fr 44px;
      grid-template-areas: "left text right";
      align-items: center;
      column-gap: 8px;
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 5px;
      cursor: pointer;
      white-space: nowrap;
      text-decoration: none;
      min-height: 54px;
      width: 100%;
      background-color: $color-primary-100;
      color: $color-primary-1;

      &:hover {
        opacity: 0.9;
      }

      .base-text {
        grid-area: text;
        text-align: center;
        padding: 0 6px;
        font-weight: 600;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: block;
      }
    }

    &-link-icon {
      grid-area: right;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $color-primary-90;
      border-radius: 50%;
      font-size: 16px;
      font-weight: 500;
      width: 44px;
      height: 44px;
    }
  }
}
</style>
