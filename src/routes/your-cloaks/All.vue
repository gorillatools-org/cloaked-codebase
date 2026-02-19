<script setup>
import axios from "axios";
import CloaksList from "@/routes/your-cloaks/CloaksList";
import ArrowNE from "@/assets/icons/arrow-ne.svg";
import BreachesAlert from "@/features/breaches/BreachesAlert.vue";
import NoIdentities from "@/routes/your-cloaks/NoIdentities.vue";

import Loading from "@/features/ui/loading.vue";
import ReuseService from "@/api/actions/reuse-service";
import IdentityService from "@/api/actions/identity-service";

import { useRoute } from "vue-router";
import store from "@/store";

import {
  reactive,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  ref,
} from "vue";
import { cloakHelpers } from "@/scripts/cloakHelpers";
import { hash } from "@/scripts/hash";
import { search } from "@/scripts/search";

const route = useRoute();

const source = axios.CancelToken.source();

const PAGE_SIZE = 30;

const cloakListRef = ref(null);

const state = reactive({
  filter: cloakHelpers.getFilterFromRoute(route),
  sort: route.query.ordering || "-created_at",
  loading: false,
  isTotpFilterTooltipDisplayed: false,
  page: 1,
});

onBeforeUnmount(() => {
  source.cancel();
});

onMounted(() => {
  if (ready.value) {
    getOrCreateCloakedSupport();
    ReuseService.getInitialCount();
    if (route?.query?.id || route.params?.id) {
      // NOTE: params.id is only supported because extension still uses "/cloak/:id" url
      const encodedId = route.query?.id || route.params?.id;
      const identityId = hash.decode(encodedId);
      if (identityId) {
        store
          .dispatch("fetchPopulatedData", { id: identityId })
          .then((data) => {
            store.dispatch("openCloakDetails", { cloak: data });
          });
      }
    }
  }
});

const hasExpiringNumbers = computed(() => {
  return store.state.reuse.initialized && store.state.reuse.numbers.length > 0;
});

const ready = computed(() => {
  return (
    store.state.authentication.auth &&
    store.state.authentication.auth.access_token
  );
});

const dbLoaded = computed(() => {
  return store.getters.dbLoaded;
});

const identityList = computed(() => {
  const numToShow = state.page * PAGE_SIZE;
  let slicedCloakList = cloaksToShow.value.slice(0, numToShow);
  return slicedCloakList;
});

const allCloaks = computed(() => {
  if (store.state.localdb.db_cloaks) {
    return store.state.localdb.db_cloaks.filter((d) => !d.protected);
  }
  return [];
});

const availabileFilters = computed(() => {
  /* We add 'Show All' by default so if there
  are no additional identity-specific filters,
  then don't show the filters */
  const matchingIdentityFilters = cloakHelpers.getAvailableIdentityFilters(
    allCloaks.value
  );
  return matchingIdentityFilters;
});

const identitySearch = computed(() => {
  return store.getters.getIdentitySearch;
});

const cloaksToShow = computed(() => {
  const cloaksFilteredByFilters = cloakHelpers.getAvailableCloakFilters({
    allCloaks: allCloaks.value,
    sort: sorted.value,
    filter: state.filter,
  });

  const cloaksFilteredBySearch = search.searchLocalCloaksSingleList(
    cloaksFilteredByFilters,
    identitySearch.value
  );

  return cloaksFilteredBySearch;
});

const allCloaksLoaded = computed(() => {
  return state.page * PAGE_SIZE >= cloaksToShow.value.length;
});

const sorted = computed(() => {
  return store.state?.ui?.identitySortType;
});

watch(
  () => state.filter,
  () => {
    state.page = 1;
  },
  { deep: true }
);

function loadNextPage() {
  state.loading = true;
  const newPage = state.page + 1;
  state.page = newPage;
  state.loading = false;
}

function getOrCreateCloakedSupport() {
  if (!store.state.support_cloak) {
    const supportCloak = store.state.localdb.db_cloaks.find(
      (c) => c.protected && c.nickname.match(/team|support/i)
    );
    if (supportCloak) {
      store.commit("registerSupport", supportCloak);
    } else {
      return IdentityService.generateDefaultCloak();
    }
  }
}

function setFilter(filter) {
  if (filter !== state.filter) {
    state.filter = filter;
  } else {
    state.filter = "";
  }
}

function createNewIdentity() {
  store.dispatch("openCloakCreate");
}
</script>

<template>
  <div v-if="ready">
    <router-view />

    <Loading v-if="state.loading || !dbLoaded" />
    <NoIdentities
      v-else-if="
        !identityList.length && allCloaksLoaded && !identitySearch.length
      "
      identity-type="all"
      :callback="createNewIdentity"
    />
    <section
      v-else
      class="main-content"
    >
      <CloaksList
        v-if="dbLoaded"
        ref="cloakListRef"
        hover-text="New Identity"
        :add="true"
        :identity-list="identityList"
        :identifier-priority="state.filter"
        :filter-options="availabileFilters"
        :all-cloaks-loaded="allCloaksLoaded"
        :loading="state.loading"
        @load-next-page="loadNextPage"
        @filter="(e) => setFilter(e)"
      >
        <template #identity-banners>
          <div>
            <BreachesAlert />

            <div class="all-title">
              <div v-if="hasExpiringNumbers">
                <router-link
                  to="/number-reuse"
                  class="number-reuse"
                >
                  <span>Number clean up</span>
                  <span>
                    Review numbers
                    <ArrowNE />
                  </span>
                </router-link>
              </div>
            </div>
          </div>
        </template>
      </CloaksList>
    </section>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins.scss";

.title {
  padding: 0 36px;
  margin-bottom: 7px;
  margin-top: 24px;

  h1 {
    font-weight: 500;
    font-size: 32px;
    line-height: 48px;
    color: $color-primary-100;
  }
}

.all-title {
  display: flex;
  justify-content: space-between;
  margin: 0;
  align-items: center;

  .number-reuse {
    font-size: 12px;
    border-radius: 12px;
    padding: 8px 16px;
    gap: 20px;
    display: flex;
    justify-content: space-between;
    color: $color-primary-100;
    border: 1px solid $color-primary-20;
    background-color: $color-primary-5;
    margin-top: 16px;
  }
}

.main-content {
  background: $color-base-white-100;
}
</style>
