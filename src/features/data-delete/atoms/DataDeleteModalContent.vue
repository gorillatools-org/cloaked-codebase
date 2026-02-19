<script setup>
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
</script>

<template>
  <DataDeleteCard
    class="data-delete-modal-content"
    type="dark"
  >
    <slot />
  </DataDeleteCard>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-modal-content {
  width: clamp(0px, 100vw - 48px, 512px);
  max-height: calc(100vh - 48px);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;

  @at-root .theme-light & {
    background-color: rgba($color-primary-1-light, 0.6);
  }

  & > * {
    flex-shrink: 0;
  }

  @media all and (min-width: $screen-xl) {
    padding: 32px 24px;
  }
}
</style>
