<script setup>
import creditCardType, { types as CardType } from "credit-card-type";
import moment from "moment";
import store from "@/store";

import EditAddress from "./EditAddress";

import PersonalInfoService from "@/api/settings/personal-services";

import { reactive, computed, onMounted } from "vue";
import { useToast } from "@/composables/useToast.js";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import Button from "@/features/Button.vue";
import CardLogo from "@/features/creditCards/CardLogo.vue";

const toast = useToast();

const emit = defineEmits(["toggleBack", "update", "refresh", "back"]);

const props = defineProps({
  selectedCard: {
    type: Object,
    default: null,
  },
  creditCards: {
    type: Array,
    default: () => [],
  },
});

const state = reactive({
  errors: [],
  card: {
    name: null,
    card_number: null,
    cvv: null,
    expiry_date: null,
  },
  address: {
    autofill_street_address: null,
    autofill_unit: null,
    autofill_country: null,
    autofill_address_level2: null,
    autofill_address_level1: null,
    autofill_postal_code: null,
  },
  loading: false,
  processingDelete: false,
});

onMounted(() => {
  if (props.selectedCard) {
    state.card = {
      ...state.card,
      ...props.selectedCard,
      name: props.selectedCard?.cardholder_name,
    };
    state.address = {
      name: props.selectedCard?.billing_name,
      autofill_street_address: props.selectedCard?.billing_address_1,
      autofill_unit: props.selectedCard?.billing_address_2,
      autofill_address_level2: props.selectedCard?.billing_city,
      autofill_address_level1: props.selectedCard?.billing_state,
      autofill_postal_code: props.selectedCard?.billing_zip,
      autofill_country: props.selectedCard?.billing_country,
    };
  }
});

const title = computed(() => {
  return props.selectedCard
    ? "Edit card details"
    : "Add a credit or debit card";
});

const maxLength = computed(() => {
  const card = cardFormatted.value;
  if (card) {
    return Math.max(...card.lengths) + card.gaps.length;
  }
  return 19;
});

const addressPayload = computed(() => {
  return {
    autofill_street_address: state.address.autofill_street_address,
    autofill_unit: state.address.autofill_unit,
    autofill_country: state.address.autofill_country,
    autofill_address_level2: state.address.autofill_address_level2,
    autofill_address_level1: state.address.autofill_address_level1,
    autofill_postal_code: state.address.autofill_postal_code,
  };
});

const payloadFormatted = computed(() => {
  return {
    ...state.card,
    cardholder_name: state.card.name,
    card_type: cardType.value,
    last_4_digits:
      state.card.card_number &&
      state.card.card_number.slice(
        state.card.card_number.length - 4,
        state.card.card_number.length
      ),
    billing_name: state.address.name,
    billing_address_1: state.address.autofill_street_address,
    billing_address_2: state.address.autofill_unit || "",
    billing_city: state.address.autofill_address_level2,
    billing_state: state.address.autofill_address_level1,
    billing_zip: state.address.autofill_postal_code,
    billing_country: state.address.autofill_country,
  };
});

const cardFormatted = computed(() => {
  const types = creditCardType(state.card.card_number).filter((card) => {
    return (
      card.type === CardType.MASTERCARD ||
      card.type === CardType.VISA ||
      card.type === CardType.AMERICAN_EXPRESS ||
      card.type === CardType.DISCOVER ||
      card.type === CardType.DINERS_CLUB ||
      card.type === CardType.HIPERCARD
    );
  });
  if (types.length === 1) {
    return types[0];
  }
  return null;
});

const cardType = computed(() => {
  const card = cardFormatted.value;
  return card && card.type;
});

const cardIsValid = computed(() => {
  const card = cardFormatted.value;
  if (card) {
    if (payloadFormatted.value.card_number) {
      const number = payloadFormatted.value.card_number.replaceAll(" ", "");
      if (number !== "") {
        if (card.lengths.includes(number.length)) {
          return true;
        }
      }
    }
  }
  return false;
});

const disabled = computed(() => {
  if (cardIsValid.value && cardType.value) {
    return false;
  }
  return true;
});

