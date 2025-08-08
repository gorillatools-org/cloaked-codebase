<script setup></script>
<template>
  <div class="form-wrapper">
    <div class="form-header">
      <slot name="header" />
    </div>
    <slot />
    <div class="form-tags">
      <slot name="tags" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.form-wrapper {
  padding: 24px;
  border: 1px solid $color-primary-30;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  width: 100%;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $color-primary-100;
    width: 100%;
  }

  .form-tags {
    display: flex;
    flex-flow: row wrap;
    gap: 4px;
  }

  .form-item-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }
}
</style>
