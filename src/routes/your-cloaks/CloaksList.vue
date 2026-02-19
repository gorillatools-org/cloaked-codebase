<script setup>
import store from "@/store";
import CloakCard from "@/features/global/CloakCard.vue";
import InfiniteLoader from "@/features/global/InfiniteLoader";
import MultiSelectToolbar from "@/routes/your-cloaks/MultiSelectToolbar";
import ListViewRow from "@/routes/your-cloaks/ListViewRow";
import CategoryService from "@/api/actions/category-service";
import IdentityService from "@/api/actions/identity-service";
import BaseText from "@/library/BaseText.vue";

import UserService from "@/api/actions/user-service";

import { min as lodashMin, max as lodashMax } from "lodash-es";

import { posthogCapture } from "@/scripts/posthog.js";
import { UI_IDENTITY_LIST_VIEW_TYPE } from "@/scripts/userFlags";

import {
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  reactive,
  computed,
  useSlots,
} from "vue";
const slots = useSlots();

import { useToast } from "@/composables/useToast.js";
import { constants } from "@/scripts/constants";
const toast = useToast();

let interval;

const props = defineProps({
  hoverText: { type: String, default: null },
  identityList: { type: Array, default: null },
  identifierPriority: { type: String, default: null },
  filterOptions: { type: Array, default: null },
  allCloaksLoaded: Boolean,
  loading: Boolean,
});

const emit = defineEmits(["multiselect", "loadNextPage", "sort", "filter"]);

const state = reactive({
  shiftKey: false,
  selected: [],
  keysPressed: [],
});

const viewType = computed(() => {
  return (
    store?.state?.flags?.onboarding[UI_IDENTITY_LIST_VIEW_TYPE] ||
    constants.VIEW_TYPE.GRID
  );
});

const isMultiselect = computed(() => {
  return state.shiftKey || state.selected.length > 0;
});

const ignoreDisplay = computed(() => {
  let status;
  for (const cloakId of state.selected) {
    const cloak = props.identityList.find((c) => c.id === cloakId);

    if (cloak) {
      const currCloakStatus = cloak.muted ? "Unignore" : "Ignore";
      if (!status) {
        status = currCloakStatus;
      } else if (currCloakStatus !== status) {
        // if selection has mixed muted status, behvaior should mute all
        status = "Ignore";
        break;
      }
    }
  }
  return status || "";
});

watch(
  () => isMultiselect.value,
  (val) => {
    store.commit("setIsMultiSelect", val);
  },
  { deep: true }
);

watch(
  () => store.getters.identities,
  (value) => {
    if (value.length > 0 && state.loading) {
      state.loading = false;
    }
  },
  { deep: true }
);

watch(
  () => state.selected,
  (value) => {
    emit("multiselect", value.length > 0);
  },
  { deep: true }
);

onMounted(() => {
  document.body.addEventListener("keydown", setKeys);
  document.body.addEventListener("keyup", unsetShift);
  window.addEventListener("blur", unsetShift);
});

onBeforeUnmount(() => {
  document.body.removeEventListener("keydown", setKeys);
  document.body.removeEventListener("keyup", unsetShift);
  window.removeEventListener("blur", unsetShift);
  if (interval) {
    clearInterval(interval);
  }
});

function setKeys(event) {
  if (isMultiselect.value && event?.key?.toLowerCase() === "escape") {
    setTimeout(() => {
      state.selected = [];
    }, 200);
  } else {
    state.keysPressed = [...state.keysPressed, event.key];
  }

  if (state.keysPressed.length > 1) {
    // NOTE: some key combinations do not trigger keyup event
    // if user presses any key combo we assume they are no longer in multi-select mode
    unsetShift();
  } else {
    state.shiftKey = event.shiftKey;
  }
}

function unsetShift() {
  state.keysPressed = [];
  state.shiftKey = false;
}

function handleClick(event) {
  event.stopPropagation();
}

function move({ category, identity }) {
  if (!isSelected(identity)) {
    toggleSelect(identity);
  }
  nextTick(() => {
    transferList(category);
  });
}

