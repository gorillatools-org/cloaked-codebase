<script setup>
import ButtonPlans from "@/features/subscribe/ButtonPlans.vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import router from "@/routes/router";
import { posthogCapture } from "@/scripts/posthog";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import store from "@/store";
import { PH_FEATURE_FLAG_USER_INVITE_UPGRADE } from "@/scripts/posthogEvents.js";
import BaseText from "@/library/BaseText.vue";

const { featureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_USER_INVITE_UPGRADE
);

const { activePlan } = usePlans();
const planType = usePlanType(activePlan);

const { openPlansModal } = usePlansModal();

function onUpgradePlan() {
  store.dispatch("subscription/init");
  openPlansModal();
  posthogCapture(
    "user_clicked_upgrade_in_data_removal_settings_individual_plan"
  );
}

function onClickInvite() {
  router.push({ name: "settings.subscription" });
  posthogCapture("user_clicked_invite_in_data_removal_settings_bulk_plan");
}
</script>

<template>
  <div
    v-if="
      featureFlag === 'updated' &&
      ['Individual', 'Couple', 'Family'].includes(planType)
    "
    class="family-plans-banner"
  >
    <div>
      <div v-if="planType === 'Individual'">
        <BaseText
          as="h3"
          variant="headline-6-medium"
          class="family-plans-banner__title"
        >
          Want to add someone else for data removal?
        </BaseText>
        <BaseText
          as="p"
          variant="body-small-medium"
          class="family-plans-banner__text"
        >
          Upgrade to a couple or family plan
        </BaseText>
      </div>

      <div v-else>
        <BaseText
          as="h3"
          variant="headline-6-medium"
          class="family-plans-banner__title"
        >
          Looking to add your family member?
        </BaseText>
        <BaseText
          as="p"
          variant="body-small-medium"
          class="family-plans-banner__text"
        >
          Visit the subscription page to invite family members to your plan
        </BaseText>
      </div>
    </div>
    <ButtonPlans
      v-if="planType === 'Individual'"
      size="md"
      type="family"
      class="family-plans-banner__cta"
      @click="onUpgradePlan"
    >
      Upgrade
    </ButtonPlans>
    <ButtonPlans
      v-else
      size="md"
      type="family"
      class="family-plans-banner__cta"
      @click="onClickInvite"
    >
      Invite
    </ButtonPlans>
  </div>
</template>

<style lang="scss" scoped>
.family-plans-banner {
  border-radius: 8px;
  border: 1px solid $color-primary-100;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 36px;
  max-width: 700px;

  &__title {
    color: $color-primary-100;
  }

  &__text {
    margin-top: 4px;
    color: $color-primary-100;
  }

  &__cta {
    flex-shrink: 0;
  }
}
</style>
