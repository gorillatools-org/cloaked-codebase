<script setup lang="ts">
import { useTemplateRef } from "vue";
import CheckoutAccountCreation from "@/features/checkout/CheckoutAccountCreation.vue";
import BaseButton from "@/library/BaseButton.vue";

type MobileCheckoutAccountProps = {
  error: string | null;
};

const emit = defineEmits<{
  (e: "continue"): void;
}>();

const props = withDefaults(defineProps<MobileCheckoutAccountProps>(), {
  error: null,
});

const accountCreationRef = useTemplateRef("accountCreationRef");

const handleContinue = async () => {
  const credentials = await accountCreationRef.value?.verifyForm();

  if (!credentials) {
    return;
  }

  emit("continue");
};

defineExpose({
  verifyForm: () => accountCreationRef.value?.verifyForm(),
});
</script>

<template>
  <div class="mobile-checkout-account">
    <CheckoutAccountCreation
      ref="accountCreationRef"
      class="mobile-checkout-account__form"
      :error="props.error"
    />

    <BaseButton
      variant="primary"
      size="lg"
      full-width
      class="mobile-checkout-account__button"
      @click="handleContinue"
    >
      Continue
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.mobile-checkout-account {
  &__form {
    margin-top: -16px;

    :deep(.base-select__title),
    :deep(.base-input__title) {
      color: $color-neutral-700;
    }

    :deep(.base-input__input),
    :deep(.base-select__select) {
      height: 56px;
      border-radius: 12px;
    }

    :deep(.base-input__input:not(.base-input__input--error)),
    :deep(.base-select__select:not(.base-select__select--error)) {
      border: 1.5px solid $color-overlay-neutral-15;

      &:focus {
        border-color: $color-primary-100;
      }

      &::placeholder {
        color: $color-neutral-250;
      }
    }
  }

  &__button {
    margin-top: 20px;
  }
}
</style>
