<template>
  <header class="sidebar-header">
    <slot />
  </header>
</template>

<style lang="scss" scoped>
.sidebar-header {
  margin-top: 0;
  padding: 19px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  position: sticky;
  top: 0;
}
</style>
