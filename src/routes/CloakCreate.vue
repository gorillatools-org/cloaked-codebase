<script setup>
import { url } from "@/scripts/validation";
import { standardizeUrl } from "@/scripts/format";
import WebService from "@/api/actions/web-service";
import IdentityService from "@/api/actions/identity-service";
import CategoryService from "@/api/actions/category-service";
import store from "@/store";
import { useRoute } from "vue-router";
const route = useRoute();

import { reactive, onMounted, nextTick, computed, watch, ref } from "vue";
import SidebarHeader from "@/features/Sidebar/SidebarHeader.vue";
import SidebarCloseButton from "@/features/Sidebar/SidebarCloseButton.vue";
import InputSpinner from "@/features/InputSpinner.vue";
import SectionList from "@/features/SectionList.vue";
import { useToast } from "@/composables/useToast.js";

let fetchWebSearchTimeout;

const cloakNicknameRef = ref(null);

const emit = defineEmits(["done"]);

onMounted(() => {
  setTimeout(() => cloakNicknameRef?.value?.focus(), 300);
});

const state = reactive({
  nickname: "",
  results: [],
  searching: false,
  active: null,
});

const listItems = computed(() => {
  const stateResults = [...state.results];
  return getListItems(stateResults);
});

function getListItems(stateResults) {
  let items = [];
  if (stateResults.length) {
    items = stateResults;
  }

  if (state.nickname.length) {
    const customCloak = {
      title: `Create "${state.nickname}"`,
      nickname: state.nickname,
    };
    if (items.length && items[0].title && items[0].title.startsWith("Create")) {
      items[0] = customCloak;
    } else {
      items.unshift(customCloak);
    }
  }
  return items;
}

const sectionTitle = computed(() => {
  return "";
});

watch(
  () => state.nickname,
  (name) => {
    if (!name.length) {
      state.active = null;
    }
    searchWithTimeout(name);
  },
  { deep: true }
);

function handleClosePanel() {
  store.dispatch("closeRightPanel");
}

function handleEnter() {
  if (state.active === null) {
    return searchWithTimeout(state.nickname);
  } else {
    return selectWebsite(listItems.value[state.active]);
  }
}

async function searchWebsites(query) {
  state.results = [];
  if (state.searching || !query) {
    return;
  }

  state.searching = true;
  state.active = 0;

  let strippedQuery;

  try {
    strippedQuery = new URL(query).host;
    strippedQuery = strippedQuery.replace("www.", "");
  } catch {
    strippedQuery = query.toLowerCase();
  }

  return WebService.searchWebsites(strippedQuery)
    .then(({ data }) => {
      if (data && data.results) {
        state.results = data.results.map((website) => ({
          ...website,
          logo_url: getImageFor(website),
          nickname: website.name,
          website_url: website.base_domain,
        }));
      } else {
        state.results = [];
      }

      if (!state.results.length) {
        return;
      }

      const exactMatch = state.results.findIndex(
        (item) => item.base_domain === strippedQuery
      );

      if (exactMatch >= 0) {
        const items = [...state.results];
        const item = items[exactMatch];

        items.splice(exactMatch, 1);
        state.results = [item, ...items];
        state.active = 1;
      }
    })
    .catch(() => {
      state.results = [];
    })
    .finally(() => {
      state.searching = false;
    });
}

function getImageFor(website) {
  return (
    website.logo_url ||
    website.icon_image_url ||
    website.logo_image_url ||
    website.logo_svg_url ||
    website.icon_svg_url
  );
}

function selectName(listItem) {
  let payload = {};
  if (listItem.nickname) {
    payload.nickname = listItem.nickname;
  }
  payload.category = "personal";
  createCloak(payload);
}

function selectWebsite(listItem) {
  let payload = {};
  if (listItem.website_url) {
    payload.app_ref = listItem.nickname;
    payload.nickname = listItem.nickname;
    payload.website_url = listItem.website_url;
    payload.category = "website";
  } else {
    return selectName(listItem);
  }
  createCloak(payload);
}

const { error } = useToast();

function createCloak(payload) {
  if (url(payload.nickname)) {
    const url = new URL(standardizeUrl(payload.nickname));
    payload.website_url = url;
    payload.nickname = url.hostname;
  }

  IdentityService.createIdentity(payload).then(async ({ data }) => {
    emit("done", data);
    nextTick(reset);
    if (route.name.toLowerCase() === "category") {
      CategoryService.addCloaksToCategory(route.params.id, [data.id])
        .then(() => {})
        .catch(() => {
          error("Failed to add identity to category");
        });
    }
  });
}

function reset() {
  state.nickname = "";
  state.results = [];
  state.searching = false;
  state.active = null;
}

function searchWithTimeout(query) {
  if (fetchWebSearchTimeout) {
    clearTimeout(fetchWebSearchTimeout);
  }
  fetchWebSearchTimeout = setTimeout(() => searchWebsites(query), 300);
}

function nav(direction, override) {
  if (!listItems.value.length) {
    state.active = null;
    return;
  }

  if (override) {
    state.active = direction;
    return;
  }

  const max = listItems.value.length;
  let active = state.active || 0;

  active += direction;

  if (active === -1) {
    active = max - 1;
  }

  state.active = active % max;
}
</script>

<template>
  <section class="cloak-detail-wrapper">
    <SidebarHeader>
      <SidebarCloseButton @click="handleClosePanel" />
    </SidebarHeader>

    <div class="nickname-row">
      <input
        ref="cloakNicknameRef"
        aria-id="SearchOrAddInput"
        class="nickname-row__input"
        type="text"
        placeholder="Add name or URL"
        :value="state.nickname"
        autocomplete="off"
        maxlength="50"
        data-lpignore="true"
        :autofocus="true"
        @input="(event) => (state.nickname = event.target.value)"
        @keydown.enter="handleEnter"
        @keyup.up="nav(-1)"
        @keyup.down="nav(1)"
      />
    </div>

    <div
      v-if="state.searching"
      class="cloak-detail-wrapper__loader"
    >
      <InputSpinner />
    </div>

    <SectionList
      v-else
      :title="sectionTitle"
      :items="listItems"
      :active="state.active"
      @select.once="selectWebsite"
      @set-active="(idx) => nav(idx, true)"
    />
  </section>
</template>

<style lang="scss" scoped>
.cloak-detail-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__loader {
    width: 100%;
    display: flex;
    padding: 10px;
    justify-content: center;
    align-items: center;
  }
}

.nickname-row {
  padding: 18px 16px;

  &__input {
    width: 100%;
    height: 48px;
    border: none;
    font-weight: 300;
    font-size: 32px;
    line-height: 48px;
    color: $color-primary-100;
    background: $color-base-white-100;
    caret-color: #007aff;

    &:active,
    &:focus-visible {
      outline: none;
    }
  }
}
</style>
