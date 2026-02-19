<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";

const isOpen = ref(false);

const contentEl = ref<HTMLElement | null>(null);
const collapsedEl = ref<HTMLElement | null>(null);
const expandedEl = ref<HTMLElement | null>(null);
const contentHeight = ref("0px");

async function updateHeight() {
  await nextTick();

  const activeEl = isOpen.value ? expandedEl.value : collapsedEl.value;
  if (!activeEl) return;

  const rect = activeEl.getBoundingClientRect();
  const safeHeight = Math.ceil(rect.height) + 1;
  contentHeight.value = `${safeHeight}px`;
}

async function toggleOpen() {
  isOpen.value = !isOpen.value;
  await updateHeight();
}

const handleResize = () => {
  updateHeight();
};

onMounted(async () => {
  await updateHeight();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <DataDeleteCard
    class="expandable-card"
    :class="{ 'expandable-card--open': isOpen }"
  >
    <slot name="header" />

    <div
      ref="contentEl"
      class="expandable-card__content"
      :style="{ height: contentHeight }"
    >
      <div
        ref="collapsedEl"
        class="expandable-card__view"
        :class="{ 'expandable-card__view--hidden': isOpen }"
      >
        <slot name="collapsed" />
      </div>

      <div
        ref="expandedEl"
        class="expandable-card__view"
        :class="{ 'expandable-card__view--hidden': !isOpen }"
      >
        <slot name="expanded" />
      </div>
    </div>

    <footer class="expandable-card__footer">
      <button
        type="button"
        class="expandable-card__toggle-btn"
        :aria-expanded="isOpen"
        @click="toggleOpen"
      >
        <BaseText
          as="p"
          variant="body-2-semibold"
        >
          {{ isOpen ? "See less information" : "See more information" }}
        </BaseText>
        <BaseIcon
          name="chevron-down"
          class="expandable-card__chevron"
        />
      </button>
    </footer>
  </DataDeleteCard>
</template>

<style lang="scss" scoped>
.expandable-card {
  padding: 20px;
  transition: border-color 250ms ease;

  &.data-delete-card {
    background: $color-base-black-5;
    border: 1px solid $color-base-black-15;
  }

  &--open.data-delete-card {
    border-color: $color-status-error;
  }

  &__content {
    position: relative;
    overflow: hidden;
    transition: height 350ms cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 16px;
    will-change: height;
  }

  &__view {
    opacity: 1;
    transition: opacity 300ms ease;

    > * + * {
      margin-top: 16px;
    }

    &--hidden {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      opacity: 0;
      pointer-events: none;
    }
  }

  &__footer {
    margin-top: 16px;
  }

  &__toggle-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: $color-base-black-80;
    cursor: pointer;
    transition: color 200ms ease;

    &:hover {
      color: $color-base-black-100;
    }
  }

  &__chevron {
    width: 16px;
    height: 16px;
    transition: transform 220ms ease;

    .expandable-card--open & {
      transform: rotate(180deg);
    }
  }
}
</style>
