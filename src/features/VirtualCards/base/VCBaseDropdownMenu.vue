<script setup lang="ts">
import Popper from "@/features/Popper.vue";
import { computed, ref, type StyleValue } from "vue";
import type { PopperProps } from "@/types/components/popper";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes";

export type DropdownMenuItem = {
  id?: string;
  label: string;
  icon?: BaseIconName;
  iconPosition?: "left" | "right";
  color?: "default" | "danger" | "success" | "yield";
  visible?: boolean;
  onClick?: () => void;
};

type Props = {
  items: DropdownMenuItem[][];
  popper: PopperProps;
};

defineOptions({ inheritAttrs: false });

const props = defineProps<Props>();

const isOpen = ref(false);

const filteredItems = computed(() => {
  return props.items
    .map((itemSet) => itemSet.filter((item) => item.visible !== false))
    .filter((itemSet) => itemSet.length > 0);
});
</script>

<template>
  <Popper
    :width="'180px'"
    :overflow="'unset'"
    v-bind="props.popper"
    @open="isOpen = true"
    @close="isOpen = false"
  >
    <slot :open="isOpen" />
    <template #content>
      <div
        :style="$attrs.style as StyleValue"
        :class="$attrs.class"
        class="vc-base-dropdown-menu"
      >
        <div
          v-for="(itemsSet, index) in filteredItems"
          :key="index"
          class="vc-base-dropdown-menu__items-container"
        >
          <div
            v-for="(item, itemIndex) in itemsSet"
            :key="item.id || itemIndex"
            class="vc-base-dropdown-menu__item"
            :class="[
              `vc-base-dropdown-menu__item--${item.color || 'default'}`,
              item.iconPosition === 'right' &&
                'vc-base-dropdown-menu__item--icon-right',
            ]"
            @click="item.onClick ? item.onClick() : null"
          >
            <slot
              :name="item.id"
              :item="item"
            >
              <BaseIcon
                v-if="item.icon"
                class="vc-base-dropdown-menu__item-icon"
                :name="item.icon"
              />
              <BaseText variant="body-small-semibold">
                {{ item.label }}
              </BaseText>
            </slot>
          </div>
        </div>
      </div>
    </template>
  </Popper>
</template>

<style scoped lang="scss">
.vc-base-dropdown-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  border: 1px solid $color-primary-20;
  background-color: $color-primary-1;
  box-shadow: 0 10px 24px 0 rgb(0 0 0 / 15%);
  border-radius: 16px;

  &__items-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
    padding-top: 6px;

    &:first-child {
      padding-top: 8px;
    }

    &:not(:last-child) {
      border-bottom: 1px solid $color-primary-20;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    cursor: pointer;
    border-radius: 8px;

    &--danger {
      color: $color-status-error;
    }

    &--success {
      color: $color-status-success;
    }

    &--yield {
      color: $color-status-yield;
    }

    &-icon {
      font-size: 15px;
      margin-top: -2px;
    }

    &--icon-right {
      justify-content: space-between;

      .vc-base-dropdown-menu__item-icon {
        order: 1;
      }
    }

    &:hover {
      background-color: $color-primary-10;
    }
  }
}
</style>
