<script setup>
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import { useBankCardExpiresAtValidation } from "@/composables/validation/useBankCardExpiresAtValidation.js";
import { useBankCardNumberValidation } from "@/composables/validation/useBankCardNumberValidation.js";
import { useBankCardSecurityCodeValidation } from "@/composables/validation/useBankCardSecurityCodeValidation.js";
import { useNameValidation } from "@/composables/validation/useNameValidation.js";
import Button from "@/features/Button.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import { constants } from "@/scripts/constants.js";
import {
  formatCardExpiresAtField,
  formatCardNumberField,
  keyPressNumbersOnly,
} from "@/scripts/format.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { bankCardExpiresAtStringToDate } from "@/scripts/tools.js";
import store from "@/store";
import { computed, watch } from "vue";

const toast = useToast();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  cardType: {
    type: String,
    default: constants.CARD_TYPE.DEBIT_CARD,
  },
});

function closeModal() {
  store.dispatch("closeModal");
}

const isButtonDisabled = computed(() => {
  return !checkFormIsValid();
});

let isSubmitting = defineModel("isSubmitting", {
  type: Boolean,
  default: false,
});

const cardName = defineModel("cardName", { type: String, default: "" });
const cardNumber = defineModel("cardNumber", { type: String, default: "" });
const cardExpiresAt = defineModel("cardExpiresAt", {
  type: String,
  default: "",
});
const cardSecurityCode = defineModel("cardSecurityCode", {
  type: String,
  default: "",
});

const {
  error: cardNameError,
  validate: validateCardName,
  validateDebounced: validateCardNameDebounced,
} = useNameValidation(cardName);

const {
  error: cardNumberError,
  validate: validateCardNumber,
  validateDebounced: validateCardNumberDebounced,
} = useBankCardNumberValidation(cardNumber);

const {
  error: cardExpiresAtError,
  validate: validateCardExpiresAt,
  validateDebounced: validateCardExpiresAtDebounced,
} = useBankCardExpiresAtValidation(cardExpiresAt);

const {
  error: cardSecurityCodeError,
  validate: validateCardSecurityCode,
  validateDebounced: validateCardSecurityCodeDebounced,
} = useBankCardSecurityCodeValidation(cardSecurityCode);

function addCard() {
  validateForm();

  const payload = {
    card: {
      expires_at: bankCardExpiresAtStringToDate(cardExpiresAt.value)
        .toISOString()
        .split("T", 1)[0],
      name: cardName.value,
      pan: cardNumber.value.replaceAll(" ", ""),
      security_code: cardSecurityCode.value,
    },
    channel: props.cardType,
  };

  isSubmitting.value = true;

  CardsServices.addBankCard(payload)
    .then(() => {
      closeModal();
      toast.success("Card was added successfully");
      posthogCapture("dashboard_pay_wallet_add_funding_source_success");
    })
    .catch(() => {
      isSubmitting.value = false;
      toast.error(
        "We could not add your funding source. Please double check the card data you provided."
      );
      posthogCapture("dashboard_pay_wallet_add_funding_source_failed");
    });
}

function checkFormIsValid() {
  return (
    cardName.value &&
    cardNumber.value &&
    cardExpiresAt.value &&
    cardSecurityCode.value &&
    !cardNameError.value &&
    !cardNumberError.value &&
    !cardExpiresAtError.value &&
    !cardSecurityCodeError.value
  );
}

function validateForm() {
  validateCardName();
  validateCardNumber();
  validateCardExpiresAt();
  validateCardSecurityCode();
  return checkFormIsValid();
}

watch(() => props.isVisible, { immediate: true });
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <BaseText
        as="h1"
        variant="headline-4-bold"
      >
        Enter Card Information
      </BaseText>
    </template>

    <template #body>
      <form
        class="inputs"
        @input="checkFormIsValid"
        @submit="(e) => e.preventDefault()"
      >
        <BaseInput
          v-model="cardName"
          :error="cardNameError"
          :disabled="isSubmitting"
          title="Name on card*"
          placeholder="Cardholder Name"
          minlength="1"
          maxlength="50"
          class="inputs__input full-width"
          @blur="validateCardName"
          @input="validateCardNameDebounced"
        />

        <BaseInput
          v-model="cardNumber"
          :error="cardNumberError"
          :disabled="isSubmitting"
          title="Number*"
          placeholder="0000 0000 0000 0000"
          minlength="19"
          maxlength="19"
          class="inputs__input full-width"
          @blur="validateCardNumber"
          @input="
            (e) => {
              cardNumber = formatCardNumberField(e); // Mask
              validateCardNumberDebounced(e);
            }
          "
          @keypress="keyPressNumbersOnly"
        />

        <BaseInput
          v-model="cardExpiresAt"
          :error="cardExpiresAtError"
          :disabled="isSubmitting"
          title="Expires at*"
          placeholder="MM/YY"
          minlength="5"
          maxlength="5"
          class="inputs__input"
          @blur="validateCardExpiresAt"
          @input="
            (e) => {
              cardExpiresAt = formatCardExpiresAtField(e); // Mask
              validateCardExpiresAtDebounced(e);
            }
          "
          @keypress="keyPressNumbersOnly"
        />

        <BaseInput
          v-model="cardSecurityCode"
          :error="cardSecurityCodeError"
          :disabled="isSubmitting"
          title="Security code*"
          placeholder="000"
          minlength="3"
          maxlength="4"
          class="inputs__input secure"
          @blur="validateCardSecurityCode"
          @input="validateCardSecurityCodeDebounced"
          @keypress="keyPressNumbersOnly"
        />
      </form>
    </template>

    <template #footer>
      <div class="footer">
        <Button
          class="button-submit"
          :disabled="isButtonDisabled"
          @click="addCard()"
        >
          Submit information

          <BaseIcon name="wallet-filled" />
        </Button>

        <BaseText
          as="span"
          variant="body-small-medium"
          class="secure-info"
        >
          <BaseIcon name="shield-lock" />

          Secure & encrypted – card information protected end-to-end.
        </BaseText>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
.inputs {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;

  &__input {
    align-self: flex-start;
    width: calc(50% - 10px);

    &:first-child {
      margin-top: 0;
    }

    &.full-width {
      width: 100%;
    }

    &.secure {
      // Add styles for BaseInput input
      &:deep(.base-input__input) {
        -webkit-text-security: circle;
        text-security: circle;
      }
    }
  }
}

:deep(.modal-footer) {
  padding-top: 0 !important;
}

.footer {
  display: flex;
  flex-direction: column;
  width: 100%;

  .button-submit {
    width: 100%;
    align-self: center;
    font-size: 0.9em;

    &:deep(.base-icon) {
      font-size: 1.3em;
    }
  }

  .secure-info {
    display: flex;
    margin-top: 20px;
    align-self: center;
    color: $color-primary-30-dark;
    align-items: center;
    gap: 10px;
    line-height: 1;

    &:deep(.base-icon) {
      font-size: 1.8em;
    }
  }
}
</style>
