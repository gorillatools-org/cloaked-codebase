import { constants } from "@/scripts/constants.js";

function getBankCardProviderType(value) {
  const provider = constants.CARD_PROVIDER_TYPE[value];
  return provider || constants.CARD_PROVIDER_TYPE_UNKNOWN;
}

export { getBankCardProviderType };
