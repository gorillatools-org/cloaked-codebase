<script setup>
import { debounce } from "lodash-es";
import AppTable from "@/features/ui/AppTable.vue";
import {
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  useAttrs,
  useSlots,
} from "vue";
const el = ref(null);

const state = reactive({
  hasOverflowLeft: false,
  hasOverflowRight: false,
  isMaximized: false,
});

const attrs = useAttrs();

function updateOverflows() {
  if (!el?.value) return;
  debounce(
    () => {
      state.hasOverflowLeft = el.value.$el.scrollLeft > 0;
      state.hasOverflowRight =
        el.value.$el.scrollWidth -
          el.value.$el.clientWidth -
          el.value.$el.scrollLeft >
        0;
    },
    50,
    { maxWait: 50 }
  );
}

onMounted(() => {
  window.addEventListener("resize", updateOverflows);
});

onBeforeMount(() => {
  window.removeEventListener("resize", updateOverflows);
});

const slots = useSlots();
</script>

<template>
  <AppTable
    v-bind="attrs"
    ref="el"
    class="import-table"
    :class="{
      'import-table--overflow-left': state.hasOverflowLeft,
      'import-table--overflow-right': state.hasOverflowRight,
      'import-table--maximized': state.isMaximized,
    }"
  >
    <template
      v-for="(index, name) in slots"
      #[name]="data"
    >
      <slot
        :name="name"
        v-bind="data"
      />
    </template>
  </AppTable>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins";

@mixin table-scroll-bar() {
  &::-webkit-scrollbar:vertical {
    width: 6px;
  }

  &::-webkit-scrollbar:horizontal {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: $color-primary-30;
  }

  &::-webkit-scrollbar-track {
    background-color: $color-primary-1;

    @at-root .theme-dark & {
      background-color: $color-primary-10;
    }
  }

  &::-webkit-scrollbar {
    appearance: none;
  }
}

.import-table {
  &.app-table {
    overflow: scroll;

    @include custom-scroll-bar;

    @include table-scroll-bar;
  }
}
</style>
