<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import router from "@/routes/router";
import VirtualCardsSubscriptionIntroTabs from "./VirtualCardsSubscriptionIntroTabs.vue";
import VirtualCardsSubscriptionIntroStep1 from "./VirtualCardsSubscriptionIntroStep1.vue";
import VirtualCardsSubscriptionIntroStep2 from "./VirtualCardsSubscriptionIntroStep2.vue";

const emit = defineEmits<{
  (e: "finish"): void;
}>();

const route = useRoute();
const totalSteps = 2;
const currentStep = ref<number>(0);

onMounted(() => {
  // Check if the intro step is set in the query params and if it is
  // set the current step to the value of the query param
  const stepParam = route.query.introStep;
  if (stepParam) {
    const step = Number(stepParam);
    if (!isNaN(step) && step >= 0 && step < totalSteps) {
      currentStep.value = step;
    }

    const cleanQuery = { ...route.query };
    delete cleanQuery.introStep;

    router.replace({ query: cleanQuery });
  }
});

const nextStep = () => {
  if (currentStep.value === totalSteps - 1) {
    emit("finish");
    return;
  }

  currentStep.value++;
};
</script>

<template>
  <div class="vc-subs-intro">
    <div class="vc-subs-intro__tabs">
      <VirtualCardsSubscriptionIntroTabs v-model:step="currentStep">
        <template #tab-0>
          <div class="vc-subs-intro__step-1 vc-subs-intro__tab-content">
            <VirtualCardsSubscriptionIntroStep1 @continue="nextStep" />
          </div>
        </template>
        <template #tab-1>
          <div class="vc-subs-intro__step-2 vc-subs-intro__tab-content">
            <VirtualCardsSubscriptionIntroStep2 @continue="nextStep" />
          </div>
        </template>
      </VirtualCardsSubscriptionIntroTabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-subs-intro";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  &__tabs {
    display: flex;
    width: 100%;
    height: 100%;
    margin-top: 24px;

    @media (height >=750px) {
      margin-top: 32px;
    }
  }

  &__tab-content {
    width: 100%;
    padding-top: 24px;

    @media (height >=750px) {
      padding-top: 32px;
    }
  }
}
</style>
