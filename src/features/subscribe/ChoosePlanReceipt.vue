<script setup>
import { computed, watch } from "vue";
import { formatPhone } from "@/scripts/format";
import { parsePhoneNumber } from "awesome-phonenumber";
import PersonalInfoServices from "@/api/settings/personal-services";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  recipient: {
    type: String,
    required: true,
  },
});

const model = defineModel({ default: true, type: Boolean });

const formattedRecipient = computed(() => formatPhone(props.recipient));

const internationalRecipient = computed(
  () =>
    parsePhoneNumber(props.recipient, { regionCode: "US" })?.number?.e164 ??
    null
);

watch(
  () => ({
    isChecked: model.value,
    recipient: internationalRecipient.value,
  }),
  ({ isChecked, recipient }) => {
    if (recipient) {
      PersonalInfoServices.setReceiptNumber(isChecked ? recipient : null);
    }
  },
  { immediate: true }
);
</script>

<template>
  <BaseText
    as="label"
    variant="body-3-semibold"
    class="choose-plan-receipt"
  >
    <input
      v-model="model"
      type="checkbox"
      class="choose-plan-receipt__input"
    />
    <span>
      Text my receipt to
      <span class="choose-plan-receipt__recipient">
        {{ formattedRecipient }}
      </span>
    </span>
  </BaseText>
</template>

<style scoped lang="scss">
.choose-plan-receipt {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.9;
  }

  &__input {
    width: 20px;
    height: 20px;
    pointer-events: none;
    position: relative;
    margin: 0;
    background: linear-gradient(46deg, #ff550c 31.04%, #fd9871 100%);
    border-radius: 3px;
    opacity: 0.6;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      z-index: 1;
    }

    &:checked {
      opacity: 1;

      &::after {
        background-image: url("@/assets/icons/checkmark-plain.svg");
        background-position: center;
        background-size: 70%;
        background-repeat: no-repeat;
      }
    }
  }

  &__recipient {
    font-weight: 600;
  }
}
</style>
