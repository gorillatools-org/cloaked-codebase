import { type MaybeRefOrGetter } from "vue";
import CardsServices from "@/api/actions/cards-services";
import IdentityService from "@/api/actions/identity-service";
import type {
  VirtualCard,
  VirtualCardPeriod,
} from "@/types/Wallet/virtual-card";
import useVirtualCard from "./useVirtualCard";
import type { MerchantDropdownModel } from "../VCMerchantDropdown.vue";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";
import useVirtualCardGenerate from "./useVirtualCardGenerate";
import { useRouter } from "vue-router";
import store from "@/store";
import { useToast } from "@/composables/useToast";
import useVirtualCardActionsHandler from "./useVirtualCardActionsHandler";
import {
  CARD_PERIOD_TO_MAX_TRANSACTIONS,
  CARD_PERIOD_TYPE_TO_API_TYPE,
} from "../constants/virtual-card-constants";

export default function useVirtualCardActions(
  card: MaybeRefOrGetter<VirtualCard | string>
) {
  const router = useRouter();
  const toast = useToast();
  const {
    card: _card,
    cardFundingSourceId,
    cardId,
    cardIdentity,
  } = useVirtualCard(card);
  const { generateCardName } = useVirtualCardGenerate();
  const { showErrorMessage, optimisticUpdate } =
    useVirtualCardActionsHandler(card);

  const updateSelfDestructDate = (selfDestructDate: Date) => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    const { rollback } = optimisticUpdate({
      ..._card.value,
      expires_at: selfDestructDate.toISOString(),
    });

    return CardsServices.patchUpdateCloakedCardDetails(_card.value.id, {
      expires_at: selfDestructDate.toISOString(),
    })
      .then((res) => {
        toast.success("Deactivate card date updated");
        return res;
      })
      .catch((err) => {
        showErrorMessage(err, "Failed to update deactivate card date");
        rollback();
        throw err;
      });
  };

  const updateLockState = (state: "unlocked" | "locked_by_user") => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    const { rollback } = optimisticUpdate({ ..._card.value, state });
    const request =
      state === "unlocked" ? CardsServices.unlockCard : CardsServices.lockCard;

    return request(_card.value.identity_id, _card.value.id)
      .then((res) => {
        toast.success(state === "unlocked" ? "Card unlocked" : "Card locked");
        return res;
      })
      .catch((error) => {
        rollback();
        showErrorMessage(
          error,
          `Failed to ${state === "unlocked" ? "unlock" : "lock"} card`
        );
        throw error;
      });
  };

  const updateMerchantLockState = (isLocked: boolean) => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    const { rollback } = optimisticUpdate({
      ..._card.value,
      is_merchant_locked: isLocked,
    });

    return CardsServices.patchUpdateCloakedCardDetails(_card.value.id, {
      is_merchant_locked: isLocked,
    })
      .then((response) => {
        IdentityService.patchIdentityUpdatedAt(_card.value!.identity_id);
        toast.success(
          isLocked ? "Merchant locking enabled" : "Merchant locking disabled"
        );
        return response;
      })
      .catch((error) => {
        showErrorMessage(error, "Failed to update merchant locking state");
        rollback();
        throw error;
      });
  };

  const updateMerchant = (merchant: MerchantDropdownModel) => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    const websiteUrl =
      typeof merchant === "object"
        ? merchant.base_domain || NO_URL_IDENTITY_DOMAIN
        : NO_URL_IDENTITY_DOMAIN;

    const nickname =
      typeof merchant === "object"
        ? merchant.name
        : merchant || generateCardName(cardFundingSourceId.value || "");

    const optimisticUpdatePayload =
      typeof merchant === "object"
        ? {
            identity_name: nickname,
            identity_logo_url: merchant.logo_url ?? "",
          }
        : {
            identity_name: nickname,
            identity_logo_url: "",
          };

    const { rollback } = optimisticUpdate({
      ..._card.value,
      ...optimisticUpdatePayload,
    });

    return IdentityService.updateCloak(_card.value.identity_id, {
      nickname,
    })
      .then(async (response) => {
        await IdentityService.updateCloakWebsite(
          _card.value!.identity_id,
          websiteUrl
        );
        await store.dispatch("fetchPopulatedData", cardIdentity.value);
        toast.success("Virtual Card updated");
        return response;
      })
      .catch((err) => {
        showErrorMessage(err, "Failed to update Virtual Card");
        rollback();
        throw err;
      });
  };

  const cancelCard = () => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    return CardsServices.deleteCard(_card.value.identity_id, _card.value.id)
      .then((res) => {
        return router.push("/virtual-cards/wallet").then(() => {
          toast.success("Virtual Card canceled");
          return res;
        });
      })
      .catch((err) => {
        showErrorMessage(err, "Failed to cancel Virtual Card.");
        throw err;
      });
  };

  const updateCardFundingSource = (replacementFundingSourceId: string) => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    if (!cardFundingSourceId.value) {
      throw new Error(
        `Funding source ID not found for Virtual Card ${cardId.value}`
      );
    }

    return CardsServices.switchFundingSource(
      cardFundingSourceId.value,
      replacementFundingSourceId,
      cardId.value
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        showErrorMessage(error, "Failed to switch funding source");
        throw error;
      });
  };

  const getLightningCheckAmount = (
    includeCard = true,
    replacementFundingSourceId?: string | undefined
  ) => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    return CardsServices.getLightningCheckAmount(
      cardFundingSourceId.value,
      replacementFundingSourceId,
      includeCard ? cardId.value : undefined
    )
      .then((response) => response as { lightning_check_amount: number })
      .catch((error) => {
        showErrorMessage(error, "Failed to get lightning check amount");
        throw error;
      });
  };

  const updateCardLimit = (
    limitCents: number,
    period: VirtualCardPeriod,
    fixedUses?: number
  ) => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    const periodApi = CARD_PERIOD_TYPE_TO_API_TYPE[period];
    const uses =
      period === "fixed" ? fixedUses : CARD_PERIOD_TO_MAX_TRANSACTIONS[period];
    if (!uses) {
      throw new Error(`Invalid uses for period ${period}`);
    }

    const payload = {
      transaction_period_limit: limitCents,
      transaction_period: periodApi,
      transaction_period_max_transactions: uses,
    };

    const { rollback } = optimisticUpdate({
      ..._card.value,
      ...payload,
    });

    return CardsServices.patchUpdateCloakedCardDetails(_card.value.id, payload)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        showErrorMessage(
          error,
          "Something went wrong. Please try again later."
        );
        rollback();
        throw error;
      });
  };

  return {
    updateSelfDestructDate,
    updateLockState,
    updateMerchantLockState,
    updateMerchant,
    cancelCard,
    updateCardFundingSource,
    getLightningCheckAmount,
    updateCardLimit,
  };
}
