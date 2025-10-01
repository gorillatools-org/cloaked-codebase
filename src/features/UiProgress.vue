<script setup>
import { computed } from "vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  label: { type: String, default: null },
  counter: { type: Number, default: null },
  counterTotal: { type: Number, default: null },
  percentage: { type: Number, default: null },
});

const isDone = computed(() => {
  return progress.value === 100;
});

const barStyle = computed(() => {
  return {
    "--progress": progress.value,
  };
});

const progress = computed(() => {
  if (props.percentage) {
    return props.percentage;
  }

  if (!props.counter || !props.counterTotal) {
    return 0;
  }

  // if external percentage is missing and there is a counter, determine here
  return (props.counter * 100) / props.counterTotal;
});
</script>

<template>
  <div
    :class="[
      'ui-progress',
      {
        'ui-progress__done': isDone,
      },
    ]"
  >
    <div class="ui-progress__header">
      <BaseText
        as="div"
        variant="body-small-medium"
        class="ui-progress__label"
      >
        {{ props.label }}
      </BaseText>
      <BaseText
        v-if="props.counter || props.counterTotal"
        as="div"
        variant="body-small-medium"
        class="ui-progress__counter"
      >
        {{ props.counter || 0
        }}{{ props.counterTotal ? ` of ${props.counterTotal}` : "" }}
      </BaseText>
    </div>

    <div
      class="ui-progress__bar"
      :style="barStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.ui-progress {
  --progress: 0;
  padding-top: 8px;

  &__header {
    display: flex;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    color: $color-primary-90;
    flex: 1 1 0;
  }

  &__counter {
    color: $color-primary-90;
    flex-shrink: 0;
  }

  &__bar {
    width: 100%;
    height: 1px;
    margin-top: 8px;
    position: relative;
    background: $color-base-white-100;

    &::after {
      content: "";
      display: block;
      height: 100%;
      width: calc(1% * var(--progress));
      max-width: 100%;
      background: $color-primary-100;
      transition: all 0.5s ease-in-out;
    }
  }

  &__done {
    &__label {
      color: $color-info;
    }

    &__counter {
      color: $color-info;
    }

    &__bar {
      background: $color-info;
    }
  }
}
</style>
