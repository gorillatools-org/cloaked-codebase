import { computed, toValue, type MaybeRefOrGetter } from "vue";
import store from "@/store";
import useFundingSource from "../../../composables/Wallet/useFundingSource";
import type {
  VirtualCard,
  VirtualCardExpiresAt,
} from "@/types/Wallet/virtual-card";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import {
  parseExpirationDate,
  detectExpiresAtType,
} from "@/features/VirtualCards/utils/expiration-utils";

export default function useVirtualCard(
  card: MaybeRefOrGetter<VirtualCard | string>
) {
  const { fundingSources } = useFundingSource();
  const toast = useToast();
  let abortController: AbortController | null = null;

  const _card = computed<VirtualCard | null>(() => {
    const cardValue = toValue(card);

    if (typeof cardValue === "string") {
      const list = store.state.cards?.cards?.results;
      if (!list) return null;

      const cardFound = list.find((vc: VirtualCard) => vc.id === cardValue);
      if (!cardFound) return null;

      return cardFound as VirtualCard;
    }

    return cardValue;
  });

  const cardId = computed(() => {
    return _card.value?.id;
  });

  const cardIdentity = computed(() => {
    return (
      store.state.localdb?.db_cloaks?.find(
        (item: any) => item.id === _card.value?.identity_id
      ) ?? null
    );
  });

  const cardFundingSource = computed(() => {
    return fundingSources.value?.find(
      (source) => source.id === _card.value?.funding_source
    );
  });

  const cardFundingSourceId = computed(() => {
    return _card.value?.funding_source;
  });

  const isCanceled = computed(() => {
    return _card.value?.canceled;
  });

  const isMerchantLocked = computed(() => {
    return _card.value?.is_merchant_locked;
  });

  const isLocked = computed(() => {
    return (
      _card.value?.state === "locked_by_user" ||
      _card.value?.state === "locked_by_system"
    );
  });

  const canToggleLockState = computed(() => {
    if (_card.value?.state === "locked_by_system") return false;
    return true;
  });

  const lastFourDigits = computed(() => {
    return _card.value?.pan?.slice(-4) || "";
  });

  const expiresAtDate = computed(() => {
    return parseExpirationDate(_card.value?.expires_at);
  });

  const networkExpiresAtDate = computed(() => {
    return parseExpirationDate(_card.value?.network_expires_at);
  });

  const expiresAtDetailed = computed<{
    date: Date | null;
    type: VirtualCardExpiresAt;
    typeLabel: string;
  }>(() => {
    return detectExpiresAtType(
      _card.value?.expires_at,
      _card.value?.network_expires_at
    );
  });

  const getCardInformation = () => {
    if (!_card.value?.identity_id || !_card.value?.id) {
      return Promise.reject(new Error("Card identity or id is missing"));
    }

    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();
    store.commit("currentCard", "");

    return CardsServices.getSingleIdentityCard(
      _card.value.identity_id,
      _card.value.id,
      abortController.signal
    )
      .then(({ data }) => {
        store.commit("currentCard", data);
      })
      .catch((error) => {
        if (error.name !== "AbortError" && error.name !== "CanceledError") {
          toast.error(error);
          throw error;
        }
      })
      .finally(() => {
        abortController = null;
      });
  };

  return {
    card: _card,
    cardIdentity,
    cardFundingSource,
    cardFundingSourceId,
    cardId,
    isCanceled,
    isLocked,
    isMerchantLocked,
    canToggleLockState,
    networkExpiresAtDate,
    expiresAtDate,
    expiresAtDetailed,
    lastFourDigits,
    getCardInformation,
  };
}
