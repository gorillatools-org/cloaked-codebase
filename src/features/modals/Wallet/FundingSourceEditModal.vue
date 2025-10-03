<script setup lang="ts">
import useFundingSource from "@/composables/Wallet/useFundingSource";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import store from "@/store";
import { ref, computed, onMounted } from "vue";
import { useToast } from "@/composables/useToast";
import {
  CARD_LABEL_BY_PROVIDER_TYPE,
  CARD_PROVIDER_TYPE,
} from "@/scripts/constants";
import type { CardProviderType } from "@/types/Wallet/funding-source";
import BaseToggle from "@/library/BaseToggle.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", payload: { nickname?: string }): void;
}>();

const props = defineProps({
  fundingSourceId: {
    type: String,
    required: true,
  },
});

const toast = useToast();
const {
  fundingSources,
  updateNickname,
  updateAutoPay,
  openAutoPayOffConfirmationModal,
} = useFundingSource();

const isSaving = ref(false);
const nickname = ref<string>("");

onMounted(() => {
  if (!fundingSource.value) {
    closeModal();
    toast.error(
      "Oops! Something went wrong. Reach out to support if this persists."
    );
    return;
  }

  nickname.value = fundingSource.value.nickname ?? "";
});

const fundingSource = computed(() => {
  return fundingSources.value?.find(
    (fundingSource) => fundingSource.id === props.fundingSourceId
  );
});

const cardType = computed(() => {
  return CARD_LABEL_BY_PROVIDER_TYPE[
    fundingSource.value?.provider as keyof typeof CARD_LABEL_BY_PROVIDER_TYPE
  ];
});

const canToggleAutoPay = computed(() => {
  const autoPayAllowedProviders = [
    CARD_PROVIDER_TYPE.STRIPE_FLOW_DEBIT,
    CARD_PROVIDER_TYPE.CHECKOUT_FLOW_DEBIT,
    CARD_PROVIDER_TYPE.PLAID_STRIPE_FLOW_ACH,
    CARD_PROVIDER_TYPE.CHECKOUT_FLOW_ACH,
  ] as CardProviderType[];

  return autoPayAllowedProviders.includes(
    fundingSource.value?.provider as CardProviderType
  );
});

const isAutoPayEnabled = computed(() => {
  return fundingSource.value?.is_auto_debit || false;
});

const autoPayDescription = computed(() => {
  return canToggleAutoPay.value
    ? "Automatically funds transactions for your Virtual Cards."
    : "Cannot be disabled for credit-based funding sources.";
});

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};

const handleSave = () => {
  if (!fundingSource.value) {
    toast.error("Oops! We could not find the funding source.");
    return;
  }

  isSaving.value = true;
  updateNickname(props.fundingSourceId, nickname.value)
    .then(() => {
      closeModal();
    })
    .finally(() => {
      isSaving.value = false;
    });
};

const handleAutoPayToggle = () => {
  if (!canToggleAutoPay.value) return;

  if (isAutoPayEnabled.value) {
    openAutoPayOffConfirmationModal(props.fundingSourceId);
    return;
  }

  updateAutoPay(props.fundingSourceId, true);
};
</script>

