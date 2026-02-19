<script setup>
import { computed } from "vue";

const props = defineProps({
  color: { type: String, default: "#0094C6" },
  secondaryColor: { type: String, default: "#3673AE" },
  height: { type: String, default: "30px" },
  width: { type: String, default: "30px" },
  noGradient: { type: Boolean, default: false },
});

const colorOne = computed(() => props.color);
const colorTwo = computed(() => props.secondaryColor);

const uniqId = computed(() => Math.random());
</script>
<template>
  <svg
    :id="`brandGradient${colorOne.replace('#', '')}-${uniqId}`"
    class="default-identity-icon"
    :width="props.width"
    :height="props.height"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="50%"
      cy="50%"
      r="50"
      :fill="
        props.noGradient
          ? colorOne
          : `url('#brandGradient${colorOne.replace('#', '')}')`
      "
    />
    <g clip-path="url(#clip0_2410_349539)">
      <g opacity="0.5">
        <path
          opacity="0.45"
          d="M56.4416 87.14C56.4416 87.14 10.3098 70.8661 20.4588 53.688C26.9173 42.8387 41.6794 54.5921 64.7453 66.3455L56.4416 87.14Z"
          fill="#191E23"
        />
        <path
          opacity="0.6"
          d="M112.572 81.5011C112.674 81.511 112.777 81.5196 112.879 81.5273C130.215 82.8444 142.763 79.7626 151.456 75.7709C161.713 71.0616 161.877 58.1702 154.877 49.3171C148.124 40.7754 139.867 30.1308 133.735 21.5738C125.335 9.85279 114.571 -6.81226 108.413 -16.4857C106.222 -19.9277 100.991 -19.7847 98.7562 -16.3698C75.8642 18.6035 33.7101 44.8203 24.2598 49.8716C31.6902 46.9051 45.2141 56.0937 63.5056 65.9741C63.7162 66.0878 63.9263 66.1971 64.1407 66.3033C66.2454 67.3461 78.3656 73.293 86.8144 76.1811C97.9956 80.0032 111.034 81.3518 112.572 81.5011Z"
          fill="#FEFEFE"
        />
      </g>
    </g>

    <defs>
      <clipPath id="clip0_2410_349539">
        <rect
          width="100"
          height="100"
          rx="50"
          fill="white"
        />
      </clipPath>
      <linearGradient
        :id="`brandGradient${colorOne.replace('#', '')}`"
        gradientTransform="rotate(45.7)"
      >
        <stop
          offset="31.04%"
          :stop-color="colorOne"
        />
        <stop
          offset="100%"
          :stop-color="colorTwo"
        />
      </linearGradient>
    </defs>
  </svg>
</template>

<style lang="scss" scoped>
.default-identity-icon {
  display: flex;
  flex-shrink: 0;
  align-self: center;
  border: 1px solid $color-primary-10;
  border-radius: 50%;
}
</style>
