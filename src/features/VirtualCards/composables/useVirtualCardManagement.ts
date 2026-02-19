import { ref, type MaybeRefOrGetter } from "vue";
import type {
  VirtualCard,
  VirtualCardExpiresAt,
  VirtualCardPeriod,
} from "@/types/Wallet/virtual-card";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";
import useVirtualCardActions from "@/features/VirtualCards/composables/useVirtualCardActions";
import useVirtualCardModals from "@/features/VirtualCards/composables/useVirtualCardModals";
import { posthogCapture } from "@/scripts/posthog";
import { markRaw } from "vue";
import store from "@/store";
import WalletConfirmationModal from "@/features/modals/Wallet/WalletConfirmationModal.vue";
import useCreationLimit from "./useCreationLimit";
import useVirtualCards from "./useVirtualCards";
import { convertExpiresAtTypeToDate } from "@/features/VirtualCards/utils/expiration-utils";

export default function useVirtualCardManagement(
  card: MaybeRefOrGetter<VirtualCard | string>
) {
  const isCancelingCard = ref(false);
  const { card: _card } = useVirtualCard(card);
  const {
    updateLockState,
    cancelCard,
    updateMerchantLockState,
    updateMerchant,
    updateSelfDestructDate: _updateSelfDestructDate,
    updateCardLimit: _updateCardLimit,
  } = useVirtualCardActions(card);
  const { openManageCardModal } = useVirtualCardModals(card);
  const { refetchCards } = useVirtualCards();
  const { refresh: refreshCreationLimit } = useCreationLimit();

  const lockCard = () => {
    return updateLockState("locked_by_user")
      .then(() => {
        posthogCapture("pay_wallet_lock_card_success");
      })
      .catch(() => {
        posthogCapture("pay_wallet_lock_card_failed");
      });
  };

  const unlockCard = () => {
    return updateLockState("unlocked")
      .then(() => {
        posthogCapture("pay_wallet_unlock_card_success");
      })
      .catch(() => {
        posthogCapture("pay_wallet_unlock_card_failed");
      });
  };

  const lockMerchant = () => {
    return updateMerchantLockState(true)
      .then(() => {
        posthogCapture("pay_wallet_lock_merchant_success");
      })
      .catch(() => {
        posthogCapture("pay_wallet_lock_merchant_failed");
      });
  };

  const unlockMerchant = () => {
    return updateMerchantLockState(false)
      .then(() => {
        posthogCapture("pay_wallet_unlock_merchant_success");
      })
      .catch(() => {
        posthogCapture("pay_wallet_unlock_merchant_failed");
      });
  };

  const updateCardLimit = (
    limitCents: number,
    period: VirtualCardPeriod,
    fixedUses?: number
  ) => {
    return _updateCardLimit(limitCents, period, fixedUses)
      .then(() => {
        refreshCreationLimit();
        posthogCapture("pay_wallet_update_card_limit_success", {
          limit: limitCents,
          period,
        });
      })
      .catch((error) => {
        posthogCapture("pay_wallet_update_card_limit_failed");
        throw error;
      });
  };

  const updateSelfDestructDate = (expiresAtType: VirtualCardExpiresAt) => {
    if (!_card.value) {
      throw new Error("Virtual Card not found");
    }

    const newDate = convertExpiresAtTypeToDate(
      expiresAtType,
      expiresAtType === "when_card_expires"
        ? _card.value.network_expires_at
        : undefined
    );

    return _updateSelfDestructDate(newDate.toDate())
      .then(() => {
        refetchCards(true);
        posthogCapture("pay_wallet_update_self_destruct_date_success", {
          period: expiresAtType,
        });
      })
      .catch(() => {
        posthogCapture("pay_wallet_update_self_destruct_date_failed", {
          period: expiresAtType,
        });
      });
  };

  const showCancelConfirmationModal = (onDeleted?: () => void) => {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(WalletConfirmationModal),
        props: {
          title: "Cancel card",
          description:
            "Are you sure you want to cancel this card? This card's activity will still be accessible should you need to download it later.",
          primaryButtonText: "Yes, cancel card",
          secondaryButtonStyle: { width: "170px", flex: "unset" },
          onConfirm: () => {
            isCancelingCard.value = true;
            cancelCard()
              .then(() => {
                posthogCapture("pay_wallet_cancel_card_success");
                refreshCreationLimit();
                refetchCards(false);
                if (onDeleted) {
                  onDeleted();
                }
              })
              .catch(() => {
                posthogCapture("pay_wallet_cancel_card_failed");
              })
              .finally(() => {
                isCancelingCard.value = false;
              });
          },
        },
      },
    });
  };

  return {
    openManageCardModal,
    showCancelConfirmationModal,
    lockCard,
    unlockCard,
    lockMerchant,
    unlockMerchant,
    updateSelfDestructDate,
    updateMerchant,
    isCancelingCard,
    updateCardLimit,
  };
}
