<script setup lang="ts">
import { computed } from "vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteExpandableCard from "@/features/data-delete/atoms/DataDeleteExpandableCard.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataScanCardPill from "@/features/data-delete/atoms/DataScanCardPill.vue";
import DataScanCardHeaderShared from "@/features/data-delete/atoms/DataScanCardHeaderShared.vue";
import DataDeleteThumbsFeedback from "@/features/data-delete/DataDeleteThumbsFeedback.vue";
import type { BaseIconName } from "@/library/baseIconTypes";

const props = defineProps({
  breachData: {
    type: Object,
    default: null,
  },
});

const formatAmount = (n: number | null | undefined) =>
  n
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n)
    : "—";

const makeRow = (label: string, value: any, isSingleRow = false) => {
  if (value === null || value === undefined || value === "") return null;
  return { label, value, isSingleRow };
};

const mortgages = computed(() => {
  return (
    props.breachData?.mortgages?.map((m: any) => ({
      title: m.mortgage_lender_name || "Mortgage",
      rows: [
        makeRow("Loan Amount", formatAmount(m.mortgage_amount)),
        makeRow(
          "Monthly Payment",
          m.mortgage_monthly_payment
            ? formatAmount(m.mortgage_monthly_payment)
            : null
        ),
        makeRow("Loan Type", m.mortgage_loan_type, true),
      ].filter(Boolean),
    })) || []
  );
});

const properties = computed(() => {
  return (
    props.breachData?.properties?.map((p: any) => {
      const a = p.property_address || {};

      const title = [
        a.address_1,
        a.address_2,
        a.city,
        a.state,
        a.postal_code,
        a.country,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        title: title || "Property",
        rows: [
          makeRow(
            "Estimated Value",
            p.estimated_value ? formatAmount(p.estimated_value) : null
          ),
          makeRow("Type", p.property_type),
          makeRow("Purchased", p.purchased_at, true),
        ].filter(Boolean),
      };
    }) || []
  );
});

const vehicles = computed(() => {
  return (
    props.breachData?.registered_vehicles?.map((v: any) => {
      const title =
        [v.vehicle_year, v.vehicle_make, v.vehicle_model]
          .filter(Boolean)
          .join(" ") || "Vehicle";

      return {
        title,
        rows: [
          makeRow("VIN", v.vin || v.vehicle_identification_number, true),
          makeRow("Plate", v.vehicle_plate_number, true),
        ].filter(Boolean),
      };
    }) || []
  );
});

const totalBreaches = computed(() => {
  return (
    (props.breachData?.mortgages?.length || 0) +
    (props.breachData?.properties?.length || 0) +
    (props.breachData?.registered_vehicles?.length || 0)
  );
});

const collapsedCards = computed(() => {
  const sections = [] as any;
  const categories = [
    {
      label: `Active ${mortgages.value.length === 1 ? "Mortgage" : "Mortgages"}`,
      icon: "bank-filled",
      items: mortgages.value,
    },
    {
      label: "Property Ownership",
      icon: "building",
      items: properties.value,
    },
    {
      label: `Registered ${vehicles.value.length === 1 ? "Vehicle" : "Vehicles"}`,
      icon: "name-card",
      items: vehicles.value,
    },
  ];

  const nonEmpty = categories.filter((c) => c.items.length > 0);

  if (nonEmpty.length === 1) {
    const cat = nonEmpty[0];

    const firstTwo = cat.items.slice(0, 2);

    return firstTwo.map((item: any, index: number) => ({
      label: index === 0 ? cat.label : null,
      icon: cat.icon,
      title: item.title,
      rows: item.rows.slice(0, 3),
    }));
  }

  nonEmpty.forEach((cat: any) => {
    sections.push({
      label: cat.label,
      icon: cat.icon,
      title: cat.items[0].title,
      rows: cat.items[0].rows.slice(0, 3),
    });
  });

  return sections.slice(0, 2);
});
</script>

