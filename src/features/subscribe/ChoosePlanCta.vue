<script setup>
import ButtonPlans from "@/features/subscribe/ButtonPlans.vue";
import { toRef, computed } from "vue";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT } from "@/scripts/posthogEvents";
import { useDisplay } from "@/composables/useDisplay.js";

const {
  featureFlag: topOfFunnelExperiment,
  hasLoadedFeatureFlag: topOfFunnelFlagLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT);

const showSubscribeNowCta = computed(
  () =>
    topOfFunnelFlagLoaded.value &&
    topOfFunnelExperiment.value === "checkout-cta-subscribe-now-copy"
);

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
  hasPlan: {
    type: Boolean,
    default: false,
  },
});
defineEmits(["choose-plan"]);

const planType = usePlanType(toRef(() => props?.option?.stripePlan));

const { isMobile } = useDisplay();
</script>

<template>
  <ButtonPlans
    id="choose-plan-cta"
    :type="planType?.toLowerCase()"
    size="lg"
    :full-width="!isMobile || showSubscribeNowCta"
    @click="$emit('choose-plan')"
  >
    <span v-if="hasPlan">
      <span v-if="$attrs.loading">Switching plan</span>
      <span v-else>Switch to {{ planType?.toLowerCase() }} plan</span>
    </span>
    <span v-else>
      <span v-if="$attrs.loading">Processing...</span>
      <span v-else>
        <span v-if="showSubscribeNowCta">Subscribe now</span>
        <span v-else>Start your {{ planType?.toLowerCase() }} plan</span>
      </span>
    </span>
  </ButtonPlans>
</template>
