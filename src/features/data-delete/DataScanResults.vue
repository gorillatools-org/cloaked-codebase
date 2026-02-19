<script setup>
import { useRoute } from "vue-router";
import { onMounted, provide, computed, inject, ref } from "vue";
import DataDeletePageNoResults from "@/features/data-delete/DataDeletePageNoResults.vue";
import DataScanPagePhoneResults from "@/features/data-delete/DataScanPagePhoneResults.vue";
import DataDeleteTryAgain from "@/features/data-delete/DataDeleteTryAgain.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_SCAN_RESULTS_FEEDBACK_BUTTONS } from "@/scripts/posthogEvents.js";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_RESULTS } from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";
import { networkVisualizationFlagKey } from "@/features/data-delete/injectionKeys";
import DataDeleteNetworkPage from "@/features/data-delete/family-network/components/DataDeleteNetworkPage.vue";

import UserService from "@/api/actions/user-service";
import { DATA_DELETE_SEARCHED_EXPOSURES } from "@/scripts/userFlags";

const route = useRoute();
const {
  featureFlag: thumbsFeedbackFlag,
  hasLoadedFeatureFlag: hasLoadedThumbsFeedbackFlag,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_SCAN_RESULTS_FEEDBACK_BUTTONS);

const hasUserViewedNetworkVisualization = ref(false);
const networkVisualizationFlag = inject(networkVisualizationFlagKey);

const props = defineProps({
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  numTotalResults: {
    type: Number,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  searchResults: {
    type: Array,
    default: () => [],
  },
  breachData: {
    type: Object,
    default: null,
  },
  totalBreachesCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["force-new-search", "setup"]);

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_RESULTS, {
    results: props.numTotalResults ?? 0,
    searchType: props.phone ? "phone" : "name",
    isForcingNewSearch: props.isForcingNewSearch,
    hasError: props.hasError,
  });

  UserService.setFlag({
    name: DATA_DELETE_SEARCHED_EXPOSURES,
    value: true,
  });
});

const onViewFullReport = () => {
  hasUserViewedNetworkVisualization.value = true;
};

provide(
  "canShowThumbsFeedback",
  computed(
    () =>
      hasLoadedThumbsFeedbackFlag.value && thumbsFeedbackFlag.value === "test-A"
  )
);
</script>

<template>
  <DataDeleteTryAgain v-if="hasError" />

  <div
    v-else
    class="data-delete-search-page"
  >
    <transition
      name="fade"
      duration="400"
    >
      <div v-if="searchResults[0]">
        <template
          v-if="
            networkVisualizationFlag?.canShowNetwork?.value &&
            !hasUserViewedNetworkVisualization
          "
        >
          <DataDeleteNetworkPage
            :search-result="searchResults[0]"
            :brokers-names="[]"
            :exposures-count="totalBreachesCount"
            v-bind="{ ...$attrs, class: null }"
            @view-full-report="onViewFullReport"
          />
        </template>
        <template v-else>
          <DataScanPagePhoneResults
            :search-results="searchResults"
            :phone="phone ?? route.query.phone"
            :is-forcing-new-search="isForcingNewSearch"
            :breach-data="breachData"
            :total-breaches-count="totalBreachesCount"
            @force-new-search="() => emit('force-new-search')"
            @setup="() => emit('setup')"
          />
        </template>
      </div>

      <DataDeletePageNoResults
        v-else
        v-bind="$attrs"
      />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.data-delete-search-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-delete__page:has(.data-delete-network-page) {
  padding: 0 !important;
}

.data-delete-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;

  &.data-delete-phone-results {
    padding-bottom: 92px + 8px !important;
  }

  &.data-delete-no-results {
    padding-bottom: 92px + 8px !important;
  }

  @media all and (min-width: $screen-xl) {
    flex-direction: row-reverse;
    justify-content: center;
    align-items: flex-start;
    gap: 90px;
    padding-bottom: 25px !important;
  }

  &__column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;

    &:first-child {
      align-items: center;
    }

    @media all and (min-width: $screen-xl) {
      flex-basis: 50%;
      flex-grow: 1;
      max-width: 560px;
      align-self: auto;
      margin-top: clamp(40px, 5vh, 150px);

      &:first-child {
        align-items: flex-start;
      }
    }
  }

  .data-delete__title,
  .data-delete__text {
    @media all and (min-width: $screen-xl) {
      text-align: start;
    }
  }

  &__table {
    z-index: 1;
    margin-top: -64px;
    margin-bottom: 32px + 60px;
    max-width: 2 * 560px + 90px;
    width: 100%;

    @media all and (min-width: $screen-xl) {
      margin-top: -32px;
      margin-bottom: 32px;
    }
  }
}
</style>
