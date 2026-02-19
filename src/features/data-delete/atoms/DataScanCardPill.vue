<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import DataDeleteDivider from "@/features/data-delete/atoms/DataDeleteCardDivider.vue";
import { computed } from "vue";

type Row = { label: string; value: string; isSingleRow?: boolean };

const props = defineProps<{
  title?: string;
  rows: Row[];
}>();

const displayTitle = computed(() => props.title || "");
</script>

<template>
  <section class="scan-card-pill">
    <BaseText
      as="div"
      variant="body-2-semibold"
    >
      {{ displayTitle }}
    </BaseText>

    <DataDeleteDivider
      v-if="displayTitle && rows.length"
      class="scan-card-pill__divider"
    />

    <div class="scan-card-pill__grid">
      <div
        v-for="(row, i) in rows"
        :key="i"
        :class="[
          'scan-card-pill__item',
          row.isSingleRow ? 'scan-card-pill__item--full' : null,
        ]"
      >
        <BaseText
          as="label"
          variant="body-3-semibold"
          class="scan-card-pill__label"
        >
          {{ row.label }}
        </BaseText>

        <BaseText
          as="p"
          variant="body-3-semibold"
          class="scan-card-pill__value"
        >
          {{ row.value }}
        </BaseText>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.scan-card-pill {
  color: $color-primary-100;

  &__divider {
    margin-block: 16px;
  }

  &__label {
    color: $color-base-black-60;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 20px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    &--full {
      grid-column: 1 / -1;
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid $color-base-black-10-dark;

      &:first-child {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
      }
    }
  }

  &__value {
    word-break: break-word;
  }
}

@media screen and (width <= 420px) {
  .scan-card-pill__grid {
    grid-template-columns: 1fr;
  }

  .scan-card-pill__item--full {
    gap: 12px;
  }
}
</style>
