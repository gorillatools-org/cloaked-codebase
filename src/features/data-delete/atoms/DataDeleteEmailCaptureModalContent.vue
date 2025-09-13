<template>
  <div
    class="data-delete-email-capture-modal-content"
    type="dark"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.data-delete-email-capture-modal-content {
  border-radius: 30px;
  background-blend-mode: screen;
  padding: 24px;
  width: 100%;
  width: clamp(0px, 100vw - 48px, 375px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  background-color: $color-base-white-100;

  & > * {
    flex-shrink: 0;
  }

  @media all and (min-width: $screen-xl) {
    padding: 32px;
  }
}
</style>
