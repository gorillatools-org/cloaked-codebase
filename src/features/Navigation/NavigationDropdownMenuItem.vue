<script setup>
import { computed } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseToggle from "@/library/BaseToggle.vue";

const emit = defineEmits(["click"]);

const props = defineProps({
  name: { type: String, required: true },
  icon: { type: String, default: "play" },
  type: {
    type: String,
    default: "page-link",
    validator: (value) =>
      ["page-link", "external-link", "toggle-button"].includes(value),
  },
  to: { type: String, default: null },
  href: { type: String, default: null },
  noBackground: { type: Boolean, default: false },
  noRightIcon: { type: Boolean, default: false },
  alert: { type: Boolean, default: false },
  toggle: { type: Boolean, default: false },
});

const handleClick = (event) => {
  emit("click", event);
};

// Compute component type
const componentType = computed(() => {
  if (props.type === "page-link" && props.to) return "router-link";
  if (props.type === "external-link") return "a";
  return "button";
});

// Compute component attributes
const componentAttributes = computed(() => {
  if (props.type === "page-link") return { to: props.to };
  if (props.type === "external-link")
    return { href: props.href, target: "_blank", rel: "noopener noreferrer" };
  return {}; // No extra attributes for buttons
});
</script>

<template>
  <component
    :is="componentType"
    class="navigation-dropdown-menu-item"
    :class="{
      'navigation-dropdown-menu-item--no-background': noBackground,
      'navigation-dropdown-menu-item--no-right-icon': noRightIcon,
      'navigation-dropdown-menu-item--alert': alert,
    }"
    v-bind="componentAttributes"
    @click="handleClick"
  >
    <div class="navigation-dropdown-menu-item__icon">
      <BaseIcon :name="props.icon" />
    </div>
    <BaseText
      as="div"
      variant="caption-semibold"
      class="navigation-dropdown-menu-item__text"
    >
      {{ props.name }}
    </BaseText>

    <BaseToggle
      v-if="props.type === 'toggle-button'"
      :active="toggle"
      class="navigation-dropdown-menu-item__toggle"
    />

    <BaseIcon
      v-else-if="props.type === 'external-link'"
      key="new-tab"
      class="navigation-dropdown-menu-item__icon navigation-dropdown-menu-item__icon--right"
      name="new-tab"
    />

    <BaseIcon
      v-else
      key="chevron-right"
      class="navigation-dropdown-menu-item__icon navigation-dropdown-menu-item__icon--right"
      name="chevron-right"
    />
  </component>
</template>

<style lang="scss" scoped>
.navigation-dropdown-menu-item {
  padding: 10px 32px;
  color: $color-primary-100;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  background: $color-base-white-100;
  border: none;

  &:hover {
    background-color: $color-primary-10;
    cursor: pointer;
  }

  &__icon {
    position: absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-100;
    font-size: 15px;
    font-weight: 500;
    border-radius: 50%;

    &--right {
      left: auto;
      right: 8px;
    }
  }

  &__toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  &__text {
    margin-left: 10px;
    width: 100%;
  }

  &--no-background {
    background-color: transparent;

    &:hover {
      border-radius: 14px;
    }
  }

  &--no-right-icon {
    & .navigation-dropdown-menu-item__icon--right {
      display: none;
    }
  }

  &--alert {
    & .navigation-dropdown-menu-item__icon {
      background: rgba($color-alert, 0.15);
      color: $color-alert;
    }

    &:hover {
      background-color: $color-alert;
      color: $color-primary-100-dark !important;

      & .navigation-dropdown-menu-item__icon {
        color: $color-primary-100-dark !important;
      }
    }
  }
}
</style>
