<script setup>
import InlineSvg from "@/features/InlineSvg";
import CategoryService from "@/api/actions/category-service";
import AddEditNewCategory from "@/routes/modals/categories/AddEditNewCategory";
import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import { computed, markRaw } from "vue";
import AddCloakToCategory from "@/routes/modals/categories/AddCloakToCategory";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import BaseText from "@/library/BaseText.vue";

const toast = useToast();

const props = defineProps({
  categoryId: {
    type: [Number, String],
    required: true,
  },
});

const category = computed(() => {
  return store.state.categories.custom.find(
    (cat) => cat.id == props.categoryId
  );
});

const allCloaks = computed(() => {
  if (store.state.localdb?.db_cloaks) {
    return store.state.localdb.db_cloaks?.filter((cloak) =>
      cloak?.categories?.includes(parseInt(props.categoryId))
    );
  }
  return [];
});

function openCategoryEditModal() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddEditNewCategory),
      props: {
        category: category.value,
        prefilled: category.value.name,
        isVisible: true,
      },
    },
  });
}

function openDeleteConfirmation() {
  store.dispatch("openGlobalDeleteModal", {
    type: "category",
    paragraphs: [
      "Deleting the category won't delete the cloaks in the category.",
    ],
    onClick: deleteCat,
  });
}
function deleteCat(e) {
  e.stopPropagation();

  CategoryService.deleteCategory(props.categoryId)
    .then(() => {
      toast.success("Category deleted");
      router.push({ name: "Home" });
    })
    .catch(() => {
      toast.error("Error deleting category");
    });
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
          addCloaksToCategory: addCloaksToCategory,
        },
      },
    });
  }
}

function addCloaksToCategory(newCloaks) {
  const identityIds = newCloaks.map((c) => c.id);
  CategoryService.addCloaksToCategory(props.categoryId, identityIds);
}
</script>

<template>
  <UiMenu
    placement="bottom-start"
    class="filter-item-row"
  >
    <div class="filter-item small-gap">
      <InlineSvg name="edit-pencil-larger" />
      <BaseText
        as="p"
        variant="body-small-medium"
      >
        Edit Category
      </BaseText>
    </div>
    <template #content>
      <UiMenuButton
        title="Edit category name"
        @click="openCategoryEditModal"
      >
        <template #icon>
          <InlineSvg name="edit-pencil-larger" />
        </template>
      </UiMenuButton>
      <UiMenuButton
        title="Add identities to category"
        @click="toggleAddCloaksModal(true)"
      >
        <template #icon>
          <InlineSvg name="plus" />
        </template>
      </UiMenuButton>
      <UiMenuSeparator />
      <UiMenuButton
        title="Delete"
        :danger="true"
        @click="openDeleteConfirmation"
      >
        <template #icon>
          <InlineSvg name="delete" />
        </template>
      </UiMenuButton>
    </template>
  </UiMenu>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.filter-item-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;

  .filter-item {
    display: flex;
    align-items: center;
    column-gap: 8px;
    padding: 4px 10px;
    cursor: pointer;
    border-radius: 8px;

    &:hover {
      background: $color-primary-10;
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
</style>
