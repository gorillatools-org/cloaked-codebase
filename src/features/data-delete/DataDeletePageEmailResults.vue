<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import DataDeleteService from "@/api/actions/data-delete-service";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import DataDeleteThreatLevel from "@/features/data-delete/atoms/DataDeleteThreatLevel.vue";
import DataDeleteEmailHeader from "@/features/data-delete/DataDeleteEmailHeader.vue";
import DataDeleteResultsCardsSkeleton from "@/features/data-delete/atoms/DataDeleteResultsCardsSkeleton.vue";
import DataDeleteResultsThreatSkeleton from "@/features/data-delete/atoms/DataDeleteResultsThreatSkeleton.vue";
import DataDeleteResultsServicesSkeleton from "@/features/data-delete/atoms/DataDeleteResultsServicesSkeleton.vue";
import DataDeleteEmailBreachCard from "@/features/data-delete/atoms/DataDeleteEmailBreachCard.vue";
import AtomPaginationWidget from "@/library/AtomPaginationWidget.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { emailCheck } from "@/scripts/regex";
import {
  PH_EVENT_EMAIL_BREACH_SEARCH_STARTED,
  PH_EVENT_EMAIL_BREACH_RESULTS_VIEWED,
  PH_EVENT_EMAIL_BREACH_IDENTITY_REVEALED,
  PH_EVENT_EMAIL_BREACH_IDENTITY_MASKED,
} from "@/scripts/posthogEvents";
import store from "@/store";
import { useDisplay } from "@/composables/useDisplay";

const route = useRoute();
const { isMobile } = useDisplay();

const email = ref(route.query.email || "");
const breachData = ref(null);
const breachCompanies = ref(null);
const loading = ref(false);
const error = ref(null);

const currentPage = ref(1);
const totalPages = ref(1);
const hasNext = ref(false);
const hasPrevious = ref(false);
const pageSize = ref(10);

const hasBreaches = computed(() => breachData.value?.results?.length > 0);

const breachCount = computed(() => breachData.value?.count || 0);

const isAuthenticated = computed(() => {
  return store.getters.auth_token;
});

const hasLoaded = ref(false);
const isInitialSearch = ref(true);

function getUniqueBreachedCompanies(breaches) {
  const companies = breaches.flatMap((breach) =>
    (breach.breached_companies || []).map((c) => c.company_name)
  );

  return [...new Set(companies)];
}

const handleBreachRevealed = () => {
  posthogCapture(PH_EVENT_EMAIL_BREACH_IDENTITY_REVEALED);
};

const handleBreachMasked = () => {
  posthogCapture(PH_EVENT_EMAIL_BREACH_IDENTITY_MASKED);
};

const loadBreachData = async (page = 1) => {
  if (!emailCheck(email.value)) {
    error.value = "Please enter a valid email address";
    return;
  }

  loading.value = true;
  error.value = null;

  if (page === 1 && isInitialSearch.value) {
    posthogCapture(PH_EVENT_EMAIL_BREACH_SEARCH_STARTED, {
      email: email.value,
    });
  }

  try {
    const { data } = await DataDeleteService.getEmailBreachReport(
      email.value,
      page,
      pageSize.value
    );
    const results = Array.isArray(data?.results)
      ? data.results.map((item, index) => ({
          ...item,
          document_id: item.document_id || `breach-${index + 1}`,
        }))
      : [];

    breachData.value = { ...data, results };
    breachCompanies.value = getUniqueBreachedCompanies(results);
    currentPage.value = page;
    totalPages.value = Math.ceil(data.count / pageSize.value);
    hasNext.value = !!data.next;
    hasPrevious.value = !!data.previous;
    hasLoaded.value = true;

    if (page === 1 && isInitialSearch.value) {
      posthogCapture(PH_EVENT_EMAIL_BREACH_RESULTS_VIEWED, {
        email: email.value,
      });
      isInitialSearch.value = false;
    }
  } catch (err) {
    error.value = "Failed to load breach data";
    hasLoaded.value = true;
    console.error("Error loading breach data:", err);
  } finally {
    loading.value = false;
  }
};

const emit = defineEmits(["setup", "force-new-search"]);
const onNotMe = () => emit("force-new-search");

onMounted(() => {
  if (isAuthenticated.value && email.value && !hasLoaded.value) {
    loadBreachData();
  }
});

watch([isAuthenticated, email], ([authed, em]) => {
  if (authed && em && !hasLoaded.value && !loading.value) {
    loadBreachData();
  }
});

const breachStatus = () => {
  if (breachCount.value >= 12) {
    return "high";
  } else if (breachCount.value >= 6) {
    return "medium";
  } else if (breachCount.value >= 1) {
    return "low";
  } else {
    return "unknown";
  }
};

const onDelete = () => {
  emit("setup");
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && !loading.value) {
    loadBreachData(page);
  }
};
</script>

