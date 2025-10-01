<script setup>
import { computed, markRaw, ref } from "vue";
import Button from "@/features/Button.vue";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import MultiCardPaymentPanel from "@/features/Wallet/MultiCardPaymentPanel.vue";
import router from "../../routes/router/index.js";
import PatchDefaultFundingSource from "@/features/modals/Wallet/PatchDefaultFundingSource.vue";

const toast = useToast();

const props = defineProps({
  active: {
    type: Boolean,
    required: true,
  },
  outstandingBalance: {
    type: Number,
    required: true,
  },
});

const sources = computed(() => {
  return store.state.cards?.fundingSources.results;
});

const receivePaymentsActive = ref(props.active);

const multiCardPaymentPanelActivated = ref(false);

const buttonDisabled = ref(false);

function convertToDollar(amount) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/\.0+$/, "");
}

const emit = defineEmits(["close"]);

function payReceivePayments() {
  buttonDisabled.value = true;

  CardsServices.payAll()
    .then(async () => {
      await store.dispatch("authentication/getUser");
      toast.success("Payment successful");
      buttonDisabled.value = false;
      receivePaymentsActive.value = false;
      emit("close");
    })
    .catch(() => {
      toast.error("Payment failed");
      buttonDisabled.value = false;
    });
}

const openDefaultFundingSources = () => {
  if ((store.state.cards?.fundingSources?.results?.length ?? 0) === 0) {
    router.push("settings/cloaked-cards");
    return;
  }

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(PatchDefaultFundingSource),
      props: {
        isVisible: true,
      },
    },
  });
};
</script>

<template>
  <div v-if="multiCardPaymentPanelActivated">
    <MultiCardPaymentPanel :outstanding-balance="props.outstandingBalance" />
  </div>

  <div
    v-if="sources && receivePaymentsActive"
    class="receive-payments-panel"
  >
    <div class="receive-payments">
      <div class="title">
        <h1 v-if="receivePaymentsActive">
          Balance due: {{ convertToDollar(props.outstandingBalance) }}
        </h1>
        <p v-if="receivePaymentsActive">Please pay your remaining balance.</p>

        <p v-else-if="collection?.status === 'pending'">
          Your payment is being processed. Please come back later.
        </p>
      </div>

      <div
        v-if="receivePaymentsActive"
        class="funding-sources"
      >
        <div
          v-for="source in sources.filter((s) => s.primary)"
          :key="source.id"
          class="funding-source"
          @click="openDefaultFundingSources"
        >
          <InlineSvg name="bank" />
          <div class="information">
            <h1>{{ source.card_brand }}</h1>
            <p>
              <span>**** {{ source.pan_last_four }}</span>
              <span v-if="source.nickname">• {{ source.nickname }}</span>
            </p>
          </div>
          <span class="default-pill">Default</span>
        </div>
      </div>

      <Button
        full-width
        size="xl"
        :disabled="buttonDisabled"
        :loading="buttonDisabled"
        @click="payReceivePayments()"
      >
        Pay balance in full
      </Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.receive-payments-panel {
  z-index: 1;
  background-color: $color-base-white-100;
  padding-top: 10px;
  padding-bottom: 1px;

  .receive-payments {
    padding: 24px;
    border: 1px solid $color-primary-10;
    border-radius: 20px;
    margin: 15px 15px 0;

    > * {
      margin-top: 16px;

      &:first-child {
        margin-top: 0;
      }
    }

    .title {
      h1 {
        font-size: 24px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        color: $color-primary-100;
      }

      p {
        margin-top: 16px;
        font-size: 16px;
        line-height: 24px;
        color: $color-primary-70;

        strong {
          font-weight: 600;
        }
      }
    }

    .funding-sources {
      margin-top: 24px;

      .funding-source {
        border: 1px solid $color-primary-10;
        border-radius: 16px;
        padding: 16px;
        margin-top: 4px;
        position: relative;
        color: $color-primary-100;

        &:hover {
          background-color: $color-primary-5;
          cursor: pointer;
        }

        &.selected {
          .selected-icon {
            &::after {
              content: "";
              display: block;
              width: 8px;
              height: 8px;
              background-color: $color-primary-100;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }

        &:first-child {
          margin-top: 0;
        }

        svg {
          width: 24px;
          height: 24px;
          margin-right: 16px;
          position: absolute;
          top: 50%;
          left: 16px;
          transform: translateY(-50%);
        }

        .information {
          padding-left: 40px;
          padding-right: 40px;

          h1 {
            font-size: 15px;
            font-style: normal;
            font-weight: 500;
            line-height: normal;
            color: $color-primary-100;
            text-transform: capitalize;
          }

          p {
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            margin-top: 4px;

            span {
              display: inline-block;

              &:nth-of-type(2) {
                margin-left: 4px;
              }
            }
          }
        }

        .default-pill {
          position: absolute;
          top: 50%;
          right: 25px;
          transform: translateY(-50%);
          background-color: $color-success;
          color: $white;
          font-size: 10px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          padding: 4px 10px;
          border-radius: 19px;
        }

        .selected-icon {
          position: absolute;
          top: 50%;
          right: 24px;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid $color-primary-100;
        }
      }
    }
  }
}
</style>
