<script setup lang="ts">
export type BaseSheetProps = {
  rounding?: "sm" | "md" | "lg" | "xl";
  elevation?: "none" | "sm" | "md" | "lg" | "xl";
  spacingX?: "sm" | "md" | "lg" | "xl";
  spacingY?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary";
};

withDefaults(defineProps<BaseSheetProps>(), {
  rounding: "md",
  elevation: "none",
  spacingX: "md",
  spacingY: "md",
  variant: "primary",
});
</script>

<template>
  <div
    class="base-sheet"
    :class="[
      `base-sheet--rounding-${rounding}`,
      `base-sheet--elevation-${elevation}`,
      `base-sheet--spacing-x-${spacingX}`,
      `base-sheet--spacing-y-${spacingY}`,
      `base-sheet--variant-${variant}`,
    ]"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.base-sheet {
  background-color: $color-primary-70;
  border: 1px solid $color-primary-20;

  &--rounding {
    &-sm {
      border-radius: 16px;
    }

    &-md {
      border-radius: 20px;
    }

    &-lg {
      border-radius: 24px;
    }

    &-xl {
      border-radius: 30px;
    }
  }

  &--elevation {
    &-none {
      box-shadow: none;
    }

    &-sm {
      box-shadow: 0 0 24px 0 rgba($black, 0.05);
    }

    &-md {
      box-shadow: 0 4px 24px 0 rgba($black, 0.05);
    }

    &-lg {
      box-shadow: 0 10px 24px 0 rgba($black, 0.15);
    }

    &-xl {
      box-shadow: 0 5px 24px 0 rgba($black, 0.25);
    }
  }

  &--spacing-x {
    &-sm {
      padding-left: 16px;
      padding-right: 16px;
    }

    &-md {
      padding-left: 20px;
      padding-right: 20px;
    }

    &-lg {
      padding-left: 24px;
      padding-right: 24px;
    }

    &-xl {
      padding-left: 30px;
      padding-right: 30px;
    }
  }

  &--spacing-y {
    &-sm {
      padding-top: 16px;
      padding-bottom: 16px;
    }

    &-md {
      padding-top: 20px;
      padding-bottom: 20px;
    }

    &-lg {
      padding-top: 24px;
      padding-bottom: 24px;
    }

    &-xl {
      padding-top: 30px;
      padding-bottom: 30px;
    }
  }

  &--variant {
    &-primary {
      background-color: $color-base-white-100;
      border-color: $color-primary-20;
    }

    &-secondary {
      background-color: $color-primary-5;
      border-color: $color-primary-10;
    }
  }
}
</style>
