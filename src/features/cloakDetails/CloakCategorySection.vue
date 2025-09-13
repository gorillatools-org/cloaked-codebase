<script setup>
import { lowerCase } from "lodash-es";

import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuInput from "@/features/UiMenu/UiMenuInput.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import CloakDetailsInputRow from "@/features/cloakDetails/CloakDetailsInputRow.vue";
import AddEditNewCategory from "@/routes/modals/categories/AddEditNewCategory.vue";

import CategoryService from "@/api/actions/category-service.js";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import { reactive, ref, nextTick, watch, computed, markRaw } from "vue";
import { useToast } from "@/composables/useToast.js";
const toast = useToast();

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
});

const emit = defineEmits(["refresh", "refreshCloak"]);

const state = reactive({
  loading: false,
  loadingMessage: "",
  categoryFilter: "",
  expectsRefresh: false,
  isMenuOpen: false,
});

const componentElement = ref(null);

const categories = computed(() => {
  return store.getters.getCustomCategories;
});

const filteredCategories = computed(() => {
  if (!state.categoryFilter) {
    return categories.value;
  }

  return categories.value.filter((category) => {
    const a = lowerCase(category.name);
    const b = lowerCase(state.categoryFilter);

    return a.includes(b);
  });
});

const selectedCategoryId = computed(() => {
  if (props.cloak && props.cloak.categories && props.cloak.categories.length) {
    const catId = props.cloak.categories[0]; // assumes only one category for now
    return catId;
  }

  return null;
});

const categoryName = computed(() => {
  let name = "";

  if (selectedCategoryId.value) {
    const category = categories.value.find(
      (cat) => cat.id == selectedCategoryId.value
    );

    if (category) {
      name = category.name;
    }
  }
  return name;
});

const hasCategory = computed(() => {
  return props.cloak && props.cloak.categories && props.cloak.categories.length;
});

function moveToCat(category) {
  state.loading = true;
  state.loadingMessage = "Updating category";

  CategoryService.addCloaksToCategory(category.id, [props.cloak.id])
    .then(() => {
      state.expectsRefresh = true;
      emit("refresh", {
        ...props.cloak,
        categories: [category.id],
      });
      state.isMenuOpen = false;
      window.dispatchEvent(new CustomEvent("category:identities"));
    })
    .finally(() => {
      state.loading = false;
    });
}

function handleCategoryCreate() {
  const prefilled = `${state.categoryFilter}`;
  state.isMenuOpen = false;
  state.categoryFilter = "";

  nextTick().then(() => {
    openCategoryAddModal(prefilled);
    window.dispatchEvent(new CustomEvent("category:identities"));
  });
}

function openCategoryAddModal(prefilled) {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddEditNewCategory),
      props: {
        prefilled,
        noRedirect: true,
        isVisible: true,
      },
      events: {
        addIdentity: (cat) => moveToCat(cat),
      },
    },
  });
}

function removeIdentityFromCategory() {
  state.isMenuOpen = false;
  state.categoryFilter = "";
  toast.success(`Removing identity from "${categoryName.value}"...`);
  CategoryService.removeCloaksFromCategory(selectedCategoryId?.value, [
    props.cloak?.id,
  ])
    .then(() => {
      toast.success(`Identity removed!`);
    })
    .catch(() => {
      toast.error(`Error removing identity from "${categoryName.value}"`);
    });
}

watch(
  () => props.cloak,
  (newValue, oldValue) => {
    if (newValue.nickname !== oldValue.nickname) {
      state.nickname = newValue.nickname;
    }
  },
  { deep: true }
);

watch(
  () => props.refreshing,
  (value) => {
    if (!value) {
      state.expectsRefresh = false;
    }
  },
  { deep: true }
);
</script>

