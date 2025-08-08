<script setup>
import { computed, ref, onMounted } from "vue";
import store from "@/store";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";
import inlineSvg from "@/features/InlineSvg.vue";
import Button from "@/features/Button.vue";
import IdentityService from "@/api/actions/identity-service";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import ModalTemplate from "@/features/ModalTemplate.vue";
import { posthogCapture } from "@/scripts/posthog.js";

const toast = useToast();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
    default: null,
  },
});

onMounted(() => {
  posthogCapture("dashboard_pay_wallet_add_new_card_modal_viewed");
});

const emit = defineEmits(["refresh", "newCardIssued"]);

function closeModal() {
  store.dispatch("closeModal");
}

const cardSettings = computed(() => {
  return store.state.cards?.cardSettings;
});

const periodOptions = [
  {
    value: "daily",
    label: "Day",
    cardType: "MULTI_USE",
    transactionPeriod: "daily",
    maxTransactions: 100,
  },
  {
    value: "weekly",
    label: "Week",
    cardType: "MULTI_USE",
    transactionPeriod: "weekly",
    maxTransactions: 100,
  },
  {
    value: "monthly",
    label: "Month",
    cardType: "MULTI_USE",
    transactionPeriod: "monthly",
    maxTransactions: 100,
  },
  {
    value: "one-time",
    label: "One time",
    transactionPeriod: "forever",
    cardType: "SINGLE_USE",
    maxTransactions: 1,
  },
  {
    value: "fixed",
    label: "Fixed",
    transactionPeriod: "forever",
    cardType: "MULTI_USE",
    maxTransactions: 5,
  },
];

const activePeriod = ref(cardSettings?.value?.period || null);
const maxTransactions = ref(
  periodOptions.find((option) => option.value === activePeriod.value)
    ?.maxTransactions || 100
);

function changePeriod(period) {
  activePeriod.value = period;
  const selectedPeriodOption = periodOptions.find(
    (option) => option.value === period
  );

  if (selectedPeriodOption) {
    maxTransactions.value = selectedPeriodOption.maxTransactions; // Assign the default max transactions
  }
}

const sources = computed(() => {
  const results = store.state.cards?.fundingSources?.results;

  return results?.sort((a, b) => b.primary - a.primary);
});

const primarySource = computed(() => {
  return sources?.value.find((source) => source.primary).id;
});

const fundingSource = ref(null);

const selectedSource = computed(() => {
  return fundingSource.value || primarySource.value;
});

function selectSource(source) {
  fundingSource.value = source.id;
  form.value.source = source.id;
}

const showAll = ref(true);

const dollars = ref(
  convertToDollarFormatted(cardSettings?.value?.spending_limit) || ""
);

const isAmountValid = ref(true);
const isMaxTransactionsValid = ref(true);

function convertToDollarFormatted(amount) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/\.0+$/, "")
    .replace(/\$/g, "");
}

function convertToCent(amount) {
  const centsFloat = Number(amount.replace(/[^\d.]/g, "")) * 100;
  return Math.trunc(centsFloat);
}

function updateCents(value) {
  // Validate the amount on update
  validateAmount(value);

  dollars.value = value;
  form.value.amount = convertToCent(value);
}

function validateAmount(value) {
  const regex = /^\d+(\.\d{1,2})?$/; // Valid float with up to 2 decimals
  const isPositive = parseFloat(value) >= 0.5;
  isAmountValid.value = regex.test(value) && isPositive;
}

function validateMaxTransactions(value) {
  const regex = /^\d+$/; // Valid integer
  const num = parseInt(value, 10);
  isMaxTransactionsValid.value = regex.test(value) && num >= 1 && num <= 100;
}

const form = ref({
  amount: cardSettings?.value?.spending_limit || 0,
  period: activePeriod.value || "daily",
  source: selectedSource?.value,
});

const generating = ref(false);

