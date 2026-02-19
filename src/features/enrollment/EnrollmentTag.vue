<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <BaseText
    class="enrollment-tag"
    :class="{ 'enrollment-tag--disabled': disabled }"
    variant="caption-semibold"
  >
    <span class="enrollment-tag__text">
      <slot />
    </span>
    <BaseIcon
      name="close"
      class="enrollment-tag__icon"
    />
  </BaseText>
</template>

<style scoped lang="scss">
.enrollment-tag {
  display: inline-grid;
  grid-template-columns: 1fr 24px;
  gap: 4px;
  align-items: center;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid $color-primary-20;
  border-radius: 100px;
  cursor: pointer;
  background-color: $color-primary-1;

  &__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-word;
  }

  &:focus {
    outline: none;
    border: 1px solid $color-primary-50;
  }

  &:hover {
    border: 1px solid $color-primary-50;
  }

  &--disabled {
    background-color: $color-primary-5;
    color: $color-primary-20;
    border: 1px solid rgba($black, 0.05);
    pointer-events: none;

    &:hover {
      border: 1px solid rgba($black, 0.05);
    }
  }

  &__icon {
    place-self: center;
    font-size: 19px;
  }
}
</style>
