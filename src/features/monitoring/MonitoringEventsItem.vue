<script setup>
import BaseSheet from "@/library/BaseSheet.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import { computed } from "vue";
import moment from "moment";

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const type = computed(() => props.event.alert_type);
const title = computed(() => props.event.source_name);
const date = computed(() =>
  props.event.array_date_found
    ? moment(props.event.array_date_found).fromNow()
    : null
);
</script>

<template>
  <BaseSheet
    spacing-y="sm"
    spacing-x="sm"
    class="monitoring-events-item"
  >
    <img
      v-if="event.logo_url"
      :src="event.logo_url"
      :alt="title"
      class="monitoring-events-item__icon"
    />
    <span
      v-else
      class="monitoring-events-item__icon"
      :class="`monitoring-events-item__icon--${type === 'SSN' ? 'orange' : 'red'}`"
    >
      <BaseIcon :name="type === 'SSN' ? 'profile-me' : 'name-card'" />
    </span>
    <BaseText
      v-if="type"
      variant="caption-semibold"
      class="monitoring-events-item__type"
    >
      {{ type === "SSN" ? "New Event" : "Data Breach" }}
    </BaseText>
    <BaseText
      v-if="title"
      variant="body-3-semibold"
      class="monitoring-events-item__title"
    >
      {{ title }}
    </BaseText>
    <BaseText
      v-if="date"
      variant="caption-semibold"
      class="monitoring-events-item__date"
    >
      {{ date }}
    </BaseText>
    <BaseIcon
      name="chevron-right"
      class="monitoring-events-item__chevron"
    />
  </BaseSheet>
</template>

<style lang="scss" scoped>
.monitoring-events-item {
  display: grid;
  grid-template-columns: 32px 1fr max-content 16px;
  grid-template-areas: "icon type date chevron" "icon title date chevron";
  column-gap: 8px;

  &__icon {
    width: 32px;
    height: 32px;
    place-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
    grid-area: icon;
    font-size: 19px;
    background-color: $color-primary-20;

    &--orange {
      color: $color-cloaked;
      background-color: $color-cloaked-15;
    }

    &--red {
      color: $color-status-error;
      background-color: $color-status-error-15;
    }
  }

  &__type {
    grid-area: type;
    color: $color-primary-50;
  }

  &__title {
    grid-area: title;
  }

  &__date {
    grid-area: date;
    place-self: center;
    color: $color-primary-50;
  }

  &__chevron {
    grid-area: chevron;
    place-self: center;
    font-size: 16px;
  }
}
</style>
