<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { watchImmediate } from "@vueuse/core";
import { useScanProgress } from "@/features/enrollment/useScanProgress.js";
import BaseText from "@/library/BaseText";
import BaseButton from "@/library/BaseButton.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import LineProgress from "@/features/ui/LineProgress.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import moment from "moment";
import { useSessionEnrollmentData } from "@/features/enrollment/useSessionEnrollmentData.js";
import { formatPhoneStringBasic } from "@/scripts/format.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";

defineEmits(["see-results"]);

const {
  initiate,
  scannedBrokers,
  scannedBrokersDisplayed,
  submittedBrokersDisplayed,
  isFinished,
} = useScanProgress();

onMounted(() => {
  posthogCapture("user_viewed_enrollment_progress");
});

const { enrollmentData } = useSessionEnrollmentData();

const progress = ref(0);

const isSubmitted = ref(false);

onMounted(() => {
  let progressInterval = setInterval(() => {
    if (progress.value < 0.6) {
      progress.value = Math.min(0.96, progress.value + Math.random() / 10);
    }

    if (progress.value >= 0.6 && progress.value < 0.96) {
      progress.value = Math.min(0.96, progress.value + Math.random() / 40);
    }

    if (isFinished.value) {
      clearInterval(progressInterval);

      setTimeout(() => (progress.value = 0.97), 200);
      setTimeout(() => (progress.value = 0.98), 500);
      setTimeout(() => (progress.value = 0.99), 800);
      setTimeout(() => (progress.value = 1), 1000);

      setTimeout(() => {
        isSubmitted.value = true;
      }, 2000);
    }
  }, 200);
});

onMounted(() =>
  initiate({
    firstName: enrollmentData.value?.name?.first ?? null,
    lastName: enrollmentData.value?.name?.last ?? null,
    age: enrollmentData.value?.dob
      ? moment().diff(moment(enrollmentData.value.dob, "MM-DD-YYYY"), "years")
      : null,
    city: enrollmentData.value?.addresses?.[0]?.city ?? null,
    state: enrollmentData.value?.addresses?.[0]?.state ?? null,
    country: enrollmentData.value?.addresses?.[0]?.country ?? null,
    postal_code: enrollmentData.value?.addresses?.[0]?.postal_code ?? null,
    email: enrollmentData.value?.email_addresses?.[0] ?? null,
    phone: enrollmentData.value?.phone_numbers?.[0]
      ? formatPhoneStringBasic(enrollmentData.value?.phone_numbers?.[0])
      : null,
  })
);

const content = ref(null);
const indicatorWidth = ref(0);

const onWindowResize = () => {
  indicatorWidth.value = (content.value?.offsetWidth ?? 0) * 0.9;
};

watchImmediate(content, (newValue) => {
  if (newValue) {
    onWindowResize();
  }
});

