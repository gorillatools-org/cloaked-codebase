<script setup>
import EnterIcon from "@/assets/icons/enter.svg";
import { watch, ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
  active: {
    type: [Number, null],
    default: null,
  },
});

const emit = defineEmits(["select", "setActive"]);

const sectionListItems = ref(null);

watch(
  () => props.active,
  (idx) => {
    if (sectionListItems.value) {
      const parentBox = sectionListItems.value.getBoundingClientRect();
      const { scrollTop } = sectionListItems.value;

      const activeChild = sectionListItems.value.querySelector(
        ".section-list__item--active"
      );

      if (activeChild) {
        const box = activeChild.getBoundingClientRect();
        const top = box.height * (idx || 0);

        const visibleRange = [scrollTop, scrollTop + parentBox.height];

        // if the new active element is not at least 80% visible, scroll to it;
        if (
          top >= visibleRange[0] &&
          top <= visibleRange[1] - box.height * 0.8
        ) {
          return;
        }

        sectionListItems.value.scrollTo({
          top,
          behavior: "smooth",
        });
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <section
    ref="sectionList"
    class="section-list"
  >
    <h4
      v-if="title"
      class="section-list__title"
    >
      {{ props.title }}
    </h4>

    <ul
      ref="sectionListItems"
      class="section-list__items"
    >
      <template v-for="(item, idx) in props.items">
        <li
          v-if="item?.title === 'divider'"
          :key="`${idx}-${item.id}`"
        >
          <div class="section-list__separator" />
        </li>
        <li
          v-else
          :key="`${idx}-${item.title || item.nickname}`"
          class="section-list__item"
          :class="{
            'section-list__item--active': props.active == idx,
          }"
          :aria-id="`Add${item?.nickname || ''}`"
          @mousedown="emit('select', item)"
          @mouseenter="emit('setActive', idx)"
        >
          <div class="section-list__item-body">
            <h2
              v-if="item.title || item.nickname"
              class="section-list__item-title"
            >
              {{ item.title || item.nickname }}
            </h2>

            <h4
              v-if="item.website_url"
              class="section-list__item-subtitle"
            >
              {{ item.website_url }}
            </h4>
          </div>

          <div
            v-if="props.active == idx"
            class="section-list__item-actions"
            aria-id="WebsiteSelectButton"
          >
            <EnterIcon />
          </div>
        </li>
      </template>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.section-list {
  padding: 15px 0 15px 9px;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  &__title {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-50;
    padding: 0 10px;
    flex-shrink: 0;
  }

  &__separator {
    height: 1px;
    width: 100%;
    background: $color-primary-10;
  }

  &__items {
    overflow: hidden auto;

    @include custom-scroll-bar;
  }

  &__item {
    padding: 8px 10px;
    margin-right: 9px;
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    gap: 8px;
    min-height: 55px;

    &--active {
      background: $color-primary-5;
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      transform: scale(1.005);
    }
  }

  &__item-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 1 0;
  }

  &__item-title {
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-100;
  }

  &__item-subtitle {
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-50;
  }

  &__item-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    svg {
      color: $color-primary-50;
    }
  }
}
</style>
