<script setup>
defineEmits(["go-back"]);
</script>

<template>
  <header class="preferences-header">
    <div class="preferences-header__left">
      <slot name="post-left" />
    </div>

    <div class="preferences-header__right">
      <slot name="right" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.preferences-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0;
  width: 100%;

  &__left,
  &__right {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
