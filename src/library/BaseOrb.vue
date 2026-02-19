<script setup>
import { computed, h } from "vue";
import redOrb from "@/assets/images/orbs/orb-red.svg?raw";
import blueOrb from "@/assets/images/orbs/orb-blue.svg?raw";
import goldOrb from "@/assets/images/orbs/orb-gold.svg?raw";
import greenOrb from "@/assets/images/orbs/orb-green.svg?raw";
import purpleOrb from "@/assets/images/orbs/orb-purple.svg?raw";

const props = defineProps({
  color: {
    type: String,
    default: "red",
    validator: (value) => {
      return ["red", "blue", "gold", "green", "purple"].includes(value);
    },
  },
});

const orbMap = {
  red: redOrb,
  blue: blueOrb,
  gold: goldOrb,
  green: greenOrb,
  purple: purpleOrb,
};

const getSvgContent = computed(() => orbMap[props.color] || orbMap.gold);

// Create a dynamic component that will render our SVG with proper class inheritance
const SvgComponent = computed(() => {
  // Create wrapper div with the class and SVG content
  return h("div", {
    class: "base-orb",
    innerHTML: getSvgContent.value,
  });
});
</script>

<template>
  <component :is="SvgComponent" />
</template>

<style lang="scss" scoped>
.base-orb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;

  :deep(svg) {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}
</style>