<template>
  <ModalTemplate
    :show="true"
    @close="closeModal"
  >
    <template #body>
      <header class="fs-edit-modal__header">
        <BaseText
          as="h3"
          variant="headline-3-bold"
          class="fs-edit-modal__header-title"
        >
          Settings
        </BaseText>
      </header>
      <div class="fs-edit-modal__body">
        <div class="fs-edit-modal__input-container">
          <input
            v-model="nickname"
            class="fs-edit-modal__input"
            placeholder="Add nickname"
          />
          <div class="fs-edit-modal__input-card-container">
            <BaseText
              as="p"
              variant="body-small-semibold"
              class="fs-edit-modal__input-card-text"
            >
              •••• {{ fundingSource?.pan_last_four }} • {{ cardType }}
            </BaseText>
          </div>
        </div>
        <div class="fs-edit-modal__auto-pay-container">
          <div class="fs-edit-modal__auto-pay-toggle-container">
            <div class="fs-edit-modal__auto-pay-infos">
              <BaseIcon
                name="refresh"
                class="fs-edit-modal__auto-pay-infos-icon"
              />
              <div class="fs-edit-modal__auto-pay-infos-texts">
                <BaseText
                  as="p"
                  variant="body-3-semibold"
                  class="fs-edit-modal__auto-pay-infos-texts-title"
                >
                  AutoPay
                </BaseText>
                <BaseText
                  as="p"
                  variant="caption-semibold"
                  class="fs-edit-modal__auto-pay-infos-texts-description"
                >
                  {{ autoPayDescription }}
                </BaseText>
              </div>
            </div>
            <div
              class="fs-edit-modal__auto-pay-toggle-container"
              :class="{
                'fs-edit-modal__auto-pay-toggle-container--disabled':
                  !canToggleAutoPay,
              }"
            >
              <BaseToggle
                :active="isAutoPayEnabled"
                class="fs-edit-modal__auto-pay-toggle"
                @click="handleAutoPayToggle"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="fs-edit-modal__footer">
        <div
          class="fs-edit-modal__footer-btn-back-container"
          role="button"
          tabindex="0"
          @click="closeModal"
        >
          <BaseIcon
            name="chevron-left"
            class="fs-edit-modal__footer-btn-back-icon"
          />
          <BaseText
            as="p"
            variant="body-3-semibold"
            class="fs-edit-modal__footer-btn-back-text"
          >
            Back
          </BaseText>
        </div>
        <div class="fs-edit-modal__footer-actions-container">
          <Button
            class="fs-edit-modal__footer-btn-save"
            type="primary"
            :loading="isSaving"
            :disabled="isSaving"
            @click="handleSave"
          >
            Save
          </Button>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
/* stylelint-disable */
$component-name: "fs-edit-modal";

.#{$component-name} {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__alert {
    margin-top: 16px;

    &-actions {
      display: flex;
      justify-content: flex-end;
      padding-left: 12px;

      button {
        width: 75px;
      }
    }
  }

  &__input {
    padding: 20px 16px;
    height: 80px;
    border-radius: 24px;
    width: 100%;
    border: 1px solid $color-base-black-15;
    color: $color-primary-100;
    background-color: $color-base-white-100;
    font-size: 16px;
    font-weight: 700;
    margin-top: 4px;
    padding-right: 150px;
    box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.05);

    &:focus {
      outline: 1px solid $color-primary-100;
    }

    &-container {
      margin-top: 24px;
      position: relative;
    }

    &-card {
      &-container {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(calc(-50% + 3px));
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 24px;
        background-color: $color-primary-5;
        border: 1px solid $color-base-black-5;
      }

      &-text {
        color: $color-primary-100;
      }
    }
  }

  &__auto-pay {
    &-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 8px;
      padding: 20px 16px;
      height: 80px;
      border-radius: 24px;
      width: 100%;
      border: 1px solid $color-base-black-15;
      background-color: $color-base-white-100;
      box-shadow: 0px 4px 24px 0px rgba(0, 0, 0, 0.05);
    }

    &-infos {
      display: flex;
      align-items: center;
      gap: 12px;

      &-icon {
        font-size: 24px;
        font-weight: 400;
      }

      &-texts {
        display: flex;
        flex-direction: column;
        gap: 2px;

        &-description {
          color: $color-primary-50;
        }
      }
    }

    &-toggle-container {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-grow: 1;
      gap: 8px;

      &--disabled {
        opacity: 0.5;

        button {
          cursor: not-allowed;
        }
      }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 24px;

    &-btn-back-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
    }

    &-btn-save {
      width: 79px;
    }

    &-actions-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