function openDeleteModal() {
  state.processingDelete = true;
  return store.dispatch("openModal", {
    header: `Delete card ending in ${state.card.last_4_digits}?`,
    subheader:
      "Deleting this card will remove it from your account and autofill information.",
    button: {
      text: "Yes, delete",
      danger: true,
      onClick: deleteCard,
    },
    cancelAction: () => {
      state.processingDelete = false;
    },
  });
}

function deleteCard() {
  PersonalInfoService.deleteAutofillCard(state.card.url)
    .then(() => {
      emit("refresh");
      emit("back", "Credit card deleted.");
      state.processingDelete = false;
    })
    .catch(() => {
      toast.error("Error deleting credit card");
      state.processingDelete = false;
    });
}

function validateCardNumber() {
  const cardTypeData = cardFormatted.value;
  const cardNumFormatted = state.card?.card_number?.split(" ").join("");
  const cardIsValidLength = cardTypeData?.lengths.includes(
    cardNumFormatted.length
  );
  const errorIncludesCardNum = state.errors.includes("card_number");
  if (!cardIsValidLength && !errorIncludesCardNum) {
    state.errors = [...state.errors, "card_number"];
  }
}

function validateCardCvv() {
  const cardTypeData = cardFormatted.value;
  let cardIsValidLength = false;

  if (state.card?.cvv?.length) {
    cardIsValidLength = cardTypeData?.code?.size === state.card?.cvv?.length;
  }

  const errorIncludesCardCvv = state.errors.includes("cvv");
  if (!cardIsValidLength && !errorIncludesCardCvv) {
    state.errors = [...state.errors, "cvv"];
  }
}

function validateCardExp() {
  const errorIncludesCardExp = state.errors.includes("expiry_date");
  let cardExpIsValid = false;
  if (state.card?.expiry_date) {
    cardExpIsValid =
      moment().format("x") <
      moment(state.card.expiry_date, "MM/YY").format("x");
  }
  if (!cardExpIsValid && !errorIncludesCardExp) {
    state.errors = [...state.errors, "expiry_date"];
  }
}

function clearErrorType(errorType) {
  if (state.errors.includes(errorType)) {
    state.errors = state.errors.filter((err) => err !== errorType);
  }
}

function formatCardNumber(value) {
  const card = cardFormatted.value;
  if (value && card) {
    let data = value.replaceAll(/[^0-9]/g, "").split("");
    card.gaps.reverse().map((d) => {
      if (data.length > d) {
        data.splice(d, 0, " ");
      }
    });
    return data.join("");
  }

  return value;
}

function formatCardCVV(value) {
  if (value) {
    return value.replaceAll(/[^0-9]/g, "").slice(0, 4);
  }
  return value;
}

function formatCardExp(value) {
  if (value) {
    const match = value
      .replaceAll(/[^0-9]/g, "")
      .slice(0, 4)
      .match(/.{1,2}/g);
    return match.join("/");
  }
  return value;
}

function updateAddress({ name, value }) {
  state.address = {
    ...state.address,
    [name]: value,
  };
}

function hasError(field) {
  return state.errors.includes(field);
}

function cardIsDuplicate() {
  let isDupe = false;
  let cards = props.creditCards;
  if (props.selectedCard) {
    cards = cards.filter((c) => c.id !== props.selectedCard.id);
  }

  cards.forEach((card) => {
    if (!isDupe) {
      const expMatch = card.expiry_date === payloadFormatted.value.expiry_date;
      const cvvMatch = card.cvv === payloadFormatted.value.cvv;
      const cardNumberMatch =
        card.card_number === payloadFormatted.value.card_number;
      if (expMatch && cvvMatch && cardNumberMatch) {
        isDupe = true;
      }
    }
  });

  return isDupe;
}

function checkHasErrors() {
  state.errors = [];
  let errors = [];
  const required = ["card_number", "expiry_date"];
  required.map((k) => {
    if (!payloadFormatted.value[k]) {
      errors.push(k);
    }
  });
  if (disabled.value) {
    errors.push("card_number");
  }
  if (cardIsDuplicate()) {
    return true;
  }
  if (errors.length > 0) {
    state.errors = errors;
    return true;
  }
  return false;
}

function successfullySaved() {
  state.loading = false;
  emit("refresh");
  emit("back", "Credit card saved.");
}

