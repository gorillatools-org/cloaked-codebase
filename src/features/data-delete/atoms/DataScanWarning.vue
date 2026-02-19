<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";

defineProps<{
  message: string;
}>();
</script>

<template>
  <DataDeleteCard class="scan-warning">
    <div class="scan-warning__icon">
      <BaseIcon name="exclamation-mark-triangle-filled" />
    </div>
    <BaseText
      as="p"
      variant="caption-semibold"
      class="scan-warning__text"
    >
      {{ message }}
    </BaseText>
  </DataDeleteCard>
</template>

<style lang="scss" scoped>
.scan-warning {
  display: flex;
  gap: 12px;
  border-radius: 20px;
  align-items: center;

  &.data-delete-card {
    background: $color-status-yield-15;
    border: 1px solid $color-status-yield-15;
  }

  &__icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: $color-status-yield-15;
    border-radius: 40px;
  }

  &__text {
    flex: 1;
    color: $color-base-black-80;
  }
}
</style>
