<script setup>
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling.js";
import InlineSvg from "@/features/InlineSvg.vue";
import { computed } from "vue";
import {
  PH_EVENT_BULK_PLAN_USER_CLICKED_INVITES,
  PH_EVENT_BULK_PLAN_USER_CLICKED_PLAN_TYPE,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  neverCenter: {
    type: Boolean,
    default: false,
  },
});

const { activePlan } = usePlans();
const billingInterval = usePlanBilling(activePlan);
const planType = usePlanType(activePlan);
const { freeSpots } = useInvites();

const isOwner = computed(() => {
  return store.getters["settings/getSubscription"]?.owner;
});

function planTypeClicked() {
  posthogCapture(PH_EVENT_BULK_PLAN_USER_CLICKED_PLAN_TYPE);
}

function planMembersClicked() {
  posthogCapture(PH_EVENT_BULK_PLAN_USER_CLICKED_INVITES);
}
</script>
<template>
  <div
    v-if="['Family', 'Couple'].includes(planType) && isOwner"
    class="bulk-plan-card-wrapper"
    :class="{ neverCenter: props.neverCenter }"
  >
    <BaseText
      as="h1"
      variant="body-2-semibold"
      class="bulk-plan-card-wrapper__title"
      :class="{ neverCenter: props.neverCenter }"
    >
      Your subscription
    </BaseText>
    <div
      class="bulk-plan-card-wrapper__bubbles"
      :class="{ neverCenter: props.neverCenter }"
    >
      <div
        class="bubble"
        @click="planTypeClicked"
      >
        <InlineSvg
          name="check"
          class="icon-check"
        />
        <BaseText
          variant="body-3-semibold"
          class="bubble-text"
        >
          {{ planType }} {{ billingInterval }} Subscription
        </BaseText>
      </div>
      <div
        v-if="!!freeSpots"
        class="bubble"
        @click="planMembersClicked"
      >
        <InlineSvg
          name="check"
          class="icon-check"
        />
        <BaseText
          variant="body-3-semibold"
          class="bubble-text"
        >
          {{ freeSpots }}
          {{ freeSpots === 1 ? "Invite" : "Invites" }} Remaining
        </BaseText>
      </div>
    </div>
    <BaseText
      as="div"
      variant="body-2-semibold"
      class="bulk-plan-card-wrapper__info"
      :class="{ neverCenter: props.neverCenter }"
    >
      After enrolling in data removal you can send invites to add people to your
      plan.
    </BaseText>
  </div>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.bulk-plan-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  background: rgba($color-primary-100-dark, 0.07);
  border-radius: 20px;
  backdrop-filter: blur(22px);
  padding: 24px;
  box-shadow: 0 4px 16px 0 rgb(0 0 0 / 15%);
  width: 100%;
  color: $color-primary-100;
  height: 100%;

  &__title {
    width: 100%;
    text-align: left;
    opacity: 0.7;

    @media all and (min-width: $screen-xl) {
      text-align: center;

      &.neverCenter {
        text-align: left;
      }
    }
  }

  &__bubbles {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 4px;
    width: 100%;

    @media all and (min-width: $screen-xl) {
      align-items: center;

      &.neverCenter {
        align-items: flex-start;
      }
    }

    .bubble {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      padding: 8px;
      border-radius: 9px;
      background: $color-base-black-5;
    }
  }

  &__info {
    color: $color-primary-70;
    text-align: left;

    @media all and (min-width: $screen-xl) {
      text-align: center;

      &.neverCenter {
        text-align: left;
      }
    }
  }
}

.icon-check {
  color: $color-success;
  height: 19px;
  width: auto;
}
</style>
