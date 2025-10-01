<script setup>
import { computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseChip from "@/library/BaseChip.vue";
import MonitoringScanningItem from "@/features/monitoring/MonitoringScanningItem.vue";
import store from "@/store/index.js";

const profile = computed(
  () => store.getters["dataDelete/getEnrollmentProfile"]
);

const scannedItems = computed(() => [
  {
    label: "Phone Numbers",
    status: profile.value?.phone_numbers?.length ? "scanning" : "inactive",
  },
  {
    label: "Email Addresses",
    status: profile.value?.email_addresses?.length ? "scanning" : "inactive",
  },
  {
    label: "Home Addresses",
    status: profile.value?.addresses?.length ? "scanning" : "inactive",
  },
  {
    label: "Social Security Number",
    status: profile.value?.ssn_submitted ? "scanning" : "inactive",
  },
]);
</script>

<template>
  <div class="monitoring-scanning">
    <BaseText
      variant="headline-3-bold"
      class="monitoring-scanning__title"
    >
      Scanning for...
    </BaseText>
    <RouterLink :to="{ name: 'MonitoringSettings' }">
      <BaseChip
        prepend-icon="plus"
        size="md"
        class="monitoring-scanning__add"
      >
        Add more info
      </BaseChip>
    </RouterLink>
    <BaseSheet
      class="monitoring-scanning__sheet"
      spacing-x="lg"
      spacing-y="md"
    >
      <ul class="monitoring-scanning__list">
        <li
          v-for="item in scannedItems"
          :key="item.label"
          class="monitoring-scanning__list-item"
        >
          <RouterLink :to="{ name: 'MonitoringSettings' }">
            <MonitoringScanningItem :status="item.status">
              {{ item.label }}
            </MonitoringScanningItem>
          </RouterLink>
        </li>
      </ul>
    </BaseSheet>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.monitoring-scanning {
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-template-areas: "title add" "sheet sheet";
  gap: 16px;

  &__title {
    grid-area: title;
    align-self: end;
  }

  &__add {
    grid-area: add;
    align-self: end;
  }

  &__sheet {
    grid-area: sheet;
  }

  &__list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;

    &-item {
      align-self: center;
      justify-self: start;
    }
  }

  &:deep(.monitoring-scanning-item) {
    &:hover {
      background-color: $color-primary-5;
      cursor: pointer;
    }
  }
}
</style>
