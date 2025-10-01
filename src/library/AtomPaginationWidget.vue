<script setup>
import { computed, reactive } from "vue";
import { vOnClickOutside } from "@vueuse/components";

// eslint-disable-next-line import/no-restricted-paths
import ArrowButton from "@/features/ArrowButton.vue";

const props = defineProps({
  currentItemsCount: {
    type: Number,
    default: 0,
  },
  totalItemsCount: {
    type: Number,
    default: 0,
  },
  fetchPageNumberData: {
    type: Function,
    default: () => {},
  },
  resultsPerPage: {
    type: Number,
    default: 5,
  },
  customOffset: {
    type: String,
    default: "",
  },
  leftArrowDisabled: {
    type: Boolean,
    default: false,
  },
  rightArrowDisabled: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});
const state = reactive({
  currentPage: 1,
  showNavPopup: false,
  activeButton: "",
});

const totalPages = computed(() => {
  return Math.ceil(props.totalItemsCount / props.resultsPerPage);
});

/* Create array from 1 - x number of buttons */
const pageButtons = computed(() =>
  Array(totalPages.value)
    .fill(0)
    .map(Number.call, Number)
    .map((x) => ++x)
);

const pages = computed(() => {
  const { floor, min, max } = Math;
  const range = (lo, hi) => Array.from({ length: hi - lo }, (_, i) => i + lo);

  const pagination = (count) => (page, total) => {
    const start = max(1, min(page - floor((count - 3) / 2), total - count + 2));
    const end = min(total, max(page + floor((count - 2) / 2), count - 1));
    return [
      ...(start > 2 ? [1, "..."] : start > 1 ? [1] : []),
      ...range(start, end + 1),
      ...(end < total - 1 ? ["...", total] : end < total ? [total] : []),
    ];
  };

  if (props.isMobile) {
    return pagination(6)(state.currentPage, totalPages.value);
  }
  return pagination(props.resultsPerPage)(state.currentPage, totalPages.value);
});

const toggleShowNavPopup = (e, buttonId) => {
  e.stopPropagation();
  state.showNavPopup = !state.showNavPopup;
  if (state.showNavPopup && buttonId) {
    state.activeButton = buttonId;
  } else {
    state.activeButton = "";
  }
};
const hide = () => {
  state.showNavPopup = false;
};

const handlePageChange = (page) => {
  state.currentPage = page;
  props.fetchPageNumberData(page);
};

const overallOffset = computed(() => {
  const offsetStart = (state.currentPage - 1) * props.resultsPerPage + 1;
  const offsetEnd = offsetStart + props.currentItemsCount - 1;
  const overallOffsetStart = state.currentPage === 1 ? 1 : offsetStart;

  return `${overallOffsetStart} - ${offsetEnd} of ${props.totalItemsCount}`;
});
</script>
<template>
  <div
    v-if="pages?.length > 0"
    class="cloak-identifier-section__nav-btns"
  >
    <div>
      <ArrowButton
        class="arrow-btn"
        :disabled="leftArrowDisabled || state.currentPage === 1"
        horizontal
        @click="() => handlePageChange(state.currentPage - 1)"
      />
      <span
        v-for="(page, index) in pages"
        :key="`${page}-${index}`"
      >
        <button
          v-if="typeof page === 'number'"
          class="page-btn"
          :class="{
            active: state.currentPage === page,
          }"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        <span
          v-else
          v-on-click-outside="hide"
          class="nav-anchor"
        >
          <div
            v-if="state.showNavPopup"
            class="nav-popup"
          >
            <h6>Jump to page</h6>
            <div class="page-nav">
              <button
                v-for="pageButton in pageButtons"
                :key="pageButton"
                class="page-btn"
                :class="{
                  active: state.currentPage === pageButton,
                }"
                @click="handlePageChange(pageButton)"
              >
                {{ pageButton }}
              </button>
            </div>
          </div>
          <button
            :id="`ellipses-${index}`"
            class="page-btn"
            :class="{
              active:
                state.showNavPopup === true &&
                state.activeButton === `ellipses-${index}`,
            }"
            @click="(e) => toggleShowNavPopup(e, `ellipses-${index}`)"
          >
            ...
          </button>
        </span>
      </span>
      <ArrowButton
        class="arrow-btn"
        :disabled="props.rightArrowDisabled || state.currentPage === totalPages"
        horizontal
        is-open
        @click="() => handlePageChange(state.currentPage + 1)"
      />
    </div>
    <div class="cloak-identifier-section__count">
      <span v-if="props.customOffset">{{ props.customOffset }}</span>
      <span v-else>{{ overallOffset }}</span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// stylelint-disable
.cloak-identifier-section {
  &__nav-btns {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 0;
    color: $color-primary-70;

    .page-btn {
      background-color: transparent;
      color: $color-primary-70;
      border: none;
      border-radius: 6px;
      height: 24px;
      width: 24px;
      min-height: 24px;
      min-width: 24px;
      cursor: pointer;
      padding: 2px;

      &.active {
        background-color: $color-primary-10;
        color: $color-primary-100;
      }
    }

    .nav-anchor {
      position: relative;
    }

    .nav-popup {
      position: absolute;
      width: 189px;
      background-color: $color-primary-1;
      box-shadow:
        -22.9px -8.90123px 26.7037px rgb(1 2 24 / 5%),
        13.3518px 12.35px 26.7037px rgb(1 2 24 / 16%);
      border-radius: 8px;
      padding: 18px;

      h6 {
        font-size: 10px;
        font-weight: 500;
        margin-bottom: 16px;
      }
    }

    .page-nav {
      display: flex;
      flex-flow: row wrap;
      gap: 8px;

      .page-btn {
        border: 1px solid $color-primary-10;
      }
    }
  }

  &__count {
    span {
      color: $color-primary-50;
      font-size: 11px;
    }
  }
}
</style>
