<script setup>
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";
import { onMounted, ref } from "vue";
import SubscriptionInputInvite from "@/routes/modals/preferences/SubscriptionInputInvite.vue";
import { PH_EVENT_ONBOARDING_FLOW_INVITE_MEMBERS } from "@/scripts/posthogEvents";
import UserService from "@/api/actions/user-service";
import { COMPLETED_DD_ONBOARDING_INVITE_FLOW } from "@/scripts/userFlags";
import router from "@/routes/router";
import SubscriptionModalExceededInvites from "@/routes/modals/preferences/SubscriptionModalExceededInvites.vue";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";

const { activePlan } = usePlans();
const planType = usePlanType(activePlan);

const {
  planMembers,
  freeSpots,
  inviteMember,
  cancelInvite,
  cancellingInviteId,
  isSendingInvite,
} = useInvites();

const memberEmail = ref("");

const isLimitExceededModalOpen = ref(false);

const onInvite = async () => {
  try {
    await inviteMember(memberEmail);
    memberEmail.value = "";
  } catch {
    isLimitExceededModalOpen.value = true;
  }
};

const onRemove = async (member) => {
  await cancelInvite(member.id);
};

onMounted(() => {
  UserService.setNewOnboardingFlag(COMPLETED_DD_ONBOARDING_INVITE_FLOW, true);
});

const onSkip = () => router.push({ name: "NewOnboardingGetStarted" });
</script>

<template>
  <UiPageWrapper
    class="onboarding-invite"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_INVITE_MEMBERS"
  >
    <UiHeader>
      <img
        src="@/assets/images/subscription/logo-accept.webp"
        alt="Cloaked Identity"
        width="268"
        height="155"
        class="onboarding-invite__icon"
      />
      <h1 class="onboarding-form__title">
        Add someone to your Cloaked {{ planType }} plan
      </h1>
    </UiHeader>
    <p
      v-if="freeSpots"
      class="onboarding-invite__spots"
    >
      {{ freeSpots }} member {{ freeSpots === 1 ? "spot" : "spots" }} open
    </p>
    <p
      v-else
      class="onboarding-invite__spots"
    >
      You've filled your plan!
    </p>
    <SubscriptionInputInvite
      v-model="memberEmail"
      :is-loading="isSendingInvite"
      :disabled="!freeSpots"
      class="onboarding-invite__invite"
      @submit="onInvite"
    />
    <ul
      v-if="planMembers.length"
      class="onboarding-invite__members"
    >
      <li
        v-for="member in planMembers"
        :key="member.created_at"
        class="onboarding-invite__members-item"
      >
        {{ member.recipient_email }}
        <InlineSvg
          v-if="member.id === cancellingInviteId"
          name="spinner"
          class="onboarding-invite__removing"
        />
        <InlineSvg
          v-else
          name="close-outline"
          class="onboarding-invite__remove"
          @click="onRemove(member)"
        />
      </li>
    </ul>
    <BaseButton
      size="lg"
      variant="cloaked-gradient"
      class="onboarding-invite__cta"
      icon="arrow-right"
      @click="onSkip"
    >
      Continue
    </BaseButton>
    <button
      v-if="!planMembers.length"
      class="onboarding-invite__skip"
      @click="onSkip"
    >
      I'll add someone later
    </button>
    <SubscriptionModalExceededInvites
      :value="isLimitExceededModalOpen"
      @input="isLimitExceededModalOpen = $event"
    />
  </UiPageWrapper>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.onboarding-invite {
  &__icon {
    width: 267px;
    height: 154px;
    filter: drop-shadow(0 9px 34px rgb(0 0 0 / 10%));
  }

  &__invite {
    width: 100%;
    max-width: 510px;
  }

  .app-form-input {
    margin-top: 16px;
    width: 80%;

    &__input {
      background: rgb(255 255 255 / 10%);
      border: none;
      padding: 24px;

      @media all and (min-width: $screen-md) {
        padding: 36px 24px;
      }
    }
  }

  &__spots {
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
    margin-top: 32px;
  }

  &__members {
    max-width: 510px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;

    &-item {
      color: $color-primary-100;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      padding: 8px 16px;
      border-radius: 8px;
      background-color: rgba(#000, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  &__remove {
    width: 20px;
    height: 20px;
    color: $color-primary-50;
    cursor: pointer;

    &:hover {
      color: $color-primary-100;
    }
  }

  &__removing {
    width: 20px;
    height: 20px;
    color: $color-primary-50;
  }

  &__cta {
    max-width: 340px;
    width: 100%;
    margin-top: 40px;
    margin-bottom: 32px;
  }

  &__skip {
    background-color: transparent;
    border: none;
    color: $color-primary-100;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    text-align: center;
    transition: opacity 0.3s;
    z-index: 1;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
      transition: opacity 0.3s;
    }
  }
}
</style>
