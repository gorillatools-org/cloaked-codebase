<script setup>
import { ref, computed, nextTick, inject } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import ExposureStatusBrokerListItem from "@/features/ExposureStatus/ExposureStatusBrokerListItem.vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  brokers: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    default: "monitoring",
    validator(value) {
      return [
        "removing",
        "monitoring",
        "action-required",
        "no-records-found",
      ].includes(value);
    },
  },
  amountDisplayed: {
    type: Number,
    default: 3,
  },
});

const isExpanded = ref(false);
const sectionRef = ref(null);
const isClosing = ref(false);

// Use provided state from parent
const openItemIds = inject("openItemIds");
const openItem = inject("openItem");
const closeItem = inject("closeItem");

const displayedBrokers = computed(() => {
  if (isExpanded.value) {
    return props.brokers;
  }
  return props.brokers.slice(0, props.amountDisplayed);
});

const getItemAnimationDelay = (index) => {
  if (!isExpanded.value) return "0ms";
  if (index < 3) return "0ms";
  if (index >= 9) return "700ms";
  return `${(index - 2) * 100}ms`;
};

const toggleExpand = async () => {
  if (isExpanded.value) {
    isClosing.value = true;
    isExpanded.value = false;
    // Close all items in this section
    props.brokers.forEach((broker) => {
      closeItem(`${broker.state}-${broker.broker_name}`);
    });
    await nextTick();
  } else {
    isExpanded.value = true;
    await nextTick();
    sectionRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const toggleItem = (broker) => {
  const itemId = `${broker.state}-${broker.broker_name}`;
  if (openItemIds.value.has(itemId)) {
    closeItem(itemId);
  } else {
    openItem(itemId);
  }
};

// Computed property to check if an item is expanded
const isItemExpanded = (broker) => {
  return openItemIds.value.has(`${broker.state}-${broker.broker_name}`);
};
</script>

<template>
  <div
    ref="sectionRef"
    class="exposure-status__broker-list-section"
  >
    <div class="exposure-status__broker-list-section__header">
      <BaseText
        variant="headline-3-bold"
        as="h5"
        class="exposure-status__broker-list-section__header-title"
      >
        {{ title }}
      </BaseText>

      <BaseButton
        v-if="brokers.length > props.amountDisplayed"
        variant="text"
        class="exposure-status__broker-list-section__header-button"
        @click="toggleExpand"
      >
        {{
          isExpanded
            ? "Show Less"
            : `Show ${brokers.length - props.amountDisplayed} More`
        }}
      </BaseButton>
    </div>

    <div class="exposure-status__broker-list-section__items">
      <ExposureStatusBrokerListItem
        v-for="(broker, index) in displayedBrokers"
        :key="broker.broker_name"
        class="exposure-status__broker-list-section__items__item"
        :style="{ '--animation-delay': getItemAnimationDelay(index) }"
        :broker="broker"
        :status="props.status"
        :is-expanded="isItemExpanded(broker)"
        @toggle="toggleItem(broker)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.exposure-status__broker-list-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;

  &:first-child {
    margin-top: 0;
  }

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: $color-primary-5;
    padding: 8px 0;

    &-title {
      display: inline-block;
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__item {
      &:nth-child(n + 4) {
        opacity: 0;
        transform: translateY(10px);
        animation: fadeInUp 0.3s ease forwards;
        animation-delay: var(--animation-delay);
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
