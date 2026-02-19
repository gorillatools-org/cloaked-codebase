<script setup>
import { get } from "lodash-es";
import store from "@/store";

import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";
import CloakInfoRow from "@/features/cloakDetails/CloakInfoRow.vue";
import { createValidUrl } from "@/scripts/format";
import { useToast } from "@/composables/useToast.js";
import { reactive, nextTick, watch, computed } from "vue";
import IdentityService from "@/api/actions/identity-service";
import WebService from "@/api/actions/web-service";
import SectionList from "@/features/SectionList.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import { formattedText } from "@/scripts/formattedText";

let searchTimeout;

const toast = useToast();

const emit = defineEmits(["refresh"]);

const props = defineProps({
  cloak: {
    type: Object,
    required: true,
  },
  refreshing: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  showReplaceNameModal: {
    type: Boolean,
    default: true,
  },
});

const state = reactive({
  results: [],
  urlQuery: "",
  websiteUrl: "",
  searching: false,
  active: null,
  newWebsiteSelected: null,
  expectsRefresh: false,
  loading: false,
  isFocused: false,
  saveFromList: false,
  forceReset: false,
});

function handleSelect(item) {
  state.saveFromList = true;
  selectedFromList(item);
}

function handleSetActive(idx) {
  nav(idx, true);
}

function handleBlur() {
  state.isFocused = false;
  /*
    Blur is also triggered after clicking on a menu item,
    so don't trigger the save function on blur if
    an item was selected from the list
  */
  if (state.saveFromList) {
    return;
  }

  checkAndSaveUrl();
}

function handleFocus() {
  state.isFocused = true;
}

function handleInput(value) {
  state.urlQuery = value;
  state.active = null;
  handleUrlUpdate(value);
}

function handleEnterPress() {
  if (searchTimeout || !state.results.length) {
    state.isFocused = false;
    return checkAndSaveUrl();
  }

  if (state.results.length) {
    state.saveFromList = true;
    const idx = state.active ? state.active : 0;
    selectedFromList(state.results[idx]);
  }
}

function handleUrlUpdate(newUrl) {
  clearTimeout(searchTimeout);

  if (newUrl) {
    nav(0, true);
    searchTimeout = setTimeout(() => {
      searchTimeout = null;
      searchWebsites(newUrl);
    }, 300);
  } else {
    state.active = null;
  }
}

function checkAndSaveUrl(selectedWebsite) {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  const selectedDomain =
    (selectedWebsite && selectedWebsite.base_domain) || state.urlQuery;

  if (selectedDomain.length) {
    if (selectedWebsite && selectedWebsite.custom) {
      if (formattedText.url(selectedDomain)) {
        state.urlQuery = formattedText.url(selectedDomain);

        return updateWebsite(state.urlQuery);
      } else {
        return errorSaving();
      }
    } else {
      return updateWebsite(selectedDomain);
    }
  }
}

function errorSaving() {
  const savedWebsiteUrl = state.websiteUrl;
  state.urlQuery = "";
  state.websiteUrl = " ";
  state.newWebsiteSelected = null;
  state.forceReset = true;
  state.saveFromList = false;
  toast.error("Please enter a valid url.");

  nextTick().then(() => {
    state.forceReset = false;
    state.websiteUrl = savedWebsiteUrl;
  });
}

function updateWebsite(newUrl) {
  if (state.loading) {
    return new Promise((resolve) => resolve());
  }

  store.dispatch("updateCloaks", [
    {
      ...props.cloak,
      website_url: newUrl,
    },
  ]);
  state.loading = true;

  return IdentityService.updateCloakWebsite(props.cloak.id, newUrl)
    .then(({ data }) => {
      state.urlQuery = "";
      state.expectsRefresh = true;
      const newCloakData = {
        ...props.cloak,
        website_url: newUrl,
        logo_url: data.logo_url,
      };
      store.dispatch("updateCloaks", [newCloakData]);
      emit("refresh", newCloakData);

      const name = get(data, "website.name", nickname.value);

      if (name && props.showReplaceNameModal) {
        store.dispatch("openModal", {
          header: "Replace name?",
          subheader: `Would you like to update the name of the identity to "${name}"?`,
          button: {
            text: "Replace name",
            onClick: () => replaceName(name),
          },
        });
      }
    })
    .catch(errorSaving)
    .finally(() => {
      state.loading = false;
      state.saveFromList = false;
    });
}

function selectedFromList(item) {
  state.newWebsiteSelected = item;
  checkAndSaveUrl(item);
  state.results = [];
  state.active = null;
}

