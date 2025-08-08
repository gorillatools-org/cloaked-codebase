<script setup></script>
<template>
  <div class="form-item-row">
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.form-item-row {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
</style>
