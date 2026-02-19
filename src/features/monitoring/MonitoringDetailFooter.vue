<script setup></script>

<template>
  <footer class="monitoring-detail-footer">
    <slot />
  </footer>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.monitoring-detail-footer {
  position: sticky;
  bottom: 0;
  margin-left: -24px;
  margin-right: -24px;
  padding: 24px;
  background-color: $color-primary-1;
  border-radius: 20px;
  border: 1px solid $color-primary-5;
  box-shadow: 0px -10px 50px 0px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
</style>
