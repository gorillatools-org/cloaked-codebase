<script setup>
import { computed, onMounted, ref, markRaw } from "vue";
import store from "@/store";
import { useBasicMode } from "@/composables/useBasicMode.js";
import { useFeatures } from "@/composables/useFeatures.js";
import BaseText from "@/library/BaseText.vue";
import NavigationSidebarMenuItem from "@/features/Navigation/NavigationSidebarMenuItem.vue";
import EsimService from "@/api/actions/esim-service.js";
import InboxService from "@/api/actions/inbox-service.js";
import CategoryService from "@/api/actions/category-service.js";
import AddEditNewCategory from "@/routes/modals/categories/AddEditNewCategory.vue";
import { createNavigationItems } from "@/scripts/navigation";
import BaseButton from "@/library/BaseButton.vue";
import {
  getUserCountry,
  LAUNCHED_COUNTRIES,
} from "@/scripts/countries/countries";

const {
  hasForYou,
  hasDataDeleteScan,
  hasIdentityMonitoring,
  hasPayEnabled,
  hasAutoPasswordChange,
  hasExposureStatus,
} = useFeatures();

const { isBasicModeAccessible, isBasicModeEnabled } = useBasicMode();

onMounted(async () => {
  if (!basicModeEnabled.value) {
    await Promise.all([
      EsimService.getSims({ number: true }),
      InboxService.getUnreadCount().then((response) => {
        unreadCount.value = response.data;
      }),
      CategoryService.getCategories(),
    ]);
  }
});

const subscriptionState = computed(() => {
  return store.state.settings.subscription?.state;
});

const basicModeEnabled = computed(() => {
  return isBasicModeAccessible.value && isBasicModeEnabled.value;
});

const eSimFeatureFlag = computed(() => {
  const userCountry = getUserCountry(store.state.authentication?.user);
  return (
    LAUNCHED_COUNTRIES.includes(userCountry) &&
    store.state.authentication?.user?.flags?.esim_enabled &&
    store.getters["settings/isSubscribed"]
  );
});

const hasEsimsWithNumbers = computed(() => {
  const simsWithNumbers = store.getters["esim/getEsims"]?.filter(
    (sim) => !!sim?.msisdn
  );
  return !!simsWithNumbers?.length;
});

const showEsimGetStarted = computed(() => {
  return !!eSimFeatureFlag.value && !hasEsimsWithNumbers.value;
});

const unreadCount = ref({
  all: 0,
  emails: 0,
  messages: 0,
  calls: 0,
  requests: 0,
  starred: 0,
});

const allUnread = computed(() => {
  return (
    unreadCount.value.emails +
    unreadCount.value.messages +
    unreadCount.value.calls +
    unreadCount.value.requests +
    unreadCount.value.starred
  );
});

const categories = computed(() => {
  return store.getters["getCategories"];
});

function openCategoryAddModal() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddEditNewCategory),
      props: { isVisible: true },
    },
  });
}

function newIdentity() {
  store.dispatch("openCloakCreate");
}

function openCompose() {
  store.commit("compose", {});
}

const navigationItems = computed(() =>
  createNavigationItems({
    basicModeEnabled: basicModeEnabled.value,
    hasDataDeleteScan: !!hasDataDeleteScan.value,
    showEsimGetStarted: showEsimGetStarted.value,
    hasEsimsWithNumbers: hasEsimsWithNumbers.value,
    hasIdentityMonitoring: !!hasIdentityMonitoring.value,
    hasAutoPasswordChange: !!hasAutoPasswordChange.value,
    hasPayEnabled: !!hasPayEnabled.value,
    allUnread: allUnread.value,
    unreadCount: unreadCount.value,
    hasExposureStatus: !!hasExposureStatus.value,
    hasForYou: !!hasForYou.value,
  })
);

const filteredNavigationItems = computed(() => {
  return navigationItems.value
    .filter((section) => section.active)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.active !== false),
    }))
    .filter((section) => section.items.length > 0);
});
</script>

<template>
  <div class="navigation-left-panel">
    <div class="navigation-left-panel__navigation">
      <div class="navigation-left-panel__navigation-inner">
        <template
          v-for="(section, index) in filteredNavigationItems"
          :key="index"
        >
          <div class="navigation-left-panel__navigation-inner-section">
            <BaseText
              v-if="section.title"
              variant="caption-semibold"
              as="div"
              class="navigation-left-panel__navigation-inner-section-title"
            >
              {{ section.title }}
            </BaseText>

            <NavigationSidebarMenuItem
              v-for="item in section.items"
              :key="item.url"
              :url="item.url"
              :icon="item.icon"
              class="navigation-left-panel__navigation-inner-section-item"
              :count="item.count"
            >
              {{ item.text }}
            </NavigationSidebarMenuItem>
          </div>
        </template>

        <div
          v-if="!basicModeEnabled"
          class="navigation-left-panel__navigation-inner-section"
        >
          <BaseText
            variant="caption-semibold"
            as="div"
            class="navigation-left-panel__navigation-inner-section-title"
          >
            Categories
          </BaseText>

          <NavigationSidebarMenuItem
            v-for="category in categories"
            :key="category.id"
            :url="`/category/${category.id}`"
            icon="categories"
            class="navigation-left-panel__navigation-inner-section-item"
          >
            {{ category.name }}
          </NavigationSidebarMenuItem>

          <NavigationSidebarMenuItem
            icon="plus"
            class="navigation-left-panel__navigation-inner-section-item"
            @click="openCategoryAddModal"
          >
            Add new...
          </NavigationSidebarMenuItem>
        </div>
      </div>
    </div>

    <div
      v-if="subscriptionState !== 'CANCELLED' && !basicModeEnabled"
      class="navigation-left-panel__actions"
    >
      <BaseButton
        variant="primary"
        tabindex="0"
        class="navigation-left-panel__actions-button"
        @click="newIdentity()"
      >
        New identity
      </BaseButton>
      <BaseButton
        variant="secondary"
        tabindex="0"
        icon="chatting "
        class="navigation-left-panel__actions-button"
        @click="openCompose"
      >
        Compose message
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-left-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__navigation {
    background-color: $color-primary-5;
    flex-grow: 1;
    overflow-y: auto;
    border-radius: 20px;
    padding: 22px 16px;
    @include custom-scroll-bar;
  }

  &__actions {
    background-color: $color-primary-5;
    margin-top: 8px;
    padding: 16px;
    border-radius: 20px;

    &-button {
      margin-bottom: 8px;
      width: 100%;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__navigation-inner-section {
    margin-top: 16px;

    &:first-child {
      margin-top: 0;
    }

    &-title {
      margin-bottom: 8px;
      font-weight: 500;
      color: $color-primary-90;
    }

    &-item {
      margin-top: 4px;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
