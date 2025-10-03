<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import { useBankCardExpiresAtValidation } from "@/composables/validation/useBankCardExpiresAtValidation.js";
import { useBankCardNumberValidation } from "@/composables/validation/useBankCardNumberValidation";
import { useBankCardSecurityCodeValidation } from "@/composables/validation/useBankCardSecurityCodeValidation.js";
import { useNameValidation } from "@/composables/validation/useNameValidation.js";
import Button from "@/features/Button.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import CardLogo from "@/features/creditCards/CardLogo.vue";
import {
  formatCardExpiresAtField,
  formatCardNumberField,
  keyPressNumbersOnly,
} from "@/scripts/format.js";
import { bankCardExpiresAtStringToDate } from "@/scripts/tools.js";
import creditCardType from "credit-card-type";
import store from "@/store";
import { computed, ref, watch } from "vue";
import type { FundingSourceType } from "@/types/Wallet/funding-source";

export type CardFormSubmitPayload = {
  card: {
    expires_at: string;
    name: string;
    pan: string;
    security_code: string;
  };
  channel: FundingSourceType;
};

type Props = {
  cardType: FundingSourceType;
  isSubmitting?: boolean;
  title?: string;
  initialCardName?: string;
};

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", payload: CardFormSubmitPayload): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  title: "Enter Card Information",
  initialCardName: "",
});

const cardName = ref("");
const cardNumber = ref("");
const cardExpiresAt = ref("");
const cardSecurityCode = ref("");

const {
  error: cardNameError,
  validate: validateCardName,
  validateDebounced: validateCardNameDebounced,
} = useNameValidation(cardName);

const {
  error: cardNumberError,
  validate: validateCardNumber,
  validateDebounced: validateCardNumberDebounced,
} = useBankCardNumberValidation(cardNumber, () => {
  if (cardDefinitions.value?.length === 1) {
    return cardDefinitions.value[0].lengths;
  }
  return [16];
});

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

const isFormValid = computed(() => {
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
});

const cardDefinitions = computed(() => {
  return creditCardType(cardNumber.value);
});

const isSubmitDisabled = computed(() => {
  return props.isSubmitting || !isFormValid.value;
});

const onCardNumberInput = (event: Event & { target: HTMLInputElement }) => {
  const cardDefinition =
    cardDefinitions.value?.length === 1 ? cardDefinitions.value[0] : undefined;
  const maxDigits = cardDefinition
    ? Math.max(...cardDefinition.lengths)
    : undefined;
  const gaps = cardDefinition ? cardDefinition.gaps : undefined;

  cardNumber.value = formatCardNumberField(event, maxDigits, gaps);
  validateCardNumberDebounced();
};

const onCardExpiresAtInput = (event: Event & { target: HTMLInputElement }) => {
  cardExpiresAt.value = formatCardExpiresAtField(event);
  validateCardExpiresAtDebounced();
};

function addCard() {
  if (!validateForm()) {
    return;
  }

  const payload: CardFormSubmitPayload = {
    card: {
      expires_at: bankCardExpiresAtStringToDate(cardExpiresAt.value)
        .toISOString()
        .split("T", 1)[0],
      name: cardName.value,
      pan: cardNumber.value.replace(/\s/g, ""),
      security_code: cardSecurityCode.value,
    },
    channel: props.cardType,
  };

  emit("submit", payload);
}

function validateForm() {
  validateCardName();
  validateCardNumber();
  validateCardExpiresAt();
  validateCardSecurityCode();
  return isFormValid.value;
}

function closeModal() {
  store.dispatch("closeModal");
  emit("close");
}

watch(
  () => props.initialCardName,
  () => {
    if (props.initialCardName && !cardName.value) {
      cardName.value = props.initialCardName;
    }
  },
  { immediate: true }
);
</script>

<template>
  <ModalTemplate
    class="fs-card-form-modal"
    :show="true"
    @close="closeModal"
  >
    <template #header>
      <BaseText
        as="h1"
        variant="headline-4-bold"
      >
        {{ title }}
      </BaseText>
      <slot name="subheader" />
    </template>

    <template #body>
      <form
        class="inputs"
        @submit="(e) => e.preventDefault()"
      >
        <BaseInput
          v-model="cardName"
          :error="cardNameError"
          :disabled="props.isSubmitting"
          title="Name on card*"
          placeholder="Cardholder Name"
          minlength="1"
          maxlength="50"
          class="inputs__input full-width"
          @blur="validateCardName"
          @input="validateCardNameDebounced"
        />

        <div class="fs-card-form-modal__card-number-input-container">
          <BaseInput
            v-model="cardNumber"
            :error="cardNumberError"
            :disabled="props.isSubmitting"
            title="Number*"
            placeholder="0000 0000 0000 0000"
            class="inputs__input full-width"
            @blur="validateCardNumber"
            @input="onCardNumberInput"
            @keypress="keyPressNumbersOnly"
          />
          <CardLogo
            v-if="cardDefinitions?.length === 1"
            class="fs-card-form-modal__card-number-input-logo"
            :card-type="cardDefinitions[0].type"
          />
        </div>

        <BaseInput
          v-model="cardExpiresAt"
          :error="cardExpiresAtError"
          :disabled="props.isSubmitting"
          title="Expires at*"
          placeholder="MM/YY"
          minlength="5"
          maxlength="5"
          class="inputs__input"
          @blur="validateCardExpiresAt"
          @input="onCardExpiresAtInput"
          @keypress="keyPressNumbersOnly"
        />

        <BaseInput
          v-model="cardSecurityCode"
          :error="cardSecurityCodeError"
          :disabled="props.isSubmitting"
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
        <slot name="footer-before-submit" />
        <Button
          class="button-submit"
          :disabled="isSubmitDisabled"
          @click="addCard()"
        >
          Submit information
          <InlineSvg
            v-if="props.isSubmitting"
            name="spinner"
          />
          <BaseIcon
            v-else
            name="wallet-filled"
          />
        </Button>

        <slot name="footer-after-submit" />

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
/* stylelint-disable */
.fs-card-form-modal {
  :deep(.modal-body) {
    padding-block: 25px !important;
  }

  &__card-number-input {
    &-container {
      width: 100%;
      position: relative;
    }

    &-logo {
      position: absolute;
      right: 0;
      top: 46px;
      transform: translateY(-50%);
      background-color: $color-white;
      color: #000;

      @at-root .theme-light & {
        border: 1px solid $color-primary-20;
      }
    }
  }
}

.inputs {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;

  &__input {
    align-self: flex-start;
    width: calc(50% - 10px);

    // Override BaseInput style due to lack of visibility
    &:deep(.base-input__input) {
      @at-root .theme-dark & {
        border-color: $color-primary-10;

        &:hover {
          border-color: $color-primary-20;
        }

        &:active,
        &:focus {
          border-color: $color-primary-100;
        }
      }
    }

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
