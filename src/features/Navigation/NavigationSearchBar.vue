<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import store from "@/store";
import BaseIcon from "@/library/BaseIcon.vue";

const route = useRoute();
const pageTitle = ref(route?.meta);
const globalSearch = ref("");

watch(
  () => route.meta,
  (newMeta) => {
    pageTitle.value = newMeta;
  }
);

const navTitle = computed(
  () => pageTitle?.value?.title.toLowerCase() || "this page"
);
const inbox = computed(() => route?.meta?.nav === "inbox");

watch(globalSearch, (value) => {
  const action = inbox.value ? "inbox/setSearch" : "setSearch";
  store.dispatch(action, value);
});
</script>

<template>
  <div class="navigation-search">
    <div
      class="navigation-search__input-wrapper"
      :class="{ 'navigation-search__input-wrapper--has-text': !!globalSearch }"
    >
      <BaseIcon
        name="search"
        class="navigation-search__icon navigation-search__icon--search"
      />
      <input
        id="inbox-search"
        v-model="globalSearch"
        type="text"
        :placeholder="`Search ${navTitle}`"
        autocomplete="off"
        class="navigation-search__input"
        :class="{ 'navigation-search__input--active': globalSearch }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-search {
  &__input-wrapper {
    background-color: $color-primary-1;
    border-radius: 30px;
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    position: relative;
    width: 325px;
    margin: 0 12px;
    overflow: hidden;
  }

  &__icon {
    color: $color-primary-100;
    position: absolute;
    top: 50%;
    font-size: 16px;
    transform: translateY(-50%);

    &--search {
      left: 10px;
    }
  }

  &__input {
    outline: none;
    color: $color-primary-100;
    padding: 8px 10px 8px 40px;
    background-color: $color-primary-5;
    border: 2px solid $color-primary-5;
    border-radius: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;

    &::placeholder {
      color: $color-primary-70;
    }

    &--active,
    &:focus {
      border-color: $color-primary-10;
      background-color: $color-primary-10;
    }
  }
}
</style>
