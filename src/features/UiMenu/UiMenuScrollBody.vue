<template>
  <div class="ui-menu-scroll-body">
    <slot />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.ui-menu-scroll-body {
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @include custom-scroll-bar;
}
</style>