function errorSaving() {
  state.loading = false;
  emit("refresh");
  emit("back", "Credit card failed.");
}

async function save() {
  if (!checkHasErrors()) {
    if (!disabled.value) {
      state.loading = true;
      if (props.selectedCard) {
        return PersonalInfoService.updateAutofillCard(
          props.selectedCard?.id,
          payloadFormatted.value
        )
          .then(successfullySaved)
          .catch(errorSaving);
      }
      return PersonalInfoService.postAutofillCard(payloadFormatted.value)
        .then(successfullySaved)
        .catch(errorSaving);
    } else {
      toast.error("Error saving card. Valid credit card number required.");
    }
  } else {
    const errorMessage = cardIsDuplicate()
      ? "Card already exists"
      : "Error saving card. Enter required fields.";
    toast.error(errorMessage);
  }
}
</script>

<template>
  <PreferencesPanel>
    <template #header>
      <PreferencesHeader @go-back="emit('toggleBack')" />
    </template>
    <PreferencesTitle :big="true">
      {{ title }}
    </PreferencesTitle>
    <PreferencesInput
      label="Cardholder name"
      :error="hasError('cardholder_name')"
      tabindex="1"
      :value="state.card.name"
      :max="128"
      @input="(event) => (state.card.name = event)"
    />

    <div class="cc_input">
      <div>
        <PreferencesInput
          :pattern="/[0-9]/g"
          label="Card number"
          :error="hasError('card_number')"
          :format="formatCardNumber"
          :max="maxLength"
          tabindex="2"
          :value="state.card.card_number"
          error-message="Not a valid card number"
          @input="(event) => (state.card.card_number = event)"
          @blur="validateCardNumber"
          @focus="clearErrorType('card_number')"
        />
        <CardLogo :card-type="cardType" />
      </div>
      <div>
        <PreferencesInput
          label="Exp date"
          :error="hasError('expiry_date')"
          :pattern="/[0-9]/g"
          tabindex="3"
          :max="5"
          :format="formatCardExp"
          :value="state.card.expiry_date"
          error-message="Not a valid expiration date"
          @input="(event) => (state.card.expiry_date = event)"
          @blur="validateCardExp"
          @focus="clearErrorType('expiry_date')"
        />
      </div>
      <div>
        <PreferencesInput
          label="Security code"
          :pattern="/[0-9]/g"
          :error="hasError('cvv')"
          :format="formatCardCVV"
          :max="4"
          tabindex="4"
          :value="state.card.cvv"
          error-message="Not a valid security code"
          @input="(event) => (state.card.cvv = event)"
          @blur="validateCardCvv"
          @focus="clearErrorType('cvv')"
        />
      </div>
    </div>
    <PreferencesTitle :big="true">Billing address (optional)</PreferencesTitle>
    <PreferencesInput
      label="Name"
      tabindex="5"
      :value="state.address.name"
      :max="128"
      @input="(event) => (state.address.name = event)"
    />
    <EditAddress
      ref="editAddressRef"
      :errors="state.errors"
      label="address"
      :current="addressPayload"
      name="address"
      @update="updateAddress"
    />

    <PreferencesFooter>
      <Button
        :class="{ disabled: disabled }"
        :disabled="state.loading || disabled"
        :loading="state.loading"
        @click="save"
      >
        {{ state.loading ? "Saving changes" : "Save" }}
      </Button>
      <Button
        v-if="props.selectedCard"
        :class="{ disabled: disabled }"
        :disabled="state.processingDelete"
        :loading="state.processingDelete"
        type="danger"
        @click="openDeleteModal"
      >
        Delete
      </Button>
    </PreferencesFooter>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.preferences-title {
  font-family: $global-font;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 36px;
  display: flex;
  align-items: center;
}
.disabled {
  opacity: 0.5;
}
.preferences-input {
  margin: 15px auto;
}
.cc_input {
  display: grid;
  gap: 10px;
  grid-template-columns: 55% 20% 20%;
  align-items: flex-start;
  margin: 15px 0;
  > div:first-child {
    position: relative;
    > div:nth-child(2) {
      position: absolute;
      background-color: $white;
    }
  }
}
</style>
