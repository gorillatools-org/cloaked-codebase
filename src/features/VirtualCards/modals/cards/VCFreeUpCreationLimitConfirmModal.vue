<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import VCCloseModalButton from "../VCCloseModalButton.vue";
import { computed } from "vue";
import store from "@/store";
import useCreationLimit from "../../composables/useCreationLimit";
import BaseMedallion from "@/library/BaseMedallion.vue";

type Props = {
  freeUpCents: number;
};

const emit = defineEmits(["confirm"]);

const props = defineProps<Props>();

const { currencyFormatConfig } = useCreationLimit();

const title = computed(() => {
  return `Free up ${freeUpAmountFormatted.value}?`;
});

const description = computed(() => {
  return `Canceling the selected cards will free up ${freeUpAmountFormatted.value} in available credit. Any future transactions on those cards will be automatically declined.`;
});

const freeUpAmountFormatted = computed(() => {
  return new Intl.NumberFormat("en-US", currencyFormatConfig).format(
    (props.freeUpCents || 0) / 100
  );
});

const closeModal = () => {
  store.dispatch("closeModal");
};

const handleConfirm = () => {
  closeModal();
  emit("confirm");
};
</script>

<template>
  <ModalTemplate
    :show="true"
    width="540px"
    without-header-padding
    without-body-padding
    without-footer-padding
    class="vc-free-up-creation-limit-confirm-modal"
    @close="closeModal"
  >
    <template #body>
      <header class="vc-free-up-creation-limit-confirm-modal__header">
        <BaseMedallion
          icon="question-mark"
          color="safe-zone-blue"
          size="md"
        />
        <VCCloseModalButton
          class="vc-free-up-creation-limit-confirm-modal__header-close-button"
          @close="closeModal"
        />
      </header>
      <div class="vc-free-up-creation-limit-confirm-modal__content">
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="vc-free-up-creation-limit-confirm-modal__title"
        >
          {{ title }}
        </BaseText>
        <BaseText
          as="p"
          variant="headline-5-bold"
          class="vc-free-up-creation-limit-confirm-modal__subtitle"
        >
          {{ description }}
        </BaseText>

        <footer class="vc-free-up-creation-limit-confirm-modal__footer">
          <Button
            type="secondary"
            class="vc-free-up-creation-limit-confirm-modal__footer-cancel-btn"
            @click="closeModal"
          >
            Go back
          </Button>
          <Button
            type="primary"
            class="vc-free-up-creation-limit-confirm-modal__footer-confirm-btn"
            @click="handleConfirm"
          >
            Confirm
          </Button>
        </footer>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 32px;

.vc-free-up-creation-limit-confirm-modal {
  &__header {
    padding-inline: $base-padding;
    padding-top: $base-padding;
    padding-bottom: 8px;

    &-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-inline: $base-padding;
    padding-bottom: $base-padding;
  }

  &__subtitle {
    font-weight: 400;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    width: 100%;

    &-cancel-btn,
    &-confirm-btn {
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
