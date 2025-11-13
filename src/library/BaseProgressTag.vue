<script setup>
import BaseText from "@/library/BaseText.vue";

defineProps({
  color: {
    type: String,
    default: "safe-zone-blue",
    validator: (value) =>
      [
        "cloaked",
        "spirit-rose",
        "arctic-lime",
        "foam-blue",
        "crest-blue",
        "violet-reflection",
        "caribbean-green",
        "spam-protection",
        "safe-zone-blue",
        "safe-zone-green",
        "status-error",
        "status-yield",
      ].includes(value),
  },
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "secondary"].includes(value),
  },
});
</script>

<template>
  <div
    class="base-progress-tag"
    :class="[`base-progress-tag--${color}`, `base-progress-tag--${variant}`]"
  >
    <div class="base-progress-tag__icon"></div>
    <BaseText
      variant="caption-semibold"
      as="div"
      class="base-progress-tag__text"
    >
      <slot />
    </BaseText>
    <slot name="right"></slot>
  </div>
</template>

<style lang="scss" scoped>
.base-progress-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  padding: 8px 12px;

  &__text {
    font-weight: 700;
  }

  &__icon {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: relative;
    z-index: 1;
    background-color: var(--tag-color);

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      z-index: -1;
      animation: ping 2.3s cubic-bezier(0, 0, 0.2, 1) infinite;
      opacity: 0.3;
      background-color: var(--tag-color);
    }
  }

  &--cloaked {
    --tag-color: #{$color-cloaked};
    --tag-bg-color: #{$color-cloaked-15};
  }

  &--spirit-rose {
    --tag-color: #{$color-spirit-rose};
    --tag-bg-color: #{$color-spirit-rose-15};
  }

  &--arctic-lime {
    --tag-color: #{$color-arctic-lime};
    --tag-bg-color: #{$color-arctic-lime-15};
  }

  &--foam-blue {
    --tag-color: #{$color-foam-blue};
    --tag-bg-color: #{$color-foam-blue-15};
  }

  &--crest-blue {
    --tag-color: #{$color-crest-blue};
    --tag-bg-color: #{$color-crest-blue-15};
  }

  &--violet-reflection {
    --tag-color: #{$color-violet-reflection};
    --tag-bg-color: #{$color-violet-reflection-15};
  }

  &--caribbean-green {
    --tag-color: #{$color-caribbean-green};
    --tag-bg-color: #{$color-caribbean-green-15};
  }

  &--spam-protection {
    --tag-color: #{$color-spam-protection};
    --tag-bg-color: #{$color-spam-protection-15};
  }

  &--safe-zone-blue {
    --tag-color: #{$color-safe-zone-blue};
    --tag-bg-color: #{$color-safe-zone-blue-15};
  }

  &--safe-zone-green {
    --tag-color: #{$color-safe-zone-green};
    --tag-bg-color: #{$color-safe-zone-green-15};
  }

  &--status-error {
    --tag-color: #{$color-status-error};
    --tag-bg-color: #{$color-status-error-15};
  }

  &--status-yield {
    --tag-color: #{$color-status-yield};
    --tag-bg-color: #{$color-status-yield-15};
  }

  &--purple {
    --tag-color: #{$color-spam-protection};
    --tag-bg-color: #{$color-spam-protection-15};
  }

  &--red {
    --tag-color: #{$color-spirit-rose};
    --tag-bg-color: #{$color-spirit-rose-15};
  }

  &--primary {
    background-color: var(--tag-bg-color);
  }

  &--secondary {
    background-color: transparent;
    border: 1px solid var(--tag-color);

    .base-progress-tag__text {
      color: var(--tag-color);
    }
  }
}

@keyframes ping {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.6;
  }

  50%,
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
</style>
