<script setup>
import IconHome from "@/assets/icons/custom-fields/address-types/home.svg";
import IconWork from "@/assets/icons/custom-fields/address-types/work.svg";
import IconPoBox from "@/assets/icons/custom-fields/address-types/po-box.svg";
import IconOther from "@/assets/icons/custom-fields/address-types/other.svg";

defineProps({
  type: {
    type: String,
    validator: (value) => ["home", "work", "po-box", "other"].includes(value),
    default: null,
  },
});

const iconByType = {
  home: IconHome,
  work: IconWork,
  "po-box": IconPoBox,
  other: IconOther,
};
</script>

<template>
  <Component
    :is="iconByType[type]"
    class="custom-field-address-icon"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.custom-field-address-icon {
  color: $color-primary-100;
}
</style>
