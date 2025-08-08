<script setup>
import { reactive, computed } from "vue";
import AtomInputCheckbox from "@/library/AtomInputCheckbox.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteAgreementModal from "@/features/data-delete/DataDeleteAgreementModal.vue";

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["agree"]);

const state = reactive({
  checked: false,
  isModalOpen: false,
});

function openAgreement() {
  state.isModalOpen = true;
}

function handleInput(e) {
  state.checked = e;
}

const nameOfTheUser = computed(() => {
  return typeof props.request.name === "string"
    ? props.request.name
    : [props.request?.name?.first, props.request?.name?.last].join(" ").trim();
});
function handleCloseModal(accepted = false) {
  state.isModalOpen = false;
  if (accepted) {
    state.checked = true;
  }
}

function handleConfirm() {
  if (!state.checked) return;
  emit("agree");
}
</script>
<template>
  <div class="delete-flow-terms-footer">
    <DataDeleteAgreementModal
      :value="state.isModalOpen"
      :name="nameOfTheUser"
      @close="handleCloseModal"
    />
    <AtomInputCheckbox
      :value="state.checked"
      @input="handleInput"
    >
      <span class="checkbox-text">
        I agree to Cloaked's
        <u @click.stop.prevent="openAgreement">Data deletion agreement</u>
      </span>
    </AtomInputCheckbox>
    <BaseButton
      fullWidth
      size="lg"
      variant="primary"
      icon="checkmark"
      class="delete-flow-terms-footer__button"
      :class="{ 'delete-flow-terms-footer__button--disabled': !state.checked }"
      @click="handleConfirm"
    >
      Continue
    </BaseButton>
  </div>
</template>
<style scoped lang="scss">
.delete-flow-terms-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 24px;
  width: 100%;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 110%;
    background: linear-gradient(
      180deg,
      rgba($color-base-white-100-dark, 0) 0%,
      rgba($color-base-white-100-dark, 0.9) 50%
    );
    z-index: -1;
  }

  .checkbox-text {
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    color: $color-primary-100;
  }

  &__button {
    max-width: 550px;
    box-shadow: none !important;

    svg {
      height: 20px;
    }

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: $color-primary-10;
      color: $color-primary-50;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }
  }
}
</style>
