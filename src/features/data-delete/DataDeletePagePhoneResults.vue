<script setup>
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeletePagePhoneResultsCard from "@/features/data-delete/DataDeletePagePhoneResultsCard.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import DataDeleteThreatLevel from "@/features/data-delete/atoms/DataDeleteThreatLevel.vue";
import DataDeleteEmailCaptureModal from "@/features/data-delete/atoms/DataDeleteEmailCaptureModal.vue";
import DataDeleteCompanyHeader from "@/features/data-delete/atoms/DataDeleteCompanyHeader.vue";
import {
  PH_EVENT_USER_CLICKED_DATA_DELETION_NOT_ME_BUTTON,
  PH_EVENT_USER_CLICKED_DATA_DELETION_SEARCH_RESULTS_CONTINUE_BUTTON,
  PH_EVENT_USER_VIEWED_DATA_DELETION_THREAT_LEVEL,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";
import { useRelativesParsing } from "@/features/data-delete/composables/useRelativesParsing";
import BaseText from "@/library/BaseText.vue";
import { computed, onMounted, ref, onBeforeUnmount, inject } from "vue";
import { PH_FEATURE_FLAG_DD_EMAIL_CAPTURE_MODAL } from "@/scripts/posthogEvents";
import { PH_FEATURE_FLAG_SCAN_IDENTITIES_COUNTER } from "@/scripts/posthogEvents.js";
import {
  usePostHogFeatureFlag,
  fetchFeatureFlag,
} from "@/composables/usePostHogFeatureFlag.js";
import { useRoute } from "vue-router";
import DataDeleteIdentitiesCounter from "@/features/data-delete/atoms/DataDeleteIdentitiesCounter.vue";
import { networkVisualizationFlagKey } from "@/features/data-delete/injectionKeys";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_DD_EMAIL_CAPTURE_MODAL
);

const {
  featureFlag: identitiesCounterFlag,
  hasLoadedFeatureFlag: hasLoadedIdentitiesCounterFlag,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_SCAN_IDENTITIES_COUNTER);

const networkVisualizationFlag = inject(networkVisualizationFlagKey);

const isEmailCaptureModalFlag = computed(
  () => hasLoadedFeatureFlag.value && featureFlag.value === true
);

const route = useRoute();

const props = defineProps({
  searchResults: {
    type: Array,
    default: () => [],
  },
  phone: {
    type: String,
    default: "",
  },
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
});

const isEmailCaptureOpen = ref(false);
const emit = defineEmits(["setup", "force-new-search"]);
const bestMatch = computed(() => props.searchResults[0] ?? null);

let autoOpenTimer;

onMounted(async () => {
  const { value: flag } = await fetchFeatureFlag(
    PH_FEATURE_FLAG_DD_EMAIL_CAPTURE_MODAL
  );

  if (!flag) return;

  if (bestMatch.value && props.phone) {
    autoOpenTimer = setTimeout(() => {
      isEmailCaptureOpen.value = true;
    }, 4000);
  }
});

onBeforeUnmount(() => {
  clearTimeout(autoOpenTimer);
});

const onDelete = () => {
  emit("setup");

  if (bestMatch.value?.relatives) {
    const { partners, relatives } = useRelativesParsing(
      bestMatch.value?.relatives
    );

    localStorage.setItem(
      "data-delete-relatives",
      JSON.stringify({
        data: [...partners.value, ...relatives.value, ...others.value].splice(
          0,
          3
        ),
      })
    );
  }

  sessionStorage.setItem(
    "data-delete",
    JSON.stringify({ ...bestMatch.value, searchDate: new Date() })
  );
  posthogCapture(
    PH_EVENT_USER_CLICKED_DATA_DELETION_SEARCH_RESULTS_CONTINUE_BUTTON,
    {
      isForcingNewSearch: props.isForcingNewSearch,
    }
  );
};

const onNotMe = () => {
  emit("force-new-search");
  posthogCapture(PH_EVENT_USER_CLICKED_DATA_DELETION_NOT_ME_BUTTON);
};

const threatLevel = ref("low");

const { partners, relatives, others } = useRelativesParsing(
  bestMatch.value?.relatives
);

// temporary tracking for measuring the threat level distribution
onMounted(() => {
  try {
    posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_THREAT_LEVEL, {
      addressCount: bestMatch.value?.locations?.length ?? null,
      phonesNumbersCount: bestMatch.value?.phones?.length ?? null,
      emailsCount: bestMatch.value?.emails?.length ?? null,
      partnersCount: partners.value?.length ?? null,
      relativesCount: relatives.value?.length ?? null,
      friendsOrAssociatesCount: others.value?.length ?? null,
      threatLevel: threatLevel.value,
    });
    localStorage.removeItem("data-delete-relatives");
  } catch (e) {
    console.error(e);
  }
});

