<script setup>
import { SUPPORT_EMAIL } from "@/scripts/constants";
import SubscriptionFamilyPlansMembersOwner from "@/routes/modals/preferences/SubscriptionFamilyPlansMembersOwner.vue";
import SubscriptionFamilyPlansMembersMember from "@/routes/modals/preferences/SubscriptionFamilyPlansMembersMember.vue";
import SubscriptionFamilyPlansMembersInvited from "@/routes/modals/preferences/SubscriptionFamilyPlansMembersInvited.vue";
import SubscriptionFamilyPlansMembersGuest from "@/routes/modals/preferences/SubscriptionFamilyPlansMembersGuest.vue";
import SubscriptionFamilyPlansMembersAdd from "@/routes/modals/preferences/SubscriptionFamilyPlansMembersAdd.vue";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
import store from "@/store";
import { onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";

const { planMembers } = useInvites();

onMounted(() => {
  store.dispatch("subscription/fetchInvitations");
  posthogCapture("user_lands_on_subscription_page_bulk_plan");
});
</script>

<template>
  <section class="family-plans-members">
    <SettingsTitle>Members</SettingsTitle>
    <template v-if="$store.getters['settings/getSubscription'].owner">
      <SubscriptionFamilyPlansMembersAdd />
      <SettingsParagraph class="family-plans-members__text">
        Members on your plan receive all of the same benefits as you. You may
        remove them or they may remove themselves at anytime. For any billing
        questions, you may reach out to
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          target="_blank"
          class="family-plans-members__link"
        >
          {{ SUPPORT_EMAIL }}.
        </a>
      </SettingsParagraph>
    </template>
    <ul
      v-if="$store.getters['settings/getSubscription'].owner"
      class="family-plans-members__list"
    >
      <li
        v-for="member in planMembers"
        :key="member.created_at"
      >
        <SubscriptionFamilyPlansMembersMember
          v-if="member.state === 'accepted'"
          :member="member"
        />
        <SubscriptionFamilyPlansMembersInvited
          v-if="member.state === 'pending'"
          :member="member"
        />
      </li>
      <li
        v-if="$store.getters['settings/getSubscription']"
        key="you"
      >
        <SubscriptionFamilyPlansMembersOwner
          :member="{
            joined_at: $store.getters['settings/getSubscription'].purchase_date,
          }"
        />
      </li>
    </ul>
    <SubscriptionFamilyPlansMembersGuest
      v-else
      class="family-plans-members__guest-member"
      :member="{
        joined_at: $store.getters['settings/getSubscription'].purchase_date,
      }"
    />
  </section>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.family-plans-members {
  margin-top: 36px;

  &__text {
    margin-top: 16px;
  }

  &__link {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }

  &__list {
    margin-top: 36px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .plan-member {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 8px;
    text-align: center;

    @media all and (min-width: $screen-lg) {
      flex-direction: row;
      text-align: left;
      gap: 18px;
    }

    &__icon {
      height: 24px;
      flex: 0 0 24px;

      @media all and (min-width: $screen-lg) {
        height: 32px;
        flex: 0 0 32px;
      }

      &--neutral {
        color: $color-primary-100;
      }
    }

    &__name {
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      color: $color-primary-100;
      @include line-clamp(1);
      word-break: break-all;
    }

    &__joined-at,
    &__invited-at {
      margin-top: 4px;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      color: $color-primary-100;
    }

    &__invite-status {
      text-transform: capitalize;
      color: $color-primary-100;
    }

    &__actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      margin-top: 8px;

      @media all and (min-width: $screen-lg) {
        margin-left: auto;
        margin-top: 0;
      }
    }
  }

  &__guest-member {
    margin-top: 16px;
  }
}
</style>
