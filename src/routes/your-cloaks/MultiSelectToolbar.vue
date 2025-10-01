<script setup>
import store from "@/store";
import InlineSvg from "@/features/InlineSvg";
import { computed, reactive } from "vue";
import { useToast } from "@/composables/useToast.js";
import { useRoute } from "vue-router";
import EditCategoryButton from "@/features/categories/EditCategoryButton.vue";
import CategoryService from "@/api/actions/category-service";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuScrollBody from "@/features/UiMenu/UiMenuScrollBody.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import { constants } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";

const route = useRoute();
const toast = useToast();

const props = defineProps({
  selected: { type: Array, default: null },
  identityList: { type: Array, default: null },
  ignoreDisplay: { type: String, default: null },
  filterOptions: { type: Array, default: null },
  viewType: {
    type: String,
    default: constants.VIEW_TYPE.GRID,
  },
});

const emit = defineEmits([
  "select",
  "ignore",
  "unignore",
  "delete",
  "filter",
  "transferList",
  "toggleView",
]);

const sortedOptions = [
  {
    label: "Date created",
    value: "-created_at",
  },
  {
    label: "Alphabetical",
    value: "nickname",
  },
];
const sorted = computed(() => {
  return store.state?.ui?.identitySortType;
});

const sortedLabel = computed(() => {
  return sortedOptions.find((f) => f.value === sorted.value)?.label;
});

const state = reactive({
  /*
  user will only see filter options for types that they have, ie if none of their identities have TOTP fields, they will
  not see one-time passcode as an option
  */
  filtered: props.filterOptions ? props.filterOptions[0] : [],
});

const categories = computed(() => {
  return store.state.categories.custom;
});

const identity = computed(() => {
  if (props.selected.length === 1) {
    return props.identityList.find((f) => f.id === props.selected[0]);
  }
  return null;
});

const currentCategoryId = computed(() => {
  if (identity.value?.categories) {
    return identity.value.categories[0];
  }
  return null;
});

const currentCategoryName = computed(() => {
  if (props.selected.length > 1) {
    return "all categories";
  }
  const currentCat = categories.value.find(
    (cat) => currentCategoryId.value === cat.id
  );
  if (currentCat) {
    return currentCat.name;
  }
  return null;
});

function isInCategory(cat) {
  if (identity.value?.categories) {
    return identity.value.categories.includes(cat.id);
  }
  return false;
}

function moveToCategory(cat) {
  emit("transferList", cat);
}

function toggleAction(action) {
  emit(action);
}

function onSortOptionSelect(opt) {
  store.dispatch("setSortType", opt.value);
}

function onFilterOptionSelect(opt) {
  emit("filter", opt.value);
  state.filtered = opt;
}

function removeIdentityFromCategory() {
  toast.success(
    `Removing identit${props.selected.length > 1 ? "ies" : "y"} from "${
      currentCategoryName.value
    }"...`
  );
  Promise.allSettled(
    props.selected.map((CloakId) => {
      const cloak = props.identityList.find((f) => f.id === CloakId);
      CategoryService.removeCloaksFromCategory(cloak.categories[0], [
        cloak?.id,
      ]);
    })
  )
    .then(() => {
      toast.success(
        `Identit${props.selected.length > 1 ? "ies" : "y"} removed!`
      );
    })
    .catch(() => {
      toast.error(
        `Error removing identit${
          props.selected.length > 1 ? "ies" : "y"
        } from "${currentCategoryName.value}"`
      );
    });
}
</script>

