<script setup></script>
<template>
  <div class="list-row-wrapper">
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.list-row-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  width: 100%;
}
</style>
