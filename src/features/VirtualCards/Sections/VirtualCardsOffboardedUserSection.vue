<script setup lang="ts">
import WalletSupportContact from "@/features/Wallet/WalletSupportContact.vue";
import CardExampleGroup from "@/features/Wallet/CardExampleGroup.vue";
import { posthogCapture } from "@/scripts/posthog";
import ListStatements from "@/features/modals/Wallet/ListStatements.vue";
import { markRaw, ref } from "vue";
import store from "@/store";
import CardsServices from "@/api/actions/cards-services";
import Button from "@/features/Button.vue";

const isFetchingStatements = ref(false);

async function viewStatements() {
  isFetchingStatements.value = true;
  CardsServices.getStatements()
    .then(() => {
      posthogCapture(`dashboard_pay_offboarded_user_statements_viewed`);

      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(ListStatements),
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
  posthogCapture(`dashboard_pay_offboarded_user_contact_support_clicked`);
}
</script>

<template>
  <section class="vc-offboarded-user-section">
    <WalletSupportContact title="Your Cloaked Pay account is no longer active">
      <template #description>
        <p class="vc-offboarded-user-section__support-description">
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
        <div class="vc-offboarded-user-section__button">
          <Button
            variant="outline"
            :disabled="isFetchingStatements"
            :loading="isFetchingStatements"
            @click="viewStatements()"
          >
            View statements
          </Button>
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

  &__button {
    max-width: 215px;

    button {
      width: 100%;
      padding: 11px;
      border-radius: 30px;
      background: transparent;
      color: $color-primary-100;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      border: 1px solid $color-primary-100;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: $color-primary-10;
      }

      svg {
        width: 24px;
        height: 24px;
        margin-left: 10px;
        display: inline-block;
      }

      &.disabled {
        cursor: not-allowed;
        background: $color-success;
        border-color: $color-success;
        color: $white;
        pointer-events: none;
      }
    }
  }

  &__card-examples {
    position: absolute;
    left: 580px;
    top: 180px;
  }
}
</style>
