<script setup>
import { computed } from "vue";
import BaseButton from "@/library/BaseButton.vue";
const props = defineProps({
  type: {
    type: String,
    default: "individual",
    validator: (value) => ["individual", "couple", "family"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
});

const backgroundColor = computed(() => {
  if (props.type === "couple") {
    return "brand-2-gradient";
  }
  if (props.type === "family") {
    return "brand-3-gradient";
  }
  return "info-gradient";
});
</script>

<template>
  <BaseButton
    :disabled="props.disabled"
    :size="props.size"
    :fullWidth="props.fullWidth"
    :backgroundColor="backgroundColor"
    :loading="props.loading"
  >
    <slot />
  </BaseButton>
</template>

<style lang="scss" scoped>
.button-plans {
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  color: $color-primary-100-light;
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @mixin background-gradient($color-start, $color-end) {
    background: linear-gradient(46deg, $color-start 31%, $color-end 100%);
  }

  &--individual {
    @include background-gradient($color-info, #fd9871);
  }

  &--couple {
    @include background-gradient($color-brand-2-90-light, #dbdf00);
  }

  &--family {
    @include background-gradient($color-brand-3-90-light, #2ab5dc);
  }

  &--sm {
    padding: 8px 12px;
  }

  &--md {
    padding: 16px 24px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>
