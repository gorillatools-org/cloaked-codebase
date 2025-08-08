<template>
  <div class="sidebar-separator" />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.sidebar-separator {
  padding: 0.5px 0;
  width: 100%;
  background: $color-primary-10;

  + .sidebar-separator {
    display: none;
  }
}
</style>
