<script setup>
import store from "@/store";
import ModalTemplate from "@/features/ModalTemplate.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import BaseButton from "@/library/BaseButton.vue";
import { searchLocalCloaksSingleList } from "@/scripts/search.js";
import { getFormattedNickname } from "@/scripts/formattedText.js";
import InfiniteLoader from "@/features/global/InfiniteLoader.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import {
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  watch,
  ref,
  defineComponent,
} from "vue";

const PAGE_SIZE = 100;

defineComponent(ModalTemplate);

const emit = defineEmits(["addCloaksToCategory"]);

const props = defineProps({
  isModalVisible: Boolean,
  category: { type: Object, default: null },
  identitiesInCategory: { type: Array, default: null },
});

const state = reactive({
  searchText: "",
  searchResults: [],
  active: null,
  selected: [],
  size: PAGE_SIZE,
  cloaksToBeRemoved: [],
  loadingSearch: false,
  showModal: false,
});

const searchCloaks = ref(null);

function addSize() {
  nextTick(() => {
    state.size = state.size + PAGE_SIZE;
  });
}
function checkForEscapeKey(e) {
  if (e?.key?.toLowerCase() === "escape" && props.isModalVisible) {
    state.showModal = false;
  }
}

function isSelected(identity) {
  return state.selected.map((selected) => selected.id).includes(identity.id);
}

function resetData() {
  state.searchText = "";
  state.searchResults = cloaksFilteredForSearch.value;
  state.active = null;
  state.selected = [];
}

function addCloaksToCategory() {
  if (props.category) {
    emit(
      "addCloaksToCategory",
      state.selected.map((c) => JSON.parse(JSON.stringify(c)))
    );
    state.showModal = false;
  }
  closeModal();
}

function search() {
  state.searchResults = searchLocalCloaksSingleList(
    cloaksFilteredForSearch.value,
    state.searchText
  );
  state.active = null;
  state.loadingSearch = false;
}

