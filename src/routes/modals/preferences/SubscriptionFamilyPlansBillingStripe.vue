<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import AppCard from "@/features/ui/AppCard.vue";
import store from "@/store";
import { computed, ref } from "vue";
import { copyToClipboard } from "@/scripts/tools";
import { useToast } from "@/composables/useToast.js";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import SubscriptionModalCancelSubscription from "@/routes/modals/preferences/SubscriptionModalCancelSubscription.vue";
import Button from "@/features/Button.vue";
import BaseText from "@/library/BaseText.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";

defineEmits(["switch-plans"]);

const stripeLink = computed(() => {
  const stripeEmail = store.getters["settings/getStripe"]?.email;

  let stripeUrl = import.meta.env?.VITE_STRIPE_MANAGE_URL;

  if (stripeEmail) {
    stripeUrl += `?prefilled_email=${stripeEmail}`;
  }

  return stripeUrl;
});

const { success } = useToast();

const onCopyEmail = () => {
  const email = store.getters["settings/getStripe"]?.email;
  copyToClipboard(email);
  success(`${email} copied to clipboard`);
};

const { planMembers } = useInvites();

const isCancelSubscriptionModalOpen = ref(false);

const subscription = computed(() => store.getters["settings/getSubscription"]);
</script>

<template>
  <AppCard
    size="md"
    class="family-plans-billing-card"
  >
    <SettingsParagraph>
      Billing is managed in Stripe. Use the email below to access your Stripe
      account.
    </SettingsParagraph>
    <AppCard
      v-if="$store.getters['settings/getStripe']?.email"
      type="background"
      class="family-plans-billing-card__email"
      @click="onCopyEmail"
    >
      <div>
        <BaseText
          as="label"
          variant="body-small-medium"
        >
          Stripe account email
        </BaseText>
        <BaseText
          as="div"
          variant="headline-6-medium"
          class="family-plans-billing-card__email-value"
        >
          {{ $store.getters["settings/getStripe"]?.email }}
        </BaseText>
      </div>
      <InlineSvg
        name="copy"
        class="family-plans-billing-card__email-copy"
      />
    </AppCard>
    <footer class="family-plans-billing-card__actions">
      <BaseText
        as="a"
        variant="headline-6-medium"
        class="family-plans-billing-card__link"
        @click="$emit('switch-plans')"
      >
        Switch plans
        <InlineSvg
          name="switch"
          class="family-plans-billing-card__icon"
        />
      </BaseText>
      <BaseText
        as="a"
        variant="headline-6-medium"
        class="family-plans-billing-card__link"
        :href="stripeLink"
        target="_blank"
      >
        Billing
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

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.family-plans-billing-card {
  &__email {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    cursor: pointer;
    color: $color-primary-100;

    &-value {
      word-break: break-all;
    }

    &-copy {
      width: 26px;
      height: 26px;
      flex-shrink: 0;

      @at-root .family-plans-billing-card__email:hover & {
        opacity: 0.8;
      }

      @at-root .family-plans-billing-card__email:active & {
        transform: scale(0.95);
      }
    }
  }

  &__note {
    border-top: 1px solid $color-primary-10;
  }
}
</style>