<template>
  <div
    ref="componentElement"
    class="cloak-category-section"
    :class="{ readOnly: props.readOnly }"
  >
    <CloakDetailsInputRow
      :value="selectedCategoryId"
      label="Category"
      placeholder="Add category"
      :loading-message="state.loadingMessage"
      :loading="state.loading || state.expectsRefresh"
      :is-menu-open="state.isMenuOpen"
      tabindex="0"
    >
      <template #input-before>
        <UiMenu
          width="188px"
          max-height="288px"
          placement="left-start"
          class="cloak-category-section__menu"
          :has-outside-click-close="false"
        >
          <template #content>
            <UiMenuInput
              v-if="categories && categories.length"
              aria-id="FilterInputCategoriesCloakDetails"
              placeholder="Filter category..."
              :value="state.categoryFilter"
              tabindex="0"
              @input="(event) => (state.categoryFilter = event)"
              @click.stop
            />

            <UiMenuSeparator v-if="categories && categories.length" />

            <UiMenuButton
              v-if="categoryName"
              :title="`Remove from &quot;${categoryName}&quot;`"
              tabindex="0"
              @click="removeIdentityFromCategory"
              @keydown.enter="removeIdentityFromCategory"
              @keydown.space="removeIdentityFromCategory"
            >
              <template #icon>
                <InlineSvg name="minus-outline" />
              </template>
            </UiMenuButton>

            <UiMenuButton
              aria-id="CreateNewCategoryCloakedDetails"
              title="Create new Category"
              dark-font
              tabindex="0"
              @click="handleCategoryCreate"
              @keydown.enter="handleCategoryCreate"
              @keydown.space="handleCategoryCreate"
            >
              <template #icon>
                <InlineSvg name="plus" />
              </template>
            </UiMenuButton>
            <UiMenuSeparator
              v-if="filteredCategories && filteredCategories.length"
            />

            <div
              v-if="categories && categories.length"
              class="cloak-category-section-categories"
            >
              <UiMenuButton
                v-for="category in filteredCategories"
                :key="category.id"
                :aria-id="`AddToCategory.${category?.name || ''}`"
                :title="category.name"
                :active="category.id === selectedCategoryId"
                tabindex="0"
                @click="() => moveToCat(category)"
                @keydown.enter="() => moveToCat(category)"
                @keydown.space="() => moveToCat(category)"
              >
                <template #icon>
                  <InlineSvg
                    v-if="category.id === selectedCategoryId"
                    name="check"
                  />
                  <span v-else />
                </template>
              </UiMenuButton>
            </div>
          </template>
        </UiMenu>
      </template>

      <template #icon>
        <button
          class="cloak-category-section__icon-button"
          tabindex="-1"
        >
          <InlineSvg
            v-if="props.readOnly"
            name="lock"
          />
          <InlineSvg
            v-else-if="hasCategory"
            name="chevron-down"
          />
          <InlineSvg
            v-else
            name="plus"
          />
        </button>
      </template>

      <template #input>
        <button
          id="cloak-details-category-button"
          class="category-button"
          :class="{
            'category-button--active': hasCategory,
          }"
          aria-id="CloakDetailsAddToCategoryButton"
        >
          <span>{{ categoryName || "Add a category" }}</span>
        </button>
      </template>
    </CloakDetailsInputRow>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.readOnly {
  pointer-events: none;
}

.cloak-category-section {
  padding: 10px 24px 2px;
  width: 100%;
  position: relative;

  &__menu {
    position: absolute;
    inset: 0;
    z-index: 100;

    .popper__activator {
      position: absolute;
      inset: 0;
      cursor: pointer;
    }
  }

  &__icon-button {
    border: none;
    background: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      cursor: pointer;
    }
  }

  .category-button {
    background: none;
    border: none;
    gap: 4px;
    padding: 0;
    height: 24px;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    display: flex;
    align-items: center;
    overflow: hidden;
    width: 100%;
    color: $color-primary-50;

    svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &--active {
      color: $color-primary-100;
    }

    &:hover {
      color: $color-primary-100;
      cursor: pointer;
    }

    &:focus-visible {
      outline: none;
    }
  }

  .ui-menu {
    width: 100%;
    display: flex;
  }
}

.cloak-category-section-categories {
  overflow-x: auto;

  // @include custom-scroll-bar();
}
</style>