function nav(direction, override) {
  if (state.searchResults.length > 0) {
    if (override) {
      state.active = direction;
    } else {
      let active = state.active === null ? 0 : state.active + direction;
      if (active === -1) {
        active = state.searchResults.length - 1;
      }
      if (active > state.searchResults.length - 1) {
        active = 0;
      }
      state.active = active;
      const el = document.getElementById(`i-${active}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  } else {
    state.active = null;
  }
}
function select(identity) {
  const selectedIds = state.selected.map((selected) => selected.id);

  if (selectedIds.includes(identity.id)) {
    const selectedCopy = [...state.selected];
    const idx = selectedIds.indexOf(identity.id);
    const deselected = selectedCopy.splice(idx, 1);

    // NOTE: should not happen currently as we are filtering out identities in category
    if (identityIdsInCat.value.includes(deselected.id)) {
      state.cloaksToBeRemoved = [...state.cloaksToBeRemoved, deselected];
    }

    state.selected = selectedCopy;
  } else {
    state.selected = [...state.selected, identity];

    if (identityIdsInCat.value.includes(identity.id)) {
      const cloaksToBeRemovedCopy = [...state.cloaksToBeRemoved];
      const idx = selectedIds.indexOf(identity.id);
      cloaksToBeRemovedCopy.splice(idx, 1);
      state.cloaksToBeRemoved = cloaksToBeRemovedCopy;
    }
  }
  searchCloaks.value.focus();
}
function formatNickname(cloak) {
  return getFormattedNickname(cloak);
}

onMounted(() => {
  (state.searchResults = cloaksFilteredForSearch.value),
    document.addEventListener("keyup", checkForEscapeKey);
});

onBeforeUnmount(() => {
  document.removeEventListener("keyup", checkForEscapeKey);
});

const displayResults = computed(() => {
  return state.searchResults && state.searchResults.slice(0, state.size);
});

const categoryName = computed(() => {
  return props.category && props.category.name ? props.category.name : "";
});

const identityIdsInCat = computed(() => {
  return props.identitiesInCategory.map((m) => m.id);
});

const cloaks = computed(() => {
  return store.state.localdb.db_cloaks;
});

const cloaksFilteredForSearch = computed(() => {
  if (cloaks.value) {
    const results = [...cloaks.value].filter(
      (cloak) => !identityIdsInCat.value.includes(cloak.id) && !cloak.protected
    );
    return results;
  }
  return [];
});

watch(
  () => props.isModalVisible,
  (value) => {
    if (value) {
      state.showModal = true;
      setTimeout(() => searchCloaks.value.focus(), 2200);
      state.searchResults = cloaksFilteredForSearch.value;
    }
    resetData();
  },
  { deep: true },
  { immediate: true }
);

watch(
  () => state.searchText,
  (value) => {
    if (value.length) {
      search();
    } else {
      state.searchResults = cloaksFilteredForSearch.value;
    }
  },
  { deep: true }
);

function closeModal() {
  store.dispatch("closeModal");
}
</script>

<template>
  <ModalTemplate
    ref="modal"
    :show="true"
    full-height
    @close="closeModal"
  >
    <template #header>
      <h1>Move to {{ categoryName }}</h1>

      <BaseButton
        aria-id="CategorySaveButton"
        :disabled="state.selected.length === 0"
        @click="addCloaksToCategory"
      >
        Done
      </BaseButton>
    </template>

    <template #body>
      <div class="input-wrapper">
        <input
          ref="searchCloaks"
          aria-id="CategoryAddIDInput"
          type="text"
          placeholder="Type contact name, URL, or app"
          :value="state.searchText"
          autocomplete="off"
          @input="(event) => (state.searchText = event.target.value)"
          @keypress.enter="() => select(displayResults[state.active])"
          @keyup.up="nav(-1)"
          @keyup.down="nav(1)"
        />
      </div>

      <div
        v-if="displayResults && displayResults.length"
        ref="category_results"
        class="results"
      >
        <ul>
          <li
            v-for="(identity, idx) in displayResults"
            :id="`i-${idx}`"
            :key="identity.id"
            class="resultItem"
            :aria-id="`ResultIdentityName.${identity?.nickname || ''}`"
            :class="{
              selected: isSelected(identity),
              active: state.active === idx,
            }"
            @mousemove="nav(idx, true)"
            @click="() => select(identity)"
          >
            <div>
              <IdentityIcon :identity="identity" />
              <label>{{ formatNickname(identity) }}</label>
            </div>

            <InlineSvg
              v-if="isSelected(identity)"
              name="check-active"
            />
            <InlineSvg
              v-else
              name="check-inactive"
            />
          </li>
          <li>
            <InfiniteLoader
              v-if="state.searchResults.length > displayResults.length"
              ref="infinite"
              :all-data-fetched="
                state.searchResults.length <= displayResults.length
              "
              @load-more="addSize"
            />
          </li>
        </ul>
      </div>
      <div
        v-else-if="
          (!displayResults || !displayResults.length) &&
          state.searchText.length &&
          !state.loadingSearch
        "
        class="emptyResults"
      >
        <span>No search results found for</span>
        <span>"{{ state.searchText }}"</span>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
:deep(.modal-header__title) {
  display: flex;
  align-items: center;
  gap: 4px;

  h1 {
    flex: 1;
    overflow-wrap: break-word;
    word-wrap: break-word;
    // hyphens: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 280px;
  }
}

.cat-dialog-outer {
  background-color: $color-base-white-5;
  border: none;
  border-radius: 12px;
  padding: 0;
  width: 100%;
  margin-top: 65px;
}
.input-wrapper {
  position: sticky;

  input[type="text"] {
    position: relative;
    width: 100%;
    height: 48px;
    border-radius: 8px !important;
    overflow: hidden;
    padding: 12px 10px;
    background-color: $color-base-white-5;
    color: $color-primary-100;
    border: none;
    outline: none;
    &::placeholder {
      color: $color-primary-100;
      opacity: 0.4;
    }
    margin-bottom: 20px;
    position: relative;
  }
  .x-icon {
    position: absolute;
    right: 20px;
    margin-top: 22px;
    height: 36px;
    width: 36px;
    top: 0;
  }
}

.resultItem {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  > div:first-child {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  &:hover {
    cursor: pointer;
  }
  > div {
    width: 100%;
  }
  > span {
    border: 1.5px solid $color-primary-50;
    border-radius: 16px;
    height: 16px;
    width: 16px;
    cursor: pointer;
  }
}
.results {
  position: relative;
  padding-bottom: 25px;
  overflow-y: auto;
  max-height: calc(100% - 68px);
  height: fit-content;
  @include custom-scroll-bar;
  > div:first-child {
    text-transform: capitalize;
    font-size: 11px;
    padding-left: 20px;
  }
  > ul {
    > li {
      padding: 0px 10px;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      width: 100%;
      height: 50px;
      border: 1px solid $color-base-white-100;
      cursor: pointer;
      position: relative;

      svg {
        color: $color-primary-30;
        right: 10px;
      }

      &.selected {
        svg {
          color: $color-primary-100;
        }
      }

      > div > label {
        margin-left: 12px;
        color: $color-primary-100;
        width: calc(100% - 74px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.emptyResults {
  padding-top: calc(27px - 14px);
  padding-bottom: 27px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  color: $color-primary-100;
  > span:last-child {
    font-weight: 500;
  }
}
.header-row {
  margin-top: 48px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  > h1 {
    font-size: 20px;
    line-height: 30px;
    font-weight: 400px;
    padding: 0 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.selected {
  background-color: $color-base-white-5;
  border-radius: 8px;
}

.active {
  background-color: $color-base-white-5;
  border-radius: 8px;
}
#search-footer-wrapper {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
}
</style>