function toggleList() {
  if (state.selected.length > 0) {
    state.selected = [];
  } else {
    state.selected = props.identityList.map((d) => d.id);
  }
}

function transferList(cat) {
  const identityIds = [...new Set(state.selected)];
  CategoryService.addCloaksToCategory(cat.id, identityIds).then(() => {
    window.dispatchEvent(new CustomEvent("category:identities"));
    toast.success(
      `${state.selected.length === 1 ? "Identity" : "Identities"} moved to ${
        cat.name
      }`
    );
    state.selected = [];
  });
}

function unselectAll() {
  state.selected = [];
}

function selectAll() {
  state.selected = props.identityList.map((d) => d.id);
}

function ignoreList() {
  const mute = true;
  refresh(state.selected, { muted: mute });
  const payload = {
    mute,
    identity_ids: [...new Set(state.selected)],
  };

  IdentityService.updateMuteState(payload).then(() => {
    const phrase =
      state.selected.length > 1 ? "Identities Ignored" : "Identity Ignored";
    toast.success(phrase);
    state.selected = [];
  });
}

function unignoreList() {
  const mute = false;
  refresh(state.selected, { muted: mute });
  const payload = {
    mute,
    identity_ids: [...new Set(state.selected)],
  };

  IdentityService.updateMuteState(payload).then(() => {
    const phrase =
      state.selected.length > 1 ? "Identities Unignored" : "Identity Unignored";
    toast.success(phrase);
  });
}

function deleteList() {
  if (state.selected.length === 1) {
    const identity = props.identityList.find((f) => f.id === state.selected[0]);
    if (identity) {
      const name = identity.nickname || identity.app_ref;

      return store.dispatch("openModal", {
        header: `Delete ${name}?`,
        paragraphs: [
          `Deleting this cloak means that ${name} will no longer be able to contact you unless you give them new contact information.`,
          "It also means that we won't be able to help you sign in to any account associated with that information.",
        ],
        closeAfterOnClick: true,
        button: {
          text: "Yes, delete",
          danger: true,
          onClick: triggerDelete,
        },
      });
    }
  } else {
    return store.dispatch("openModal", {
      header: "Are you sure you want to delete all selected cloaks?",
      paragraphs: [
        "Deleting these cloaks means that they will no longer be able to contact you unless you give them new contact information.",
        "It also means that we won't be able to help you sign in to any account associated with the cloaks.",
      ],
      closeAfterOnClick: true,
      button: {
        text: "Yes, delete",
        danger: true,
        onClick: triggerDelete,
      },
    });
  }
}

function triggerDelete() {
  store.dispatch("deleteCloakFromLocalDB", state.selected);
  const identityIds = [...new Set(state.selected)];
  return IdentityService.bulkDeleteIdentity(identityIds)
    .then(() => {
      store.dispatch("recentlyImported/fetch", true);
      state.selected = [];
    })
    .catch(() => {
      toast.error("Error deleting your identity.");
    });
}

function toggleSelect(identity, off) {
  if (state.shiftKey) {
    const range = props.identityList
      .map((a, i) => {
        if (state.selected.findIndex((b) => b === a.id) !== -1) {
          return i;
        }
        return -1;
      })
      .filter((a) => a !== -1);
    const currentIndex = props.identityList.findIndex(
      (cloak) => cloak.id === identity.id
    );
    range.push(currentIndex);
    const min = lodashMin(range);
    const max = lodashMax(range);
    const filtered = props.identityList
      .filter((a, b) => {
        return b >= min && b <= max;
      })
      .map((d) => d.id);
    state.selected = [...state.selected, ...filtered];
  } else {
    if (off || isSelected(identity)) {
      state.selected = [...state.selected].filter((d) => d !== identity.id);
    } else {
      state.selected = [...state.selected, identity.id];
    }
  }
}

function isSelected(identity) {
  return state.selected.includes(identity?.id);
}

