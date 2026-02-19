<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

type Props = {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  showBullets?: boolean;
  totalSlides: number;
};

const emit = defineEmits<{
  (e: "bullet-click", index: number): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  autoPlay: true,
  autoPlayInterval: 5000,
  loop: true,
  showBullets: true,
});

const currentSlide = defineModel<number>("currentSlide", {
  default: 0,
});

let autoPlayTimer: ReturnType<typeof setInterval> | null = null;
const previousSlide = ref(0);
const slideDirection = ref<"left" | "right">("right");

const transitionName = computed(() => {
  return `slide-${slideDirection.value}`;
});

onMounted(() => {
  startAutoPlay();
});

onBeforeUnmount(() => {
  stopAutoPlay();
});

function goToSlide(index: number) {
  if (index === currentSlide.value) {
    return;
  }

  if (index >= 0 && index < props.totalSlides) {
    previousSlide.value = currentSlide.value;
    slideDirection.value = index > currentSlide.value ? "right" : "left";
    currentSlide.value = index;
    resetAutoPlay();
    emit("bullet-click", index);
  }
}

function nextSlide() {
  previousSlide.value = currentSlide.value;
  slideDirection.value = "right";

  if (currentSlide.value < props.totalSlides - 1) {
    currentSlide.value++;
  } else if (props.loop) {
    currentSlide.value = 0;
  }

  resetAutoPlay();
}

function prevSlide() {
  previousSlide.value = currentSlide.value;
  slideDirection.value = "left";

  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else if (props.loop) {
    currentSlide.value = props.totalSlides - 1;
  }

  resetAutoPlay();
}

function startAutoPlay() {
  if (props.autoPlay && props.totalSlides > 1) {
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, props.autoPlayInterval);
  }
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
}

function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

watch(
  () => props.autoPlay,
  (newValue) => {
    if (newValue) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  }
);

watch(
  () => currentSlide.value,
  (newValue, oldValue) => {
    if (oldValue !== undefined && oldValue !== newValue) {
      previousSlide.value = oldValue;
      slideDirection.value = newValue > oldValue ? "right" : "left";
    }
  }
);

watch(
  () => props.totalSlides,
  () => {
    if (currentSlide.value >= props.totalSlides) {
      currentSlide.value = Math.max(0, props.totalSlides - 1);
    }
    resetAutoPlay();
  }
);

defineExpose({
  currentSlide,
  goToSlide,
  nextSlide,
  prevSlide,
  startAutoPlay,
  stopAutoPlay,
});
</script>

<template>
  <div class="vc-base-carousel">
    <div class="vc-base-carousel__content">
      <Transition
        :name="transitionName"
        mode="out-in"
      >
        <div :key="currentSlide">
          <slot :current-slide="currentSlide" />
        </div>
      </Transition>
    </div>
    <ul
      v-if="showBullets && totalSlides > 1"
      class="vc-base-carousel__bullets"
    >
      <li
        v-for="(_, index) in totalSlides"
        :key="index"
        class="vc-base-carousel__bullet"
      >
        <button
          class="vc-base-carousel__bullet-button"
          :class="{
            'vc-base-carousel__bullet-button--active': currentSlide === index,
          }"
          :aria-label="`Go to slide ${index + 1}`"
          :aria-current="currentSlide === index ? 'page' : undefined"
          @click="goToSlide(index)"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.vc-base-carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  &__content {
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  &__bullets {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    list-style: none;
    padding: 0;
    margin: 0;
    height: 40px;
  }

  &__bullet {
    position: relative;
  }

  &__bullet-button {
    position: relative;
    padding: 8px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: $color-primary-30;
      transition: background-color 0.2s ease;
    }

    &:not(&--active) {
      &:hover::before {
        background-color: $color-primary-50;
      }
    }

    &--active::before {
      background-color: $color-primary-100;
    }
  }
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    filter 0.2s ease-out,
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.slide-right-enter-from {
  filter: blur(1px);
  opacity: 0;
  transform: translateX(30%) scale(0.7);
}

.slide-right-leave-to {
  filter: blur(1px);
  opacity: 0;
  transform: translateX(-60%) scale(0.7);
}

.slide-left-enter-from {
  filter: blur(1px);
  opacity: 0;
  transform: translateX(-30%) scale(0.7);
}

.slide-left-leave-to {
  filter: blur(1px);
  opacity: 0;
  transform: translateX(60%) scale(0.7);
}
</style>
