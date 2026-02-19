<script setup>
const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="app-table">
    <div class="app-table__head">
      <div class="app-table__head-row">
        <slot
          name="head-row"
          :row="props.columns"
          :cell-class="'app-table__head-cell'"
        />
      </div>
    </div>
    <div class="app-table__body">
      <div
        v-for="(row, index) in props.rows"
        :key="row.id || index"
        class="app-table__body-row"
      >
        <slot
          name="body-row"
          :row="row"
          :cell-class="'app-table__body-cell'"
        />
      </div>
      <slot
        v-if="!props.rows.length"
        name="empty"
      />
    </div>
    <slot name="footer" />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins";

.app-table {
  margin-top: 16px;
  background: $color-base-white-100;
  border: 1px solid $color-primary-10;
  border-radius: 16px 16px 0 0;
  height: 100%;
  overflow-x: auto;

  @mixin table-row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  @mixin table-cell {
    display: table-cell;
    width: 250px;
  }

  &__head {
    background-color: $color-primary-5;
    display: table;
    position: sticky;
    top: 0;
    z-index: 2;
    box-shadow:
      0 0 12px rgb(0 0 0 / 4%),
      0 1px 4px rgb(1 2 24 / 8%);
    width: 100%;

    &-row {
      @include table-row;

      height: 64px;
      border-bottom: 1px solid $color-primary-10;
    }

    &-cell {
      @include table-cell;
    }
  }

  &__body {
    width: 100%;
    display: table;

    &-row {
      @include table-row;

      background: $color-base-white-100;
      font-size: 14px;
      line-height: 21px;
      color: $color-primary-100;
      border-bottom: 1px solid $color-primary-10;
      min-height: 64px;
      transition: 0.3s all cubic-bezier(0.17, 0.67, 0.83, 0.67);

      &:hover {
        background: $color-primary-5;
        transform: scale(1.003) translate3d(0, 0, 0);
        transition: 0.3s all cubic-bezier(0.17, 0.67, 0.83, 0.67);
      }
    }

    &-cell {
      @include table-cell;
      @include line-clamp(2);

      padding: 0 8px;
    }
  }
}
</style>
