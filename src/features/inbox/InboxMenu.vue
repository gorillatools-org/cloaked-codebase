<script setup>
import { useRoute } from "vue-router";
import { computed, watch, reactive, ref } from "vue";
import store from "@/store";

import InlineSvg from "@/features/InlineSvg";
import IdentityIcon from "@/features/ui/IdentityIcon";
import router from "@/routes/router";
import { vOnClickOutside } from "@vueuse/components";
import { hash } from "@/scripts/hash";
import { format } from "@/scripts/format";
import { formattedText } from "@/scripts/formattedText";
import BaseText from "@/library/BaseText.vue";

const route = useRoute();

const menuSearch = ref(null);
const scrollRef = ref(null);
// NOTE: commenting out keyboard shortcuts
// const scrollElements = ref(null);

const searchNav = reactive({
  position: null,
});

const unfilteredCategories = computed(() => {
  return store.getters["getCategories"];
});

const categories = computed(() => {
  if (menuSearch.value) {
    return unfilteredCategories.value.filter((cat) => {
      return (
        cat.name &&
        cat.name
          .toLowerCase()
          .match(new RegExp(menuSearch.value.toLowerCase(), "ig"))
      );
    });
  }
  return unfilteredCategories.value;
});

const searchIdentity = computed(() => {
  if (route.name.toLowerCase() === "cloakinbox") {
    const id = hash.decode(route?.params?.id);
    const identity = store.state.localdb.db_cloaks.find((i) => i.id === id);
    return identity;
  }
  return null;
});

const searchCategory = computed(() => {
  if (route.name.toLowerCase() === "categoryinbox") {
    const id = hash.decode(route?.params?.id);
    const category = categories.value.find((i) => i.id === id);
    return category;
  }
  return null;
});

const menu = computed(() => {
  return store.state.inbox.menu;
});

const inboxList = computed(() => {
  const top20Identities = identities.value?.slice(0, 20).map((identity) => {
    return {
      type: "identity",
      element: identity,
    };
  });

  const top20Cats = categories.value?.slice(0, 20).map((category) => {
    return {
      type: "category",
      element: category,
    };
  });
  if (menuSearch.value) {
    const list = [];

    if (top20Identities.length) {
      list.push({ type: "header", text: "Inbox identities" });
      list.push(...top20Identities);
    }
    if (
      top20Cats.length ||
      "favorites".includes(menuSearch.value) ||
      "recent".includes(menuSearch.value)
    ) {
      list.push({ type: "header", text: "Inbox categories" });
      if ("favorites".includes(menuSearch.value)) {
        list.push({ type: "action", button: "favorites" });
      }
      if ("recent".includes(menuSearch.value)) {
        list.push({ type: "action", button: "recent" });
      }
      if (top20Cats.length) {
        list.push(...top20Cats);
      }
    }
    return list.length ? list : [{ type: "header", text: "No matches" }];
  }

  const list = [
    { type: "action", button: "all" },
    { type: "header", text: "Inbox categories" },
    { type: "action", button: "favorites" },
    { type: "action", button: "recent" },
    ...top20Cats,
  ];
  if (top20Identities.length) {
    list.push({ type: "header", text: "Inbox identities" });
    list.push(...top20Identities);
  }
  return list;
});

const identities = computed(() => {
  if (menuSearch.value) {
    return store.state.localdb.db_cloaks.filter((cloak) => {
      return (
        cloak.nickname &&
        cloak.nickname
          .toLowerCase()
          .match(new RegExp(menuSearch.value.toLowerCase(), "ig"))
      );
    });
  }
  return store.state.localdb.db_cloaks;
});

watch(
  menuSearch,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      searchNav.position = null;
    }
  },
  { deep: true }
);

watch(
  menu,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      searchNav.position = null;
    }
  },
  { deep: true }
);

function navTo(routeName) {
  router.push({
    name: routeName,
  });
  closeMenu();
}

function selectIdentity(identity) {
  menuSearch.value = null;
  router.push({
    path: `/cloak/${hash.encode(identity.id)}/inbox/`,
  });
  closeMenu();
}

function selectCategory(category) {
  menuSearch.value = null;
  router.push({
    path: `/category/${hash.encode(category.id)}/inbox/`,
  });
  closeMenu();
}