async function searchWebsites(query) {
  if (!state.isFocused) {
    return;
  }

  if (!state.searching) {
    state.searching = true;

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
            nickname: website.name,
            website_url: website.base_domain,
          }));
        } else {
          state.results = [];
        }

        if (
          state.results.findIndex((res) => res.website_url === strippedQuery) <
          0
        ) {
          state.results = [{ nickname: query, custom: true }, ...state.results];
        } else {
          const exactMatch = state.results.findIndex(
            (item) => item.website_url === strippedQuery
          );

          if (exactMatch >= 0) {
            const items = [...state.results];
            const item = items[exactMatch];

            items.splice(exactMatch, 1);
            state.results = [item, ...items];
            state.active = 0;
          }
        }

        state.active = 0;
        state.searching = false;
      })
      .catch(() => {
        state.results = [];
        state.searching = false;
      });
  }
}

function deleteWebsite() {
  state.urlQuery = "";
  state.loading = true;

  IdentityService.deleteCloakWebsite(props.cloak.id)
    .then(() => {
      state.urlQuery = "";
      state.expectsRefresh = true;

      emit("refresh", {
        ...props.cloak,
        website_url: "",
        logo_url: "",
        website: null,
      });
    })
    .finally(() => {
      state.loading = false;
    });
}

function nav(direction, override) {
  if (!state.results.length) {
    state.active = null;
    return;
  }

  if (override) {
    state.active = direction;
    return;
  }

  const max = state.results.length;
  let active = state.active || 0;

  active += direction;

  if (active === -1) {
    active = max - 1;
  }

  state.active = active % max;
}

function replaceName(name) {
  const payload = { nickname: name };
  store.dispatch("updateCloaks", [
    {
      ...props.cloak,
      nickname: name,
    },
  ]);

  IdentityService.updateCloak(props.cloak.id, payload).then(() => {
    state.expectsRefresh = true;
    emit("refresh");
  });
  closeReplaceName();
}

function closeReplaceName() {
  state.newWebsiteSelected = null;
  store.dispatch("closeModal");
}

function resetResults() {
  state.results = [];
}

const nickname = computed(() => {
  return (
    state.newWebsiteSelected &&
    (state.newWebsiteSelected.name || state.newWebsiteSelected.title)
  );
});

const showResultsMenu = computed(() => {
  return [!!state.urlQuery, !!state.results.length, state.isFocused].every(
    Boolean
  );
});

watch(
  () => props.refreshing,
  (value) => {
    if (!value) {
      state.expectsRefresh = false;
    }
  },
  { deep: true }
);

watch(
  () => props.cloak.website_url,
  (value) => {
    if (!value || value.includes(NO_URL_IDENTITY_DOMAIN)) {
      state.websiteUrl = "";
    } else {
      state.websiteUrl = createValidUrl(value);
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="cloak-web-section">
    <CloakInfoRow
      field="website"
      placeholder="Add a website"
      :initial-value="state.websiteUrl"
      :loading="state.loading || state.expectsRefresh"
      :disable-enter="true"
      :force-delete="true"
      :force-reset="state.forceReset"
      :identity-id="props.cloak.id"
      :read-only="readOnly"
      @input="handleInput"
      @delete="deleteWebsite"
      @keydown.enter="handleEnterPress"
      @keyup.up="nav(-1)"
      @keyup.down="nav(1)"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #input-before>
        <UiMenu
          :value="showResultsMenu"
          width="264px"
          height="475px"
          placement="left-start"
          class="cloak-web-section__menu"
          @close="resetResults"
        >
          <template #content>
            <SectionList
              :items="state.results"
              :active="state.active"
              @set-active="handleSetActive"
              @select="handleSelect"
            />
          </template>
        </UiMenu>
      </template>
    </CloakInfoRow>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.cloak-web-section {
  padding: 2px 24px 20px;

  &__menu {
    position: absolute;
    inset: 0;
  }
}

#cloak-detail-website {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 12px;
  padding: 20px;

  &:focus-within {
    .deleteButtons {
      visibility: visible;
    }
  }

  &:hover {
    .link-out {
      visibility: visible;
    }

    .deleteButtons {
      visibility: visible;
    }
  }

  .website-header {
    color: $color-primary-50;
  }

  .deleteButtons {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    visibility: hidden;
    position: absolute;
    right: 15px;
    border: none;
  }

  .input-website {
    border-radius: 36px;
    outline: none;
    height: 36px;
    width: 100%;
    padding: 0 30px;
    border: none;
    background: transparent;
    position: relative;
    margin: 0 10px;

    &:focus {
      background: $color-primary-5;
    }

    &:hover {
      cursor: pointer;
      background: $color-primary-5;
    }
  }

  .link-out {
    visibility: hidden;
    position: absolute;
    right: 45px;
  }

  .link-chain-icon {
    position: absolute;
    left: 65px;
    z-index: 100;
  }
}
</style>
