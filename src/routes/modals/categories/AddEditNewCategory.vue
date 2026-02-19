<script setup>
import store from "@/store";
import BaseButton from "@/library/BaseButton.vue";

import CategoryService from "@/api/actions/category-service";

import {
  watch,
  computed,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  ref,
} from "vue";

import router from "@/routes/router";
import { useRoute } from "vue-router";
import ModalTemplate from "@/features/ModalTemplate.vue";
const route = useRoute();

const props = defineProps({
  id: { type: String, default: null },
  category: { type: Object, default: null },
  prefilled: { type: String, default: null },
  noRedirect: Boolean,
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const state = reactive({
  categoryName: "",
  saving: false,
});

const emit = defineEmits(["closeModal", "addIdentity"]);

const newCategory = ref(null);

onMounted(() => {
  document.addEventListener("keyup", checkForSpecialKeys);
});

onBeforeUnmount(() => {
  document.removeEventListener("keyup", checkForSpecialKeys);
});

function checkForSpecialKeys($event) {
  $event.stopPropagation();
  if ($event?.key?.toLowerCase() === "escape") {
    closeModal();
  }
}

function handleSave() {
  if (!isButtonDisabled.value) {
    state.saving = true;
    if (props.category) {
      return updateCategory();
    }
    return createCategory();
  }
}

function createCategory() {
  CategoryService.createCategory(state.categoryName)
    .then(({ data }) => {
      emit("addIdentity", data);
      if (!props.noRedirect) {
        router.push({ path: `/category/${data.id}` });
      }
      state.saving = false;
      window.dispatchEvent(new CustomEvent("category:updated"));
    })
    .catch(() => {
      state.saving = false;
    });

  closeModal();
}

function updateCategory() {
  CategoryService.updateCategory(props.category.id, state.categoryName)
    .then(({ data }) => {
      if (route.params.id != data.id) {
        router.push({ path: `/category/${data.id}` });
      }
      state.saving = false;
    })
    .catch(() => {
      state.saving = false;
    })
    .finally(() => {
      nextTick(() => {
        window.dispatchEvent(new CustomEvent("category:updated"));
      });
    });
  closeModal();
}

const isButtonDisabled = computed(() => {
  return !(!nameIsTaken.value && state.categoryName?.length && !state.saving);
});

const nameIsTaken = computed(() => {
  let customCatsFiltered = [...store.state.categories.custom];
  if (props.category) {
    customCatsFiltered = store.state.categories.custom.filter(
      (cat) => cat.id !== props.category.id
    );
  }
  const allCustomCategoryNames = customCatsFiltered.map((cat) =>
    cat.name.toLowerCase()
  );
  const allCustomPermanentNames = store.state.categories.permanent.map((cat) =>
    cat.name.toLowerCase()
  );
  const allCategoryNames = [
    ...allCustomCategoryNames,
    ...allCustomPermanentNames,
  ];
  const nameIsTaken = state.categoryName
    ? allCategoryNames.includes(state.categoryName?.toLowerCase())
    : false;
  return nameIsTaken;
});

watch(
  () => props.category,
  (value) => {
    state.categoryName = value ? value.name : "";
  },
  { immediate: true }
);

watch(
  () => props.prefilled,
  (value) => {
    state.categoryName = value;
  },
  { immediate: true }
);

watch(
  () => props.isVisible,
  (value) => {
    if (value) {
      setTimeout(() => {
        newCategory?.value?.focus();
      }, 500);
    }
  },
  { immediate: true }
);

function closeModal() {
  store.dispatch("closeModal");
}
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <h1>{{ props.category ? "Edit" : "Add" }} category name</h1>
    </template>

    <template #body>
      <input
        :id="`newCategory-${id}`"
        ref="newCategory"
        :aria-id="`NewCategory.${state.categoryName || ''}`"
        type="text"
        placeholder="New category"
        :value="state.categoryName"
        autocomplete="off"
        maxlength="50"
        tabindex="0"
        @input="(event) => (state.categoryName = event.target.value)"
        @keydown.enter="handleSave"
      />

      <div
        class="error-message"
        :class="{ visible: nameIsTaken }"
      >
        Please choose a unique name for this category
      </div>
    </template>

    <template #footer>
      <BaseButton
        :id="`save-${id}`"
        aria-id="SaveChangesCategoryButton"
        variant="primary"
        :disabled="isButtonDisabled"
        tabindex="0"
        @click="handleSave"
        @keydown.enter="handleSave"
        @keydown.space="handleSave"
      >
        Save Changes
      </BaseButton>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
input[type="text"] {
  width: 100%;
  height: 60px;
  border-radius: 10px;
  padding: 10px;
  background-color: $color-primary-5;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  display: block;
  color: $color-primary-100;

  @include placeholder {
    color: $color-primary-50;
  }
}

.error-message {
  margin-top: 10px;
  font-size: 12px;
  color: red;
  visibility: hidden;
  opacity: 0;
  display: none;

  &.visible {
    opacity: 1;
    visibility: visible;
    display: block;
  }
}
</style>
