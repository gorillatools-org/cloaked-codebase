<script setup>
import { computed, ref, watch } from "vue";
import ModalTemplate from "@/features/ModalTemplate";
import { useRoute } from "vue-router";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import Button from "@/features/Button.vue";
import useCreationLimit from "@/features/VirtualCards/composables/useCreationLimit";

const isSaving = ref(false);
const { refresh: refreshCreationLimit } = useCreationLimit();
const route = useRoute();
const toast = useToast();

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close"]);

const currentCard = computed(() => {
  if (route.params.id && store.state.cards.cards.results) {
    return store.state.cards.cards.results.find(
      (card) => card.id === route.params.id
    );
  } else {
    return "";
  }
});

const currentCardCopy = computed(() => {
  return JSON.parse(JSON.stringify(currentCard.value));
});

const isSelectedPeriodValid = computed(() => {
  return periodOptions.some((option) => isPeriodActive(option.value));
});

const isMaxTransactionsValid = computed(() => {
  const regex = /^\d+$/; // Valid integer
  const num = parseInt(maxTransactions.value, 10);
  return regex.test(maxTransactions.value) && num >= 1 && num <= 100;
});

const localCard = ref(currentCardCopy.value);
const maxTransactions = ref(
  currentCard.value.transaction_period_max_transactions
);

