<script setup>
import { computed, onBeforeMount, ref } from "vue";
import { TransitionPresets, useTransition } from "@vueuse/core";
import BaseText from "@/library/BaseText.vue";
const props = defineProps({
  startsAt: {
    type: Number,
    default: 0,
  },
  endsAt: {
    type: Number,
    default: 100,
  },
  duration: {
    type: Number,
    default: 8000,
  },
  delay: {
    type: Number,
    default: 500,
  },
  transition: {
    type: Array,
    default: TransitionPresets.easeOutExpo,
  },
});

const countSource = ref(props.startsAt);
const countOutput = useTransition(countSource, {
  duration: props.duration,
  delay: props.delay,
  transition: props.transition,
});

const currentCount = computed(() =>
  Math.ceil(countOutput.value)
    .toString()
    .padStart(props.endsAt.toString().length, "0")
);

onBeforeMount(() => {
  countSource.value = props.endsAt;
});
</script>

<template>
  <div class="data-delete-counter">
    <BaseText
      v-for="(digit, index) in currentCount.split('')"
      :key="index"
      variant="headline-2-semibold"
      class="data-delete-counter__digit"
    >
      {{ digit }}
    </BaseText>
  </div>
</template>

<style scoped lang="scss">
.data-delete-counter {
  display: flex;
  align-items: center;
  gap: 2px;

  &__digit {
    color: $color-alert;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: rgb(242 65 65 / 20%);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    @media all and (min-width: $screen-xl) {
      width: 44px;
      height: 64px;
      border-radius: 8px;
    }
  }
}
</style>
