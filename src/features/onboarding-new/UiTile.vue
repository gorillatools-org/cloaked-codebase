<script setup>
import { computed } from "vue";
import inlineSvg from "@/features/InlineSvg.vue";
import { assetUrl } from "@/scripts/assets";

const props = defineProps({
  completed: {
    type: Boolean,
    required: false,
  },
  icon: {
    type: String,
    required: true,
  },
  wrapperStyleOverride: {
    type: Object,
    default: () => {},
  },
  statusText: {
    type: String,
    required: false,
    default: null,
  },
});

const emit = defineEmits(["click"]);

const statusText = computed(() => {
  if (props.statusText) {
    return props.statusText;
  }
  return null;
});

const wrapperStyle = computed(() => {
  return {
    ...props.wrapperStyleOverride,
  };
});

function onClick() {
  if (!props.completed) {
    emit("click");
  }
}
</script>
<template>
  <div
    class="tile-wrapper"
    :class="{ completed: props.completed }"
    :style="wrapperStyle"
    @click="onClick"
  >
    <img
      :src="assetUrl(`@/assets/images/onboarding-new/${props.icon}.png`)"
      :alt="`${props.icon} icon`"
      width="240"
      height="160"
      class="floating-icon"
    />
    <div class="title">
      <slot />
    </div>
    <div
      v-if="statusText"
      class="status"
      :class="{ completed: props.completed }"
    >
      {{ statusText }}
      <inlineSvg
        v-if="props.completed"
        name="checkmark-plain"
      />
      <inlineSvg
        v-else
        name="arrow-right"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tile-wrapper {
  border-radius: 12px;
  background-blend-mode: soft-light;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  width: 343px;
  height: 149px;
  flex-shrink: 0;
  color: $color-primary-100;
  position: relative;
  overflow: hidden;
  background: rgba($color-primary-100-light, 0.1);
  box-shadow: 0 10px 10px 0 rgba($color-primary-1-light, 0.1);
  transition: opacity 0.3s;

  &.completed {
    background: rgba($color-primary-100-light, 0.3);
  }

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.1);
    box-shadow: 0 10px 10px 0 rgba($color-primary-1-dark, 0.1);

    &.completed {
      background: rgba($color-primary-100-dark, 0.3);
    }
  }

  &:hover {
    opacity: 0.7;
    cursor: pointer;
    transition: opacity 0.3s;

    &.completed {
      cursor: unset;
      opacity: 1;
    }
  }

  .floating-icon {
    position: absolute;
    top: -25px;
    right: -80px;
  }

  .title {
    color: $color-primary-100;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    max-width: 170px;
  }

  .status {
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    justify-content: center;
    border-radius: 99px;
    border: 1px solid $color-primary-100;
    color: $color-primary-100;
    height: 30px;
    padding: 8px 12px;
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-top: 10px;

    &.completed {
      background-color: $color-base-white-100;
      border: $color-base-white-100;
      color: $color-primary-100;

      svg {
        height: 14px;
        color: $color-success;
      }
    }
  }
}
</style>
