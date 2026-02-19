<script setup>
import IconText from "@/assets/icons/custom-fields/text.svg";
import IconAddress from "@/assets/icons/custom-fields/address.svg";
import IconUrl from "@/assets/icons/custom-fields/url.svg";
import IconDate from "@/assets/icons/custom-fields/date.svg";
import IconBank from "@/assets/icons/custom-fields/bank.svg";
import IconAuth from "@/assets/icons/custom-fields/auth.svg";
import IconIdentification from "@/assets/icons/custom-fields/identification.svg";

defineProps({
  type: {
    type: String,
    validator: (value) =>
      [
        "text",
        "address",
        "url",
        "date",
        "bank",
        "auth",
        "identification",
        "secret",
      ].includes(value),
    default: null,
  },
});

const iconByType = {
  text: IconText,
  address: IconAddress,
  url: IconUrl,
  date: IconDate,
  bank: IconBank,
  auth: IconAuth,
  identification: IconIdentification,
};
</script>

<template>
  <Component
    :is="iconByType[type]"
    class="custom-field-icon"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.custom-field-icon {
  color: $color-primary-100;
}
</style>
