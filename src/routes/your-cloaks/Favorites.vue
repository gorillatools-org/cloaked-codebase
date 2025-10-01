<script setup>
import CloaksList from "@/routes/your-cloaks/CloaksList";
import { reactive, computed } from "vue";
import store from "@/store";
import NoIdentities from "@/routes/your-cloaks/NoIdentities.vue";
import { useRoute } from "vue-router";
import { cloakHelpers } from "@/scripts/cloakHelpers";
import { search } from "@/scripts/search";
const route = useRoute();

const PAGE_SIZE = 30;

const state = reactive({
  page: 0,
  loading: false,
  filter: cloakHelpers.getFilterFromRoute(route),
});

const cloaks = computed(() => {
  return store.state.localdb.db_cloaks;
});

const allCloaks = computed(() => {
  if (cloaks.value) {
    return cloaks.value.filter((cloak) => cloak.favorited);
  }
  return [];
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

const identityList = computed(() => {
  const numToShow = state.page * PAGE_SIZE;
  let slicedCloakList = cloaksToShow.value.slice(0, numToShow);
  return slicedCloakList;
});

const allCloaksLoaded = computed(() => {
  return state.page * PAGE_SIZE >= cloaksToShow.value.length;
});

const availabileFilters = computed(() => {
  const matchingIdentityFilters = cloakHelpers.getAvailableIdentityFilters(
    allCloaks.value
  );
  return matchingIdentityFilters;
});

const sorted = computed(() => {
  return store.state?.ui?.identitySortType;
});

function loadNextPage() {
  state.loading = true;
  const newPage = state.page + 1;
  state.page = newPage;
  state.loading = false;
}

function setFilter(filter) {
  if (filter !== state.filter) {
    state.filter = filter;
  } else {
    state.filter = "";
  }
}
</script>

<template>
  <div>
    <NoIdentities
      v-if="!identityList.length && allCloaksLoaded"
      identity-type="favorite"
    />
    <CloaksList
      v-else
      ref="cloaklist"
      title="Favorites"
      :identity-list="identityList"
      :all-cloaks-loaded="allCloaksLoaded"
      :filter-options="availabileFilters"
      @load-next-page="loadNextPage"
      @filter="(e) => setFilter(e)"
    />
  </div>
</template>
