<script setup lang="ts">
import store from "@/store";
import BaseButton from "@/library/BaseButton.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { type CSSProperties, type PropType } from "vue";

const emit = defineEmits(["confirm", "cancel"]);
const props = defineProps({
  title: {
    type: String,
    default: "Are you sure of your action?",
  },
  description: {
    type: String,
    default: "Do you confirm your action?",
  },
  icon: {
    type: String,
    default: "trash",
  },
  showCloseInHeader: {
    type: Boolean,
    default: false,
  },
  primaryButtonText: {
    type: String,
    default: "Yes, Confirm",
  },
  secondaryButtonText: {
    type: String,
    default: "Cancel",
  },
  hideSecondaryButton: {
    type: Boolean,
    default: false,
  },
  primaryButtonColor: {
    type: String,
    default: "danger",
  },
  secondaryButtonColor: {
    type: String,
    default: "outline",
  },
  primaryButtonStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
  secondaryButtonStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
});

function closeModal() {
  store.dispatch("closeModal");
}

function handlePrimaryButtonClick() {
  closeModal();
  emit("confirm");
}

function handleSecondaryButtonClick() {
  closeModal();
  emit("cancel");
}
</script>

<template>
  <ModalTemplate
    :show="true"
    prevent-body-scroll
    @close="closeModal"
  >
    <template #header>
      <!-- Close button-->
      <span
        v-if="props.showCloseInHeader"
        role="button"
        tabindex="0"
        class="wallet-confirmation-modal__close-btn"
        @click="closeModal"
      >
        <BaseIcon
          class="wallet-confirmation-modal__close-btn-icon"
          name="close"
        />
      </span>

      <div class="wallet-confirmation-modal__icon-container">
        <div class="wallet-confirmation-modal__icon-background">
          <BaseIcon
            class="wallet-confirmation-modal__icon"
            :name="props.icon as any"
          />
        </div>
      </div>
      <BaseText
        as="h3"
        class="wallet-confirmation-modal__title"
        variant="headline-3-bold"
      >
        {{ props.title }}
      </BaseText>
      <!-- Since the values used in this component are hardcoded, we can use v-html safely-->
      <!-- eslint-disable vue/no-v-html -->
      <!-- eslint-disable vue/no-v-text-v-html-on-component -->
      <BaseText
        as="p"
        variant="headline-6-medium"
        class="wallet-confirmation-modal__description"
        v-html="props.description"
      ></BaseText>
      <!-- eslint-enable vue/no-v-text-v-html-on-component -->
      <!-- eslint-enable vue/no-v-html -->
    </template>

    <template #footer>
      <div class="wallet-confirmation-modal__footer">
        <div
          class="wallet-confirmation-modal__footer-button-container"
          :style="{
            ...props.secondaryButtonStyle,
            visibility: props.hideSecondaryButton ? 'hidden' : 'visible',
          }"
        >
          <BaseButton
            :variant="props.secondaryButtonColor"
            :style="props.secondaryButtonStyle"
            @click="handleSecondaryButtonClick"
          >
            {{ props.secondaryButtonText }}
          </BaseButton>
        </div>
        <div
          class="wallet-confirmation-modal__footer-button-container"
          :style="props.primaryButtonStyle"
        >
          <BaseButton
            :background-color="props.primaryButtonColor"
            @click="handlePrimaryButtonClick"
          >
            {{ props.primaryButtonText }}
          </BaseButton>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$component-name: "wallet-confirmation-modal";

.#{$component-name} {
  &__close-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: $color-base-black-5;
    position: absolute;
    top: 18px;
    right: 18px;
    cursor: pointer;

    &:hover {
      background-color: $color-base-black-10;
    }

    &-icon {
      font-size: 16px;
      color: $color-base-black-100;
    }
  }

  &__icon {
    font-size: 18px;
    color: #fff;

    &-container {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: $color-status-error-15;
    }

    &-icon {
      font-size: 56px;
    }

    &-background {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: $color-status-error;
    }
  }

  &__title {
    margin-top: 8px;
  }

  &__description {
    margin-top: 16px;
    color: var(--color-primary-70);
  }

  &__footer {
    margin-top: 4px;
    width: 100%;
    display: flex;
    gap: 8px;

    &-button-container {
      display: flex;
      flex: 1;

      button {
        width: 100%;
      }
    }
  }
}
</style>
