<script setup>
import axios from "axios";
import CloaksList from "@/routes/your-cloaks/CloaksList";
import { reactive, computed, onMounted, markRaw } from "vue";
import store from "@/store";
import NoIdentities from "@/routes/your-cloaks/NoIdentities.vue";
import { useRoute } from "vue-router";
import AddCloakToCategory from "@/routes/modals/categories/AddCloakToCategory";
import CategoryService from "@/api/actions/category-service";
import EditCategoryButton from "@/features/categories/EditCategoryButton.vue";
import { cloakHelpers } from "@/scripts/cloakHelpers";
import { search } from "@/scripts/search";

const route = useRoute();

const PAGE_SIZE = 30;

const sorted = computed(() => {
  return store.state?.ui?.identitySortType;
});

const state = reactive({
  page: 0,
  loading: false,
  filter: cloakHelpers.getFilterFromRoute(route),
  showAddCloaksModal: false,
  fetchingCategory: false,
  category: store.state.categories.custom.find(
    (cat) => cat.id == route?.params?.id
  ),
});

onMounted(() => {
  getCategoryData();
});

const cloaks = computed(() => {
  return store.state.localdb.db_cloaks;
});

const categoryId = computed(() => {
  return route.params.id;
});

const allCloaks = computed(() => {
  if (cloaks.value) {
    return cloaks.value.filter(
      (cloak) =>
        cloak?.categories?.includes(parseInt(categoryId.value)) || cloak.id < 0
    );
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

const category = computed(() => {
  return state.category;
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

function toggleAddCloaksModal(show) {
  if (show) {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(AddCloakToCategory),
        props: {
          category: category.value,
          isModalVisible: true,
          identitiesInCategory: allCloaks.value,
        },
        events: {
          addCloaksToCategory: (newCloaks) => addCloaksToCategory(newCloaks),
        },
      },
    });
  }
}

function addCloaksToCategory(newCloaks) {
  const identityIds = newCloaks.map((c) => c.id);
  CategoryService.addCloaksToCategory(categoryId.value, identityIds);
}

const source = axios.CancelToken.source();
function getCategoryData() {
  if (!state.fetchingCategory) {
    state.fetchingCategory = true;
    CategoryService.refreshCategory(source, categoryId.value)
      .then(({ data }) => {
        state.category = data;
        state.fetchingCategory = false;
      })
      .catch(() => {
        state.fetchingCategory = false;
      });
  }
}
</script>

<template>
  <div>
    <div v-if="!identityList.length && allCloaksLoaded">
      <EditCategoryButton :category-id="categoryId" />
      <NoIdentities
        identity-type="category"
        :callback="() => toggleAddCloaksModal(true)"
      />
    </div>
    <CloaksList
      v-else
      ref="cloaklist"
      title="Category"
      hover-text="Add cloak to category"
      :loading="state.loading"
      :identity-list="identityList"
      :all-cloaks-loaded="allCloaksLoaded"
      :filter-options="availabileFilters"
      @load-next-page="loadNextPage"
      @filter="(e) => setFilter(e)"
    />
  </div>
</template>
