<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import VCCloseModalButton from "../VCCloseModalButton.vue";
import { ref, computed, watch, markRaw } from "vue";
import store from "@/store";
import useCreationLimit from "../../composables/useCreationLimit";
import useVirtualCards from "../../composables/useVirtualCards";
import VCCardSelectableRowItem from "../../Wallet/VCCardSelectableRowItem.vue";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import type { VirtualCard } from "@/types/Wallet/virtual-card";
import moment from "moment";
import VCBaseAlert from "../../base/VCBaseAlert.vue";
import NumberFlow from "@number-flow/vue";
import VCFreeUpCreationLimitConfirmModal from "./VCFreeUpCreationLimitConfirmModal.vue";
import { posthogCapture } from "@/scripts/posthog";

const {
  limitFormatted,
  currencyFormatConfig,
  refresh: refreshCreationLimit,
  isNearLimit,
} = useCreationLimit();
const { cardsList, refetchCards } = useVirtualCards();
const isCancelingCards = ref(false);
const selectedCardsId = ref<string[]>([]);
const localCards = ref<any[]>([]);
const toast = useToast();

const isCancelButtonDisabled = computed(() => {
  return selectedCardsId.value.length === 0 || isCancelingCards.value;
});

const title = computed(() => {
  if (isNearLimit.value) {
    return `You're nearing your card creation limit of ${limitFormatted.value}.`;
  }
  return `You've reached your card creation limit of ${limitFormatted.value}.`;
});

const description = computed(() => {
  if (isNearLimit.value) {
    return `You're within $100 of your limit. Cancel cards below to free up space.`;
  }
  return "Free up space by canceling cards you no longer need.";
});

const cards = computed(() => {
  const list = localCards.value;
  if (!list || list.length <= 1) return list;

  // 1) Oldest → newest
  const chronological = [...list].sort(
    (a, b) => moment(a.created_at).valueOf() - moment(b.created_at).valueOf()
  );

  // 2) Split into oldest/recent halves
  const splitIndex = Math.ceil(chronological.length / 2);
  const oldestHalf = chronological.slice(0, splitIndex);
  const recentHalf = chronological.slice(splitIndex);

  // 3) In each half, split into "most" (top half by limit) and "least"
  const splitMostLeast = (_cards: VirtualCard[]) => {
    if (_cards.length <= 1) return [_cards, []] as const;
    const byLimitDesc = [..._cards].sort(
      (a, b) => b.transaction_period_limit - a.transaction_period_limit
    );
    const half = Math.ceil(byLimitDesc.length / 2);
    return [byLimitDesc.slice(0, half), byLimitDesc.slice(half)] as const;
  };

  const [oldestMost, oldestLeast] = splitMostLeast(oldestHalf);
  const [recentMost, recentLeast] = splitMostLeast(recentHalf);

  return [...oldestMost, ...oldestLeast, ...recentMost, ...recentLeast];
});

const freeUpCents = computed(() => {
  return selectedCardsId.value.reduce((acc, id) => {
    const card = localCards.value.find((_card) => _card.id === id);
    return acc + (card?.transaction_period_limit || 0);
  }, 0);
});

const closeModal = () => {
  store.dispatch("closeModal");
};

const openConfirmationModal = () => {
  posthogCapture(
    "dashboard_pay_wallet_free_up_creation_limit_cancel_cards_button_clicked"
  );
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(VCFreeUpCreationLimitConfirmModal),
      props: {
        freeUpCents: freeUpCents.value,
        onConfirm: cancelSelectedCards,
      },
    },
  });
};

const cancelSelectedCards = async () => {
  if (!selectedCardsId.value.length) return;

  posthogCapture(
    "dashboard_pay_wallet_free_up_creation_limit_cancel_cards_confirmed"
  );

  isCancelingCards.value = true;

  try {
    for (const id of selectedCardsId.value) {
      const card = localCards.value.find((_card) => _card.id === id);
      if (!card) continue;

      await CardsServices.deleteCard(card.identity_id, card.id);
      const index = localCards.value.findIndex((_card) => _card.id === id);
      if (index !== -1) {
        localCards.value.splice(index, 1);
      }
    }
  } catch (error: any) {
    posthogCapture(
      "dashboard_pay_wallet_free_up_creation_limit_cancel_cards_failed"
    );
    toast.error(
      error?.response?.data?.message || "Failed to cancel Virtual Card."
    );
  } finally {
    setTimeout(() => {
      void refreshCreationLimit();
      void refetchCards(false);
      isCancelingCards.value = false;
      selectedCardsId.value = [];
      toast.success("Cards successfully canceled");
      posthogCapture(
        "dashboard_pay_wallet_free_up_creation_limit_cancel_cards_success"
      );
      closeModal();
    }, 300);
  }
};

