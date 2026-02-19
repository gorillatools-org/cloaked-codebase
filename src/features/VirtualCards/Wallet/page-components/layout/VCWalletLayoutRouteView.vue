<script setup lang="ts">
import { useRoute } from "vue-router";
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  provide,
  type Component,
  computed,
  markRaw,
} from "vue";
import { useVirtualCardsWalletPageStore } from "@/features/VirtualCards/store/useVirtualCardsWalletPageStore";
import {
  WalletRouterViewKey,
  type WalletRouterViewNavigation,
  type WalletPageSlot,
} from "@/features/VirtualCards/composables/pages-context/useWalletRouterViewContext";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps<{
  scrollContainer: HTMLDivElement;
}>();

const defaultNavigation: WalletRouterViewNavigation = {
  showBackButton: false,
  backTo: "",
  preserveWhileSameViewKey: false,
};

const route = useRoute();
const walletPageStore = useVirtualCardsWalletPageStore();
const shouldRouteTransition = ref(false);

let navigationResetTimeout: ReturnType<typeof setTimeout> | undefined =
  undefined;

const navigation = ref<WalletRouterViewNavigation>({
  ...defaultNavigation,
});

const slots = ref<
  Record<
    WalletPageSlot,
    {
      component?: Component;
      props?: Record<string, unknown>;
      preserveWhileSameViewKey?: boolean;
    } | null
  >
>({
  "header-actions": null,
});

const routerViewScrollContainer = computed(() => props.scrollContainer);

onMounted(() => {
  setTimeout(() => {
    walletPageStore.setShouldAnimateOnMount(false);
  }, 50); // Delay to be able to see the animation
});

onBeforeUnmount(() => {
  walletPageStore.setShouldAnimateOnMount(true);
  clearTimeout(navigationResetTimeout);
  navigationResetTimeout = undefined;
});

const currentViewKey = computed<string | null>(() => {
  const last = route.matched[route.matched.length - 1];
  return (last?.meta?.viewKey as string | undefined) ?? null;
});

const setSlot = (
  name: WalletPageSlot,
  component?: Component,
  props?: Record<string, unknown>,
  preserveWhileSameViewKey = false
) => {
  if (!component) {
    slots.value[name] = null;
    return;
  }

  slots.value[name] = {
    component: markRaw(component),
    props,
    preserveWhileSameViewKey,
  };
};

const setNavigation = (
  walletNavigation: Partial<WalletRouterViewNavigation>
) => {
  clearTimeout(navigationResetTimeout);
  navigationResetTimeout = undefined;
  navigation.value = { ...defaultNavigation, ...walletNavigation };
};

// Clear all slots and navigation on route change
watch(
  [() => route.path, () => currentViewKey.value],
  ([newPath, newViewKey], [oldPath, oldViewKey]) => {
    const isSameViewKey = newViewKey === oldViewKey;
    const isSamePath = newPath === oldPath;
    const shouldPreserveNavigation =
      isSameViewKey && navigation.value.preserveWhileSameViewKey;

    // Preserve navigation if same viewKey and preserveWhileSameViewKey is true
    if (shouldPreserveNavigation) {
      return;
    }

    // Clear slots if needed
    if (
      !isSameViewKey ||
      !slots.value["header-actions"]?.preserveWhileSameViewKey
    ) {
      slots.value = {
        "header-actions": null,
      };
    }

    // Clear navigation if needed
    if (!isSameViewKey || !navigation.value.preserveWhileSameViewKey) {
      clearTimeout(navigationResetTimeout);
      if (isSameViewKey && isSamePath) {
        // Same viewKey and path - clear immediately
        navigation.value = { ...defaultNavigation };
      } else {
        // Different viewKey or path - delay to allow component to set it first
        navigationResetTimeout = setTimeout(() => {
          navigation.value = { ...defaultNavigation };
        }, 150);
      }
    }
  }
);

watch(
  () => currentViewKey.value,
  (next, prev) => {
    shouldRouteTransition.value = next !== prev;
  }
);

provide(WalletRouterViewKey, {
  setSlot,
  setNavigation,
  routerViewScrollContainer,
});
</script>

