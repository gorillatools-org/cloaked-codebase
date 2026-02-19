<script setup>
import moment from "moment";
import { useRoute } from "vue-router";
import { uniqBy } from "lodash-es";
import {
  computed,
  watch,
  reactive,
  ref,
  nextTick,
  onUnmounted,
  onMounted,
} from "vue";
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";

import router from "@/routes/router";
import store from "@/store";
import { db } from "@/store/modules/localdb";
import InboxService from "@/api/actions/inbox-service";
import InboxListItem from "@/features/inbox/InboxListItem";
import InboxListSkeleton from "@/features/inbox/InboxListSkeleton";
import Checkbox from "@/features/ui/input/Checkbox";
import InlineSvg from "@/features/InlineSvg";
import InboxMenu from "@/features/inbox/InboxMenu";
import { useToast } from "@/composables/useToast.js";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import axios from "axios";
import { hash } from "@/scripts/hash";
import { constants } from "@/scripts/constants";
import BaseText from "@/library/BaseText";

const source = axios.CancelToken.source();

const toast = useToast();

const route = useRoute();

const state = reactive({
  loading: false,
  count: 0,
  pageSize: 20,
  selected: [],
  activities: [],
});

let searchTimeout;
const inboxListKey = ref(0);

const page = ref(Number(route?.query?.page) || 1);

const pageName = computed(() => {
  return route?.name;
});

let loadedDate;
let pollingInterval;

const queryType = ref(route?.query?.type);

onMounted(() => {
  window.addEventListener("visibilitychange", togglePolling);
  window.addEventListener("reset:cache", deleteStoredCacheAndRefetch);
});

onUnmounted(() => {
  window.removeEventListener("reset:cache", deleteStoredCacheAndRefetch);
  window.removeEventListener("visibilitychange", togglePolling);
  clearInterval(pollingInterval);
  source.cancel();
});

const categories = computed(() => store.getters["getCategories"]);

const searchIdentity = computed(() => {
  if (pageName.value.toLowerCase() === "cloakinbox") {
    const id = hash.decode(route?.params?.id);
    const identity = store.state.localdb.db_cloaks.find((i) => i.id === id);
    return identity;
  }
  return null;
});

const searchCategory = computed(() => {
  if (pageName.value.toLowerCase() === "categoryinbox") {
    const id = hash.decode(route?.params?.id);
    const category = categories.value.find((i) => i.id === id);
    return category;
  }
  return null;
});

const searchFavorites = computed(() => {
  return pageName.value.toLowerCase() === "favoritesinbox";
});

const searchRecent = computed(() => {
  return pageName.value.toLowerCase() === "recentinbox";
});

const { featureFlag: activity25Flag } = usePostHogFeatureFlag(
  "dashboard-activity-2-5"
);

const searchTerm = computed(() => {
  return store.state.inbox.search;
});

const pages = computed(() => {
  return Math.ceil(state.count / state.pageSize);
});

const isAllSelected = computed(() => {
  return (
    state.activities.length > 0 &&
    state.selected.length === state.activities.length
  );
});

const isSomeSelected = computed(() => {
  return (
    state.activities.length > 0 &&
    state.selected.length > 0 &&
    state.selected.length !== state.activities.length
  );
});

const range = computed(() => {
  let start = (page.value - 1) * state.pageSize + 1;
  start = start || 1;
  let end = start + state.pageSize - 1;
  end = Math.min(end, state.count);
  if (state.count > 0) {
    return `${start}-${end} of ${state.count}`;
  }
  return `0 of 0`;
});

const queryTypeDisplay = computed(() => {
  let activityType = "all";
  if (constants.MAIN_INBOX_PAGE_NAMES.includes(pageName.value)) {
    activityType = constants.INBOX_ROUTE_TYPE_CONVERSION[pageName.value];
  } else if (queryType.value) {
    activityType = queryType.value;
  }
  if (activityType === "all") {
    return "messages";
  }
  if (queryType.value === "message") {
    return "texts";
  }
  if (queryType.value === "starred") {
    return "starred messages";
  }
  return activityType.slice(-1).toLowerCase() !== "s"
    ? activityType + "s"
    : activityType;
});