function formatCentsToUsd(amountInCents: number) {
  return new Intl.NumberFormat("en-US", currencyFormatConfig).format(
    (amountInCents || 0) / 100
  );
}

function isSelected(cardId: string) {
  return selectedCardsId.value.includes(cardId);
}

function toggleSelection(cardId: string) {
  const idx = selectedCardsId.value.indexOf(cardId);
  if (idx >= 0) {
    selectedCardsId.value.splice(idx, 1);
  } else {
    selectedCardsId.value.push(cardId);
  }
}

watch(
  () => cardsList.value,
  (val) => {
    localCards.value = Array.isArray(val) ? [...val] : [];
  },
  { immediate: true }
);
</script>

<template>
  <ModalTemplate
    :show="true"
    :prevent-close="isCancelingCards"
    width="540px"
    without-header-padding
    without-body-padding
    without-footer-padding
    class="vc-free-up-creation-limit-modal"
    :class="{ 'vc-free-up-creation-limit-modal--canceling': isCancelingCards }"
    @close="closeModal"
  >
    <template #header>
      <header class="vc-free-up-creation-limit-modal__header">
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="vc-free-up-creation-limit-modal__header-title"
        >
          {{ title }}
        </BaseText>
        <BaseText
          as="p"
          variant="body-3-regular"
          class="vc-free-up-creation-limit-modal__header-subtitle"
        >
          {{ description }}
        </BaseText>
        <VCCloseModalButton
          class="vc-free-up-creation-limit-modal__header-close-button"
          @close="closeModal"
        />
      </header>
    </template>
    <template #body>
      <div class="vc-free-up-creation-limit-modal__body">
        <transition-group
          class="vc-free-up-creation-limit-modal__cards-list"
          name="list-item-fade"
          tag="div"
        >
          <div
            v-for="card in cards"
            :key="card.id"
            class="vc-free-up-creation-limit-modal__card"
          >
            <VCCardSelectableRowItem
              :card-id="card.id"
              :loading="isCancelingCards && selectedCardsId.includes(card.id)"
              :disabled="isCancelingCards && !selectedCardsId.includes(card.id)"
              :selected="isSelected(card.id)"
              :description="
                'Free up ' +
                formatCentsToUsd(card.transaction_period_limit || 0)
              "
              @select="toggleSelection(card.id)"
            />
          </div>
        </transition-group>
      </div>
    </template>

    <template #footer>
      <footer class="vc-free-up-creation-limit-modal__footer">
        <VCBaseAlert
          v-if="freeUpCents > 0 && !isCancelingCards"
          color="success"
          icon="money"
        >
          <BaseText
            as="p"
            variant="body-3-semibold"
            class="vc-free-up-creation-limit-modal__footer-alert-text"
          >
            Free up
            <NumberFlow
              :format="currencyFormatConfig"
              :value="freeUpCents / 100"
            />
            of your limit.
          </BaseText>
        </VCBaseAlert>
        <!-- Trick to keep the button aligned to the end -->
        <span v-else></span>
        <Button
          type="primary"
          :disabled="isCancelButtonDisabled"
          class="vc-free-up-creation-limit-modal__footer-cancel-btn"
          @click="openConfirmationModal"
        >
          Cancel Selected Cards
        </Button>
      </footer>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 36px;

.vc-free-up-creation-limit-modal {
  &--canceling {
    pointer-events: none;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-inline: $base-padding;
    padding-top: $base-padding;
    padding-bottom: 16px;

    &-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  &__body {
    padding-inline: $base-padding;
  }

  &__cards-list {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  &__card {
    overflow: hidden;
    margin-bottom: 8px; // Used as gap, to enable smooth spacing transitions
    max-height: 200px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding-inline: $base-padding;
    padding-bottom: $base-padding;
    width: 100%;
    padding-top: 16px;

    &-cancel-btn {
      font-size: 14px;
      font-weight: 600;
    }

    &-alert-text {
      display: inline;
    }
  }
}

.list-item-fade-move {
  transition:
    transform 210ms cubic-bezier(0.4, 0, 0.2, 1),
    margin 210ms cubic-bezier(0.4, 0, 0.2, 1);
}

.list-item-fade-enter-active,
.list-item-fade-leave-active {
  transition:
    opacity 210ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 210ms cubic-bezier(0.4, 0, 0.2, 1),
    max-height 210ms cubic-bezier(0.4, 0, 0.2, 1),
    margin-bottom 210ms cubic-bezier(0.4, 0, 0.2, 1);
}

.list-item-fade-enter-from,
.list-item-fade-leave-to {
  opacity: 0;
  transform: translateX(15px) scale(0.98);
  max-height: 0;
  margin-bottom: 0;
}
</style>
