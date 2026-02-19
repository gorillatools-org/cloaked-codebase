<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import store from "@/store";
import { computed, ref, watch, useTemplateRef, onMounted } from "vue";
import type { VirtualCardPeriod } from "@/types/Wallet/virtual-card";
import VCCloseModalButton from "../VCCloseModalButton.vue";
import Button from "@/features/Button.vue";
import VCBaseAmountInput from "../../base/VCBaseAmountInput.vue";
import VCBaseDropdownSelect from "../../base/VCBaseDropdownSelect.vue";
import useVirtualCardLimit from "../../composables/useVirtualCardLimit";
import VCBaseCircularProgress from "@/features/VirtualCards/base/VCBaseCircularProgress.vue";
import { formatCurrency } from "../../utils/currency-utils";
import { DEFAULT_FIXED_USES } from "../../constants/virtual-card-constants";
import useVirtualCardManagement from "../../composables/useVirtualCardManagement";
import { useToast } from "@/composables/useToast";

type Props = {
  cardId: string;
};

const emit = defineEmits(["close", "created"]);
const props = defineProps<Props>();

const MIN_LIMIT_CENTS = 100; // $1.00 in cents

const cardBorderConfig = {
  borderRadius: 30,
};

const { updateCardLimit } = useVirtualCardManagement(() => props.cardId);
const {
  limit: currentLimit,
  periodOptions,
  period: cardPeriod,
  transactionsLimit,
  spent,
  availableLimitPercentage,
} = useVirtualCardLimit(() => props.cardId);
const toast = useToast();
const isUpdating = ref(false);
const newLimit = ref<number>(currentLimit.value / 100);
const period = ref<VirtualCardPeriod | "unknown">(cardPeriod.value);
const fixedUses = ref<number>(1);

const fixedUseInputRef =
  useTemplateRef<typeof VCBaseAmountInput>("fixedUseInputRef");

const defaultFixedUses = computed(() => {
  const _default = DEFAULT_FIXED_USES;
  if (cardPeriod.value !== "fixed") {
    return _default;
  }

  return transactionsLimit.value || _default;
});

const isUpdateBtnDisabled = computed(() => {
  if (isFixedPeriod.value && fixedUses.value < 1) {
    return true;
  }

  return isUpdating.value || newLimitCents.value < MIN_LIMIT_CENTS;
});

const isFixedPeriod = computed(() => {
  return period.value === "fixed";
});

const newLimitCents = computed(() => Math.round((newLimit.value || 0) * 100));

const availableToSpend = computed(
  () => (newLimitCents.value || 0) - (spent.value || 0)
);

const availableToSpendFormatted = computed(() =>
  formatCurrency(availableToSpend.value)
);
const newLimitFormatted = computed(() => formatCurrency(newLimitCents.value));

const availableToSpendPercentage = computed(() => {
  if (!newLimitCents.value) return 0;

  return Math.max(
    0,
    Math.min(100, (availableToSpend.value / newLimitCents.value) * 100)
  );
});

const progress = computed(() => {
  if (isUpdating.value) {
    return availableToSpendPercentage.value;
  }

  // Decrease or equal: decrease the current progress and don't show extra
  if (newLimitCents.value <= currentLimit.value) {
    return availableToSpendPercentage.value;
  }
  // Increase: keep current progress, show extra
  return availableLimitPercentage.value;
});

const extraProgresses = computed(() => {
  const isNewLimitOverCurrent = newLimitCents.value > currentLimit.value;
  return [
    {
      progress:
        isNewLimitOverCurrent || isUpdating.value
          ? availableToSpendPercentage.value || 0
          : 0,
      startAtPercent: 0,
      color: "var(--extra-progress-color)",
      strokeWidth: 5,
      class: "vc-card-limit-modal__extra-progress",
    },
  ];
});

onMounted(() => {
  fixedUses.value = defaultFixedUses.value;
});

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};

const handleUpdate = () => {
  if (period.value === "unknown") {
    toast.error("Please select a valid period");
    return;
  }

  isUpdating.value = true;

  setTimeout(() => {
    updateCardLimit(
      newLimitCents.value,
      period.value as VirtualCardPeriod,
      isFixedPeriod.value ? fixedUses.value : undefined
    )
      .then(() => {
        closeModal();
      })
      .catch(() => {
        isUpdating.value = false;
      });
  }, 200); // Transition delay
};

watch(period, async () => {
  if (isFixedPeriod.value) {
    fixedUses.value = defaultFixedUses.value;

    setTimeout(() => {
      fixedUseInputRef.value?.focus();
    }, 170); // Wait for the input transition
  }
});
</script>

