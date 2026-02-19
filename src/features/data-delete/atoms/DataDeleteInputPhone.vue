<script setup>
import DataDeleteInput from "@/features/data-delete/atoms/DataDeleteInput.vue";
import { computed } from "vue";
import { parsePhoneNumber } from "awesome-phonenumber";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";

const model = defineModel({
  get(value) {
    const parsedPhoneNumber = parsePhoneNumber(value, { regionCode: "US" });
    const international = parsedPhoneNumber?.number?.international;
    const national = parsedPhoneNumber?.number?.national;

    if (
      ["US", "CA"].includes(parsedPhoneNumber?.regionCode) &&
      national?.length === 14
    ) {
      return `+1 ${national}`;
    }

    if (
      !["US", "CA"].includes(parsedPhoneNumber?.regionCode) &&
      international
    ) {
      return international;
    }

    return value;
  },
  type: String,
});

const parsedPhoneNumber = computed(() => parsePhoneNumber(model.value));

const onFocus = (event) => {
  if (!model.value.trim()) {
    model.value = "+1";

    setTimeout(() =>
      event?.target?.setSelectionRange(model.value.length, model.value.length)
    );
  }
};

const onBlur = () => {
  if (model.value.trim() === "+1") {
    model.value = "";
  }
};
</script>

<template>
  <DataDeleteInput
    v-model="model"
    type="tel"
    autocomplete="tel"
    class="data-delete-phone"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template #after-input>
      <InlineSvg
        v-if="parsedPhoneNumber?.regionCode === 'US'"
        name="flag-usa"
        class="data-delete-phone__country-icon"
      />
      <InlineSvg
        v-else-if="parsedPhoneNumber?.regionCode === 'CA'"
        name="flag-canada"
        class="data-delete-phone__country-icon"
      />
      <BaseText
        v-else-if="parsedPhoneNumber?.regionCode"
        class="data-delete-phone__country-code"
        variant="body-2-semibold"
      >
        {{ parsedPhoneNumber.regionCode }}
      </BaseText>
    </template>
  </DataDeleteInput>
</template>

<style lang="scss" scoped>
.data-delete-phone {
  @at-root {
    :global(.data-delete-phone:has(+ .data-delete-phone__country-icon)),
    :global(.data-delete-phone:has(+ .data-delete-phone__country-code)) {
      padding-left: 20px + 20px + 4px;
    }
  }

  &__country-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
  }

  &__country-code {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    opacity: 0.5;
  }
}
</style>