// Create a reactive live query that watches ALL activity cache entries
// This will re-run whenever ANY cache entry changes
const allActivityCache = useObservable(
  liveQuery(async () => {
    const [v2Entries, v25Entries] = await Promise.all([
      db.cache
        .where("url")
        .startsWithIgnoreCase("api/v2/cloaked/activity/")
        .toArray(),
      db.cache
        .where("url")
        .startsWithIgnoreCase("api/v2_5/cloaked/activity/")
        .toArray(),
    ]);
    return [...v2Entries, ...v25Entries];
  })
);

// Watch for cache updates and find our current page's data
watch(
  [allActivityCache, activity25Flag],
  ([cacheEntries]) => {
    if (!cacheEntries || state.loading) return;

    const params = getParams();
    if (!params) return;

    // Build the expected key to match InboxService.getInbox (depends on dashboard-activity-2-5 flag)
    const queryKeys = { ordering: "-created_at", ...params };
    if (!activity25Flag.value) {
      queryKeys.group_threads = true;
      if (queryKeys.search) {
        queryKeys.sensitive_search = queryKeys.search;
        delete queryKeys.search;
      }
    }
    const queryParams = Object.keys(queryKeys)
      .map((key) => `${key}=${queryKeys[key]}`)
      .join("&");
    const activityBaseUrl = activity25Flag.value
      ? "api/v2_5/cloaked/activity/group/"
      : "api/v2/cloaked/activity/";
    const expectedKey = `${activityBaseUrl}?${queryParams}::get`;

    const cached = cacheEntries.find((entry) => entry.key === expectedKey);

    if (cached) {
      try {
        const payload = JSON.parse(cached.payload);
        state.activities = payload.data.results || [];
        state.count = payload.data.count || 0;
      } catch (err) {
        console.error("Error parsing cached activities:", err);
      }
    }
  },
  { immediate: false }
);

function resetPage() {
  source.cancel();
  state.loading = true;
  page.value = Number(route?.query?.page) || 1;
  inboxListKey.value += 1;
  state.count = 0;
  state.pageSize = 20;
  state.selected = [];
  state.activities = [];
  nextTick(fetchActivity);
}

watch(searchTerm, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    state.loading = true;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(resetPage, 500);
  }
  if (newVal === "") {
    state.loading = false;
  }
});

watch(
  () => pageName.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      if (constants.MAIN_INBOX_PAGE_NAMES.includes(newVal)) {
        queryType.value = null;
      } else {
        queryType.value = "all";
      }
      resetPage();
    }
  },
  { immediate: true }
);

watch(
  () => searchIdentity?.value?.id,
  () => {
    resetPage();
  }
);

watch(
  () => searchCategory?.value?.id,
  () => {
    resetPage();
  }
);

watch(
  () => queryType.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      if (route?.query?.type !== newVal) {
        router.replace({
          query: {
            ...route.query,
            type: newVal,
          },
        });
        resetPage();
      }
    }
  },
  { deep: true }
);

watch(
  () => page.value,
  (newVal) => {
    router.replace({
      query: {
        ...route.query,
        page: newVal,
      },
    });
  },
  { immediate: true }
);

function togglePolling() {
  if (document.hidden) {
    clearInterval(pollingInterval);
  } else {
    const polling = true;
    pollingInterval = setInterval(() => fetchActivity({ polling }), 30 * 1000);
  }
}