// for enterprise scan
const isEnterpriseLeadScanResults = computed(
  () => !!route.query?.email_address
);

const canShowCounter = computed(() => {
  if (networkVisualizationFlag?.canShowNetwork.value) {
    return false;
  }

  return (
    bestMatch.value &&
    hasLoadedIdentitiesCounterFlag.value &&
    (identitiesCounterFlag.value === "test-A" ||
      identitiesCounterFlag.value === "test-B")
  );
});
</script>

<template>
  <div
    v-if="canShowCounter"
    class="data-delete-results__counter"
  >
    <DataDeleteIdentitiesCounter
      :type="
        identitiesCounterFlag === 'test-A'
          ? 'identity-theft-reports'
          : 'exposures-removed'
      "
    />
  </div>
  <DataDeleteCompanyHeader />
  <div
    class="data-delete-results data-delete-phone-results"
    :class="{ 'data-delete-results--with-counter': canShowCounter }"
  >
    <div class="data-delete-results__column">
      <DataDeleteThreatLevel
        :threat-level="threatLevel"
        :animation-delay="200"
      />
      <BaseText
        v-if="threatLevel === 'high'"
        as="p"
        variant="headline-6-medium"
        class="data-delete__text data-delete-results__supporting-text"
      >
        A lot of your vulnerable information was accessible and found on 100+
        data brokers.
      </BaseText>
      <BaseText
        v-else
        as="p"
        variant="headline-6-medium"
        class="data-delete__text data-delete-results__supporting-text"
      >
        Some of your vulnerable information was accessible and found on 100+
        data brokers.
      </BaseText>
      <DataDeleteSticky class="data-delete-phone-results__cta">
        <a
          v-if="isEnterpriseLeadScanResults"
          href="https://calendar.app.google/MXaBzzaZhermx9FU7"
          class="data-delete-phone-results__cta-button data-delete-phone-results__cta-link"
        >
          <BaseText variant="body-2-semibold">Schedule a call now!</BaseText>
          <span class="data-delete-phone-results__cta-link-icon">
            <BaseIcon name="arrow-right" />
          </span>
        </a>
        <BaseButton
          v-else
          variant="primary"
          size="lg"
          icon="arrow-right"
          class="data-delete-phone-results__cta-button"
          full-width
          @click="onDelete"
        >
          Delete your online data
        </BaseButton>
      </DataDeleteSticky>
    </div>
    <div class="data-delete-results__column">
      <DataDeletePagePhoneResultsCard
        v-model="isEmailCaptureOpen"
        :result="bestMatch"
        :phone="phone"
        :is-forcing-new-search="isForcingNewSearch"
        :is-email-capture-modal-flag="isEmailCaptureModalFlag"
        @threat-level="threatLevel = $event"
        @on-not-me="onNotMe"
      />
    </div>
    <DataDeleteEmailCaptureModal
      v-if="isEmailCaptureModalFlag"
      v-model="isEmailCaptureOpen"
      :phone="phone"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-results {
  &__counter {
    padding-bottom: 0;
    animation: expand-counter 0.3s ease-out forwards;
    animation-delay: 1s;
  }

  & &__column {
    align-self: center;

    @media all and (min-width: $screen-xl) {
      align-self: auto;

      &:first-child {
        position: sticky;
        top: 48px;
        z-index: 10;
      }
    }
  }

  & &__supporting-text {
    animation: appear-bottom-5 0.3s forwards ease-out;
    animation-delay: 0.5s;
    opacity: 0;
  }
}

.data-delete-results--with-counter .data-delete-results__column {
  @media all and (min-width: $screen-xl) {
    &:first-child {
      top: 100px;
    }
  }
}

.data-delete-phone-results {
  &__cta {
    margin-top: 16px;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.65s forwards ease-out;

    &-button {
      width: 100%;
    }

    &-link {
      display: inline-grid;
      grid-template-columns: 44px 1fr 44px;
      grid-template-areas: "left text right";
      align-items: center;
      column-gap: 8px;
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 5px;
      cursor: pointer;
      white-space: nowrap;
      text-decoration: none;
      min-height: 54px;
      width: 100%;
      background-color: $color-primary-100;
      color: $color-primary-1;

      &:hover {
        opacity: 0.9;
      }

      .base-text {
        grid-area: text;
        text-align: center;
        padding: 0 6px;
        font-weight: 600;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: block;
      }
    }

    &-link-icon {
      grid-area: right;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $color-primary-90;
      border-radius: 50%;
      font-size: 16px;
      font-weight: 500;
      width: 44px;
      height: 44px;
    }
  }
}

@keyframes expand-counter {
  from {
    padding-bottom: 0;
  }

  to {
    padding-bottom: 80px;
  }
}
</style>