<template>
  <div class="data-delete-email-results__wrapper">
    <DataDeleteEmailHeader />

    <Transition
      name="fade-swap"
      mode="out-in"
      appear
    >
      <div
        v-if="!hasLoaded"
        class="data-delete-email-results"
      >
        <div class="data-delete-results__breaches">
          <div class="data-delete-email-results__container">
            <DataDeleteResultsCardsSkeleton :cards="4" />
          </div>
        </div>

        <div class="data-delete-results__threat-level">
          <DataDeleteResultsThreatSkeleton />
        </div>

        <div class="data-delete-results__breach-services">
          <DataDeleteResultsServicesSkeleton :rows="5" />
        </div>
      </div>

      <div
        v-else
        class="data-delete-email-results"
      >
        <div class="data-delete-results__breaches">
          <div class="data-delete-email-results__container">
            <div class="data-delete-email-results__email-section">
              <BaseText
                variant="headline-5-bold"
                class="data-delete-email-results__email-label"
              >
                Your email address
              </BaseText>
              <BaseText
                variant="headline-2-semibold"
                class="data-delete-email-results__email-address"
              >
                {{ email }}
              </BaseText>
            </div>

            <div class="data-delete-email-results__header">
              <button
                type="button"
                class="data-delete-email-results__not-you-button"
                @click="onNotMe"
              >
                Not your email?
              </button>
            </div>

            <hr class="data-delete-email-results__line" />

            <div class="data-delete-email-results__breaches-info">
              <BaseText variant="headline-5-bold">
                Details on {{ breachCount }}
                {{ breachCount === 1 ? "breach" : "breaches" }}:
              </BaseText>
            </div>

            <div
              v-if="hasBreaches"
              class="data-delete-email-results__breaches"
            >
              <DataDeleteEmailBreachCard
                v-for="(breach, idx) in breachData.results"
                :key="breach.document_id || idx"
                :breach="breach"
                @breach-revealed="handleBreachRevealed"
                @breach-masked="handleBreachMasked"
              />
            </div>

            <BaseText
              v-else
              variant="headline-3-medium"
              class="data-delete-email-results__no-breaches"
            >
              Great news! No breaches found for this email.
            </BaseText>

            <AtomPaginationWidget
              v-if="hasBreaches && breachCount > 10"
              :current-items-count="breachData?.results?.length || 0"
              :total-items-count="breachCount"
              :results-per-page="pageSize"
              :left-arrow-disabled="!hasPrevious || loading"
              :right-arrow-disabled="!hasNext || loading"
              :custom-offset="`Page ${currentPage} of ${totalPages} (${breachCount} total ${breachCount === 1 ? 'breach' : 'breaches'})`"
              :fetch-page-number-data="goToPage"
              :is-mobile="isMobile"
              class="data-delete-email-results__pagination"
            />

            <div
              v-if="error"
              class="data-delete-email-results__error"
            >
              <BaseText
                variant="headline-4-medium"
                class="data-delete-email-results__error-text"
              >
                {{ error }}
              </BaseText>
            </div>
          </div>
        </div>

        <div class="data-delete-results__threat-level">
          <DataDeleteThreatLevel
            :threat-level="breachStatus()"
            :animation-delay="200"
            :has-modal="false"
          />
          <BaseText
            variant="headline-3-medium"
            class="data-delete-email-results__subtitle"
          >
            {{ breachCount }} data
            {{ breachCount === 1 ? "breach" : "breaches" }} for your email
            address
          </BaseText>
          <DataDeleteSticky class="data-delete-results__cta">
            <BaseButton
              variant="primary"
              size="lg"
              icon="arrow-right"
              class="data-delete-results__cta-button"
              full-width
              @click="onDelete"
            >
              {{ isMobile ? "Remove My Data" : "Remove and Protect My Data" }}
            </BaseButton>
          </DataDeleteSticky>
        </div>

        <div
          v-if="hasBreaches && breachCompanies && breachCompanies.length > 0"
          class="data-delete-results__breach-services"
        >
          <BaseText
            as="h1"
            variant="headline-4-bold"
          >
            Breach Services
          </BaseText>
          <ul
            v-if="breachCompanies && breachCompanies.length > 0"
            class="data-delete-results__list"
          >
            <li
              v-for="company in breachCompanies.slice(0, 5)"
              :key="company"
              class="data-delete-results__item"
            >
              {{ company }}
            </li>
          </ul>
          <div v-if="breachCompanies && breachCompanies.length > 5">
            <BaseText
              variant="body-3-semibold"
              class="data-delete-results__more"
            >
              +{{ breachCompanies.length - 5 }} more breached
              {{ breachCompanies.length - 5 === 1 ? "service" : "services" }}
            </BaseText>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-email-results {
  position: relative;
  z-index: 2;
  justify-content: center;
  display: grid;
  margin: 0 auto;
  max-width: 1200px;
  grid-template-columns: 1fr;
  grid-template-rows: min-content min-content min-content 1fr;
  margin-bottom: 68px;

  &__pagination {
    margin-top: 2rem;
    padding: 1.5rem 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 16px;
    border-top: 1px solid $color-base-black-15;

    :deep(.icon-btn) {
      height: 24px;
      width: 24px;
      min-height: 24px;
      min-width: 24px;
      border: 1px solid $color-base-black-15;
      background: transparent;
      color: $color-primary-100;
      font-weight: 500;
      transition: all 0.2s ease;
      margin-inline: 10px;
      display: inline-flex;
      align-items: center;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: $color-base-black-10;
        border-color: $color-primary-70;
      }

      &.active {
        background: $color-primary-70;
        border-color: $color-primary-70;
        color: white;
      }
    }

    :deep(.cloak-identifier-section__count span) {
      font-size: 13px;
    }
  }

  &__wrapper {
    position: relative;
    z-index: 2;
    padding: 0;
    margin: 0;
    max-width: 100vw;
  }

  &__container {
    margin: 10px auto;
    border-radius: 30px;
    background: $color-base-black-10;
    padding: 24px 16px;
  }

  &__email-section {
    margin-bottom: 0.875rem;
    text-align: center;
  }

  &__email-label {
    display: none;
  }

  &__email-address {
    color: $color-primary-100;
    font-size: 1.5rem;
    word-break: break-all;
  }

  &__header {
    text-align: center;
  }

  &__title {
    margin-bottom: 1rem;
    color: $color-primary-70;
    text-decoration: underline;
    font-size: 1rem;
    text-decoration-color: $color-base-black-15;
    cursor: pointer;
  }

  &__not-you-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    color: $color-primary-70;
    text-decoration: underline;
    cursor: pointer;
    opacity: 0.9;
    position: relative;
    transition: opacity 0.2s ease;
    text-align: left;

    &::after {
      content: "";
      position: absolute;
      inset: -14px 0;
    }

    &:hover {
      opacity: 0.7;
    }
  }

  &__subtitle {
    margin-top: 1.25rem;
    margin-bottom: 2rem;
    font-size: 1.125rem;
    display: block;
    text-align: center;
  }

  &__threat-level {
    margin-bottom: 2rem;
  }

  &__breaches {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    :deep(.data-delete-card) {
      border-radius: 30px;
      padding: 20px;
    }
  }

  &__no-breaches {
    text-align: center;
    padding: 3rem 0;
  }

  &__error {
    text-align: center;
    padding: 2rem 0;
  }

  &__error-text {
    color: $color-status-error;
  }

  &__loading {
    text-align: center;
    padding: 2rem 0;
  }

  &__line {
    margin-block: 2rem;
    border: 1px solid $color-base-black-15;
  }

  &__breaches-info {
    margin-bottom: 1rem;
  }
}