function getParams() {
  let params = {
    contact_status: "approved",
    muted: false,
  };

  if (searchTerm.value) {
    params.search = searchTerm.value;
  }
  if (constants.MAIN_INBOX_PAGE_NAMES.includes(pageName.value)) {
    const activityTypeForAPI =
      constants.INBOX_ROUTE_TYPE_CONVERSION[pageName.value];
    if (activityTypeForAPI === "requests") {
      params.contact_status = "unknown";
    } else if (activityTypeForAPI === "starred") {
      params.starred = true;
    } else if (activityTypeForAPI !== "all") {
      params.activity_type = activityTypeForAPI;
    }
  } else {
    // if page is an identity or category inbox, use query type
    if (queryType.value === "requests") {
      params.contact_status = "unknown";
    } else if (queryType.value === "starred") {
      params.starred = true;
    } else if (queryType.value !== "all") {
      params.activity_type = queryType.value;
    }
  }
  if (searchIdentity.value) {
    delete params.muted;
    params.identity = searchIdentity.value.id;
  } else if (searchCategory.value) {
    params.category = searchCategory.value.id;
  } else if (searchFavorites.value || searchRecent.value) {
    const timeline = moment().subtract(2, "weeks");
    const ids = store.state?.localdb?.db_cloaks?.filter((cloak) => {
      return searchFavorites.value
        ? cloak.favorited
        : moment(cloak.created_at).isAfter(timeline);
    });
    if (ids.length > 0) {
      const last = ids.pop();
      const list = ids.map((i) => `identity=${i.id}`);
      params[`${list.join("&")}&identity`] = last.id;
    } else {
      // if no identities are recent or favorite then there will be no activity
      state.activities = [];
      state.loading = false;
      state.count = 0;
      return null;
    }
  }

  params.page_size = state.pageSize;
  params.page = page.value;

  return params;
}

function fetchActivity({
  polling = false,
  prefetch = false,
  overWriteParams = {},
  useCache = true,
} = {}) {
  if (!polling && !prefetch) {
    deselectAll();
    state.loading = true;
  }

  let params = getParams();

  if (params === null) {
    return;
  }

  if (polling) {
    params.page_size = state.pageSize;
    params.created_at__gt = loadedDate;
    params.page = 1;
  }

  if (prefetch) {
    params.page = page.value + 1;
  }

  if (overWriteParams) {
    params = { ...params, ...overWriteParams };
  }

  if (polling || !useCache) {
    // NOTE: we never want to store polling data because it makes polling useless
    // we DO want to cache prefetch data, otherwise it makes prefetching useless
    useCache = false;
  } else {
    state.loading = true;
  }

  InboxService.getInbox(params, useCache, source)
    .then(({ data }) => {
      // If a regualar api call for current page
      if (!polling) {
        state.count = data.count;
      }
      if (!polling && !prefetch) {
        state.activities = data.results;

        if (params.page === 1) {
          // If data comes back, check for new activity
          if (data.results?.length) {
            loadedDate = data.results[0]?.created_at;
            fetchActivity({ polling: true });
          } else if (useCache) {
            // If no data found, force non-cached API call to check for updates
            // NOTE: cant use polling here since we have no timestamp
            //  to use if theres no data returned
            fetchActivity({ useCache: false });
          }
        }
        if (data.next) {
          // prefetches next page so it gets cached early
          // and will load instantly when user navs
          fetchActivity({ prefetch: true });
        }
      }

      if (polling) {
        // If data returned from polling, inject into current page

        if (data.count) {
          state.count += data.count;
          loadedDate = data.results[0]?.created_at;
          if (page.value === 1) {
            const uniqActivity = uniqBy(
              [...data.results, ...state.activities],
              "thread_id"
            );
            state.activities = uniqActivity.slice(0, state.pageSize);
          }
          params = {
            ordering: "-created_at",
            group_threads: true,
            ...params,
          };
          const queryParams = Object.keys(params).map((key) => {
            return `${key}=${params[key]}`;
          });
          // Invalidate cache for pages 2+
          store.dispatch("deleteCacheAllPages", {
            url: `api/v2/cloaked/activity/?${queryParams.join("&")}`,
          });
          // Refetch first page to update cached data in db
          fetchActivity({
            prefetch: true,
            overWriteParams: { page: 1 },
          });
        }
      }
      nextTick(() => {
        state.loading = false;
      });
    })
    .catch(() => {
      state.loading = false;
    });
}

function navTo(activity) {
  const activityType = getTypeForURL(activity);
  const detail = activity.email || activity.call || activity.message;
  const threadId = activity.thread_id || detail.thread_id;
  if (activityType) {
    router.push({ path: `/inbox/${activityType}/${threadId}/` });
  }
}

