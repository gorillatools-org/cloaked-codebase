<script setup></script>
<template>
  <div class="button-row">
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.button-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  position: fixed;
  padding-bottom: 5%;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