function selectIdentity(identity) {
  if (isMultiselect.value || state.shiftKey) {
    toggleSelect(identity);
  } else {
    store.dispatch("openCloakDetails", { cloak: identity });
  }
}

function refresh(identities, payload) {
  const updated = identities.map((id) => {
    const find = props.identityList.find((f) => f.id === id);
    return {
      ...find,
      ...payload,
    };
  });
  store.dispatch("updateCloaks", updated);
}

function toggleView(newViewType) {
  UserService.setFlag({ name: UI_IDENTITY_LIST_VIEW_TYPE, value: newViewType });
  if (newViewType === constants.VIEW_TYPE.LIST) {
    posthogCapture("user_clicked_listview");
  } else {
    posthogCapture("user_clicked_gridview");
  }
}
</script>

<template>
  <div class="page-wrapper">
    <MultiSelectToolbar
      tabindex="0"
      :is-multiselect="isMultiselect"
      :identity-list="props.identityList"
      :selected="state.selected"
      :ignore-display="ignoreDisplay"
      :filter-options="props.filterOptions"
      :view-type="viewType"
      @select="toggleList"
      @ignore="ignoreList"
      @unignore="unignoreList"
      @delete="deleteList"
      @transfer-list="transferList"
      @sort="(e) => emit('sort', e)"
      @filter="(e) => emit('filter', e)"
      @toggle-view="toggleView"
    />
    <div class="container">
      <div
        v-if="!!slots['identity-banners']"
        class="slot-identity-banners"
      >
        <slot name="identity-banners" />
      </div>

      <!-- LIST VIEW -->
      <div
        v-if="viewType === constants.VIEW_TYPE.LIST"
        class="list-view"
      >
        <div>
          <div class="list-view-title-wrap">
            <BaseText
              variant="caption-semibold"
              as="div"
              class="list-view-title"
            >
              Name
            </BaseText>
            <BaseText
              variant="caption-semibold"
              as="div"
              class="list-view-title"
            >
              Phone number
            </BaseText>
            <BaseText
              variant="caption-semibold"
              as="div"
              class="list-view-title"
            >
              Email address
            </BaseText>
            <BaseText
              variant="caption-semibold"
              as="div"
              class="list-view-title"
            >
              Username
            </BaseText>
            <BaseText
              variant="caption-semibold"
              as="div"
              class="list-view-title"
            >
              Password
            </BaseText>
            <BaseText
              variant="caption-semibold"
              as="div"
              class="list-view-title"
            />
          </div>
          <ListViewRow
            v-for="(identity, id_index) in props.identityList"
            :id="identity.id"
            :key="`list-view-${id_index}`"
            :identity="identity"
            :selected="isSelected(identity)"
            class="item"
            @select="toggleSelect(identity)"
          />
        </div>
        <InfiniteLoader
          ref="infinite"
          :loading="props.loading"
          :all-data-fetched="props.allCloaksLoaded"
          @load-more="emit('loadNextPage')"
        />
      </div>

      <!-- GRID VIEW -->
      <div
        v-else
        class="items"
      >
        <div
          v-for="(identity, id_index) in props.identityList"
          :id="identity.id"
          :key="`${identity.id}-${id_index}`"
          class="item"
          @mousedown="handleClick"
        >
          <CloakCard
            :aria-id="`CloakCardIdentity${identity?.id || ''}`"
            :identity="identity"
            :id-index="id_index"
            :no-select="identity.id === -1"
            :selected="isSelected(identity)"
            :is-multiselect="isMultiselect"
            :count="state.selected.length"
            :with-right-click="true"
            :identifier-priority="props.identifierPriority"
            :ignore-display="ignoreDisplay"
            @refresh="refresh"
            @ignore="ignoreList"
            @unignore="unignoreList"
            @delete="deleteList"
            @select="toggleSelect(identity)"
            @move="move"
            @unselect-all="unselectAll"
            @unselect="toggleSelect(identity, true)"
            @select-all="selectAll"
            @click="selectIdentity(identity)"
          />
        </div>

        <InfiniteLoader
          ref="infinite"
          :loading="props.loading"
          :all-data-fetched="props.allCloaksLoaded"
          @load-more="emit('loadNextPage')"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-wrapper {
  width: 100%;
}
.dragArea {
  z-index: 2000;
  position: fixed;
  background-color: $color-base-white-30;
  border: 4px;
  height: 100%;
}