.data-delete-results {
  &__breach-services {
    border-radius: 30px;
    border: 1px solid $color-status-yield;
    padding: 24px;
    width: 100%;
    grid-column: 1 / -1;
    grid-row: 3 / 4;
    margin: 24px 16px;
    max-width: calc(100% - 32px);
  }

  &__threat-level {
    grid-column: 1 / -1;
    grid-row: 1 / 2;
    padding: 37px 27px 0;
  }

  @media screen and (min-width: $screen-xl) {
    &__breach-services {
      position: sticky;
      top: 318px;
    }

    &__threat-level {
      position: sticky;
      top: 50px;
    }
  }

  @media screen and (min-width: $screen-sm) {
    &__threat-level {
      padding: 37px 27px 24px;
    }
  }

  &__breaches {
    grid-column: 1 / -1;
    grid-row: 2 / 3;
  }

  &__item {
    position: relative;
    padding-left: 14px;
    line-height: 1.9;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: $color-status-yield;
      transform: translateY(-50%);
    }
  }

  &__list {
    list-style: none;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
    padding: 0;
  }

  &__more {
    font-weight: 600;
  }
}

@media all and (min-width: $screen-sm) {
  .data-delete-email-results {
    margin-bottom: 0;

    &__email-address {
      font-size: 2rem;
    }
  }
}

@media all and (min-width: $screen-xl) {
  .data-delete-email-results {
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 42px;

    &__container {
      padding: 0 2rem 2rem;
      background: transparent;
    }

    &__email-label {
      margin-bottom: 0.5rem;
      display: block;
      font-size: 1.125rem;
    }

    &__email-section {
      text-align: left;
    }

    &__header {
      text-align: left;
    }
  }

  .data-delete-results {
    &__breaches {
      grid-column: 1 / 2;
      grid-row: 1 / -1;
      padding: 0;
    }

    &__threat-level {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
      padding: 0 32px 0 0;
    }

    &__breach-services {
      grid-column: 2 / 3;
      grid-row: 2 / 3;
      margin: 2rem 0 0;
    }
  }
}

.fade-swap-enter-active,
.fade-swap-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.fade-swap-enter-from,
.fade-swap-leave-to {
  opacity: 0;
}
</style>
