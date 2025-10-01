<script setup>
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_BULK_PLAN_SUB_STARTED_CLICK } from "@/scripts/posthogEvents.js";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const emit = defineEmits(["continue"]);

function onContinue() {
  emit("continue");
  posthogCapture(PH_EVENT_BULK_PLAN_SUB_STARTED_CLICK);
}

const { isMobile } = useDisplay();
</script>
<template>
  <div class="page-checkout-subscription-started">
    <PageCheckoutHeader />
    <div class="page-checkout-subscription-started__content">
      <BaseText
        as="h1"
        :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
        class="page-checkout-subscription-started__title"
      >
        Your Cloaked subscription has started!
      </BaseText>
      <BaseText
        as="p"
        variant="headline-6-medium"
        class="page-checkout-subscription-started__subtitle"
      >
        You're on the right track to building better privacy. Now let's get a
        few remaining details to get your account fully set up and start
        removing your data.
      </BaseText>

      <img
        src="@/assets/images/onboarding-new/completed.png"
        alt="completed icon"
        width="517"
      />
      <BaseButton
        variant="cloaked-gradient"
        size="lg"
        full-width
        icon="arrow-right"
        class="page-checkout-subscription-started__cta"
        @click="onContinue"
      >
        Continue
      </BaseButton>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.page-checkout-subscription-started.data-delete__page {
  padding: 0;
}

.page-checkout-subscription-started {
  &__content {
    max-width: 675px;
    margin: 0 auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 25px;

    @media all and (min-width: $screen-md) {
      padding: 0 25px 25px;
    }
  }

  &__title {
    text-align: center;
  }

  &__subtitle {
    margin-top: 8px;
    text-align: center;
    opacity: 0.8;
  }

  &__cta {
    max-width: 330px;
  }
}
</style>
