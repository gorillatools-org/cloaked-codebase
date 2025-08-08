<script setup></script>
<template>
  <div class="ui-info-list">
    <div class="ui-info-tiles">
      <slot />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.ui-info-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;

  .ui-info-tiles {
    display: flex;
    flex-flow: row wrap;
    gap: 9px;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 373px;
  }
}
</style>
