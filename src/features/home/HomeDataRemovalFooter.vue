<script setup>
import BaseButton from "@/library/BaseButton.vue";
import { useDataDeleteOverlay } from "@/routes/DataDeletion/composables/useDataDeleteOverlay";

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const { openDataDeleteOverlay } = useDataDeleteOverlay();
</script>
<template>
  <div class="footer">
    <slot />
    <BaseButton
      variant="primary"
      size="lg"
      class="footer__button"
      icon="arrow-right"
      @click="openDataDeleteOverlay"
    >
      Enroll in data removal
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  color: $color-primary-100;
  gap: 8px;
  margin-top: 24px;

  &__button {
    flex-shrink: 0;
    width: auto;

    &--secondary {
      margin-top: 12px;

      &:hover {
        background-color: $color-primary-5;
      }
    }
  }
}
</style>
