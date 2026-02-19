<script setup lang="ts">
import PayOnboardingWelcomeStep1 from "@/features/Wallet/Onboarding/PayOnboardingWelcomeStep1.vue";

const emit = defineEmits<{
  (e: "finish-profile"): void;
  (e: "setup-first-card"): void;
}>();
</script>

<template>
  <PayOnboardingWelcomeStep1
    description="Next, let’s finish your profile to start Data Removal and Identity Monitoring."
    :btn-background-color="''"
    btn-text="Finish profile (2 - 5 mins)"
    secondary-btn-text="Set up first card (1-3 mins)"
    @continue="emit('finish-profile')"
    @secondary-btn-click="emit('setup-first-card')"
  />
</template>