function getMenuStyle(event) {
  let target = event.target;
  while (target.tagName !== "BUTTON") {
    target = target.parentNode;
  }
  const coords = target.getBoundingClientRect();
  return {
    top: `${coords.bottom}px`,
    left: `${coords.left}px`,
  };
}

function closeMenu() {
  store.dispatch("inbox/closeInboxMenu");
}

// NOTE: commenting out keyboard shortcuts
// function navSearch(diff) {
//   let position = 0;
//   position = searchNav.position + diff;
//   if (inboxList.value[position]) {
//     if (inboxList.value[position].type === "header") {
//       position += diff;
//     }
//   }
//   if (position < 0) {
//     position = inboxList.value.length - 1;
//   }
//   if (position >= inboxList.value.length) {
//     position = 0;
//   }
//   searchNav.position = position;
//   scrollElements.value[position].scrollIntoView({
//     behavior: "smooth",
//     block: "nearest",
//     inline: "start",
//   });
// }

function onEnter() {
  if (searchNav.position !== null) {
    const item = inboxList.value[searchNav.position];
    if (item.type === "identity") {
      selectIdentity(item.element);
    } else if (item.type === "category") {
      selectCategory(item.element);
    } else if (item.type === "action" && item.button === "all") {
      navTo("Inbox");
    } else if (item.type === "action" && item.button === "favorites") {
      navTo("FavoritesInbox");
    } else if (item.type === "action" && item.button === "recent") {
      navTo("RecentInbox");
    }
  }
}

function isActive(index) {
  const object = inboxList.value[index];
  if (object.type === "identity") {
    return object.element.id === searchIdentity?.value?.id;
  } else if (object.type === "category") {
    return object.element.id === searchCategory?.value?.id;
  } else if (object.type === "action" && object.button === "all") {
    return route.name.toLowerCase() === "inbox";
  } else if (object.type === "action" && object.button === "favorites") {
    return route.name.toLowerCase() === "favoritesinbox";
  } else if (object.type === "action" && object.button === "recent") {
    return route.name.toLowerCase() === "recentinbox";
  } else {
    return false;
  }
}
</script>

