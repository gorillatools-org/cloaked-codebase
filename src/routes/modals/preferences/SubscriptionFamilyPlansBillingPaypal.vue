<script setup>
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import AppCard from "@/features/ui/AppCard.vue";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import { computed, ref } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import SubscriptionModalCancelSubscription from "@/routes/modals/preferences/SubscriptionModalCancelSubscription.vue";
import BaseText from "@/library/BaseText.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
const { planMembers } = useInvites();
const isCancelSubscriptionModalOpen = ref(false);
const subscription = computed(() => store.getters["settings/getSubscription"]);
</script>

<template>
  <AppCard
    size="md"
    class="family-plans-billing-card"
  >
    <SettingsParagraph>Billing is managed in PayPal.</SettingsParagraph>
    <footer class="family-plans-billing-card__actions">
      <BaseText
        as="a"
        variant="headline-6-medium"
        class="family-plans-billing-card__link"
        href="https://www.paypal.com/myaccount/autopay/"
        target="_blank"
      >
        Open PayPal
        <InlineSvg
          name="link"
          class="family-plans-billing-card__icon"
        />
      </BaseText>
      <Button
        v-if="!subscription?.canceled_at"
        type="danger"
        target="_blank"
        class="family-plans-billing-card__cancel"
        @click="isCancelSubscriptionModalOpen = true"
      >
        Cancel Subscription
      </Button>
      <PreferencesParagraph
        v-if="planMembers.length"
        class="family-plans-billing-card__note"
      >
        If you're the subscription owner of a Couple or Family plan and want to
        switch plans, the members under your plan will be removed. They'll need
        to start their own subscription or be re-invited to continue using
        Cloaked.
      </PreferencesParagraph>
    </footer>
    <SubscriptionModalCancelSubscription
      :value="isCancelSubscriptionModalOpen"
      @input="isCancelSubscriptionModalOpen = $event"
    />
  </AppCard>
</template>
