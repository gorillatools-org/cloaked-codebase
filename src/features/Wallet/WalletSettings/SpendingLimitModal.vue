<script setup>
import { computed, ref, watch } from "vue";
import ModalTemplate from "@/features/ModalTemplate";
import { useRoute } from "vue-router";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";

const route = useRoute();

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

const localCard = ref(currentCardCopy.value);

const periodConversion = (period) => {
  if (period === "daily") {
    return "per day";
  } else if (period === "weekly") {
    return "per week";
  } else if (period === "monthly") {
    return "per month";
  } else if (period === "yearly") {
    return "per year";
  } else if (
    currentCard.value.transaction_period === "forever" &&
    currentCard.value.transaction_period_max_transactions === 2
  ) {
    return "one time";
  } else if (
    currentCard.value.transaction_period === "forever" &&
    currentCard.value.transaction_period_max_transactions !== 2
  ) {
    return "Up to";
  } else {
    return "unknown";
  }
};

const title = computed(() => {
  if (
    localCard.value.transaction_period === "forever" &&
    localCard.value.transaction_period_max_transactions !== 2
  ) {
    return `You can spend up to ${spendingLimit.value}.`;
  } else if (
    localCard.value.transaction_period === "forever" &&
    localCard.value.transaction_period_max_transactions === 2
  ) {
    return `You can make a single ${spendingLimit.value} transaction.`;
  } else {
    return `You can spend up to ${spendingLimit.value} ${periodConversion(
      localCard.value.transaction_period
    )}.`;
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
  const payload = {
    transaction_period_limit: localCard.value.transaction_period_limit,
    transaction_period: localCard.value.transaction_period,
    transaction_period_max_transactions:
      localCard.value.transaction_period_max_transactions,
  };
  CardsServices.patchUpdateCloakedCardDetails(currentCard.value.id, payload)
    .then(() => {
      store.dispatch("updateCard", localCard.value);
      emit("close");
    })
    .catch(() => {
      alert("Something went wrong. Please try again later.");
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
    localCard.value.transaction_period_limit === 0 ||
    localCard.value.transaction_period_limit === null
  ) {
    return true;
  } else {
    return false;
  }
});

function changePeriod(period) {
  if (period === "one-time") {
    localCard.value.transaction_period = "forever";
    localCard.value.transaction_period_max_transactions = 2;
  } else if (period === "fixed") {
    localCard.value.transaction_period = "forever";
    localCard.value.transaction_period_max_transactions = 100;
  } else {
    localCard.value.transaction_period = period;
  }
}

function activePeriod(period) {
  if (period === "one-time") {
    return (
      localCard.value.transaction_period === "forever" &&
      localCard.value.transaction_period_max_transactions === 2
    );
  } else if (period === "fixed") {
    return (
      localCard.value.transaction_period === "forever" &&
      localCard.value.transaction_period_max_transactions === 100
    );
  } else {
    return localCard.value.transaction_period === period;
  }
}
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
            @input="updateCents($event.target.value)"
          />
        </div>

        <div class="period-change">
          <button
            v-for="option in periodOptions"
            :key="option.value"
            :class="{ active: activePeriod(option.value) }"
            @click="changePeriod(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="buttons">
          <button
            class="primary"
            :disabled="disableSave"
            @click="saveForm()"
          >
            Save
          </button>
          <button @click="emit('close')">Cancel</button>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
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

  .period-change {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;

    button {
      width: 60px;
      height: 60px;
      border: 1px solid $color-primary-100;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 14px;
      background-color: $color-primary-1;
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
