<template>
  <div class="subscribe-card">
    <slot />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.subscribe-card {
  border-radius: 16px;
  background-blend-mode: screen;
  padding: 16px;
  width: 100%;

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.1);
    border: 1px solid rgba($color-primary-100-dark, 0.1);
  }

  @at-root .theme-light & {
    background: rgba($color-primary-100-light, 0.05);
    border: 1px solid rgba($color-primary-100-light, 0.05);
  }
}
</style>