function getTypeForURL(activity) {
  if (activity?.email) {
    return "emails";
  } else if (activity?.message || activity?.call) {
    return "texts";
  }
  return null;
}

function selected(index) {
  return state.selected.includes(index);
}
function toggleSelect(index) {
  if (selected(index)) {
    state.selected = state.selected.filter((i) => i !== index);
  } else {
    state.selected.push(index);
  }
}

function selectAll() {
  if (state.selected.length === state.activities.length) {
    state.selected = [];
    return;
  }
  const selected = [];
  state.activities.map((_, index) => {
    selected.push(index);
  });
  state.selected = selected;
}

function deselectAll() {
  state.selected = [];
}

function setPage(change) {
  let newPage = page.value + change;
  if (newPage < 1) {
    newPage = 1;
  }
  if (newPage >= pages.value) {
    newPage = pages.value;
  }
  page.value = newPage;
  nextTick(fetchActivity);
}

async function deleteStoredCacheAndRefetch() {
  await Promise.all([
    store.dispatch("deleteCacheAllPages", {
      url: "api/v2/cloaked/activity/",
    }),
    store.dispatch("deleteCacheAllPages", {
      url: "api/v2_5/cloaked/activity/",
    }),
  ]);
  return setTimeout(() => {
    return nextTick(fetchActivity);
  }, 500);
}

function deleteAll() {
  store.dispatch("openModal", {
    header: `Delete ${state.selected.length} ${
      state.selected.length === 1 ? "message" : "messages"
    }`,
    subheader:
      "Any copies of this message that have been forwarded to your personal email will be unaffected.",
    button: {
      text: "Yes, Delete",
      onClick: () => {
        const threadIds = state.selected.map((index) => {
          return state.activities[index].thread_id;
        });
        InboxService.bulkDeleteActivity(threadIds)
          .then(async () => {
            state.selected = [];
            deleteStoredCacheAndRefetch();
            toast.success("Messages deleted");
          })
          .catch(() => {
            toast.error("Error deleting messages");
          });
      },
      danger: true,
    },
    cancelText: "Cancel",
  });
}

function markRead() {
  const ids = state.selected.map((index) => {
    return state.activities[index].thread_id;
  });
  InboxService.markThreadsAsRead(ids)
    .then(async () => {
      const newActivities = [];

      for (const activity of state.activities) {
        if (ids.includes(activity.thread_id)) {
          await store.dispatch("updateActivityCachedData", {
            threadId: activity.thread_id,
            key: "read",
            value: true,
          });
          if (activity.email) {
            activity.email.read = true;
          }
          if (activity.message) {
            activity.message.read = true;
          }
          if (activity.call) {
            activity.call.read = true;
          }
        }
        newActivities.push(activity);
      }
      state.activities = newActivities;
      toast.success("Marked as read");
      state.selected = [];
    })
    .catch(() => {
      toast.error("Unable to mark as read");
    });
}

function markStarred() {
  const ids = state.selected.map((index) => {
    return state.activities[index].thread_id;
  });
  InboxService.markThreadsStarred(ids)
    .then(async () => {
      const newActivities = [];

      for (const activity of state.activities) {
        if (ids.includes(activity.thread_id)) {
          await store.dispatch("updateThreadCachedData", {
            threadId: activity.thread_id,
            key: "starred",
            value: true,
          });
          activity.starred = true;
        }
        newActivities.push(activity);
      }
      state.activities = newActivities;
      toast.success("Marked as starred");
      state.selected = [];
    })
    .catch(() => {
      toast.error("Unable to mark as starred");
    });
}

function navOrFilterInbox(routeName) {
  if (constants.SPECIAL_INBOX_PAGE_NAMES.includes(pageName.value)) {
    queryType.value = constants.INBOX_ROUTE_TYPE_CONVERSION[routeName];
    return fetchActivity();
  }
  queryType.value = null;
  return router.push({ name: routeName });
}

