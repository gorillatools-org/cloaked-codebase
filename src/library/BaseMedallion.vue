<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes.ts";

export type MedallionColor =
  | "cloaked"
  | "spirit-rose"
  | "arctic-lime"
  | "foam-blue"
  | "crest-blue"
  | "violet-reflection"
  | "caribbean-green"
  | "spam-protection"
  | "safe-zone-blue"
  | "safe-zone-green"
  | "success-green"
  | "gray"
  | "error"
  | "yield"
  | "primary-adaptative"
  | "primary-white";

export type BaseMedallionProps = {
  icon: BaseIconName;
  size?: "md" | "lg";
  color?: MedallionColor;
  loading?: boolean;
};

withDefaults(defineProps<BaseMedallionProps>(), {
  size: "md",
  color: "safe-zone-blue",
  loading: false,
});
</script>

<template>
  <div class="base-medallion">
    <div
      class="base-medallion__button"
      :class="[
        `base-medallion__button--${size}`,
        `base-medallion__button--${color}`,
        {
          'base-medallion__button--loading': loading,
        },
      ]"
    >
      <div :class="['base-medallion__button-icon-container']">
        <slot>
          <span
            v-if="loading"
            class="base-medallion__button-icon base-medallion__button-icon--loading"
          ></span>
          <BaseIcon
            v-else
            :name="icon"
            class="base-medallion__button-icon"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-medallion {
  &__button {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &-icon {
      color: $white;
      font-weight: 500;

      &-container {
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &--loading {
        border-radius: 50%;
        background: linear-gradient(currentcolor 40%, transparent 70%);
        mask: radial-gradient(closest-side, transparent 70%, black 70%);
        animation: rotate 0.5s linear infinite;
      }
    }

    &--md {
      width: 48px;
      height: 48px;

      .base-medallion__button-icon-container {
        width: 36px;
        height: 36px;
        font-size: 18px;
      }

      .base-medallion__button-icon--loading {
        width: 20px;
        height: 20px;
      }
    }

    &--lg {
      width: 80px;
      height: 80px;

      .base-medallion__button-icon-container {
        width: 56px;
        height: 56px;
        font-size: 36px;
      }

      .base-medallion__button-icon--loading {
        width: 30px;
        height: 30px;
      }
    }

    &--cloaked {
      background-color: $color-cloaked-15;

      .base-medallion__button-icon-container {
        background-color: $color-cloaked;
      }
    }

    &--spirit-rose {
      background-color: $color-spirit-rose-15;

      .base-medallion__button-icon-container {
        background-color: $color-spirit-rose;
      }
    }

    &--arctic-lime {
      background-color: $color-arctic-lime-15;

      .base-medallion__button-icon-container {
        background-color: $color-arctic-lime;
      }
    }

    &--foam-blue {
      background-color: $color-foam-blue-15;

      .base-medallion__button-icon-container {
        background-color: $color-foam-blue;
      }
    }

    &--crest-blue {
      background-color: $color-crest-blue-15;

      .base-medallion__button-icon-container {
        background-color: $color-crest-blue;
      }
    }

    &--violet-reflection {
      background-color: $color-violet-reflection-15;

      .base-medallion__button-icon-container {
        background-color: $color-violet-reflection;
      }
    }

    &--caribbean-green {
      background-color: $color-caribbean-green-15;

      .base-medallion__button-icon-container {
        background-color: $color-caribbean-green;
      }
    }

    &--spam-protection {
      background-color: $color-spam-protection-15;

      .base-medallion__button-icon-container {
        background-color: $color-spam-protection;
      }
    }

    &--safe-zone-blue {
      background-color: $color-safe-zone-blue-15;

      .base-medallion__button-icon-container {
        background-color: $color-safe-zone-blue;
      }
    }

    &--safe-zone-green {
      background-color: $color-safe-zone-green-15;

      .base-medallion__button-icon-container {
        background-color: $color-safe-zone-green;
      }
    }

    &--success-green {
      background-color: rgba($color-success, 0.15);

      .base-medallion__button-icon--success-green {
        background-color: $color-success;
      }
    }

    &--gray {
      @at-root .theme-dark & {
        background-color: rgba($color-primary-50-dark, 0.15);
      }

      @at-root .theme-light & {
        background-color: rgba($color-primary-50-light, 0.15);
      }

      .base-medallion__button-icon-container {
        background-color: $color-primary-50;
      }
    }

    &--error {
      background-color: rgba($color-status-error-15, 0.15);

      .base-medallion__button-icon-container {
        background-color: $color-status-error;
      }
    }

    &--yield {
      background-color: rgba($color-status-yield-15, 0.15);

      .base-medallion__button-icon-container {
        background-color: $color-status-yield;
      }
    }

    &--primary-adaptative {
      @at-root .theme-dark & {
        background-color: rgba($color-primary-100-dark, 0.1);
      }

      @at-root .theme-light & {
        background-color: rgba($color-primary-100-light, 0.1);
      }

      .base-medallion__button-icon {
        @at-root .theme-dark & {
          color: $color-black;
        }
      }

      .base-medallion__button-icon-container {
        @at-root .theme-dark & {
          background-color: $color-primary-100-dark;
        }

        @at-root .theme-light & {
          background-color: $color-primary-100-light;
        }
      }
    }

    &--primary-white {
      @at-root .theme-dark & {
        background-color: rgba($color-primary-100-dark, 0.1);
      }

      @at-root .theme-light & {
        background-color: rgba($color-primary-100-light, 0.1);
      }

      .base-medallion__button-icon {
        color: $color-black;
      }

      .base-medallion__button-icon-container {
        background-color: $color-white;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
