<script setup>
import ButtonPlans from "@/features/subscribe/ButtonPlans.vue";
import { toRef } from "vue";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";

const props = defineProps({
  activePlan: {
    type: Object,
    default: null,
  },
});

defineEmits(["upgrade-plan"]);

const planType = usePlanType(toRef(() => props.activePlan));
</script>

<template>
  <div class="family-plans-banner">
    <div>
      <template v-if="!activePlan">
        <h3 class="family-plans-banner__title">
          Choose a plan to get the most out of Cloaked
        </h3>
        <p class="family-plans-banner__text">
          Upgrade to an Individual, Couple, or Family plan
        </p>
      </template>

      <template v-else-if="planType === 'Individual'">
        <h3 class="family-plans-banner__title">
          Want to share your plan with someone else?
        </h3>
        <p class="family-plans-banner__text">Try a Couple or Family plan</p>
      </template>

      <template v-else-if="planType === 'Couple'">
        <h3 class="family-plans-banner__title">Need more than 2 members?</h3>
        <p class="family-plans-banner__text">Upgrade to a Family plan</p>
      </template>
    </div>
    <ButtonPlans
      size="md"
      type="family"
      class="family-plans-banner__cta"
      @click="$emit('upgrade-plan')"
    >
      Upgrade
    </ButtonPlans>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.family-plans-banner {
  border-radius: 8px;
  border: 1px solid $color-primary-100;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
  margin-top: 36px;

  &__title {
    font-size: 15px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
  }

  &__text {
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-top: 4px;
    color: $color-primary-100;
  }

  &__cta {
    flex-shrink: 0;
  }
}
</style>
