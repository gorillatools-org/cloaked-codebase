<script setup lang="ts">
import VirtualCardsSubscriptionIntro from "./intro/VirtualCardsSubscriptionIntro.vue";
import VirtualCardsApplicationFlow from "./application/VirtualCardsApplicationFlow.vue";
import { useVirtualCardsApplicationStore } from "@/features/VirtualCards/store/useVirtualCardsApplicationStore";

const virtualCardsApplication = useVirtualCardsApplicationStore();

const startApplicationFlow = () => {
  virtualCardsApplication.restartApplicationFlow();
  virtualCardsApplication.setCurrentSection("application");
  virtualCardsApplication.goToUpgradePlan();
};
</script>

<template>
  <div class="vc-subs-flow">
    <Transition
      name="fade"
      mode="out-in"
    >
      <div v-if="virtualCardsApplication.currentSection === 'success'"></div>
      <VirtualCardsSubscriptionIntro
        v-else-if="virtualCardsApplication.currentSection === 'intro'"
        @finish="startApplicationFlow"
      />
      <VirtualCardsApplicationFlow v-else />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
$main-section-margin: 8px;

.vc-subs-flow {
  border-radius: 20px 20px 0 0;
  background: $color-primary-5;
  overflow: hidden !important;
  padding-bottom: 35px;

  @media screen and (min-width: $screen-md) {
    height: calc(100% - #{$main-section-margin}) !important;
    margin-right: $main-section-margin;
    padding-bottom: 0;
    border-radius: 20px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
