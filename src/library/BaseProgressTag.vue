<script setup>
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
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
      ].includes(value),
  },
});
</script>

<template>
  <div
    class="base-progress-tag"
    :class="`base-progress-tag--${props.color}`"
  >
    <div class="base-progress-tag__icon"></div>
    <BaseText
      variant="caption-semibold"
      as="div"
      class="base-progress-tag__text"
    >
      <slot />
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
.base-progress-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  padding: 10px 12px;

  &__icon {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: relative;
    z-index: 1;

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
      background-color: inherit;
    }
  }

  &__text {
    font-weight: 700;
  }

  &--cloaked {
    background-color: $color-cloaked-15;

    .base-progress-tag__icon {
      background-color: $color-cloaked;
    }
  }

  &--spirit-rose {
    background-color: $color-spirit-rose-15;

    .base-progress-tag__icon {
      background-color: $color-spirit-rose;
    }
  }

  &--arctic-lime {
    background-color: $color-arctic-lime-15;

    .base-progress-tag__icon {
      background-color: $color-arctic-lime;
    }
  }

  &--foam-blue {
    background-color: $color-foam-blue-15;

    .base-progress-tag__icon {
      background-color: $color-foam-blue;
    }
  }

  &--crest-blue {
    background-color: $color-crest-blue-15;

    .base-progress-tag__icon {
      background-color: $color-crest-blue;
    }
  }

  &--violet-reflection {
    background-color: $color-violet-reflection-15;

    .base-progress-tag__icon {
      background-color: $color-violet-reflection;
    }
  }

  &--caribbean-green {
    background-color: $color-caribbean-green-15;

    .base-progress-tag__icon {
      background-color: $color-caribbean-green;
    }
  }

  &--spam-protection {
    background-color: $color-spam-protection-15;

    .base-progress-tag__icon {
      background-color: $color-spam-protection;
    }
  }

  &--safe-zone-blue {
    background-color: $color-safe-zone-blue-15;

    .base-progress-tag__icon {
      background-color: $color-safe-zone-blue;
    }
  }

  &--safe-zone-green {
    background-color: $color-safe-zone-green-15;

    .base-progress-tag__icon {
      background-color: $color-safe-zone-green;
    }
  }

  &--purple {
    background-color: $color-spam-protection-15;
  }

  &--purple &__icon {
    background-color: $color-spam-protection;
  }

  &--red {
    background-color: $color-spirit-rose-15;
  }

  &--red &__icon {
    background-color: $color-spirit-rose;
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
