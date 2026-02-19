<script setup></script>

<template>
  <header class="monitoring-detail-header">
    <slot />
  </header>
</template>

<style scoped lang="scss">
.monitoring-detail-header {
  padding: 24px;
  position: sticky;
  top: 0;
  background-color: $color-primary-5;
  margin-left: -24px;
  margin-right: -24px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
