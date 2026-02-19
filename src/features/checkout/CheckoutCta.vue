<script setup lang="ts">
import { computed, inject, toRef } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";
import { useSelectedPlan } from "@/features/checkout/useSelectedPlan.ts";
import { usePlanType } from "@/features/checkout/usePlanType.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type CheckoutCtaProps = {
  plans: Plan[];
  disabled?: boolean;
};

const props = withDefaults(defineProps<CheckoutCtaProps>(), {
  plans: () => [],
  disabled: false,
});

const checkoutSession = inject(checkoutSessionInjectionKey);

const status = computed(() => checkoutSession?.status ?? null);

const plans = toRef(() => props.plans);

const selectedPlan = useSelectedPlan(plans, checkoutSession);

const type = usePlanType(selectedPlan);

const backgroundColor = computed(() => {
  if (type.value === "couple") {
    return "brand-2-gradient";
  } else if (type.value === "family") {
    return "brand-3-gradient";
  } else {
    return "info-gradient";
  }
});
</script>

<template>
  <BaseButton
    size="lg"
    full-width
    :disabled="!!status || !checkoutSession?.user || props.disabled"
    :loading="!!status"
    :background-color="backgroundColor"
  >
    <template v-if="status === 'signing-up'">Creating account</template>
    <template v-else-if="status === 'processing-payment'">
      Processing payment
    </template>
    <template v-else-if="status === 'signing-in'">Signing in</template>
    <template v-else-if="checkoutSession?.isRegistered">
      Complete purchase
    </template>
    <template v-else>Start your {{ type }} plan</template>
  </BaseButton>
</template>
