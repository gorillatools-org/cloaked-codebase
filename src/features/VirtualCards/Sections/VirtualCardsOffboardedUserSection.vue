<script setup lang="ts">
import WalletSupportContact from "@/features/Wallet/WalletSupportContact.vue";
import CardExampleGroup from "@/features/Wallet/CardExampleGroup.vue";
import { posthogCapture } from "@/scripts/posthog";
import VCWalletStatementsModal from "@/features/VirtualCards/modals/VCWalletStatementsModal.vue";
import { markRaw, ref } from "vue";
import store from "@/store";
import CardsServices from "@/api/actions/cards-services";
import BaseButton from "@/library/BaseButton.vue";

interface Props {
  isDisabledDowngraded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isDisabledDowngraded: false,
});

const emit = defineEmits(["restartSubscription"]);

const isFetchingStatements = ref(false);

async function viewStatements() {
  isFetchingStatements.value = true;
  CardsServices.getStatements()
    .then(() => {
      posthogCapture(`pay_offboarded_user_statements_viewed`);

      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(VCWalletStatementsModal),
          props: {
            isVisible: true,
          },
        },
      });
    })
    .finally(() => {
      isFetchingStatements.value = false;
    });
}

function sendSupportEmailEvent() {
  posthogCapture(`pay_offboarded_user_contact_support_tapped`);
}

function restartSubscriptionFlow() {
  posthogCapture(`pay_disabled_downgraded_user_restart_subscription_tapped`);
  emit("restartSubscription");
}
</script>

<template>
  <section class="vc-offboarded-user-section">
    <WalletSupportContact title="Your Cloaked Pay account is no longer active">
      <template #description>
        <p
          v-if="props.isDisabledDowngraded"
          class="vc-offboarded-user-section__support-description"
        >
          We're sorry to see you go. You can re-activate Cloaked Pay anytime and
          pick up right where you left off.
        </p>
        <p
          v-else
          class="vc-offboarded-user-section__support-description"
        >
          Cloaked Pay has been turned off on your account. Reach out to Cloaked
          Support at
          <a
            style="text-decoration: underline"
            href="mailto:support@cloaked.com"
            @click="sendSupportEmailEvent"
          >
            support@cloaked.com
          </a>
          if this seems to be an error.
        </p>
      </template>
      <template #footer-content>
        <div class="vc-offboarded-user-section__buttons">
          <div
            v-if="props.isDisabledDowngraded"
            class="vc-offboarded-user-section__button"
          >
            <BaseButton
              variant="primary"
              @click="restartSubscriptionFlow()"
            >
              Restart Cloaked Pay
            </BaseButton>
          </div>
          <div class="vc-offboarded-user-section__button">
            <BaseButton
              variant="outline"
              :disabled="isFetchingStatements"
              :loading="isFetchingStatements"
              @click="viewStatements()"
            >
              View statements
            </BaseButton>
          </div>
        </div>
      </template>
    </WalletSupportContact>

    <CardExampleGroup class="vc-offboarded-user-section__card-examples" />
  </section>
</template>

<style scoped lang="scss">
$component-name: "vc-offboarded-user-section";

.#{$component-name} {
  position: relative !important;
  overflow: hidden !important;
  height: 100%;

  &__support-description {
    color: $color-primary-50;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 215px;
  }

  &__button {
    width: 100%;

    button {
      width: 100%;
    }
  }

  &__card-examples {
    position: absolute;
    left: 580px;
    top: 180px;
  }
}
</style>
