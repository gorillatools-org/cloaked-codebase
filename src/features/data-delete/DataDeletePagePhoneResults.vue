<script setup>
import BaseButton from "@/library/BaseButton.vue";
import DataDeletePagePhoneResultsCard from "@/features/data-delete/DataDeletePagePhoneResultsCard.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import DataDeleteThreatLevel from "@/features/data-delete/atoms/DataDeleteThreatLevel.vue";
import DataDeleteEmailCaptureModal from "@/features/data-delete/atoms/DataDeleteEmailCaptureModal.vue";
import {
  PH_EVENT_USER_CLICKED_DATA_DELETION_NOT_ME_BUTTON,
  PH_EVENT_USER_CLICKED_DATA_DELETION_SEARCH_RESULTS_CONTINUE_BUTTON,
  PH_EVENT_USER_VIEWED_DATA_DELETION_THREAT_LEVEL,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";
import { useRelativesParsing } from "@/features/data-delete/composables/useRelativesParsing";
import BaseText from "@/library/BaseText.vue";
import { computed, onMounted, ref, onBeforeUnmount } from "vue";
import { PH_FEATURE_FLAG_DD_EMAIL_CAPTURE_MODAL } from "@/scripts/posthogEvents";
import {
  usePostHogFeatureFlag,
  fetchFeatureFlag,
} from "@/composables/usePostHogFeatureFlag.js";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_DD_EMAIL_CAPTURE_MODAL
);

const isEmailCaptureModalFlag = computed(
  () => hasLoadedFeatureFlag.value && featureFlag.value === true
);

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
  } catch (e) {
    console.error(e);
  }
});
</script>

<template>
  <div class="data-delete-results data-delete-phone-results">
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
        <BaseButton
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

.data-delete-phone-results {
  &__cta {
    margin-top: 16px;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.65s forwards ease-out;

    &-button {
      width: 100%;
    }
  }
}
</style>
