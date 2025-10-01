<script setup>
import { computed, ref, watch } from "vue";
import ModalTemplate from "@/features/ModalTemplate";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";

const props = defineProps({
  show: Boolean,
  card: {
    type: Object,
    default: () => {},
  },
  outstandingBalance: { type: Number, default: null },
});

const emit = defineEmits(["close"]);

const currentCard = computed(() => {
  return props.card;
});

const currentCardCopy = computed(() => {
  return JSON.parse(JSON.stringify(currentCard.value));
});

const localCard = ref(currentCardCopy.value);

const title = computed(() => {
  return (
    "Outstanding Balance: " + convertToDollarFormatted(props.outstandingBalance)
  );
});

function convertToDollarFormatted(amount) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/\.0+$/, "");
}

function convertToDollar(amount) {
  return Number(amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    })
    .replace(/[^\d.]/g, "");
}

function convertToCent(amount) {
  return Number(amount.replace(/[^\d.]/g, "")) * 100;
}

function updateCents(newValue) {
  if (newValue < 0) {
    localCard.value.outstanding_balance = 0;
    return;
  }
  localCard.value.outstanding_balance = convertToCent(dollars.value);
}

const dollars = ref(convertToDollar(localCard.value.outstanding_balance));

function closeModal() {
  store.dispatch("closeModal");
  emit("close");
}

const disabled = ref(false);

const loading = ref(false);

function payCard() {
  const payload = {
    pay_cloaked_card: [
      {
        cloaked_card: localCard.value.id,
        amount: dollars.value,
        funding_source: localCard.value.funding_source,
      },
    ],
  };
  disabled.value = true;
  loading.value = true;
  CardsServices.payCard(payload)
    .then(() => {
      loading.value = false;
      disabled.value = false;
      store.dispatch("updateCard", localCard.value);
      emit("close");
    })
    .catch(() => {
      loading.value = false;
      disabled.value = false;
      alert("Something went wrong. Please try again later.");
    });
}

watch(
  () => props.show,
  (value) => {
    if (value) {
      localCard.value = JSON.parse(JSON.stringify(currentCard.value));
      dollars.value = convertToDollar(localCard.value.outstanding_balance);
    }
  },
  { deep: true }
);

watch(
  () => localCard.value.outstanding_balance,
  (newValue) => {
    let outstandingBalance = newValue;

    let parsedBalance = parseFloat(outstandingBalance);
    if (
      isNaN(parsedBalance) ||
      parsedBalance === 0 ||
      outstandingBalance === null ||
      outstandingBalance === undefined ||
      parsedBalance < 0 ||
      parsedBalance > currentCard.value.outstanding_balance
    ) {
      disabled.value = true;
    } else {
      disabled.value = false;
    }
  }
);
</script>

<template>
  <ModalTemplate
    :show="props.show"
    no-close
    width="375px"
  >
    <template #body>
      <div
        v-if="currentCard"
        class="text"
      >
        <div class="title">
          <h1>{{ currentCard.name }}</h1>

          <p>{{ title }}</p>
        </div>

        <div class="amount">
          <inlineSvg name="cash-filled" />
          <input
            v-model="dollars"
            type="text"
            @input="updateCents($event.target.value)"
          />
        </div>

        <div class="buttons">
          <button
            class="primary"
            :disabled="disableSave"
            @click="payCard()"
          >
            Save
          </button>
          <button @click="closeModal()">Cancel</button>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.text {
  padding: 24px 0;

  .title {
    margin-bottom: 34px;

    .icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: $color-primary-100;
      position: relative;

      svg {
        width: 34px;
        height: auto;
        color: $color-primary-1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    h1 {
      margin-top: 16px;
      color: $color-primary-100;
      font-size: 18px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
    }

    p {
      margin-top: 8px;
      font-size: 15px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      color: $color-primary-70;
    }
  }

  .amount {
    position: relative;

    svg {
      position: absolute;
      top: 50%;
      left: 16px;
      transform: translateY(-50%);
      color: $color-primary-100;
      width: 36px;
      height: auto;
    }

    input {
      width: 100%;
      padding: 20px 72px 20px 60px;
      background-color: $color-primary-5;
      border: 0;
      border-radius: 24px;
      color: $color-primary-100;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-align: right;
    }

    &::after {
      content: "USD";
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      color: $color-primary-70;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
    }
  }

  .buttons {
    margin-top: 34px;
    display: flex;
    align-items: center;
    flex-direction: column;

    button {
      border: 0;
      background: transparent;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      color: $color-primary-100;
      margin-top: 16px;
      cursor: pointer;
      font-family: inherit;

      &:first-child {
        margin-top: 0;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }

      &.primary {
        width: 100%;
        background: $color-primary-100;
        padding: 11px;
        color: $color-primary-1;
        border-radius: 999px;

        &:hover {
          background: $color-primary-90;
        }
      }
    }
  }
}
</style>