function isSelected(routeName) {
  if (constants.SPECIAL_INBOX_PAGE_NAMES.includes(pageName.value)) {
    return constants.INBOX_ROUTE_TYPE_CONVERSION[routeName] === queryType.value;
  }
  return pageName.value.toLowerCase() === routeName.toLowerCase();
}
</script>

<template>
  <div :key="inboxListKey">
    <div>
      <InboxMenu @fetch="fetchActivity" />
      <div class="list-header">
        <div class="list-actions">
          <button
            class="select-button"
            @click="selectAll"
          >
            <Checkbox
              :checked="isAllSelected"
              :pending="isSomeSelected"
            />
          </button>
          <div
            v-if="state.selected.length === 0"
            class="select-actions"
          >
            <button
              :class="{ selected: isSelected('Inbox') }"
              @click="navOrFilterInbox('Inbox')"
            >
              <BaseText variant="body-small-medium">All</BaseText>
            </button>
            <button
              :class="{ selected: isSelected('Emails') }"
              @click="navOrFilterInbox('Emails')"
            >
              <BaseText variant="body-small-medium">Emails</BaseText>
            </button>
            <button
              :class="{ selected: isSelected('Texts') }"
              @click="navOrFilterInbox('Texts')"
            >
              <BaseText variant="body-small-medium">Texts</BaseText>
            </button>
            <button
              :class="{ selected: isSelected('Calls') }"
              @click="navOrFilterInbox('Calls')"
            >
              <BaseText variant="body-small-medium">Calls</BaseText>
            </button>
            <button
              :class="{ selected: isSelected('Requests') }"
              @click="navOrFilterInbox('Requests')"
            >
              <BaseText variant="body-small-medium">Requests</BaseText>
            </button>
            <button
              :class="{ selected: isSelected('Starred') }"
              @click="navOrFilterInbox('Starred')"
            >
              <BaseText variant="body-small-medium">Starred</BaseText>
            </button>
          </div>
          <div
            v-else
            class="selected-actions"
          >
            <button @click="deleteAll">
              <InlineSvg name="delete-trash" />
              <BaseText variant="body-small-medium">Delete</BaseText>
            </button>
            <button @click="markRead">
              <InlineSvg name="markasread-actionbar" />
              <BaseText variant="body-small-medium">Mark as read</BaseText>
            </button>
            <button @click="markStarred">
              <InlineSvg name="star-outline" />
              <BaseText variant="body-small-medium">Mark as starred</BaseText>
            </button>
          </div>
        </div>
        <div class="pagination">
          <button
            :disabled="page <= 1"
            @click="setPage(-1)"
          >
            <InlineSvg name="chevron-left" />
          </button>
          <BaseText
            as="div"
            variant="body-small-medium"
          >
            {{ range }}
          </BaseText>
          <button
            :disabled="page >= pages"
            @click="setPage(1)"
          >
            <InlineSvg name="chevron-right" />
          </button>
        </div>
      </div>
      <div v-if="!state.loading">
        <div
          v-if="state.activities.length > 0"
          class="inbox-list"
        >
          <InboxListItem
            v-for="(activity, index) in state.activities"
            :key="`activity-${activity.id}`"
            :highlight="searchTerm"
            :activity="activity"
            :selected="selected(index)"
            :class="{ selecting: state.selected.length > 0 }"
            @navigate="navTo(activity)"
            @select="toggleSelect(index)"
            @refetch="fetchActivity"
          />
        </div>
        <div
          v-else
          class="not-found"
        >
          <InlineSvg name="inbox" />
          <BaseText
            as="h3"
            variant="headline-3-bold"
          >
            No {{ queryTypeDisplay }}
          </BaseText>
        </div>
      </div>
      <div
        v-else
        class="loading-inbox"
      >
        <InboxListSkeleton />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.refresh-notice {
  justify-content: center;
  background-color: $color-primary-90;
  align-items: center;
  transition: all 1.5s ease-in-out;
  transition-delay: 250ms;
  transition-property: height, opacity;
  z-index: 10;
  display: flex;
  height: auto;
  opacity: 1;

  .refresh-notice-text {
    color: $color-primary-1;
    padding: 10px;
    gap: 10px;
    cursor: pointer;
    background-color: transparent;
    border: none;
    width: 100%;
  }

  .refresh-notice-icon {
    width: 16px;
    height: 16px;

    svg {
      width: 100%;
      height: 100%;
    }
  }
}