<template>
  <section class="wallet-layout-router-view">
    <div class="wallet-layout-router-view__container">
      <header class="wallet-layout-router-view__header">
        <!-- Icon or back button -->
        <div class="wallet-layout-router-view__header-icon-container">
          <transition
            name="header-icon"
            mode="out-in"
          >
            <router-link
              v-if="navigation.showBackButton && navigation.backTo"
              :to="navigation.backTo"
              class="wallet-layout-router-view__header-back-btn"
            >
              <BaseIcon
                name="chevron-left"
                class="wallet-layout-router-view__header-back-btn-icon"
              />
              <BaseText
                variant="body-3-semibold"
                class="wallet-layout-router-view__header-back-btn-text"
              >
                Back
              </BaseText>
            </router-link>
            <BaseIcon
              v-else
              name="check-list"
              class="wallet-layout-router-view__header-icon"
            />
          </transition>
        </div>

        <!-- Title and actions container -->
        <transition
          name="header-title"
          mode="out-in"
        >
          <div
            :key="currentViewKey ?? ''"
            class="wallet-layout-router-view__header-title-container"
          >
            <BaseText
              v-if="navigation.title"
              variant="headline-3-medium"
              class="wallet-layout-router-view__header-title-text"
            >
              {{ navigation.title }}
            </BaseText>
            <component
              :is="slots['header-actions']?.component"
              v-if="slots['header-actions']?.component"
              v-bind="slots['header-actions']?.props"
            />
          </div>
        </transition>
      </header>
      <RouterView v-slot="{ Component: slotComponent, route: slotRoute }">
        <Transition
          name="route"
          mode="out-in"
        >
          <div
            :key="
              (
                slotRoute.meta.viewKey ??
                slotRoute.name ??
                slotRoute.path
              ).toString()
            "
            class="wallet-layout-router-view__router-view"
          >
            <component :is="slotComponent" />
          </div>
        </Transition>
      </RouterView>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.wallet-layout-router-view {
  width: 100%;
  height: 100%;
  position: relative;

  &__container {
    width: 100%;
    height: 100%;
    max-width: 830px;
    margin: 0 auto;
  }

  &__header {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 11px;

    &-icon {
      font-size: 25px;
      margin-left: 4px;

      &-container {
        display: flex;
        align-items: center;
        min-height: 25px;
      }
    }

    &-title {
      &-container {
        display: flex;
        align-items: center;
        min-height: 34px;
      }

      &-text {
        text-transform: capitalize;
      }
    }

    &-back-btn {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      padding-right: 15px;
      gap: 5px;
      cursor: pointer;

      &-icon {
        font-size: 21px;
        color: $color-primary-100;
        font-weight: 600;
        margin-top: -2px;
        transition: transform 0.12s ease-out;

        .wallet-layout-router-view__header-back-btn:hover & {
          transform: translateX(-2px);
        }
      }
    }
  }

  &__router-view {
    margin-top: 26px;
  }
}

.route-enter-active,
.route-leave-active {
  transition:
    opacity 0.12s cubic-bezier(0.2, 0, 0, 1),
    transform 0.12s cubic-bezier(0.2, 0, 0, 1);
}

.route-enter-from,
.route-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.header-icon-enter-active {
  transition:
    opacity 0.19s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.19s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.19s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-icon-leave-active {
  transition:
    opacity 0.14s cubic-bezier(0.4, 0, 1, 1),
    transform 0.14s cubic-bezier(0.4, 0, 1, 1),
    filter 0.14s cubic-bezier(0.4, 0, 1, 1);
}

.header-icon-enter-from {
  opacity: 0;
  transform: translateX(-12px) scale(0.86);
  filter: blur(2px);
}

.header-icon-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.86);
  filter: blur(2px);
}

.header-title-enter-active,
.header-title-leave-active {
  transition:
    opacity 0.1s cubic-bezier(0.65, 0.05, 0.36, 1),
    transform 0.1s cubic-bezier(0.65, 0.05, 0.36, 1),
    filter 0.1s cubic-bezier(0.65, 0.05, 0.36, 1);
  transform-origin: center;
}

.header-title-enter-from,
.header-title-leave-to {
  opacity: 0.2;
  filter: blur(2px);
}
</style>
