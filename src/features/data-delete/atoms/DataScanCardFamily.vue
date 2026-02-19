<script setup>
import { computed, watch } from "vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteExpandableCard from "@/features/data-delete/atoms/DataDeleteExpandableCard.vue";
import BaseText from "@/library/BaseText.vue";
import DataScanCardHeaderShared from "@/features/data-delete/atoms/DataScanCardHeaderShared.vue";
import DataScanWarning from "@/features/data-delete/atoms/DataScanWarning.vue";
import DataDeleteCardDivider from "@/features/data-delete/atoms/DataDeleteCardDivider.vue";
import { useRelativesParsing } from "@/features/data-delete/composables/useRelativesParsing";

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
});

const formatRelative = (relative) => {
  const name =
    relative.fullName ??
    [relative.firstName, relative.lastName].filter(Boolean).join(" ");

  const relation =
    relative.relation && relative.relation !== "Unknown"
      ? `(${relative.relation})`
      : "";

  return `${name} ${relation}`.trim().toLowerCase();
};

const {
  partners: rawPartners,
  relatives: rawRelatives,
  others: rawOthers,
} = useRelativesParsing(props.result.relatives);

const partners = computed(() => rawPartners.value.map(formatRelative));
const relatives = computed(() => rawRelatives.value.map(formatRelative));
const others = computed(() => rawOthers.value.map(formatRelative));

const groupedRelatives = computed(() =>
  [
    { items: partners.value, type: "partners" },
    { items: relatives.value, type: "relatives" },
    { items: others.value, type: "others" },
  ].filter((group) => group.items.length > 0)
);

// TODO: make sure two are always displayed by default
const previewItems = computed(() => {
  const firstGroup = groupedRelatives.value[0];
  return firstGroup ? firstGroup.items.slice(0, 2) : [];
});

const totalCount = computed(
  () => partners.value.length + relatives.value.length + others.value.length
);

const isThreatLevelMedium = computed(
  () =>
    props.result.gender.value ||
    partners.value.length ||
    relatives.value.length ||
    others.value.length
);

const emit = defineEmits(["update:modelValue"]);

watch(
  () => isThreatLevelMedium.value,
  (isThreatMedium) => emit("update:modelValue", !!isThreatMedium),
  { immediate: true }
);

const warningCopy =
  "Scammers with this information can change insurance policies and spoof important documents requiring popular verification methods.";
</script>

<template>
  <DataDeleteExpandableCard class="family-card">
    <template #header>
      <DataScanCardHeaderShared
        icon="family-filled"
        title="Friends & Family"
        :subtitle="`${totalCount} ${totalCount === 1 ? 'Friend' : 'Friends'} & Family`"
      />
    </template>

    <template #collapsed>
      <DataDeleteCard
        type="alert"
        class="family-card__wrapper"
      >
        <div class="family-card__members">
          <div
            v-for="(item, idx) in previewItems"
            :key="`preview-${idx}`"
            class="family-card__member"
          >
            <BaseText
              as="span"
              variant="body-2-semibold"
            >
              {{ item }}
            </BaseText>
          </div>
        </div>
        <BaseText
          v-if="totalCount - 2 > 0"
          as="p"
          variant="body-3-regular"
          class="family-card__more-count"
        >
          + {{ totalCount - 2 }} more
          {{ totalCount - 2 === 1 ? "person" : "people" }}
        </BaseText>
      </DataDeleteCard>
    </template>

    <template #expanded>
      <DataDeleteCard
        type="alert"
        class="family-card__wrapper"
      >
        <div class="family-card__members">
          <template
            v-for="(group, groupIdx) in groupedRelatives"
            :key="`group-${groupIdx}`"
          >
            <DataDeleteCardDivider v-if="groupIdx > 0" />

            <div
              v-for="(item, idx) in group.items"
              :key="`${group.type}-${idx}`"
              class="family-card__member"
            >
              <BaseText
                as="span"
                variant="body-2-semibold"
              >
                {{ item }}
              </BaseText>
            </div>
          </template>
        </div>
      </DataDeleteCard>

      <DataScanWarning :message="warningCopy" />
    </template>
  </DataDeleteExpandableCard>
</template>

<style lang="scss" scoped>
.family-card {
  :deep(.expandable-card--open) {
    border-color: $color-status-error;
  }

  :deep(.family-card__wrapper) {
    border: 1px solid $color-status-error-15 !important;
    background: $color-status-error-15 !important;

    &:hover {
      border: 1px solid $color-status-error-15 !important;
      background: $color-status-error-15 !important;
    }
  }

  &__members {
    display: flex;
    flex-direction: column;
    gap: 8px;

    :deep(.data-delete-card-divider) {
      margin: 8px 0;
    }
  }

  &__member {
    display: flex;
    align-items: baseline;
    text-transform: capitalize;
    gap: 6px;
    color: $color-primary-100;
  }

  &__more-count {
    margin-top: 12px;
    color: $color-base-black-60;
  }
}

@media screen and (width <= 420px) {
  .family-card__members {
    gap: 10px;
  }
}
</style>