.list-header {
  position: sticky;
  top: 0;
  background-color: $color-base-white-100;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid $color-primary-10;
  color: $color-primary-100;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  z-index: 3;

  .list-actions {
    display: flex;
    align-items: center;
    justify-content: center;

    > button {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;
    }

    .select-actions,
    .selected-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
    }

    .select-actions {
      button {
        padding: 2px 10px;
        border-radius: 8px;
        background: none;
        color: inherit;
        border: none;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        transition: all 0.3s ease-in-out;

        &.selected {
          color: $color-primary-1;
          background-color: $color-primary-100;

          &:hover {
            transition: all 0.3s ease-in-out;
            color: $color-primary-1;
            background-color: $color-primary-100;
          }
        }

        &:hover {
          transition: all 0.3s ease-in-out;
          color: $color-primary-100;
          background-color: $color-primary-5;
          cursor: pointer;
        }
      }
    }

    .selected-actions {
      button {
        padding: 4px 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: none;
        color: inherit;
        border: none;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        transition: all 0.3s ease-in-out;

        svg {
          height: 14px;
          width: auto;
          display: inline-block;
          margin-right: 8px;
        }

        &:hover {
          color: $color-primary-100;
          background-color: $color-primary-5;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }
      }
    }

    .select-button {
      width: 32px;
      height: 32px;
      padding: 8px;
      border-radius: 0;
      position: relative;
    }
  }

  .pagination {
    display: flex;
    align-items: center;

    div {
      color: $color-primary-70;
      margin: 0 10px;
    }

    button {
      width: 24px;
      height: 24px;
      display: inline-block;
      position: relative;
      background: none;
      color: inherit;
      border: none;
      font: inherit;
      cursor: pointer;
      outline: inherit;
      border-radius: 50%;

      &.selected {
        color: $color-primary-1;
        background-color: $color-primary-100;
      }

      &:hover {
        color: $color-primary-100;
        background-color: $color-primary-5;
        cursor: pointer;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
      }

      svg {
        height: 12px;
        width: auto;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.inbox-list {
  width: 100%;
  overflow: hidden auto;
  display: flex;
  align-items: stretch;
  flex-flow: column wrap;
  align-content: flex-start;
}

.loading-inbox {
  padding: 30px;
  padding-top: 0;
  color: $color-primary-50;

  svg {
    height: 40px;
    width: auto;
  }

  h3 {
    font-size: 24px;
    font-weight: 600;
    color: $color-primary-100;
  }
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 180px 0 0;
  color: $color-primary-100;

  svg {
    height: 70px;
    width: auto;
  }

  h3 {
    color: $color-primary-100;
    margin-top: 20px;
  }
}

.inbox-menu {
  position: fixed;
  margin-top: 5px;
  width: 220px;
  border-radius: 20px;
  box-shadow: 5px 5px 10px rgb(0 0 0 / 10%);
  z-index: 1000;
  color: $color-primary-100;

  ul {
    max-height: 300px;
    overflow-y: auto;
    border-radius: 0 0 20px 20px;

    @include custom-scroll-bar;

    background-color: $color-primary-1;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;

      > div {
        width: 100%;
      }

      &.selected {
        background-color: $color-primary-5;
      }

      &:hover {
        background-color: $color-primary-5;
      }

      &.active {
        > svg {
          display: block;
        }
      }

      > svg {
        display: none;
      }

      h3 {
        font-size: 12px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        margin: 10px 0;
        padding: 0 10px;
      }

      padding: 0 12px;

      button {
        cursor: pointer;
        width: 100%;
        background-color: transparent;
        padding: 10px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        color: $color-primary-100;
      }
    }
  }
}
</style>
