<script setup>
import { computed, onBeforeMount, ref } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import MonitoringDetailHeader from "@/features/monitoring/MonitoringDetailHeader.vue";
import MonitoringDetailHeaderClose from "@/features/monitoring/MonitoringDetailHeaderClose.vue";
import MonitoringDetailHeaderBack from "@/features/monitoring/MonitoringDetailHeaderBack.vue";
import IdentityMonitoringService from "@/api/actions/identity-monitoring-service.js";
import { useMonitoringContext } from "@/features/monitoring/useMonitoringContext.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { useToast } from "@/composables/useToast.js";

const route = useRoute();

const event = ref(null);

const context = useMonitoringContext();

const { error } = useToast();

const fetchEvent = async (id = route.params.id) => {
  isFetching.value = true;

  try {
    event.value = await IdentityMonitoringService.getMonitoringAlert(
      id,
      context.value
    );

    posthogCapture("user_clicked_monitoring_alert", {
      triggeringFields: event.value.triggering_fields ?? [],
    });
  } catch {
    error("Failed to fetch alert details");
  } finally {
    isFetching.value = false;
  }
};

onBeforeMount(fetchEvent);
onBeforeRouteUpdate((to, from, next) => {
  fetchEvent(to.params.id);
  next();
});

const isFetching = ref(false);

const eventDetails = computed(() =>
  [
    {
      logo: event.value?.logo_url,
      icon: "website",
      label: "Source",
      value: event.value?.source_name,
    },
    {
      icon: "calendar",
      label: "Event Date",
      value: event.value?.array_date_found
        ? new Date(event.value?.array_date_found).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : null,
    },
  ].filter((item) => item.value)
);

const fieldToLabel = {
  address: "Home Address",
  email: "Email Address",
  phone: "Phone Number",
  ssn: "Social Security Number",
  name: "Name",
  dob: "Date of Birth",
  password: "Password",
  username: "Username",
  bank_account: "Bank Account",
  passport: "Passport",
  driver_license: "Driver License",
  credit_card: "Credit Card",
};
</script>

