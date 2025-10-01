<script setup>
import { ref, toRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeleteAgreementModal from "@/features/data-delete/DataDeleteAgreementModal.vue";
import { useFormattedName } from "@/features/enrollment/composables.js";

const props = defineProps({
  firstName: {
    type: String,
    default: null,
  },
  middleName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
});

const model = defineModel({ type: Boolean });

const formattedName = useFormattedName(
  toRef(() => props.firstName),
  toRef(() => props.middleName),
  toRef(() => props.lastName)
);

const isModalOpen = ref(false);

const onClose = (hasAccepted = false) => {
  isModalOpen.value = false;

  if (hasAccepted) {
    model.value = true;
  }
};
</script>

<template>
  <div class="enrollment-agreement">
    <BaseText
      as="label"
      variant="body-small-medium"
      class="enrollment-agreement__label"
      tabindex="0"
      @keydown.enter="model = !model"
    >
      <input
        v-model="model"
        type="checkbox"
        class="enrollment-agreement__checkbox"
      />
      <BaseIcon
        name="check-square-filled"
        class="enrollment-agreement__checked"
      />
      <BaseIcon
        name="square-radio"
        class="enrollment-agreement__unchecked"
      />
      I agree to Cloaked's
      <u @click.prevent="isModalOpen = true">Data deletion agreement</u>
    </BaseText>
    <DataDeleteAgreementModal
      :value="isModalOpen"
      :name="formattedName"
      @close="onClose"
    />
  </div>
</template>

<style scoped lang="scss">
.enrollment-agreement {
  &__label {
    cursor: pointer;
    display: block;

    &:hover {
      opacity: 0.8;
    }

    &:focus-visible {
      outline: 1px solid $color-primary-100;
    }
  }

  &__checkbox {
    display: none;
  }

  &__checked {
    width: 20px;
    height: 20px;
    font-size: 20px;
    display: none;
    margin-right: 6px;
    margin-bottom: 4px;
    vertical-align: middle;

    @at-root .enrollment-agreement__checkbox:checked ~ & {
      display: inline-block;
    }
  }

  &__unchecked {
    width: 20px;
    height: 20px;
    font-size: 20px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
    margin-bottom: 4px;

    @at-root .enrollment-agreement__checkbox:checked ~ & {
      display: none;
    }
  }
}
</style>