<template>
  <div class="multiselect-filters">
    <div class="select-all">
      <div
        v-if="selected.length > 0"
        class="filter-item"
        tabindex="0"
        @click="toggleAction('select')"
      >
        <InlineSvg
          key="minus-round-filled"
          name="minus-round-unfilled"
          width="20"
        />
        <BaseText
          as="p"
          variant="body-small-medium"
        >
          Deselect all
        </BaseText>
      </div>
      <div
        v-else
        class="filter-item-row"
      >
        <div
          class="filter-item"
          tabindex="0"
          @click="toggleAction('select')"
        >
          <InlineSvg
            key="select-all-identity"
            name="select"
            width="16"
          />
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            Select all
          </BaseText>
        </div>
        <div v-if="route.name.toLowerCase().includes('category')">
          <EditCategoryButton :category-id="route.params.id" />
        </div>
      </div>
      <div
        v-if="selected.length > 0"
        class="filter-items-group"
      >
        <div class="filter-item">
          <UiMenu
            v-if="selected.length > 0 && categories.length > 0"
            width="240px"
            max-height="295px"
            placement="bottom-start"
            has-content-click-close
          >
            <div class="filter-item no-padding">
              <InlineSvg name="arrow-right-filter" />
              <BaseText
                as="p"
                variant="body-small-medium"
              >
                Move category
              </BaseText>
            </div>
            <template #content>
              <UiMenuScrollBody>
                <UiMenuButton
                  v-if="currentCategoryName"
                  :title="`Remove from &quot;${currentCategoryName}&quot;`"
                  @click="removeIdentityFromCategory"
                >
                  <template #icon>
                    <InlineSvg name="minus-outline" />
                  </template>
                </UiMenuButton>
                <UiMenuSeparator
                  v-if="categories.length && currentCategoryName"
                />
                <UiMenuButton
                  v-for="(category, index) in categories"
                  :key="index"
                  :title="category.name"
                  :active="isInCategory(category)"
                  class="multiselect-filters__category-button titlecase"
                  @click="() => moveToCategory(category)"
                >
                  <template #icon>
                    <InlineSvg
                      v-if="isInCategory(category)"
                      name="checkmark_gray"
                    />
                  </template>
                </UiMenuButton>
              </UiMenuScrollBody>
            </template>
          </UiMenu>
        </div>
        <div
          class="filter-item"
          tabindex="0"
          @click="
            ignoreDisplay.toLowerCase() === 'ignore'
              ? toggleAction('ignore')
              : toggleAction('unignore')
          "
        >
          <InlineSvg
            :key="ignoreDisplay.toLowerCase()"
            :name="
              ignoreDisplay.toLowerCase() === 'ignore'
                ? 'notification-bell'
                : 'unmuted'
            "
            width="15"
          />
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            Ignore
          </BaseText>
        </div>
        <div
          class="filter-item"
          tabindex="0"
          @click="toggleAction('delete')"
        >
          <InlineSvg
            name="delete-actionbar"
            width="15"
          />
          <BaseText
            as="p"
            variant="body-small-medium"
          >
            Delete
          </BaseText>
        </div>
      </div>
    </div>
    <div class="row">
      <div
        v-if="props.filterOptions?.length > 0"
        class="sort"
      >
        <div class="sort-item">
          <UiMenu
            placement="bottom-start"
            tabindex="0"
          >
            <div class="selected-sort-item">
              <BaseText
                variant="body-small-medium"
                class="filter-label"
              >
                Filter:
              </BaseText>
              <BaseText
                as="p"
                variant="body-small-medium"
              >
                {{ state.filtered?.label || "All" }}
              </BaseText>
              <InlineSvg
                name="chevron-down"
                width="13"
              />
            </div>
            <template #content>
              <UiMenuScrollBody>
                <UiMenuButton
                  v-for="item in filterOptions"
                  :key="item?.value"
                  :title="item?.label"
                  class="titlecase"
                  tabindex="0"
                  @click="() => onFilterOptionSelect(item)"
                >
                  <template #icon>
                    <InlineSvg
                      v-if="state.filtered.value === item.value"
                      name="checkmark_gray"
                    />
                  </template>
                </UiMenuButton>
              </UiMenuScrollBody>
            </template>
          </UiMenu>
        </div>
        <div class="sort-item">
          <UiMenu
            placement="bottom-start"
            tabindex="0"
          >
            <div class="selected-sort-item">
              <BaseText
                variant="body-small-medium"
                class="filter-label"
              >
                Sort:
              </BaseText>
              <BaseText
                as="p"
                variant="body-small-medium"
              >
                {{ sortedLabel }}
              </BaseText>
              <InlineSvg
                name="chevron-down"
                width="13"
              />
            </div>
            <template #content>
              <UiMenuScrollBody>
                <UiMenuButton
                  v-for="item in sortedOptions"
                  :key="item.value"
                  :title="item.label"
                  tabindex="0"
                  @click="() => onSortOptionSelect(item)"
                >
                  <template #icon>
                    <InlineSvg
                      v-if="sorted === item.value"
                      name="checkmark_gray"
                    />
                  </template>
                </UiMenuButton>
              </UiMenuScrollBody>
            </template>
          </UiMenu>
        </div>
      </div>
      <div class="separator" />
      <div
        class="viewButton"
        :class="{ active: props.viewType === constants.VIEW_TYPE.GRID }"
        tabindex="0"
        @click="emit('toggleView', 'grid')"
      >
        <InlineSvg
          name="blocks"
          :class="{ hidden: props.viewType !== constants.VIEW_TYPE.GRID }"
        />
        <InlineSvg
          name="blocks-outline"
          :class="{ hidden: props.viewType === constants.VIEW_TYPE.GRID }"
        />
        <BaseText
          variant="body-small-medium"
          class="viewButtonText"
        >
          Grid View
        </BaseText>
      </div>
      <div
        class="viewButton"
        :class="{ active: props.viewType === constants.VIEW_TYPE.LIST }"
        tabindex="0"
        @click="emit('toggleView', 'list')"
      >
        <InlineSvg
          name="blocks-rect-filled"
          :class="{ hidden: props.viewType !== constants.VIEW_TYPE.LIST }"
        />
        <InlineSvg
          name="blocks-rect-outline"
          :class="{ hidden: props.viewType === constants.VIEW_TYPE.LIST }"
        />
        <BaseText
          variant="body-small-medium"
          class="viewButtonText"
        >
          List View
        </BaseText>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.multiselect-filters {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  fill: $color-primary-50;
  position: sticky;
  width: 100%;
  border-bottom: 1px solid $color-primary-10;
  background: $color-base-white-100;
  z-index: 2;
  flex-wrap: wrap;
  top: 0;
  padding: 0 24px;

  .viewButton {
    background-color: transparent;
    color: $color-primary-90;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    > svg {
      color: $color-primary-90;
      height: 16px;
      width: 16px;
    }
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    &:hover {
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      background-color: $color-primary-5;
    }
    &.active {
      background-color: $color-primary-10;
      color: $color-primary-100;
      > svg {
        color: $color-primary-100;
        height: 16px;
        width: 16px;
      }
    }

    .hidden {
      display: none;
    }
  }
  .select-all {
    display: flex;
    .filter-items-group {
      display: flex;
    }
    .filter-item {
      display: flex;
      align-items: center;
      column-gap: 8px;
      padding: 4px 10px;
      cursor: pointer;
      border-radius: 8px;
      height: 30px;

      &:hover {
        background: $color-primary-10;
      }
      &.small-gap {
        column-gap: 2px;
      }
      svg {
        color: $color-accent;
        path {
          color: $color-accent;
        }
      }

      &.no-padding {
        padding: 0;
      }
    }
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    .sort {
      display: flex;
      align-items: center;
      column-gap: 16px;
      .sort-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        &:first-of-type {
          margin-left: 10px;
        }
        .ui-menu {
          border-radius: 8px;
          padding: 6px 12px;
          z-index: 99;
          transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
          &:hover {
            transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
            background: $color-primary-10;
          }
        }
        .selected-sort-item {
          display: flex;
          align-items: center;
          span {
            color: $color-primary-50;
          }
          p {
            text-decoration: underline;
            margin: 0 6px 0 3px;
            color: $color-accent;
          }
          color: $color-accent;
          svg {
            margin-top: 2px;
          }
        }
        .filter-label {
          color: $color-primary-90;
        }
        .selected {
          color: $color-primary-10;
        }
      }
    }
  }
}

.separator {
  width: 1px;
  height: 24px;
  background-color: $color-primary-10;
  margin: 0 12px;
}

.filter-item-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

@media (max-width: 1290px) {
  .viewButtonText {
    display: none;
  }
}

.titlecase {
  text-transform: capitalize;
}
</style>