function generateCard(id) {
  generating.value = true;

  const selectedPeriodOption = periodOptions.find(
    (option) => option.value === activePeriod.value
  );

  const transactionPeriodMaxTransactions =
    activePeriod.value === "fixed"
      ? maxTransactions.value // Use user input for "Fixed"
      : selectedPeriodOption.maxTransactions; // Default for others

  const requestData = {
    type: selectedPeriodOption.cardType,
    currency: "usd",
    funding_source: form.value.source,
    transaction_period_limit: form.value.amount,
    transaction_period: selectedPeriodOption.transactionPeriod,
    valid_for_months: 24,
    transaction_period_max_transactions: transactionPeriodMaxTransactions,
  };

  const createCard = (identityId) => {
    CardsServices.createIdentityCard(identityId, requestData)
      .then((cardDetailsResponse) => {
        emit("newCardIssued", cardDetailsResponse.data);
        emit("refresh");
        closeModal();
        posthogCapture(
          "dashboard_pay_wallet_add_new_card_modal_card_generated"
        );
        toast.success("Card generated successfully");
      })
      .catch((err) => {
        toast.error(err || "Failed to generate card.");
        posthogCapture(
          "dashboard_pay_wallet_add_new_card_modal_card_generation_failed"
        );
      })
      .finally(() => {
        generating.value = false;
      });
  };

  if (id !== null) {
    createCard(id);
  } else {
    // Create an identity first
    IdentityService.createIdentity({ website_url: NO_URL_IDENTITY_DOMAIN })
      .then((response) => {
        const newIdentityId = response.data.id;
        createCard(newIdentityId); // Use the new identity ID to create the card
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Failed to create identity."
        );
        generating.value = false;
      });
  }
}
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <div class="title">
        <h1>Generate new card</h1>
      </div>
    </template>
    <template #body>
      <div class="amount">
        <inlineSvg name="cash-filled" />
        <input
          v-model="dollars"
          type="text"
          @input="updateCents($event.target.value)"
        />
      </div>

      <div
        v-if="activePeriod === 'fixed'"
        class="max-transactions"
      >
        <inlineSvg name="autofill" />
        <input
          v-model="maxTransactions"
          type="number"
          @input="validateMaxTransactions($event.target.value)"
        />
      </div>

      <div class="period-change">
        <button
          v-for="option in periodOptions"
          :key="option"
          :class="{ active: activePeriod === option.value }"
          @click="changePeriod(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div class="funding-sources">
        <div v-if="showAll">
          <div
            v-for="source in sources
              .slice()
              .filter((source) => source.id === selectedSource)"
            :key="source.id"
            class="funding-source"
            :class="{ selected: source.id === selectedSource }"
            @click="selectSource(source)"
          >
            <inlineSvg name="bank" />
            <div class="information">
              <h1>{{ source.card_brand }}</h1>
              <p>
                <span>**** {{ source.pan_last_four }}</span>
                <span v-if="source.nickname">• {{ source.nickname }}</span>
              </p>
            </div>

            <span
              v-if="source.primary"
              class="default-pill"
            >
              Default
            </span>

            <div class="selected-icon" />
          </div>
        </div>

        <div v-else>
          <div
            v-for="source in sources"
            :key="source.id"
            class="funding-source"
            :class="{ selected: source.id === selectedSource }"
            @click="selectSource(source)"
          >
            <inlineSvg name="bank" />
            <div class="information">
              <h1>{{ source.card_brand }}</h1>
              <p>
                <span>**** {{ source.pan_last_four }}</span>
                <span v-if="source.nickname">• {{ source.nickname }}</span>
              </p>
            </div>

            <span
              v-if="source.primary"
              class="default-pill"
            >
              Default
            </span>

            <div class="selected-icon" />
          </div>
        </div>

        <span
          class="show"
          @click="showAll = !showAll"
        >
          {{ showAll ? "Show all" : "Show less" }}
        </span>
      </div>
    </template>
    <template #footer>
      <Button
        type="secondary"
        @click="closeModal"
      >
        Cancel
      </Button>
      <Button
        :loading="generating"
        :disabled="
          generating ||
          !isAmountValid ||
          (activePeriod === 'fixed' && !isMaxTransactionsValid)
        "
        @click="generateCard(props.id)"
      >
        Generate
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
.title {
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

    &:focus {
      outline: none;
    }
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
      right: 56px;
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

  .show {
    margin-top: 12px;
    margin-left: 16px;
    font-size: 12px;
    display: inline-block;
    text-decoration: underline;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
