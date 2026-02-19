<script setup>
import { inject, ref, computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeleteAgreementModal from "@/features/data-delete/DataDeleteAgreementModal.vue";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";

const props = defineProps({
  poaAgreementFlag: {
    type: [String, null],
    default: "permission-to-remove-data",
  },
  size: {
    type: String,
    default: "lg",
    validator: (value) => ["md", "lg"].includes(value),
  },
});

const poaAgreementCopy = {
  "poa-agreement": {
    prefix: "I agree to Cloaked's",
    link: "Data Deletion Agreement",
  },
  "permission-to-scrub-data": {
    prefix: "Give Cloaked",
    link: "permission to scrub",
    postfix: "my data",
  },
  "permission-to-remove-data": {
    prefix: "Give Cloaked",
    link: "permission to remove",
    postfix: "my data",
  },
};

const checkoutSession = inject(checkoutSessionInjectionKey);

const isDisabled = computed(
  () => !!checkoutSession?.status || !!checkoutSession?.isPaid
);

const agreementText = computed(() => {
  const flagValue = props.poaAgreementFlag || "poa-agreement";
  return poaAgreementCopy[flagValue] || poaAgreementCopy["poa-agreement"];
});

const model = computed({
  get: () => checkoutSession?.poaAgreementAccepted ?? true,
  set: (value) => {
    if (checkoutSession) {
      checkoutSession.poaAgreementAccepted = value;
    }
  },
});

const textVariant = computed(() => {
  const variants = {
    md: "footnote-emphasized",
    lg: "body-3-semibold",
  };

  return variants[props.size];
});

const isModalOpen = ref(false);

const onClose = (hasAccepted = false) => {
  isModalOpen.value = false;

  if (hasAccepted) {
    model.value = true;
  }
};
</script>

<template>
  <div
    :class="['checkout-poa-agreement', `checkout-poa-agreement--${props.size}`]"
  >
    <BaseText
      as="label"
      :variant="textVariant"
      class="checkout-poa-agreement__label"
      tabindex="0"
      @keydown.enter="model = !model"
    >
      <div class="checkout-poa-agreement__icon">
        <BaseIcon name="check" />
      </div>
      <input
        v-model="model"
        type="checkbox"
        :disabled="isDisabled"
        class="checkout-poa-agreement__checkbox"
      />
      <span class="checkout-poa-agreement__text">
        {{ agreementText.prefix }}
        <u
          class="checkout-poa-agreement__link"
          @click.stop.prevent="!isDisabled && (isModalOpen = true)"
          @mousedown.stop.prevent
        >
          {{ agreementText.link }}
        </u>
        <template v-if="agreementText.postfix">
          {{ agreementText.postfix }}
        </template>
      </span>
    </BaseText>
    <DataDeleteAgreementModal
      :value="isModalOpen"
      :name="''"
      @close="onClose"
    />
  </div>
</template>

<style scoped lang="scss">
.checkout-poa-agreement {
  &__label {
    cursor: pointer;
    display: flex;
    gap: 8px;
    user-select: none;

    &:hover {
      opacity: 0.8;
    }

    &:focus-visible {
      outline: 1px solid $color-primary-100;
    }
  }

  &__icon {
    width: 18px;
    height: 18px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid $color-base-black-60;

    & > * {
      display: none;
      color: $color-base-white-100;
    }

    @at-root .checkout-poa-agreement:has(
          .checkout-poa-agreement__checkbox:checked
        )
        & {
      background-color: $color-base-black-100;
      border: 1px solid $color-base-black-100;

      & > * {
        display: block;
      }
    }
  }

  &__checkbox {
    display: none;
  }

  &__text {
    color: $color-base-black-60;
    margin-top: -1px;

    @at-root .checkout-poa-agreement:has(
          .checkout-poa-agreement__checkbox:checked
        )
        & {
      color: $color-base-black-70;
    }
  }

  &__link {
    text-decoration: underline;
    cursor: pointer;
    margin-right: 3px;
    color: $color-base-black-100;

    &:hover {
      opacity: 0.8;
    }
  }

  &--md {
    .checkout-poa-agreement__label {
      gap: 6px;
    }

    .checkout-poa-agreement__icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }
  }

  &:has(.checkout-poa-agreement__checkbox:disabled) {
    .checkout-poa-agreement {
      &__label {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &__link {
        cursor: not-allowed;
        color: inherit;
      }
    }
  }
}
</style>
