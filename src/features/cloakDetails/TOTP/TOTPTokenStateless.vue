<script setup>
import { computed, ref, useAttrs } from "vue";
import TOTPTokenProgress from "@/features/cloakDetails/TOTP/TOTPTokenProgress.vue";
import SecretValue from "@/features/ui/SecretValue.vue";

const props = defineProps({
  token: {
    type: String,
    default: "",
  },
  progress: {
    type: Number,
    default: 0,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const attrs = useAttrs();

const isExpiring = computed(() => props.progress <= 0.25);
const isHovered = ref(false);
</script>

<template>
  <div
    v-bind="attrs"
    class="totp-token"
    :class="{ 'totp-token--expiring': isExpiring }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="totp-token__token">
      <SecretValue
        :is-hidden="isHidden ? !isHovered : false"
        :count="6"
        variant="body-2-semibold"
      >
        {{ token }}
      </SecretValue>
    </div>
    <TOTPTokenProgress
      v-if="progress"
      :progress="progress"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.totp-token {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &__token {
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 1;
    color: $color-primary-100;

    @keyframes expiring-token {
      0% {
        color: $color-primary-100;
      }

      50% {
        color: $color-alert;
      }

      100% {
        color: $color-primary-100;
      }
    }

    @at-root .totp-token--expiring & {
      animation: expiring-token 1000ms infinite;
    }
  }
}
</style>
