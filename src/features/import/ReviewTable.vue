<script setup>
import ImportTable from "@/features/import/ImportTable";
import PasswordPreview from "@/features/ui/PasswordPreview";
import Edit from "@/assets/icons/edit.svg";
import ImportIdentityStatus from "@/features/import/ImportIdentityStatus";
import ArrowUp from "@/assets/icons/arrow-up.svg";
import InputCheckbox from "@/features/InputCheckbox.vue";
import ReviewToggleAll from "@/features/import/ReviewToggleAll";
import UrlPreview from "@/features/import/UrlPreview";
import {
  FIELD_FAVORITE,
  FIELD_PASSWORD,
  FIELD_TO_LABEL_MAPPING as fieldToLabelMapping,
  FIELD_WEBSITE,
  LABEL_STATUS as labelStatus,
} from "@/store/modules/accounts-importer/shared.js";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import store from "@/store";

const route = useRoute();

const el = ref(null);
const emit = defineEmits(["input"]);

const props = defineProps({
  identities: {
    type: Array,
    default: () => [],
  },
  value: {
    type: Array,
    default: () => [],
  },
  statuses: {
    type: Array,
    default: () => [],
  },
  excludeStatuses: {
    type: Array,
    default: () => [],
  },
});

const identityIds = computed(() => {
  return store.getters["accountsImporter/getIdentities"](
    props.statuses,
    null,
    props.excludeStatuses
  ).map((identity) => identity.id);
});

const selectedIdentities = computed({
  get() {
    return store.getters["accountsImporter/getSelectedIdentities"];
  },
  set(value) {
    store.commit("accountsImporter/setSelectedIdentities", value);
  },
});

const identityColumns = computed(
  () => store.getters["accountsImporter/getIdentityFields"]
);
const passwordColumnIndex = computed(() =>
  store.getters["accountsImporter/getIdentityFieldIndex"](FIELD_PASSWORD)
);

const urlColumnIndex = computed(() =>
  store.getters["accountsImporter/getIdentityFieldIndex"](FIELD_WEBSITE)
);
const favoriteColumnIndex = computed(() =>
  store.getters["accountsImporter/getIdentityFieldIndex"](FIELD_FAVORITE)
);
function onSort(cell) {
  if (cell === FIELD_PASSWORD) {
    return;
  }

  el.value.$el.scrollTop = 0;

  if (props.value[0] === cell && props.value[1] === "desc") {
    emit("input", []);
    return;
  }

  if (props.value[0] === cell) {
    emit("input", [cell, "desc"]);
    return;
  }

  emit("input", [cell, "asc"]);
}
</script>

