<script setup>
import { computed, ref, onMounted } from "vue";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import Button from "@/features/Button.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";
import SelectMerchantDropdown from "@/features/Wallet/SelectMerchantDropdown.vue";
import { useToast } from "@/composables/useToast.js";
import useVirtualCardGenerate from "@/composables/Wallet/useVirtualCardGenerate";

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

const toast = useToast();

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

const selectedMerchant = ref("");

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
    maxTransactions.value = selectedPeriodOption.maxTransactions;
  }
}

const sources = computed(() => {
  const results = store.state.cards?.fundingSources?.results;
  return results?.sort((a, b) => b.primary - a.primary);
});

const showAll = ref(false);

const filteredSources = computed(() => {
  if (showAll.value) {
    return sources.value;
  }
  return [...sources.value]
    .sort((a, b) => {
      return b.id === fundingSource.value ? 1 : -1;
    })
    .slice(0, 1);
});

const isSelectedPeriodValid = computed(() => {
  return periodOptions.find((option) => option.value === activePeriod.value);
});

const primarySource = computed(() => {
  return sources?.value.find((source) => source.primary)?.id;
});

const fundingSource = ref(primarySource.value);

const selectedSource = computed(() => {
  return fundingSource.value || primarySource.value;
});

function selectSource(source) {
  fundingSource.value = source.id;
  form.value.source = source.id;
}

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
  validateAmount(value);
  dollars.value = value;
  form.value.amount = convertToCent(value);
}

function validateAmount(value) {
  const regex = /^\d+(\.\d{1,2})?$/;
  const isPositive = parseFloat(value) >= 0.5;
  isAmountValid.value = regex.test(value) && isPositive;
}

function validateMaxTransactions(value) {
  const regex = /^\d+$/;
  const num = parseInt(value, 10);
  isMaxTransactionsValid.value = regex.test(value) && num >= 1 && num <= 100;
}

const form = ref({
  amount: cardSettings?.value?.spending_limit || 0,
  period: activePeriod.value || "daily",
  source: selectedSource?.value,
});

const generating = ref(false);

const { generateCard } = useVirtualCardGenerate();

async function handleGenerate(id) {
  generating.value = true;
  const selectedPeriodOption = periodOptions.find(
    (option) => option.value === activePeriod.value
  );

  try {
    if (!selectedPeriodOption) throw new Error("Please select a valid period");

    const transactionPeriodMaxTransactions =
      activePeriod.value === "fixed"
        ? maxTransactions.value
        : selectedPeriodOption.maxTransactions;

    const params = {
      identity_id: id ?? undefined,
      website_url: selectedMerchant.value?.website_url,
      nickname:
        selectedMerchant.value?.title ||
        selectedMerchant.value?.nickname ||
        selectedMerchant.value ||
        undefined,
      funding_source: String(form.value.source),
      transaction_period_limit: form.value.amount,
      transaction_period: selectedPeriodOption.transactionPeriod,
      transaction_period_max_transactions: transactionPeriodMaxTransactions,
      type: selectedPeriodOption.cardType,
    };

    const { cardId } = await generateCard(params);

    emit("newCardIssued", cardId);
    emit("refresh");

    posthogCapture("dashboard_pay_wallet_add_new_card_modal_card_generated");
    toast.success("Card generated successfully");

    closeModal();
  } catch (error) {
    toast.error(error.message);
    posthogCapture(
      "dashboard_pay_wallet_add_new_card_modal_card_generation_failed"
    );
  } finally {
    generating.value = false;
  }
}

function preventAmountInputCharacters(event) {
  const { key, target } = event;
  const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];

  if (controlKeys.includes(key)) return;

  if (!/[\d.]/.test(key)) {
    event.preventDefault();
    return;
  }

  const { value, selectionStart, selectionEnd } = target;
  if (key === "." && value.includes(".")) {
    event.preventDefault();
    return;
  }

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
    :show="props.isVisible"
    :prevent-escape-on-input-focus="true"
    @close="closeModal"
  >
    <template #header>
      <div class="title">
        <h1>Generate Virtual Card</h1>
      </div>
    </template>
    <template #body>
      <div class="select-merchant-dropdown">
        <SelectMerchantDropdown v-model="selectedMerchant" />
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
        <div
          v-for="source in filteredSources"
          :key="source.id"
        >
          <FundingSourceListItem
            :is-selected="source.id === fundingSource"
            :is-select-mode="true"
            :funding-source="source"
            @select="selectSource(source)"
          />
        </div>

        <span
          v-if="sources.length > 1"
          class="show"
          @click="showAll = !showAll"
        >
          {{ showAll ? "Show less" : "Show all" }}
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
          !isSelectedPeriodValid ||
          (activePeriod === 'fixed' && !isMaxTransactionsValid)
        "
        @click="handleGenerate(props.id)"
      >
        Generate
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;

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
