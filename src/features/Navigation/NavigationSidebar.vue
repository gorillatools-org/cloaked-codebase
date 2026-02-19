<script setup>
import { computed, onMounted, ref, markRaw, nextTick, onUnmounted } from "vue";
import store from "@/store";
import { useBasicMode } from "@/composables/useBasicMode.js";
import { useFeatures } from "@/composables/useFeatures.js";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
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
import { useNavigationStore } from "@/pinia/navigation";
import { useCloakedPayUser } from "@/features/VirtualCards/composables/useCloakedPayUser.ts";

const {
  hasDataDeleteScan,
  hasIdentityMonitoring,
  hasAutoPasswordChange,
  hasExposureStatus,
} = useFeatures();

const { isPayFlowPending } = useCloakedPayUser();
const { isBasicModeEnabled } = useBasicMode();

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
  return isBasicModeEnabled.value;
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
    isPayFlowPending: !!isPayFlowPending.value,
    allUnread: allUnread.value,
    unreadCount: unreadCount.value,
    hasExposureStatus: !!hasExposureStatus.value,
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

const collapse = computed(() => {
  return useNavigationStore().collapse;
});

// Tooltip functionality for action buttons
const newIdentityButtonRef = ref(null);
const composeButtonRef = ref(null);
const navigationContainerRef = ref(null);
const activeTooltip = ref(null); // 'newIdentity' | 'compose' | null
const tooltipStyle = ref({});

const handleScrollHide = () => {
  activeTooltip.value = null;
  removeScrollListeners();
};

const addScrollListeners = () => {
  window.addEventListener("scroll", handleScrollHide, { passive: true });
  document.addEventListener("scroll", handleScrollHide, { passive: true });

  if (navigationContainerRef.value) {
    navigationContainerRef.value.addEventListener("scroll", handleScrollHide, {
      passive: true,
    });
  }
};

const removeScrollListeners = () => {
  window.removeEventListener("scroll", handleScrollHide);
  document.removeEventListener("scroll", handleScrollHide);

  if (navigationContainerRef.value) {
    navigationContainerRef.value.removeEventListener(
      "scroll",
      handleScrollHide
    );
  }
};

const handleTooltipMouseEnter = async (buttonRef, tooltipType) => {
  if (!collapse.value || !buttonRef.value) return;

  await nextTick();
  const element = buttonRef.value.$el || buttonRef.value;
  if (!element || !element.getBoundingClientRect) return;

  try {
    const rect = element.getBoundingClientRect();
    tooltipStyle.value = {
      left: `${rect.right + 12}px`,
      top: `${rect.top + rect.height / 2}px`,
    };

    activeTooltip.value = tooltipType;
    addScrollListeners();
  } catch (error) {
    // Gracefully handle errors - log for debugging but don't break the application
    console.warn("Error calculating tooltip position:", error);
    // Don't show tooltip if we can't calculate position
    activeTooltip.value = null;
  }
};

const handleTooltipMouseLeave = () => {
  activeTooltip.value = null;
  removeScrollListeners();
};

// Specific handlers for each button
const handleNewIdentityMouseEnter = () =>
  handleTooltipMouseEnter(newIdentityButtonRef, "newIdentity");
const handleNewIdentityMouseLeave = handleTooltipMouseLeave;
const handleComposeMouseEnter = () =>
  handleTooltipMouseEnter(composeButtonRef, "compose");
const handleComposeMouseLeave = handleTooltipMouseLeave;

onUnmounted(() => {
  removeScrollListeners();
});
</script>

<template>
  <nav
    class="navigation-left-panel"
    :class="{ 'navigation-left-panel--collapsed': collapse }"
    aria-label="Sidebar navigation"
  >
    <div
      ref="navigationContainerRef"
      class="navigation-left-panel__navigation"
      data-navigation-container
    >
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
              :dot="item.dot"
              :collapse="collapse"
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
            :collapse="collapse"
          >
            {{ category.name }}
          </NavigationSidebarMenuItem>

          <NavigationSidebarMenuItem
            icon="plus"
            class="navigation-left-panel__navigation-inner-section-item"
            :collapse="collapse"
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
      <!-- Expanded state: Full BaseButton -->
      <BaseButton
        v-if="!collapse"
        ref="newIdentityButtonRef"
        variant="primary"
        size="md"
        icon="arrow-right"
        tabindex="0"
        class="navigation-left-panel__actions-button"
        @click="newIdentity"
      >
        New identity
      </BaseButton>

      <!-- Collapsed state: Custom icon button -->
      <button
        v-else
        ref="newIdentityButtonRef"
        class="navigation-left-panel__actions-button-icon navigation-left-panel__actions-button-icon--primary"
        tabindex="0"
        @click="newIdentity"
        @mouseenter="handleNewIdentityMouseEnter"
        @mouseleave="handleNewIdentityMouseLeave"
      >
        <BaseIcon name="plus" />
      </button>
      <!-- Expanded state: Full BaseButton -->
      <BaseButton
        v-if="!collapse"
        ref="composeButtonRef"
        variant="secondary"
        size="md"
        tabindex="0"
        icon="chatting "
        class="navigation-left-panel__actions-button"
        @click="openCompose"
      >
        Compose message
      </BaseButton>

      <!-- Collapsed state: Custom icon button -->
      <button
        v-else
        ref="composeButtonRef"
        class="navigation-left-panel__actions-button-icon navigation-left-panel__actions-button-icon--secondary"
        tabindex="0"
        @click="openCompose"
        @mouseenter="handleComposeMouseEnter"
        @mouseleave="handleComposeMouseLeave"
      >
        <BaseIcon name="chatting" />
      </button>
    </div>
  </nav>

  <Teleport to="body">
    <div
      v-if="collapse && activeTooltip"
      class="navigation-left-panel__tooltip"
      :style="tooltipStyle"
    >
      <!-- Triangle pointer -->
      <div class="navigation-left-panel__tooltip-arrow"></div>
      {{ activeTooltip === "newIdentity" ? "New identity" : "Compose message" }}
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.navigation-left-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 0 8px 8px;
  height: calc(100% - 8px);

  &--collapsed {
    .navigation-left-panel__navigation {
      padding: 16px 10px;
    }

    .navigation-left-panel__navigation-inner-section-title {
      font-size: 0;
      height: 1px;
      margin-bottom: 14px;
      border-bottom: 1px solid $color-primary-20;
    }
  }

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

      &-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          box-shadow: 0 0 0 2px $color-foam-blue;
        }

        &--primary {
          background-color: $color-primary-100;
          color: $color-primary-1;

          &:hover {
            opacity: 0.9;
          }
        }

        &--secondary {
          background-color: transparent;
          color: $color-primary-100;
          border-color: $color-primary-100;

          &:hover {
            background-color: $color-primary-5;
          }
        }
      }
    }
  }

  &--collapsed &__actions {
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
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

  &__tooltip {
    position: fixed;
    transform: translateY(-50%);
    z-index: 10000;
    background-color: $color-primary-100;
    color: $color-primary-1;
    padding: 8px 12px;
    border-radius: 6px;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    pointer-events: none;
    animation: fadeIn 0.2s ease;

    &-arrow {
      position: absolute;
      top: 50%;
      left: -6px;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 6px 6px 6px 0;
      border-color: transparent $color-primary-100 transparent transparent;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
