<script setup>
import { computed } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";

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
});

const componentType = computed(() => (props.url ? "router-link" : "div"));
const componentAttributes = computed(() =>
  props.url ? { to: props.url } : {}
);

const formattedCount = computed(() => {
  const num = Number(props.count);
  return num > 0 ? num.toLocaleString() : "0";
});
</script>

<template>
  <component
    :is="componentType"
    class="navigation-sidebar-menu-item"
    v-bind="componentAttributes"
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
  </component>
</template>

<style lang="scss" scoped>
.navigation-sidebar-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  position: relative;

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
}
</style>