onMounted(() => {
  window.addEventListener("resize", onWindowResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

const { featureFlag } = usePostHogFeatureFlag("download-app-experiment");

const cta = computed(() => {
  const featureFlagToCtaText = {
    "enrollment-progress-1": "See Complete Results",
    "enrollment-progress-2": "See Results",
    "enrollment-progress-3": "See My Results",
  };

  return featureFlagToCtaText[featureFlag.value] ?? "See Complete Results";
});
</script>

<template>
  <div class="enrollment-app-progress">
    <Transition
      name="progress"
      mode="out-in"
    >
      <div
        v-if="!isSubmitted"
        ref="content"
        class="enrollment-app-progress__content"
      >
        <BaseText
          variant="headline-2-semibold"
          as="h1"
          class="enrollment-app-progress__title"
        >
          Submitting requests
        </BaseText>
        <BaseText
          variant="body-3-semibold"
          class="enrollment-app-progress__paragraph"
        >
          Looking for information on data broker sites
        </BaseText>
        <LineProgress
          :progress="progress"
          :height="10"
          :width="indicatorWidth"
          class="enrollment-app-progress__indicator"
        />
        <BaseText
          variant="body-3-semibold"
          class="enrollment-app-progress__paragraph"
        >
          {{ Math.floor(progress * 100) }}% Complete
        </BaseText>
        <ul
          v-if="scannedBrokersDisplayed?.length"
          class="enrollment-app-progress__brokers"
        >
          <li
            v-for="broker in scannedBrokersDisplayed"
            :key="broker.id"
            class="enrollment-app-progress__brokers-item"
          >
            <BaseSheet
              class="enrollment-app-progress__broker"
              rounding="sm"
            >
              <div class="enrollment-app-progress__broker-indicator" />
              <BaseText
                variant="body-2-semibold"
                class="enrollment-app-progress__broker-name"
              >
                {{ broker.name }}
              </BaseText>
              <Transition
                name="status"
                mode="out-in"
              >
                <BaseText
                  v-if="broker.status === 'done' && broker.hasRecords"
                  variant="body-3-semibold"
                  class="enrollment-app-progress__broker-exposed"
                >
                  Found Your Data
                </BaseText>
                <BaseText
                  v-else-if="broker.status === 'done'"
                  variant="body-3-semibold"
                  class="enrollment-app-progress__broker-clean"
                >
                  Scanned
                </BaseText>
                <span v-else>
                  <span class="enrollment-app-progress__broker-scanning" />
                </span>
              </Transition>
            </BaseSheet>
          </li>
          <li class="enrollment-app-progress__brokers-item">
            <BaseText
              variant="body-2-semibold"
              class="enrollment-app-progress__others"
            >
              <template
                v-if="
                  scannedBrokers.length &&
                  scannedBrokers?.length - scannedBrokersDisplayed?.length > 0
                "
              >
                +{{ scannedBrokers.length - scannedBrokersDisplayed.length }}
                other
                {{
                  scannedBrokers.length - scannedBrokersDisplayed.length === 1
                    ? "site scanned"
                    : "sites scanned"
                }}
              </template>
              <template v-else>Scanning more sites...</template>
            </BaseText>
          </li>
        </ul>
      </div>
      <div
        v-else
        class="enrollment-app-progress__content"
      >
        <BaseIcon
          name="check"
          class="enrollment-app-progress__success"
        />
        <BaseText
          variant="headline-2-semibold"
          as="h1"
          class="enrollment-app-progress__title"
        >
          Requests submitted!
        </BaseText>
        <BaseSheet class="enrollment-app-progress__next">
          <BaseText
            variant="headline-4-bold"
            as="h2"
            class="enrollment-app-progress__next-title"
          >
            What happens next
          </BaseText>
          <BaseText
            variant="body-2-semibold"
            as="p"
            class="enrollment-app-progress__next-text"
          >
            We're submitting removal requests to each broker that has your data.
            Brokers are legally required to process each request. Most brokers
            remove your info within 7-45 days.
          </BaseText>
        </BaseSheet>
        <ul
          v-if="submittedBrokersDisplayed.length"
          class="enrollment-app-progress__brokers"
        >
          <li
            v-for="broker in submittedBrokersDisplayed"
            :key="broker.id"
            class="enrollment-app-progress__brokers-item"
          >
            <BaseSheet
              class="enrollment-app-progress__broker"
              rounding="sm"
            >
              <BaseText
                variant="body-2-semibold"
                class="enrollment-app-progress__broker-name"
              >
                {{ broker.name }}
              </BaseText>
              <BaseText
                variant="body-3-semibold"
                class="enrollment-app-progress__broker-submitted"
              >
                Request Sent
                <BaseIcon name="check" />
              </BaseText>
            </BaseSheet>
          </li>
          <li class="enrollment-app-progress__brokers-item">
            <BaseText
              variant="body-2-semibold"
              class="enrollment-app-progress__others"
            >
              We’re submitting more removal requests on your behalf in the
              background. Continue below to watch your progress.
            </BaseText>
          </li>
        </ul>
        <BaseButton
          size="lg"
          full-width
          class="enrollment-app-progress__cta"
          @click="$emit('see-results')"
        >
          {{ cta }}
        </BaseButton>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
:global(
  .enrollment-v2-enroll:has(.enrollment-app-progress)
    .enrollment-v2-enroll__header
) {
  display: none;
}

:global(
  .enrollment-v2-enroll:has(.enrollment-app-progress)
    .enrollment-v2-enroll__content
) {
  padding-top: 0;
  padding-bottom: 0;
}

.enrollment-app-progress {
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 540px;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__success {
    font-size: 64px;
    border: 3px solid $color-safe-zone-green;
    padding: 16px;
    border-radius: 100px;
    color: $color-safe-zone-green;
    background-color: $color-safe-zone-green-15;
    animation: bounce 0.35s ease-out forwards;

    @keyframes bounce {
      0% {
        transform: scale(0.2);
      }

      60% {
        transform: scale(1.12);
      }

      100% {
        transform: scale(1);
      }
    }
  }

  &__title {
    margin-top: 24px;
  }

  &__paragraph {
    margin-top: 16px;
  }

  &__indicator {
    margin-top: 16px;

    :deep(.progress-line__indicator) {
      stroke: $color-safe-zone-green;
    }

    :deep(.progress-line__background) {
      stroke: $color-safe-zone-green-15;
    }
  }

  &__next {
    margin-top: 32px;
    width: 100%;
    background-color: $color-safe-zone-blue-15;
    border-color: $color-safe-zone-blue-30;

    &-title {
      color: $color-primary-100;
    }

    &-text {
      margin-top: 12px;
      color: $color-primary-90;
    }
  }

  &__brokers {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    &-item {
      width: 100%;
      opacity: 0;
      animation: appear-bottom-5 0.3s forwards ease-out;
      color: $color-primary-90;

      @for $i from 1 through 6 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.02s};
        }
      }
    }
  }

  &__broker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    transition: all 250ms ease-out;

    &:has(.enrollment-app-progress__broker-exposed) {
      background-color: $color-status-yield-15;
      border-color: rgba($color-status-yield, 0.3);
    }

    &:has(.enrollment-app-progress__broker-clean) {
      background-color: $color-safe-zone-green-15;
      border-color: $color-safe-zone-green-30;
    }

    &:has(.enrollment-app-progress__broker-submitted) {
      background-color: $color-safe-zone-green-15;
      border-color: $color-safe-zone-green-30;
    }

    &-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      margin-right: auto;
    }

    &-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-primary-30;

      @at-root .enrollment-app-progress__broker:has(
            .enrollment-app-progress__broker-scanning
          )
          & {
        animation: pulse 1s ease-in-out infinite;
      }

      @at-root .enrollment-app-progress__broker:has(
            .enrollment-app-progress__broker-exposed
          )
          & {
        background-color: $color-info;
      }

      @at-root .enrollment-app-progress__broker:has(
            .enrollment-app-progress__broker-clean
          )
          & {
        background-color: $color-success;
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }

        50% {
          transform: scale(1.4);
          opacity: 0.6;
        }

        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    }

    &-scanning {
      display: block;
      flex-shrink: 0;
      color: $color-primary-30;
      width: 1em;
      height: 1em;
      border-radius: 50%;
      background: linear-gradient(currentcolor 40%, transparent 70%);
      mask: radial-gradient(closest-side, transparent 70%, black 70%);
      animation: rotate 0.5s linear infinite;

      @keyframes rotate {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    }

    &-clean {
      flex-shrink: 0;
      color: $color-success;
    }

    &-exposed {
      flex-shrink: 0;
      color: $color-info;
    }

    &-submitted {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      color: $color-success;
    }
  }

  &__others {
    text-align: center;
    display: block;
    width: 100%;
    opacity: 0.7;
    padding: 16px 5%;
  }

  &__cta {
    margin-top: 16px;
  }

  .progress-enter-active,
  .progress-leave-active {
    transition: all 250ms ease-in-out;
  }

  .progress-leave-to {
    opacity: 0;
    transform: translateY(-15px);
  }

  .progress-enter-from {
    opacity: 0;
    transform: translateY(15px);
  }

  .status-enter-active {
    transition: all 150ms ease-in-out !important;
  }

  .status-leave-active {
    transition: all 50ms ease-in-out !important;
  }

  .status-leave-to {
    opacity: 0;
    transform: translateX(-5px);
  }

  .status-enter-from {
    opacity: 0;
    transform: translateX(5px);
  }
}
</style>