.container {
  padding: 0 24px 24px 24px;
  height: 100%;
  user-select: none;
  width: 100%;
}

.add_new {
  display: inline-flex;
  border: none;
  cursor: pointer;
  align-items: center;
  height: 240px;
  border-radius: 20px;
  justify-content: center;
  background: $color-base-white-5;
  height: 240px;
  width: 190px;

  &:hover {
    background-color: $color-primary-10;
    @include transition(all 0.5s ease);
  }

  .plus {
    color: $color-primary-100;
  }
}

.title {
  margin-bottom: 28px;
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  > div {
    width: 100%;
  }
  h1 {
    font-style: normal;
    font-weight: 300;
    font-size: 40px;
    line-height: 60px;
    /* identical to box height */

    // display: flex;
    align-items: center;

    /* Primary/Light Mode/100 */

    color: $color-primary-100;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
  h3 {
    display: block;
    font-family: $global-font;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-base-white-60;
  }
  .visible_button {
    cursor: pointer;
  }
  .visible_button svg {
    background-color: transparent;
    border: none;
    margin-left: 10px;
  }

  .link {
    font-family: $global-font;
    font-weight: 500;
    font-size: 11px;
    line-height: 16px;
    text-transform: uppercase;
    color: $color-primary-100;
    padding: 5px;
    border: 0;
    border-radius: 4px;
    background: transparent;

    &:hover {
      cursor: pointer;
      background-color: rgba(98, 159, 193, 0.1);
    }
  }
}

.items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(171px, 1fr));
  gap: 8px;
  padding-top: 20px;
  min-width: 730px;
}

.loading {
  background: $color-base-white-5;
  border-radius: 8px;
  padding: 10px 20px;
  text-align: center;

  span {
    display: inline-block;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    width: 100%;
    text-align: center;
    color: $color-primary-100;
  }
}

.showModalOnHover {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 37px;
  font-size: 11px;
  color: $color-primary-5;
  position: absolute;
  margin-top: 170px;
  margin-left: 100px;
  border-radius: 6px;
  background-color: $color-base-white-90;
  box-shadow:
    -22.9px -8.90123px 26.7037px rgba(1, 2, 24, 0.05),
    13.3518px 12.35px 26.7037px rgba(1, 2, 24, 0.16);
  backdrop-filter: blur(100px);
  z-index: 1;
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 730px;
  width: 100%;
  padding-top: 0;

  .list-view-title-wrap {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    .list-view-title {
      color: $color-primary-70;
      width: 200px;
      padding-left: 8px;
      &:first-of-type {
        width: calc(200px + 38px);
        padding-left: 0px;
      }
      &:last-of-type {
        width: 110px !important;
      }
    }
  }
}

@media (max-width: 1475px) {
  .list-view-title {
    width: 175px !important;
    &:first-of-type {
      width: calc(175px + 38px) !important;
    }
    &:last-of-type {
      width: 110px !important;
    }
  }
}
@media (max-width: 1345px) {
  .list-view-title {
    width: 150px !important;
    &:first-of-type {
      width: calc(150px + 38px) !important;
    }
    &:last-of-type {
      width: 110px !important;
    }
  }
}
@media (max-width: 1225px) {
  .list-view-title {
    width: 125px !important;
    &:first-of-type {
      width: calc(125px + 38px) !important;
    }
    &:last-of-type {
      width: 110px !important;
    }
  }
}
@media (max-width: 1100px) {
  .list-view-title {
    width: 100px !important;
    &:first-of-type {
      width: calc(100px + 38px) !important;
    }
    &:last-of-type {
      width: 110px !important;
    }
  }
}
</style>
