<script setup>
import ButtonPlans from "@/features/subscribe/ButtonPlans.vue";
import { toRef } from "vue";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
  hasPlan: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["choose-plan"]);

const type = usePlanType(toRef(() => props?.option?.stripePlan));
</script>

<template>
  <ButtonPlans
    id="choose-plan-cta"
    :type="type?.toLowerCase()"
    class="choose-plan-cta"
    v-bind="$attrs"
    :disabled="props.disabled || props.isLoading"
    :loading="props.isLoading"
    fullWidth
    @click="$emit('choose-plan')"
  >
    <span v-if="props.hasPlan">
      <span v-if="props.isLoading">Switching plan</span>
      <span v-else>Switch to {{ type?.toLowerCase() }} plan</span>
    </span>
    <span v-else>
      <span v-if="props.isLoading">Processing...</span>
      <span v-else>Start your {{ type?.toLowerCase() }} plan</span>
    </span>
  </ButtonPlans>
</template>

<style lang="scss" scoped>
.choose-plan-cta {
  &__discount {
    display: inline-block;
    margin: 0 -3px;
    opacity: 0.6;
  }
}
</style>