const title = computed(() => {
  const period = localCard.value.transaction_period;

  switch (period) {
    case "daily":
      return `You can spend up to ${spendingLimit.value} per day.`;
    case "weekly":
      return `You can spend up to ${spendingLimit.value} per week.`;
    case "monthly":
      return `You can spend up to ${spendingLimit.value} per month.`;
    case "yearly":
      return `You can spend up to ${spendingLimit.value} per year.`;
    case "forever":
      // One-time
      if (localCard.value.transaction_period_max_transactions === 1) {
        return `You can make a single ${spendingLimit.value} transaction.`;
      } else {
        return `You can use ${localCard.value.transaction_period_max_transactions} times up to ${spendingLimit.value}.`;
      }
    default:
      return "unknown";
  }
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

const spendingLimit = computed(() => {
  return convertToDollarFormatted(localCard.value.transaction_period_limit);
});

function saveForm() {
  isSaving.value = true;
  const payload = {
    transaction_period_limit: localCard.value.transaction_period_limit,
    transaction_period: localCard.value.transaction_period,
    transaction_period_max_transactions: maxTransactions.value,
  };

  const updatedCard = {
    ...localCard.value,
    ...payload,
  };

  CardsServices.patchUpdateCloakedCardDetails(currentCard.value.id, payload)
    .then(() => {
      store.dispatch("updateCard", updatedCard);
      void refreshCreationLimit();
      emit("close");
    })
    .catch((err) => {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    })
    .finally(() => {
      isSaving.value = false;
    });
}

const dollars = ref(convertToDollar(localCard.value.transaction_period_limit));

function updateCents(newValue) {
  if (newValue < 0) {
    localCard.value.transaction_period_limit = 0;
    return;
  }
  localCard.value.transaction_period_limit = convertToCent(dollars.value);
}

watch(
  () => props.show,
  (value) => {
    if (value) {
      localCard.value = JSON.parse(JSON.stringify(currentCard.value));
      dollars.value = convertToDollar(localCard.value.transaction_period_limit);
      maxTransactions.value =
        localCard.value.transaction_period_max_transactions;
    }
  },
  { deep: true }
);

const periodOptions = [
  {
    value: "daily",
    label: "Day",
  },
  {
    value: "weekly",
    label: "Week",
  },
  {
    value: "monthly",
    label: "Month",
  },
  {
    value: "one-time",
    label: "One time",
  },
  {
    value: "fixed",
    label: "Fixed",
  },
];

const disableSave = computed(() => {
  if (
    isSaving.value ||
    !isSelectedPeriodValid.value ||
    localCard.value.transaction_period_limit === 0 ||
    localCard.value.transaction_period_limit === null ||
    !isMaxTransactionsValid.value
  ) {
    return true;
  } else {
    return false;
  }
});

function changePeriod(period) {
  if (isPeriodActive(period)) {
    return;
  }

  if (period === "one-time") {
    localCard.value.transaction_period = "forever";
    localCard.value.transaction_period_max_transactions = 1;
    maxTransactions.value = 1;
  } else if (period === "fixed") {
    localCard.value.transaction_period = "forever";
    localCard.value.transaction_period_max_transactions = 5;
    maxTransactions.value = 5;
  } else {
    localCard.value.transaction_period = period;
    localCard.value.transaction_period_max_transactions = 100;
    maxTransactions.value = 100;
  }
}

function isPeriodActive(period) {
  if (period === "one-time") {
    return (
      localCard.value.transaction_period === "forever" &&
      localCard.value.transaction_period_max_transactions === 1
    );
  } else if (period === "fixed") {
    return (
      localCard.value.transaction_period === "forever" &&
      localCard.value.transaction_period_max_transactions > 1
    );
  } else {
    return localCard.value.transaction_period === period;
  }
}

function onlyAllowInteger(e) {
  const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
  const isNumber = /^[0-9]$/.test(e.key);

  if (!isNumber && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
}

function preventAmountInputCharacters(event) {
  const { key, target } = event;
  const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];

  if (controlKeys.includes(key)) return;

  // Prevent non-numeric and non-decimal characters
  if (!/[\d.]/.test(key)) {
    event.preventDefault();
    return;
  }

  // Prevent more than 1 decimal point
  const { value, selectionStart, selectionEnd } = target;
  if (key === "." && value.includes(".")) {
    event.preventDefault();
    return;
  }

  // Prevent more than 2 decimal places
  const newValue =
    value.slice(0, selectionStart) + key + value.slice(selectionEnd);
  const decimalPart = newValue.split(".")[1];

  if (decimalPart && decimalPart.length > 2) {
    event.preventDefault();
  }
}
</script>

<template>
  <ModalTemplate
    :show="props.show"
    @close="emit('close')"
  >
    <template #body>
      <div
        v-if="currentCard"
        class="text"
      >
        <div class="title">
          <div class="icon">
            <inlineSvg name="spending-limit" />
          </div>

          <h1>Spending limit</h1>

          <p>{{ title }}</p>
        </div>

        <div class="amount">
          <inlineSvg name="cash-filled" />
          <input
            v-model="dollars"
            type="text"
            @keydown="preventAmountInputCharacters"
            @input="updateCents($event.target.value)"
          />
        </div>

        <div
          v-if="isPeriodActive('fixed')"
          class="max-transactions"
        >
          <inlineSvg name="autofill" />
          <input
            v-model="maxTransactions"
            type="number"
            @keydown="onlyAllowInteger"
          />
        </div>

        <div class="period-change">
          <button
            v-for="option in periodOptions"
            :key="option.value"
            :class="{ active: isPeriodActive(option.value) }"
            @click="changePeriod(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="buttons">
          <Button
            :loading="isSaving"
            class="primary"
            :disabled="disableSave"
            @click="saveForm()"
          >
            Save
          </Button>
          <button @click="emit('close')">Cancel</button>
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
    }

    &::after {
      content: "USD";
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      color: $color-primary-20;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
    }
  }

  .period-change {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;

    button {
      width: 68px;
      height: 68px;
      border: 1px solid $color-primary-10;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 14px;
      background-color: $color-base-white-100;
      color: $color-primary-100;
      border-radius: 50%;
      font-family: inherit;

      &.active {
        background-color: $color-primary-100;
        color: $color-primary-1;

        &:hover {
          background-color: $color-primary-90;
        }
      }

      &:hover {
        background-color: $color-primary-5;
        cursor: pointer;
      }
    }
  }

  .max-transactions {
    position: relative;
    margin-top: 24px;

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
      padding: 20px 72px;
      background-color: $color-primary-5;
      border: 0;
      border-radius: 24px;
      color: $color-primary-100;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-align: left;
      appearance: textfield;
      appearance: none;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        appearance: none;
        margin: 0;
      }

      &:focus {
        outline: none;
      }
    }

    &::after {
      content: "Uses";
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      color: $color-primary-20;
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
        color: $color-primary-1;

        &:hover {
          background: $color-primary-90;
        }
      }
    }
  }
}
</style>
