import IdentityService from "@/api/actions/identity-service";
import CardsServices from "@/api/actions/cards-services";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";
import store from "@/store";
import useFundingSource from "./useFundingSource";
import { capitalizeFirstLetter } from "@/scripts/format";

type TransactionPeriod = "daily" | "weekly" | "monthly" | "forever";
type CardType = "MULTI_USE" | "SINGLE_USE";

type CreateIdentityParams = {
  nickname?: string;
  website_url?: string;
};

type GenerateCardRequestParams = {
  type: CardType;
  funding_source: string;
  transaction_period_limit: number; // Cents
  transaction_period: TransactionPeriod;
  currency?: string | "usd";
  valid_for_months?: number; // Default 24 months
  transaction_period_max_transactions?: number;
};

export type GenerateCardParams = CreateIdentityParams &
  GenerateCardRequestParams & {
    identity_id?: number;
  };

export default function useVirtualCardGenerate() {
  const MAX_TRANSACTIONS_PER_TYPE: Record<CardType, number> = {
    MULTI_USE: 100,
    SINGLE_USE: 1,
  };

  const generateCard = async (
    params: GenerateCardParams
  ): Promise<{ cardId: string; identityId: number }> => {
    if (!params.funding_source) throw new Error("Missing funding_source");
    if (
      !params.transaction_period_limit ||
      params.transaction_period_limit <= 0
    )
      throw new Error("Invalid amount");

    const requestBody = {
      type: params.type,
      currency: params.currency || ("usd" as const),
      funding_source: params.funding_source,
      transaction_period_limit: Math.trunc(params.transaction_period_limit),
      transaction_period: params.transaction_period,
      valid_for_months: params.valid_for_months || 24,
      transaction_period_max_transactions:
        params.transaction_period_max_transactions ||
        MAX_TRANSACTIONS_PER_TYPE[params.type],
    };

    // Create identity if it's not provided
    let finalIdentityId = params.identity_id;
    if (!finalIdentityId) {
      finalIdentityId = await _createIdentity({
        website_url: params.website_url || NO_URL_IDENTITY_DOMAIN,
        nickname: params.nickname || generateCardName(params.funding_source),
      });
    }

    try {
      const cardId = await _createIdentityCard(finalIdentityId!, requestBody);
      return { cardId, identityId: finalIdentityId };
    } catch (error: any) {
      // If the identity was created in this call and card creation failed, delete the identity
      if (!params.identity_id && finalIdentityId) {
        await IdentityService.deleteCloak(finalIdentityId);
      }

      let errorMessage =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "";

      if (errorMessage.includes("throttled")) {
        errorMessage = "Sorry, that didn't work. Try again in a few minutes";
      }

      throw new Error(errorMessage || "Failed to generate Virtual Card");
    }
  };

  const _createIdentity = async (body: CreateIdentityParams) => {
    const response = await IdentityService.createIdentity(body);
    return response.data.id as number;
  };

  const _createIdentityCard = async (
    identityId: number,
    body: GenerateCardRequestParams
  ) => {
    const response = await CardsServices.createIdentityCard(identityId, body);
    return response.data.id as string;
  };

  // Utility functions
  function generateCardName(fundingSourceId: string) {
    const { fundingSources } = useFundingSource();

    if (!fundingSourceId) {
      throw new Error("fundingSourceId is required");
    }

    const sourceCardBrand =
      fundingSources.value?.find((source) => source.id === fundingSourceId)
        ?.card_brand || "";

    const capitalizedSourceCardBrand =
      capitalizeFirstLetter(sourceCardBrand) || "Unknown";

    const cardsNames = store.state.cards.cards.results.map(
      (card: any) => card.identity_name
    );

    let generatedCardName = `${capitalizedSourceCardBrand}`;

    let i = 1;
    do {
      generatedCardName = `${capitalizedSourceCardBrand} ${i}`;
      i++;
    } while (cardsNames.includes(generatedCardName));

    return generatedCardName;
  }

  return { generateCard };
}
