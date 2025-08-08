<script setup>
import UiTile from "@/features/onboarding-new/UiTile.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import router from "@/routes/router";
import { computed } from "vue";
import { useColorScheme } from "@/composables/useColorScheme";
import BaseText from "@/library/BaseText.vue";

function openNewOnboarding() {
  router.push({ name: "NewOnboardingGetStarted", query: { animate: true } });
}

const { colorScheme } = useColorScheme();

const wrapperStyleOverride = computed(() => {
  const wrapperStyle = {
    height: "127px",
    width: "100%",
    padding: "0px 20px",
  };
  if (colorScheme.value !== "dark") {
    wrapperStyle.background = "#191E23";
  }
  return wrapperStyle;
});
</script>
<template>
  <UiTile
    icon="lock-shield"
    :wrapperStyleOverride="wrapperStyleOverride"
    @click="openNewOnboarding"
  >
    <div class="home-new-onboarding-tile">
      <div class="overlay">
        <div class="shape" />
      </div>

      <BaseText
        as="p"
        variant="headline-3-bold"
        class="title"
      >
        Build better privacy
      </BaseText>
      <BaseText
        as="p"
        variant="headline-6-medium"
        class="subtitle"
      >
        Finish setting up your Cloaked Protection Plan
        <InlineSvg name="chevron-right" />
      </BaseText>
    </div>
  </UiTile>
</template>
<style lang="scss" scoped>
.home-new-onboarding-tile {
  position: absolute;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: center;

  .overlay {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 0;
  }

  .shape {
    height: 300px;
    width: 300px;
    background: $background-rainbow;
    filter: $background-rainbow-filter;
    z-index: 10;
    mix-blend-mode: screen;
    opacity: 0.45;
    border-radius: 59.159px;
    transform: rotate(280deg) skew(20deg, 10deg);
  }

  .title {
    margin-top: -127px;
    width: 100%;
    color: $white;
    flex-shrink: 0;
    flex-grow: 0;
    z-index: 2;
  }

  .subtitle {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    color: $white;
    flex-shrink: 0;
    flex-grow: 0;
    z-index: 2;

    svg {
      color: $white;
      height: 14px;
    }
  }
}
</style>
