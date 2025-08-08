<script setup>
import { computed } from "vue";
import TipInfo from "@/assets/icons/tip-info.svg";
import TriangleDown from "@/assets/icons/triangle-down-gradient.svg";
import UiTooltip from "@/features/ui/ui-tooltip";

const props = defineProps({
  statistics: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        typeof value.scammer_visibility === "number" &&
        typeof value.potential_hacks === "number" &&
        typeof value.info_on_public_record === "number"
      );
    },
  },
});

const dataItems = computed(() => [
  {
    label: "Scammer Visibility",
    value: props.statistics.scammer_visibility || 0,
  },
  {
    label: "Potential Hacks",
    value: props.statistics.potential_hacks || 0,
  },
  {
    label: "Public Record",
    value: props.statistics.info_on_public_record || 0,
  },
]);
</script>

<template>
  <div class="info-card">
    <div class="title">
      <p>What to expect...</p>
      <UiTooltip
        title="Protecting your data is essential. Scammers, hackers, and stalkers rely on data brokers, but removal services can block them."
        position="top"
        max-width="220"
        align-x="center"
      >
        <TipInfo style="cursor: pointer" />
      </UiTooltip>
    </div>
    <p class="description">
      Protecting your data is essential. Scammers, hackers, and stalkers rely on
      data brokers, but removal services can block them.
    </p>

    <!-- Display statistics items -->
    <div class="data-items">
      <div
        v-for="(item, index) in dataItems"
        :key="index"
        class="data-item"
      >
        <span>{{ item.label }}</span>
        <div class="percentage-container">
          <TriangleDown />
          <span class="percentage">{{ item.value }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.info-card {
  background: $color-primary-1;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 20px 0 rgba($black, 0.05);
  width: 100%;
  border: 1px solid $color-primary-10;
  height: fit-content;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  svg {
    width: 18px;
    height: 18px;
    color: $color-primary-100;
  }

  p {
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    background: linear-gradient(45.7deg, #0085ff 1.19%, #67dbfc 100%);
    background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.description {
  font-size: 12px;
  font-weight: 400;
  color: $color-primary-70;
  margin-top: 8px;
}

.data-items {
  margin-top: 10px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  color: $color-primary-100;

  .percentage-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.data-item:not(:last-child) {
  margin-bottom: 4px;
}

.percentage {
  font-size: 24px;
  font-weight: 600;
  line-height: 40px;
  background: linear-gradient(45.7deg, #0085ff 1.19%, #67dbfc 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
