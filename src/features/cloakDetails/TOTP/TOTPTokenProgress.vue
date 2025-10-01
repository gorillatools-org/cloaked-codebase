<script setup>
import { computed } from "vue";
import CircularProgress from "@/features/ui/CircularProgress.vue";

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
});

const isExpiring = computed(() => props.progress <= 0.25);
</script>

<template>
  <CircularProgress
    :progress="progress"
    anti-clock-wise
    class="totp-progress"
    :class="{ 'totp-progress--expiring': isExpiring }"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.totp-progress {
  width: 14px;
  height: 14px;

  .progress {
    &__indicator {
      stroke: $color-success;
    }

    &__background {
      stroke: $color-primary-30;
    }
  }

  &--expiring {
    .progress {
      &__indicator {
        stroke: $color-alert;
      }

      &__background {
        stroke: $color-primary-100;
      }
    }
  }
}
</style>
