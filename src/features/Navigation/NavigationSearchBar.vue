<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import store from "@/store";
import BaseIcon from "@/library/BaseIcon.vue";

const route = useRoute();
const router = useRouter();
const pageTitle = ref(route?.meta);
const globalSearch = ref("");

const MAIN_INBOX_PAGE_NAMES = [
  "Inbox",
  "Texts",
  "Calls",
  "Emails",
  "Requests",
  "Starred",
] as const;

const SPECIAL_INBOX_PAGE_NAMES = [
  "CategoryInbox",
  "CloakInbox",
  "FavoritesInbox",
  "RecentInbox",
  "StarredInbox",
] as const;

const ALL_INBOX_PAGE_NAMES = [
  ...MAIN_INBOX_PAGE_NAMES,
  ...SPECIAL_INBOX_PAGE_NAMES,
] as const;

type InboxPageName = (typeof ALL_INBOX_PAGE_NAMES)[number];

function isInboxRoute(routeName: string): routeName is InboxPageName {
  return ALL_INBOX_PAGE_NAMES.includes(routeName as InboxPageName);
}

function clearSearchOnNavigation(
  newRouteName?: string,
  oldRouteName?: string
): void {
  if (!oldRouteName || !newRouteName) return;

  const wasInbox = isInboxRoute(oldRouteName);
  const nowInbox = isInboxRoute(newRouteName);

  if (wasInbox && (!nowInbox || oldRouteName !== newRouteName)) {
    store.dispatch("inbox/setSearch", "");
    store.dispatch("setSearch", "");
    globalSearch.value = "";
  }
}

onMounted(() => {
  if (inbox.value) {
    globalSearch.value = store.state.inbox?.search || "";
  } else {
    globalSearch.value = store.state.identitySearch || "";
  }
});

watch(
  () => route.meta,
  (newMeta) => {
    pageTitle.value = newMeta;
  }
);

watch(
  () => route.name,
  (newRouteName, oldRouteName) => {
    clearSearchOnNavigation(
      typeof newRouteName === "string" ? newRouteName : undefined,
      typeof oldRouteName === "string" ? oldRouteName : undefined
    );
  }
);

const navTitle = computed(() => {
  const meta = pageTitle?.value as { title?: string } | undefined;
  return meta?.title?.toLowerCase() || "this page";
});
const inbox = computed(() => route?.meta?.nav === "inbox");

watch(globalSearch, (value) => {
  const action = inbox.value ? "inbox/setSearch" : "setSearch";
  store.dispatch(action, value);

  if (value && route.query.page) {
    const { page, ...queryWithoutPage } = route.query;
    router.replace({
      name: route.name,
      params: route.params,
      query: queryWithoutPage,
    });
  }
});
</script>

<template>
  <div class="navigation-search">
    <div
      class="navigation-search__input-wrapper"
      :class="{ 'navigation-search__input-wrapper--has-text': !!globalSearch }"
    >
      <BaseIcon
        name="search"
        class="navigation-search__icon navigation-search__icon--search"
      />
      <input
        id="inbox-search"
        v-model="globalSearch"
        type="text"
        :placeholder="`Search ${navTitle}`"
        autocomplete="off"
        class="navigation-search__input"
        :class="{ 'navigation-search__input--active': globalSearch }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-search {
  &__input-wrapper {
    background-color: $color-primary-1;
    border-radius: 30px;
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    position: relative;
    width: 325px;
    margin: 0 12px;
    overflow: hidden;
  }

  &__icon {
    color: $color-primary-100;
    position: absolute;
    top: 50%;
    font-size: 16px;
    transform: translateY(-50%);

    &--search {
      left: 10px;
    }
  }

  &__input {
    outline: none;
    color: $color-primary-100;
    padding: 8px 10px 8px 40px;
    background-color: $color-primary-5;
    border: 2px solid $color-primary-5;
    border-radius: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;

    &::placeholder {
      color: $color-primary-70;
    }

    &--active,
    &:focus {
      border-color: $color-primary-10;
      background-color: $color-primary-10;
    }
  }
}
</style>
