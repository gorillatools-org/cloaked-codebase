<script setup>
import { computed, ref, nextTick, onUnmounted } from "vue";
import { debounce } from "lodash-es";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";

const emit = defineEmits(["click"]);

const props = defineProps({
  url: {
    type: String,
    default: "",
    validator(value) {
      return value.startsWith("/") || value === "";
    },
  },
  icon: {
    type: String,
    default: "",
  },
  count: {
    type: Number,
    default: 0,
  },
  dot: {
    type: Boolean,
    default: false,
  },
  collapse: {
    type: Boolean,
    default: false,
  },
  class: {
    type: [String, Array, Object],
    default: "",
  },
});

const tooltipId = computed(() => `tooltip-${crypto.randomUUID()}`);

const componentType = computed(() => (props.url ? "router-link" : "div"));
const componentAttributes = computed(() => {
  const attributes = props.url ? { to: props.url } : {};

  if (props.collapse) {
    attributes["aria-describedby"] = tooltipId.value;
  }

  return attributes;
});

const combinedClasses = computed(() => {
  const baseClasses = [
    "navigation-sidebar-menu-item",
    { "navigation-sidebar-menu-item--collapsed": props.collapse },
  ];

  if (props.class) {
    baseClasses.push(props.class);
  }

  return baseClasses;
});

const formattedCount = computed(() => {
  const num = Number(props.count);
  return num > 0 ? num.toLocaleString() : "0";
});

const menuItemRef = ref(null);
const showTooltip = ref(false);
const tooltipStyle = ref({});

const handleScrollHide = () => {
  showTooltip.value = false;
  removeScrollListeners();
};

const debouncedHandleScrollHide = debounce(handleScrollHide, 16);

const addScrollListeners = () => {
  window.addEventListener("scroll", debouncedHandleScrollHide, {
    passive: true,
  });
  document.addEventListener("scroll", debouncedHandleScrollHide, {
    passive: true,
  });

  const navContainer = document.querySelector("[data-navigation-container]");
  if (navContainer) {
    navContainer.addEventListener("scroll", debouncedHandleScrollHide, {
      passive: true,
    });
  }
};

const removeScrollListeners = () => {
  window.removeEventListener("scroll", debouncedHandleScrollHide);
  document.removeEventListener("scroll", debouncedHandleScrollHide);

  const navContainer = document.querySelector("[data-navigation-container]");
  if (navContainer) {
    navContainer.removeEventListener("scroll", debouncedHandleScrollHide);
  }
};

const handleMouseEnter = async () => {
  if (!props.collapse || !menuItemRef.value) return;

  await nextTick();

  const element = menuItemRef.value.$el || menuItemRef.value;

  if (!element || !element.getBoundingClientRect) {
    return;
  }

  const rect = element.getBoundingClientRect();

  tooltipStyle.value = {
    left: `${rect.right + 12}px`,
    top: `${rect.top + rect.height / 2}px`,
  };

  showTooltip.value = true;
  addScrollListeners();
};

const handleMouseLeave = () => {
  showTooltip.value = false;
  removeScrollListeners();
};

const handleClick = (event) => {
  if (!props.url) {
    emit("click", event);
  }
};

onUnmounted(() => {
  removeScrollListeners();
});
</script>

<template>
  <component
    :is="componentType"
    ref="menuItemRef"
    :class="combinedClasses"
    v-bind="componentAttributes"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <div class="navigation-sidebar-menu-item__icon">
      <BaseIcon :name="icon" />
    </div>

    <BaseText
      variant="body-small-medium"
      as="span"
      class="navigation-sidebar-menu-item__text"
    >
      <slot />
    </BaseText>
    <BaseText
      v-if="count"
      variant="caption-semibold"
      as="span"
      class="navigation-sidebar-menu-item__count"
    >
      {{ formattedCount }}
    </BaseText>
    <span
      v-if="dot"
      class="navigation-sidebar-menu-item__dot"
    ></span>
  </component>

  <!-- Teleport tooltip outside of all containers -->
  <Teleport to="body">
    <div
      v-if="collapse && showTooltip"
      :id="tooltipId"
      role="tooltip"
      class="navigation-sidebar-menu-item__tooltip"
      :style="tooltipStyle"
    >
      <!-- Triangle pointer -->
      <div class="navigation-sidebar-menu-item__tooltip-arrow"></div>
      <slot />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.navigation-sidebar-menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  position: relative;

  &--collapsed {
    padding: 4px 4px;
    width: 44px;
    height: 44px;
    margin: 0 auto;

    & .navigation-sidebar-menu-item__icon {
      width: 36px;
      height: 36px;
    }

    & .navigation-sidebar-menu-item__text {
      display: none;
    }

    & .navigation-sidebar-menu-item__count {
      display: none;
    }

    & .navigation-sidebar-menu-item__dot {
      display: none;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid $color-primary-30;
    color: $color-primary-100;
    font-size: 14px;
    font-weight: 500;
  }

  &__text {
    flex: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &__count {
    position: absolute;
    top: 50%;
    right: 5px;
    transform: translateY(-50%);
    background-color: $color-spirit-rose;
    color: $color-primary-10;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 6px;
    color: $color-primary-1-light;
    display: inline-block;
    font-weight: 600;
  }

  &__dot {
    width: 8px;
    height: 8px;
    background-color: $color-spirit-rose;
    border-radius: 50%;
    position: absolute;
    top: calc(50% - 4px);
    right: 10px;
  }

  &:hover {
    background-color: $color-primary-10;
    cursor: pointer;
  }

  &.router-link-active {
    background-color: rgba($color-foam-blue, 0.15);

    & .navigation-sidebar-menu-item__icon {
      border-color: $color-foam-blue;
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
