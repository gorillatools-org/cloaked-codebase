import { computed } from "vue";
import { useCloakedPaySubscription } from "@/features/VirtualCards/composables/useCloakedPaySubscription";
import {
  WEBSITE_ID_THEFT_ASSURANT_URL,
  WEBSITE_ID_THEFT_URL,
  IDENTITY_THEFT_PROTECTION_PHONE_CLOAKED_PAY,
  IDENTITY_THEFT_PROTECTION_PHONE_REGULAR,
} from "@/scripts/constants";

/**
 * Composable to get identity theft protection information based on subscription type.
 *
 * Returns different insurance amounts and phone numbers based on whether the user
 * has a Cloaked Pay subscription or a regular subscription.
 */
export function useIdentityTheftProtection() {
  const { isSubscribedToCloakedPay } = useCloakedPaySubscription();

  const insuranceAmount = computed(() => {
    return isSubscribedToCloakedPay.value ? 300_000_000 : 100_000_000;
  });

  const millions = computed(() => {
    return insuranceAmount.value / 100 / 1_000_000;
  });

  const insuranceAmountFormattedMillion = computed(() => {
    return `$${millions.value} million dollars`;
  });

  const insuranceAmountFormattedCoverage = computed(() => {
    return `$${millions.value} million coverage`;
  });

  const insuranceAmountFormattedM = computed(() => {
    return `$${millions.value}M`;
  });

  const phoneNumber = computed(() => {
    return isSubscribedToCloakedPay.value
      ? IDENTITY_THEFT_PROTECTION_PHONE_CLOAKED_PAY
      : IDENTITY_THEFT_PROTECTION_PHONE_REGULAR;
  });

  const termsLink = computed(() => {
    return isSubscribedToCloakedPay.value
      ? WEBSITE_ID_THEFT_ASSURANT_URL
      : WEBSITE_ID_THEFT_URL;
  });

  return {
    insuranceAmount,
    millions,
    insuranceAmountFormattedMillion,
    insuranceAmountFormattedCoverage,
    insuranceAmountFormattedM,
    phoneNumber,
    termsLink,
    isSubscribedToCloakedPay,
  };
}