<template>
  <ImportTable
    ref="el"
    :columns="identityColumns"
    :rows="identities"
    class="review-table"
  >
    <template #head-row="{ row, cellClass }">
      <div
        class="review-table__head-cell--first"
        :class="cellClass"
      >
        <ReviewToggleAll
          v-model="selectedIdentities"
          :values="identityIds"
          class="review-table__toggle-all"
        />
        <span
          class="review-table__head-cell"
          @click="onSort(row[0])"
        >
          {{ fieldToLabelMapping[row[0]] }}
          <ArrowUp
            v-if="value[0] === row[0]"
            class="review-table__arrow"
            :class="{
              'review-table__arrow--descending': value[1] === 'desc',
            }"
          />
        </span>
      </div>
      <span
        class="review-table__head-cell review-table__head-cell--status"
        :class="cellClass"
        @click="onSort(labelStatus)"
      >
        {{ labelStatus }}
        <ArrowUp
          v-if="value[0] === labelStatus"
          class="review-table__arrow"
          :class="{
            'review-table__arrow--descending': value[1] === 'desc',
          }"
        />
      </span>
      <span
        v-for="(cell, index) in row"
        :key="index"
        class="review-table__head-cell"
        :class="[
          cellClass,
          index === passwordColumnIndex
            ? 'review-table__head-cell--password'
            : null,
          index === 0 ? 'review-table__head-cell--hidden' : null,
        ]"
        @click="onSort(cell)"
      >
        {{ fieldToLabelMapping[cell] }}
        <ArrowUp
          v-if="value[0] === cell"
          class="review-table__arrow"
          :class="{
            'review-table__arrow--descending': value[1] === 'desc',
          }"
        />
      </span>
    </template>
    <template #body-row="{ row, cellClass }">
      <div
        class="review-table__body-cell--first"
        :class="cellClass"
      >
        <InputCheckbox
          :id="row.id"
          v-model="selectedIdentities"
          class="review-table__checkbox"
        />
        <div :class="cellClass">
          {{ row.record[0] || "-" }}
        </div>
        <span
          class="review-table__edit"
          :class="{ 'review-table__edit--active': row.id === route.params.id }"
        >
          <router-link
            class="review-table__edit-link"
            :to="{ name: 'ImportReviewIdentityEdit', params: { id: row.id } }"
          >
            <Edit />
          </router-link>
        </span>
      </div>
      <div
        :class="cellClass"
        class="review-table__body-cell--status"
      >
        <ImportIdentityStatus :statuses="row.statuses" />
      </div>
      <div
        v-for="(cell, index) in row.record"
        :key="index"
        :class="[
          cellClass,
          index === 0 ? 'review-table__body-cell--hidden' : null,
        ]"
      >
        <PasswordPreview
          v-if="index === passwordColumnIndex"
          :password="cell"
        />
        <template v-else-if="index === favoriteColumnIndex">
          {{ cell ? "yes" : "-" }}
        </template>
        <UrlPreview
          v-else-if="index === urlColumnIndex && cell"
          :url="cell"
        />
        <template v-else>
          {{ cell || "-" }}
        </template>
      </div>
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
  </ImportTable>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.review-table {
  &__head-cell {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-50;
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    background-color: $color-primary-5;

    &:nth-child(2) {
      padding-left: 8px;
    }

    transition: color 0.1s ease-out;

    &:hover {
      transition: color 0.1s ease-out;
      color: $color-primary-50;
    }

    &--password {
      cursor: unset;

      &:hover {
        transition: color 0.1s ease-out;
        color: $color-primary-50;
      }
    }
  }

  &__arrow {
    margin-left: 4px;
    transition: transform 0.1s ease-out;

    &--descending {
      transform: rotate(180deg);
    }
  }

  .app-table__head-row {
    height: 48px;
  }

  .app-table__body-cell {
    padding: 0;

    &:nth-child(2) {
      padding-left: 8px;
    }
  }

  &__toggle-all,
  &__checkbox {
    height: 100%;
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  & &__head-cell--status,
  & &__body-cell--status {
    width: 130px;
  }

  & &__head-cell--hidden,
  & &__body-cell--hidden {
    display: none;
  }

  &__head-cell--first {
    height: 100%;
    position: sticky;
    left: 0;
    background-color: $color-primary-5;
    clip-path: inset(0 -15px 0 0);
    transition: 0.2s filter ease-out;
    display: flex;
    align-items: center;

    @at-root .import-table--overflow-left & {
      filter: drop-shadow(0 0 12px rgb(0 0 0 / 4%))
        drop-shadow(0 1px 4px rgb(1 2 24 / 8%));
    }

    @at-root .theme-dark .import-table--overflow-left & {
      filter: drop-shadow(0 0 12px rgba($white, 0.04))
        drop-shadow(0 1px 4px rgba($white, 0.08));
    }
  }

  &__body-cell--first {
    height: 64px;
    position: sticky;
    left: 0;
    clip-path: inset(0 -15px 0 0);
    transition: 0.2s filter ease-out;
    z-index: 1;
    display: flex;
    align-items: center;
    background-color: $color-base-white-100;

    &:hover {
      opacity: 1;

      .input-checkbox__input--checked,
      .input-checkbox__input--unchecked {
        opacity: 0.9;
      }
    }

    @at-root .import-table--overflow-left & {
      filter: drop-shadow(0 0 12px rgb(0 0 0 / 4%))
        drop-shadow(0 1px 4px rgb(1 2 24 / 8%));
    }

    @at-root .theme-dark .import-table--overflow-left & {
      filter: drop-shadow(0 0 12px rgba($white, 0.04))
        drop-shadow(0 1px 4px rgba($white, 0.08));
    }

    @at-root .app-table__body-row:hover & {
      background: $color-primary-5;
    }
  }

  .app-table__body-row {
    position: relative;
  }

  &__head-cell-edit {
    width: 36px;
  }

  &__edit {
    height: 100%;

    &-link {
      cursor: pointer;
      width: 48px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}
</style>
