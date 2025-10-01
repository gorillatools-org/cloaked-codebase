<script setup></script>

<template>
  <TransitionGroup
    name="list"
    tag="div"
    class="enrollment-tags"
  >
    <slot />
  </TransitionGroup>
</template>

<style scoped lang="scss">
.enrollment-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  position: absolute;

  &:has(> *) {
    margin-top: -8px;
    position: static;
    min-height: 32px;
  }

  :deep(.list-move),
  :deep(.list-enter-active),
  :deep(.list-leave-active) {
    transition: all 0.4s ease;
  }

  :deep(.list-enter-from),
  :deep(.list-leave-to) {
    opacity: 0;
    transform: translateX(20px);
  }

  :deep(.list-leave-active) {
    position: absolute;
  }
}
</style>
