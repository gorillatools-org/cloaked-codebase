<template>
  <div class="data-delete-card-divider" />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-card-divider {
  width: 100%;

  @at-root .theme-dark & {
    border-top: 1px solid rgba($color-primary-100-dark, 0.1);
  }

  @at-root .theme-light & {
    border-top: 1px solid rgba($color-primary-100-light, 0.1);
  }
}
</style>
