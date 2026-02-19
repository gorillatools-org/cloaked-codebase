<template>
  <div
    class="ui-menu-separator"
    @click.stop="() => {}"
  />
</template>

<style lang="scss" scoped>
.ui-menu-separator {
  width: 100%;
  height: 1px;
  transform: translateX(-4px);
  background: $color-primary-5;
}
</style>
