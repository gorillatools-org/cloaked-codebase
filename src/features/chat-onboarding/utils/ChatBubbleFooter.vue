<template>
  <footer class="chat-bubble-footer">
    <slot />
  </footer>
</template>

<style scoped lang="scss">
.chat-bubble-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;

  :deep(.base-button__icon) {
    display: none;
  }
}
</style>