<template>
  <div class="page-monitoring-event">
    <MonitoringDetailHeader>
      <MonitoringDetailHeaderBack>Event Details</MonitoringDetailHeaderBack>
      <MonitoringDetailHeaderClose />
    </MonitoringDetailHeader>
    <div
      v-if="isFetching"
      class="page-monitoring-event__skeleton"
    >
      <div class="page-monitoring-event__skeleton-title" />
      <div class="page-monitoring-event__skeleton-description" />
      <div class="page-monitoring-event__skeleton-subtitle" />
      <div class="page-monitoring-event__skeleton-card" />
      <div class="page-monitoring-event__skeleton-subtitle" />
      <div class="page-monitoring-event__skeleton-card" />
    </div>
    <template v-else>
      <BaseText
        v-if="event?.source_name"
        variant="headline-3-bold"
        class="page-monitoring-event__title"
      >
        {{ event.source_name }}
      </BaseText>
      <BaseText
        v-if="event?.description"
        variant="body-3-regular"
        class="page-monitoring-event__description"
      >
        {{ event.description }}
      </BaseText>
      <section
        v-if="eventDetails?.length"
        class="page-monitoring-event__section"
      >
        <BaseText
          as="h4"
          variant="body-small-semibold"
        >
          Event Details
        </BaseText>
        <BaseSheet
          spacing-x="sm"
          spacing-y="md"
          class="page-monitoring-event__sheet"
        >
          <div
            v-for="(info, key) in eventDetails"
            :key="key"
            class="page-monitoring-event__info"
          >
            <div class="page-monitoring-event__info-icon">
              <img
                v-if="info.logo"
                :src="info.logo"
                :alt="info.value"
                class="page-monitoring-event__info-logo"
              />
              <BaseIcon
                v-else
                :name="info.icon"
              />
            </div>
            <BaseText
              as="h4"
              variant="body-small-semibold"
              class="page-monitoring-event__info-label"
            >
              {{ info.label }}
            </BaseText>
            <BaseText
              as="h4"
              variant="caption-semibold"
              class="page-monitoring-event__info-value"
            >
              {{ info.value }}
            </BaseText>
          </div>
          <BaseText
            v-if="event.triggering_fields?.length"
            variant="body-small-semibold"
          >
            Info Discovered
          </BaseText>
          <span
            v-if="event.triggering_fields?.length"
            class="page-monitoring-event__fields"
          >
            <BaseText
              v-for="field in event.triggering_fields"
              :key="field"
              variant="body-small-semibold"
              class="page-monitoring-event__fields-item"
            >
              {{ fieldToLabel[field] }}
            </BaseText>
          </span>
        </BaseSheet>
      </section>
      <section
        v-if="event?.recommendations"
        class="page-monitoring-event__section"
      >
        <BaseText
          as="h4"
          variant="body-small-semibold"
        >
          Recommendation
        </BaseText>
        <BaseSheet
          spacing-y="md"
          spacing-x="sm"
        >
          <BaseText variant="body-small-medium">
            {{ event.recommendations }}
          </BaseText>
        </BaseSheet>
      </section>
      <section
        v-if="event.alert_type === 'SSN'"
        class="page-monitoring-event__section"
      >
        <BaseText
          as="a"
          variant="body-2-semibold"
          href="https://help.cloaked.app/hc/en-us/articles/36214276264980-My-Social-Security-Number-Was-Found-on-the-Dark-Web-What-Do-I-Do"
          target="_blank"
          class="page-monitoring-event__link"
        >
          Don't recognize this event? Here are some next steps you can take.
        </BaseText>
      </section>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.page-monitoring-event {
  display: grid;
  row-gap: 24px;

  &__title {
    margin-top: -18px;
  }

  &__description {
    margin-top: -10px;
  }

  &__section {
    display: grid;
    row-gap: 8px;
  }

  &__sheet {
    display: grid;
    row-gap: 20px;
  }

  &__info {
    display: grid;
    grid-template-columns: 32px 1fr;
    grid-template-areas: "icon label" "icon value";
    column-gap: 8px;

    &-icon {
      grid-area: icon;
      place-self: center;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $color-status-error;
      background-color: $color-status-error-15;
      border-radius: 100px;
      font-size: 19px;
    }

    &-logo {
      width: 32px;
      height: 32px;
      place-self: center;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100px;
      background-color: $color-primary-20;
    }

    &-label {
      grid-area: label;
    }

    &-value {
      grid-area: value;
      color: $color-primary-50;
    }
  }

  &__fields {
    margin-top: -8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    &-item {
      display: inline-grid;
      gap: 4px;
      align-items: center;
      min-height: 32px;
      padding: 4px 10px;
      border: 1px solid $color-primary-20;
      border-radius: 100px;
      background-color: $color-base-white-100;
    }
  }

  &__link {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }

  &__skeleton {
    display: grid;
    row-gap: 8px;
    margin-top: -10px;

    &-title,
    &-description,
    &-subtitle,
    &-card {
      border-radius: 12px;

      @at-root .theme-dark & {
        @include base-skeleton($color-primary-10, 0.8, $white, 0.05);
      }

      @at-root .theme-light & {
        @include base-skeleton($color-primary-10, 0.5, $white, 0.4);
      }

      @for $i from 1 through 6 {
        &:nth-child(#{$i}) {
          animation-delay: $i * 0.02s;
        }
      }
    }

    &-title {
      height: 30px;
      width: 50%;
    }

    &-description {
      height: 20px;
      width: 80%;
    }

    &-subtitle {
      width: 120px;
      height: 18px;
      margin-top: 12px;
    }

    &-card {
      height: 130px;
    }
  }
}
</style>