<template>
  <DataDeleteExpandableCard
    class="scan-card"
    :class="{ 'scan-card--not-expandable': totalBreaches < 3 }"
  >
    <template #header>
      <DataScanCardHeaderShared
        icon="bank-filled"
        title="Your Financial Data"
        :subtitle="`${totalBreaches} Data ${totalBreaches === 1 ? 'Breach' : 'Breaches'} Found`"
      >
        <template #feedback>
          <DataDeleteThumbsFeedback result-id="financial-data" />
        </template>
      </DataScanCardHeaderShared>
    </template>

    <template #collapsed>
      <div class="scan-card__content">
        <template
          v-for="(card, index) in collapsedCards"
          :key="index"
        >
          <div
            v-if="card.label"
            class="scan-card__section-label"
            :class="index > 0 ? 'scan-card__section-label--spaced' : ''"
          >
            <BaseIcon :name="card.icon as BaseIconName" />
            <BaseText variant="body-2-semibold">{{ card.label }}</BaseText>
          </div>

          <DataDeleteCard
            type="alert"
            class="scan-card__wrapper"
          >
            <DataScanCardPill
              :title="card.title"
              :rows="card.rows"
            />
          </DataDeleteCard>
        </template>

        <BaseText
          v-if="totalBreaches - collapsedCards.length > 0"
          as="p"
          variant="body-3-regular"
          class="scan-card__more-count"
        >
          + {{ totalBreaches - collapsedCards.length }} more
          {{
            totalBreaches - collapsedCards.length === 1 ? "breach" : "breaches"
          }}
        </BaseText>
      </div>
    </template>

    <template #expanded>
      <div class="scan-card__content">
        <template v-if="mortgages.length">
          <div class="scan-card__section-label">
            <BaseIcon name="bank-filled" />
            <BaseText variant="body-2-semibold">
              Active {{ mortgages.length === 1 ? "Mortgage" : "Mortgages" }}
            </BaseText>
          </div>

          <template
            v-for="m in mortgages"
            :key="m.title"
          >
            <DataDeleteCard
              type="alert"
              class="scan-card__wrapper"
            >
              <DataScanCardPill
                :title="m.title"
                :rows="m.rows"
              />
            </DataDeleteCard>
          </template>
        </template>

        <template v-if="properties.length">
          <div
            class="scan-card__section-label"
            :class="mortgages.length ? 'scan-card__section-label--spaced' : ''"
          >
            <BaseIcon name="building" />
            <BaseText variant="body-2-semibold">Property Ownership</BaseText>
          </div>

          <template
            v-for="p in properties"
            :key="p.title"
          >
            <DataDeleteCard
              type="alert"
              class="scan-card__wrapper"
            >
              <DataScanCardPill
                :title="p.title"
                :rows="p.rows"
              />
            </DataDeleteCard>
          </template>
        </template>

        <template v-if="vehicles.length">
          <div
            class="scan-card__section-label"
            :class="{
              'scan-card__section-label--spaced':
                mortgages.length || properties.length,
            }"
          >
            <BaseIcon name="name-card" />
            <BaseText variant="body-2-semibold">
              Registered {{ vehicles.length === 1 ? "Vehicle" : "Vehicles" }}
            </BaseText>
          </div>

          <template
            v-for="v in vehicles"
            :key="v.title"
          >
            <DataDeleteCard
              type="alert"
              class="scan-card__wrapper"
            >
              <DataScanCardPill
                :title="v.title"
                :rows="v.rows"
              />
            </DataDeleteCard>
          </template>
        </template>
      </div>
    </template>
  </DataDeleteExpandableCard>
</template>

<style lang="scss" scoped>
.scan-card {
  margin-top: 8px;

  :deep(.expandable-card--open) {
    border-color: $color-status-error;
  }

  :deep(.scan-card__wrapper) {
    border: 1px solid $color-status-error-15 !important;
    background: $color-status-error-15 !important;

    &:hover {
      border-color: $color-status-error-15 !important;
    }
  }

  &--not-expandable {
    &:deep(.expandable-card__footer) {
      display: none;
    }
  }

  &__content > * + * {
    margin-top: 8px;
  }

  &__section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;

    &--spaced {
      margin-top: 16px;
    }
  }

  &__more-count {
    margin-top: 12px;
    color: $color-base-black-60;
  }
}

@media screen and (width <= 420px) {
  .scan-card__content > * + * {
    margin-top: 12px;
  }
}
</style>
