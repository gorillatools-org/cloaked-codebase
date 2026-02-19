<template>
  <div class="data-delete-background" />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-background {
  position: fixed;
  inset: 0;
  z-index: 1;

  @include cloaked-gradient-background;
}
</style>