<template>
  <div>
    <div
      v-if="menu"
      v-on-click-outside="closeMenu"
      class="inbox-menu"
      :style="getMenuStyle(menu)"
    >
      <div class="search-box">
        <BaseText
          as="h1"
          variant="headline-6-medium"
          class="title"
        >
          Inboxes
        </BaseText>
        <div
          class="search-input"
          :class="{ 'has-text': !!searchIdentity }"
        >
          <label
            for="search"
            class="icon"
          >
            <InlineSvg name="search" />
          </label>
          <!--
            NOTE: commenting out keyboard shortcuts,
            add this to inbox below when commenting back in
            @keydown.down="navSearch(1)"
          @keydown.up="navSearch(-1)" -->
          <input
            id="search"
            autofocus
            type="text"
            :value="menuSearch"
            placeholder="Search"
            autocomplete="off"
            @keydown.enter="onEnter"
            @input="(event) => (menuSearch = event.target.value)"
          />
        </div>
      </div>
      <ul ref="scrollRef">
        <li
          v-for="(item, index) in inboxList"
          :key="index"
          :class="{
            header: item.type === 'header',
            'all-button': item.type === 'action',
            active: isActive(index),
            selected: searchNav.position === index,
          }"
        >
          <div class="menu-item-list">
            <button
              v-if="item.type === 'action' && item.button === 'all'"
              @click="navTo('Inbox')"
            >
              <span>
                <InlineSvg
                  name="inbox-filled"
                  class="icon"
                />
              </span>
              <BaseText variant="body-3-semibold">All</BaseText>
            </button>
            <button
              v-if="item.type === 'action' && item.button === 'favorites'"
              class="favorites"
              @click="navTo('FavoritesInbox')"
            >
              <span>
                <InlineSvg
                  name="favorite"
                  class="icon"
                />
              </span>
              <BaseText variant="body-3-semibold">Favorites</BaseText>
            </button>
            <button
              v-if="item.type === 'action' && item.button === 'recent'"
              class="recent"
              @click="navTo('RecentInbox')"
            >
              <span>
                <InlineSvg
                  name="clock"
                  class="icon"
                />
              </span>
              <BaseText variant="body-3-semibold">Recently Created</BaseText>
            </button>
            <BaseText
              v-else-if="item.type === 'header'"
              as="h3"
              variant="body-small-medium"
              class="item-name"
            >
              {{ item.text }}
            </BaseText>
            <div v-else-if="item.type === 'category'">
              <button @click="selectCategory(item.element)">
                <span>
                  <InlineSvg
                    name="category_menu"
                    class="icon"
                  />
                </span>
                <!-- eslint-disable vue/no-v-html -->
                <div v-html="format.highlight(item.element.name, menuSearch)" />
                <!-- eslint-enable vue/no-v-html -->
              </button>
            </div>
            <div v-else-if="item.type === 'identity'">
              <button @click="selectIdentity(item.element)">
                <span>
                  <IdentityIcon
                    :override="{ width: '24px', height: '24px' }"
                    :identity="item.element"
                  />
                </span>
                <!-- eslint-disable vue/no-v-html -->
                <div
                  v-html="
                    format.highlight(
                      formattedText.getFormattedNickname(item.element),
                      menuSearch
                    )
                  "
                />
                <!-- eslint-enable vue/no-v-html -->
              </button>
            </div>
          </div>
          <InlineSvg
            class="check"
            name="check"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.inbox-menu {
  position: fixed;
  margin-top: 5px;
  width: 220px;
  background-color: $color-background;
  border-radius: 8px;
  box-shadow: 0 5px 40px 0 rgb(0 0 0 / 16%);
  z-index: 1000;
  color: $color-primary-100;
  max-height: 500px;
  overflow: auto;

  @include custom-scroll-bar;

  .search-box {
    padding: 16px;
    background-color: $color-primary-1;
    border-radius: 20px 20px 0 0;

    .title {
      color: $color-primary-100;
      margin-bottom: 8px;
    }

    .search-input {
      width: 100%;
      display: flex;
      align-items: center;
      border: 1px solid transparent;
      border-radius: 8px;
      background-color: $color-primary-5;
      position: relative;

      .icon {
        width: 16px;
        height: auto;
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: $color-primary-70;

        svg {
          height: 13px;
        }
      }

      &:focus-within,
      &.has-text {
        border: 1px solid $color-primary-100;
      }

      input {
        background-color: transparent;
        border: none;
        padding: 10px 12px 10px 36px;
        color: $color-primary-100;
        width: 100%;
        outline: none;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
      }
    }
  }

  ul {
    border-radius: 0 0 20px 20px;
    background-color: $color-primary-1;
    padding: 10px;
    overflow-x: hidden;

    li {
      overflow-x: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      color: $color-primary-70;
      padding: 0 8px;
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      border-radius: 10px;

      > div {
        width: 100%;
      }

      &.selected {
        background-color: $color-primary-5;
      }

      &:hover {
        transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        background-color: $color-primary-5;
        transform: scale(1.01);
      }

      &:active {
        transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        transform: scale(1);
      }

      &.active {
        font-weight: 600 !important;
        color: $color-primary-100 !important;

        .check {
          display: block;
        }

        button {
          font-weight: 600 !important;
          color: $color-primary-100 !important;
          padding-right: 24px;
        }
      }

      .check {
        display: none;
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
      }

      .item-name {
        margin: 16px -6px;
        padding: 0 10px;
      }

      &.header {
        &:hover {
          background-color: transparent;
        }
      }

      button {
        display: flex;
        align-items: center;
        padding: 10px 0 10px 36px;
        position: relative;
        width: 100%;
        color: $color-primary-70;
        cursor: pointer;
        border: none;
        background-color: transparent;

        > div {
          color: $color-primary-70;
        }

        span {
          background-color: $color-primary-100;
          width: 24px;
          height: 24px;
          display: flex;
          place-content: center center;
          border-radius: 50px;
          color: $color-primary-1;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);

          svg.icon {
            width: 100%;
            height: 100%;
            max-width: 12px;
            max-height: 12px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        div {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &.favorites {
          color: $color-primary-70;

          span {
            background-color: $color-brand-1-100;
            color: $white;
          }
        }

        &.recent {
          color: $color-primary-70;

          span {
            color: $white;
            background-color: $color-brand-3-100;
          }
        }
      }
    }
  }
}
</style>
