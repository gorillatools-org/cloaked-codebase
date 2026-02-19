<script setup>
import { computed, onBeforeMount, ref, watch } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseChip from "@/library/BaseChip.vue";
import BaseButton from "@/library/BaseButton.vue";
import MonitoringEventsItem from "@/features/monitoring/MonitoringEventsItem.vue";
import IdentityMonitoringService from "@/api/actions/identity-monitoring-service.js";
import { useMonitoringContext } from "@/features/monitoring/useMonitoringContext.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { useToast } from "@/composables/useToast.js";

const nextPage = ref(1);
const events = ref([]);

const eventTypes = [
  { id: "recent", label: "Recent Events" },
  { id: "historical", label: "Historical Events" },
];

const selectedType = ref(eventTypes[0].id);

const context = useMonitoringContext();

const toast = useToast();

const isFetching = ref(false);

const fetchNextPage = async () => {
  try {
    isFetching.value = true;

    const response = await IdentityMonitoringService.getMonitoringAlerts(
      context.value,
      nextPage.value
    );

    events.value.push(
      ...response.results.filter((event) =>
        ["PIM", "SSN"].includes(event.alert_type)
      )
    );

    nextPage.value = response.next ? nextPage.value + 1 : null;
  } catch {
    toast.error("Failed to fetch events");
  } finally {
    isFetching.value = false;
  }
};

onBeforeMount(fetchNextPage);

watch(selectedType, (newValue) =>
  posthogCapture(
    newValue === "recent"
      ? "user_clicked_recent_events_dashboard"
      : "user_clicked_historical_events_dashboard"
  )
);

const filteredEvents = computed(() => {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - 30);

  if (selectedType.value === "historical") {
    return events.value.filter(
      (event) => new Date(event.array_date_found) < cutoff
    );
  }

  if (selectedType.value === "recent") {
    return events.value.filter(
      (event) => new Date(event.array_date_found) >= cutoff
    );
  }

  return [];
});
</script>

<template>
  <div class="monitoring-events">
    <BaseText variant="headline-3-bold">Events</BaseText>
    <div class="monitoring-events__tabs">
      <BaseChip
        v-for="eventType in eventTypes"
        :key="eventType.id"
        :selected="eventType.id === selectedType"
        variant="display"
        @click="selectedType = eventType.id"
      >
        {{ eventType.label }}
      </BaseChip>
    </div>
    <div class="monitoring-events__content">
      <div
        v-if="isFetching && !events.length"
        class="monitoring-events__skeleton"
      >
        <div
          v-for="index in 5"
          :key="index"
          class="monitoring-events__skeleton-item"
        />
      </div>
      <BaseText
        v-else-if="!filteredEvents.length"
        variant="body-2-semibold"
        class="monitoring-events__empty"
      >
        <template v-if="selectedType === 'recent'">
          No recent events. After 30 days, events move to historical.
        </template>
        <template v-else>No historical events</template>
      </BaseText>
      <ul
        v-else
        class="monitoring-events__list"
      >
        <RouterLink
          v-for="event in filteredEvents"
          :key="event.id"
          :to="{ name: 'MonitoringEvent', params: { id: event.id } }"
        >
          <MonitoringEventsItem
            :event="event"
            :class="{
              'monitoring-events__list-item--selected':
                $route.params.id?.toString() === event.id?.toString(),
            }"
          />
        </RouterLink>
      </ul>
      <BaseButton
        v-if="selectedType === 'historical' && nextPage"
        class="monitoring-events__load-more"
        :variant="isFetching ? 'secondary' : 'outline'"
        :disabled="isFetching"
        :loading="isFetching"
        @click="fetchNextPage"
      >
        <template v-if="isFetching">Loading events</template>
        <template v-else>Load more events</template>
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.monitoring-events {
  display: flex;
  flex-direction: column;

  &__tabs {
    margin-top: 16px;
    display: flex;
    gap: 4px;
  }

  &__content {
    margin-top: 24px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  &__empty {
    color: $color-primary-70;
    margin: auto;
  }

  &__list {
    display: grid;
    row-gap: 4px;

    &-item {
      &--selected {
        border-color: $color-primary-70;
        box-shadow: 0 4px 24px 0 rgba($black, 0.05);
      }
    }
  }

  :deep(.monitoring-events-item) {
    &:hover {
      box-shadow: 0 4px 24px 0 rgba($black, 0.05);
    }
  }

  &__skeleton {
    display: grid;
    row-gap: 8px;

    &-item {
      height: 68px;
      border-radius: 20px;

      @at-root .theme-dark & {
        @include base-skeleton($color-primary-10, 0.8, $white, 0.05);
      }

      @at-root .theme-light & {
        @include base-skeleton($color-primary-10, 0.5, $white, 0.4);
      }

      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          animation-delay: $i * 0.02s;
        }
      }
    }
  }

  &__load-more {
    margin-top: 24px;
    align-self: center;
  }
}
</style>