<template>
  <ModalTemplate
    :show="true"
    :prevent-escape-on-input-focus="true"
    width="520px"
    without-header-padding
    without-body-padding
    class="vc-card-limit-modal"
    :class="{ 'vc-card-limit-modal--creating': isUpdating }"
    @close="closeModal"
  >
    <template #header>
      <header class="vc-card-limit-modal__header">
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="vc-card-limit-modal__header-title"
        >
          Card Limit
        </BaseText>
        <VCCloseModalButton
          class="vc-card-limit-modal__header-close-button"
          @close="closeModal"
        />
      </header>
    </template>
    <template #body>
      <div class="vc-card-limit-modal__body">
        <div class="vc-card-limit-modal__progress">
          <VCBaseCircularProgress
            :progress="progress"
            :size="210"
            :stroke="5"
            :animate-on-mount="false"
            :debounce-timeout="400"
            :extra-progresses="extraProgresses"
          >
            <div class="vc-card-limit-modal__progress-content">
              <BaseText
                as="p"
                variant="headline-6-medium"
                class="vc-card-limit-modal__progress-subtitle"
              >
                Available to spend
              </BaseText>
              <BaseText
                as="p"
                variant="headline-2-semibold"
                class="vc-card-limit-modal__progress-amount"
              >
                {{ availableToSpendFormatted }}
              </BaseText>
              <BaseText
                as="p"
                variant="headline-6-medium"
                class="vc-card-limit-modal__progress-of"
              >
                of {{ newLimitFormatted }}
              </BaseText>
            </div>
          </VCBaseCircularProgress>
        </div>
        <div class="vc-card-limit-modal__amount-container">
          <VCBaseAmountInput
            v-model="newLimit"
            before-icon="money"
            placeholder="$25"
            :min="MIN_LIMIT_CENTS / 100"
            :border-radius="cardBorderConfig.borderRadius"
            container-class="vc-card-limit-modal__amount-input-container"
            background-color="white-100"
          >
            <template #after>
              <VCBaseDropdownSelect
                v-model="period"
                open-width="140px"
                :options="periodOptions"
              />
            </template>
          </VCBaseAmountInput>
          <Transition name="uses-input-fade">
            <div
              v-if="isFixedPeriod"
              class="vc-card-limit-modal__uses-input-container"
            >
              <VCBaseAmountInput
                ref="fixedUseInputRef"
                v-model="fixedUses"
                :min="1"
                :min-error-message="'Uses must be at least one'"
                before-icon="square-grid"
                placeholder="5"
                type="integer"
                :border-radius="cardBorderConfig.borderRadius"
                background-color="white-100"
              >
                <template #after>
                  <BaseText
                    class="vc-card-limit-modal__uses-input-after-text"
                    variant="headline-6-bold"
                  >
                    Uses
                  </BaseText>
                </template>
              </VCBaseAmountInput>
            </div>
          </Transition>
        </div>
      </div>
      <footer class="vc-card-limit-modal__footer">
        <Button
          type="primary"
          class="vc-card-limit-modal__footer-update-btn"
          :loading="isUpdating"
          :disabled="isUpdateBtnDisabled"
          @click="handleUpdate"
        >
          Update
        </Button>
      </footer>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 32px;

.vc-card-limit-modal {
  --extra-progress-color: #{$color-safe-zone-blue};

  &--creating {
    pointer-events: none;
  }

  &__header {
    padding-top: 32px;
    padding-bottom: 8px;
    padding-inline: $base-padding;

    &-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 24px;
    padding-inline: $base-padding;
  }

  &__progress {
    display: flex;
    align-items: center;
    justify-content: center;

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    &-subtitle {
      color: $color-primary-50;
    }

    &-amount {
      max-width: 170px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-of {
      color: $color-primary-50;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__amount-input-container {
    z-index: 3;
    margin-top: 18px;
  }

  &__uses-input {
    &-container {
      margin-top: 6px;
    }

    &-after-text {
      font-weight: 500;
      color: $color-primary-50;
    }
  }

  &__amount {
    &-container {
      padding-bottom: 16px;
    }

    &-description {
      margin-top: 8px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
    padding-inline: $base-padding;
    padding-bottom: calc($base-padding + 8px);

    &-card-id-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-update-btn {
      width: 120px;
      font-size: 14px;
      font-weight: 600;
    }

    &-card-id-text {
      margin-left: -4px;
    }
  }
}

.uses-input-fade-enter-active,
.uses-input-fade-leave-active {
  transition:
    opacity 0.16s ease-out,
    transform 0.12s ease-out,
    filter 0.16s ease-out,
    max-height 0.16s ease-out;
  overflow: hidden;
}

.uses-input-fade-enter-from {
  opacity: 0.2;
  transform: translateY(-5px);
  transform-origin: top;
  max-height: 0;
  filter: blur(3px);
}

.uses-input-fade-leave-to {
  opacity: 0.2;
  transform: translateY(-5px);
  transform-origin: top;
  max-height: 0;
  filter: blur(3px);
}

.uses-input-fade-enter-to,
.uses-input-fade-leave-from {
  max-height: 100px;
  filter: blur(0);
}

:deep(.vc-card-limit-modal__extra-progress) {
  animation: breathe 1.5s ease-in-out infinite;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.15;
  }

  50% {
    opacity: 0.6;
  }
}
</style>
