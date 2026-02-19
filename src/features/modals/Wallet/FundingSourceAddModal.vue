<script setup lang="ts">
import useFundingSource from "@/composables/Wallet/useFundingSource";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import store from "@/store";
import { ref, computed } from "vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import { constants, CARD_PROVIDER_TYPE } from "@/scripts/constants";
import type { FundingSourceType } from "@/types/Wallet/funding-source";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const props = defineProps<{
  onAddSuccess?: () => void;
}>();

const { openAddPopup, getProviderIcon, enabledFundingSourceTypes } =
  useFundingSource();

const loadingOption = ref<FundingSourceType | null>(null);

const linkOptions: {
  id: string;
  label: string;
  icon: BaseIconName;
  enabled: boolean;
  onClick: () => void;
}[] = [
  {
    id: constants.CARD_TYPE.CREDIT_CARD,
    label: "Credit card",
    icon: getProviderIcon(CARD_PROVIDER_TYPE.CHECKOUT_FLOW_CREDIT), // Using this value just to get the icon name
    enabled: enabledFundingSourceTypes.value.credit_card,
    onClick: () => {
      handleOptionClick(constants.CARD_TYPE.CREDIT_CARD);
    },
  },
  {
    id: constants.CARD_TYPE.DEBIT_CARD,
    label: "Debit card",
    icon: getProviderIcon(CARD_PROVIDER_TYPE.CHECKOUT_FLOW_DEBIT), // Using this value just to get the icon name
    enabled: enabledFundingSourceTypes.value.debit_card,
    onClick: () => {
      handleOptionClick(constants.CARD_TYPE.DEBIT_CARD);
    },
  },
  {
    id: "ach",
    label: "Bank account",
    icon: getProviderIcon(CARD_PROVIDER_TYPE.CHECKOUT_FLOW_ACH), // Using this value just to get the icon name
    enabled: enabledFundingSourceTypes.value.ach,
    onClick: () => {
      handleOptionClick("ach");
    },
  },
];

const enabledLinkOptions = computed(() => {
  return linkOptions.filter((option) => option.enabled);
});

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};

const handleOptionClick = (type: FundingSourceType) => {
  loadingOption.value = type;
  openAddPopup(type, props.onAddSuccess)
    ?.then(() => {
      closeModal();
    })
    ?.finally(() => {
      loadingOption.value = null;
    });
};
</script>

<template>
  <ModalTemplate
    :show="true"
    @close="closeModal"
  >
    <template #body>
      <header class="fs-add-modal__header">
        <div class="fs-add-modal__header-icon-container">
          <BaseIcon
            class="fs-add-modal__header-icon"
            name="money-filled"
          />
        </div>
        <BaseText
          as="h3"
          variant="headline-3-bold"
          class="fs-add-modal__header-title"
        >
          Link a funding source
        </BaseText>
        <BaseText
          as="p"
          variant="body-3-bold"
          class="fs-add-modal__header-description"
        >
          This is how you’ll pay for your Virtual Card transactions.
        </BaseText>
      </header>
      <div
        class="fs-add-modal__list"
        :class="{ 'fs-add-modal__list--loading': loadingOption !== null }"
      >
        <div
          v-for="option in enabledLinkOptions"
          :key="option.id"
          class="fs-add-modal__list-item"
          :class="{
            'fs-add-modal__list-item--disabled':
              !!loadingOption && loadingOption !== option.id,
          }"
          @click="option.onClick()"
        >
          <div class="fs-add-modal__list-item-infos">
            <template v-if="loadingOption === option.id">
              <div class="fs-add-modal__list-item-loader-container">
                <span class="fs-add-modal__list-item-loader-icon"></span>
              </div>
            </template>
            <template v-else>
              <BaseIcon
                :name="option.icon"
                class="fs-add-modal__list-item-icon"
              />
            </template>
            <BaseText
              as="p"
              variant="headline-6-bold"
              class="fs-add-modal__list-item-label"
            >
              {{ option.label }}
            </BaseText>
          </div>
          <BaseIcon
            name="chevron-right"
            class="fs-add-modal__list-item-chevron"
          />
        </div>
      </div>
      <div class="fs-add-modal__footer">
        <Button
          class="fs-add-modal__footer-btn-close"
          type="primary"
          @click="closeModal"
        >
          Close
        </Button>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
/* stylelint-disable */
$component-name: "fs-add-modal";

.#{$component-name} {
  &__header {
    display: flex;
    flex-direction: column;

    &-title {
      margin-top: 24px;
    }

    &-description {
      margin-top: 8px;
      color: var(--color-primary-70);
    }

    &-icon {
      font-size: 56px;
      font-weight: 200;

      &-container {
        width: 70px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: var(--color-primary-10);
      }
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;

    &-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 64px;
      padding: 16px;
      border-radius: 24px;
      border: 1px solid var(--color-base-black-15);
      box-shadow: 0px 5px 20px 0px rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: border-color 0.15s ease-in-out;

      &:hover,
      .#{$component-name}__list--loading &:not(&--disabled) {
        border-color: var(--color-base-black-50);
      }

      .#{$component-name}__list--loading & {
        pointer-events: none;
      }

      &--disabled {
        opacity: 0.5;
      }

      &-infos {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      &-icon {
        font-size: 24px;
        font-weight: 400;
      }

      &-chevron {
        font-size: 16px;
      }

      &-loader {
        &-container {
          min-width: 24px;
        }

        &-icon {
          display: block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(currentcolor 40%, transparent 70%);
          mask: radial-gradient(closest-side, transparent 70%, black 70%);
          animation: loading 0.5s linear infinite;
        }
      }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;

    &-btn-close {
      width: 79px;
    }
  }
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
