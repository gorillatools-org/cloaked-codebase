<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

import { computed } from "vue";

const props = defineProps({
  cardType: {
    type: String,
    default: "",
  },
});

const allSupportedTypes = [
  "american express",
  "american-express",
  "amex",
  "diners club",
  "diners-club",
  "discover",
  "hipercard",
  "mastercard",
  "visa",
];

const logoShouldFillSpace = computed(() => {
  if (!props.cardType) {
    return true;
  }

  const isSupportedType = allSupportedTypes.includes(props.cardType);
  const isAmex = ["american express", "american-express", "amex"].includes(
    props.cardType.toLowerCase()
  );
  return isAmex || !isSupportedType;
});

const cardIcon = computed(() => {
  const cardTypeFormatted = (props.cardType || "").toLowerCase();

  if (
    ["american express", "american-express", "amex"].includes(cardTypeFormatted)
  ) {
    return "creditCards/amex_circle";
  } else if (["diners club", "diners-club"].includes(cardTypeFormatted)) {
    return "creditCards/diners-club";
  } else if (cardTypeFormatted === "discover") {
    return "creditCards/discover";
  } else if (cardTypeFormatted === "hipercard") {
    return "creditCards/hipercard";
  } else if (cardTypeFormatted === "mastercard") {
    return "creditCards/mastercard";
  } else if (cardTypeFormatted === "visa") {
    return "creditCards/visa";
  } else {
    return "credit-card-outline";
  }
});
</script>

<template>
  <div
    :class="{ 'add-padding': !logoShouldFillSpace }"
    class="card-icon-wrapper"
  >
    <InlineSvg
      :key="cardIcon"
      :name="cardIcon"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.card-icon-wrapper {
  height: 32px;
  width: 32px;
  border-radius: 16px;
  top: 52px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-primary-5;
  margin-right: 16px;

  &.add-padding {
    svg {
      padding: 3px;
      color: $color-primary-50;
    }
  }

  svg {
    max-width: 32px;
    max-height: 32px;
  }
}
</style>
