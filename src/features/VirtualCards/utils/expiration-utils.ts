import moment from "moment";
import type { VirtualCardExpiresAt } from "@/types/Wallet/virtual-card";
import { EXPIRATION_DESCRIPTIONS } from "../constants/virtual-card-constants";

/**
 * Converts a VirtualCardExpiresAt type to a moment date
 */
export function convertExpiresAtTypeToDate(
  expiresAtType: VirtualCardExpiresAt,
  networkExpiresAt?: string
): moment.Moment {
  let newDate = moment.utc();

  switch (expiresAtType) {
    case "24_hours":
      newDate = newDate.add(24, "hour");
      break;
    case "90_days":
      newDate = newDate.add(90, "day");
      break;
    case "1_year":
      newDate = newDate.add(1, "year");
      break;
    case "when_card_expires":
      if (!networkExpiresAt) {
        throw new Error(
          "networkExpiresAt is required when expiresAtType is 'when_card_expires'"
        );
      }
      newDate = moment.utc(networkExpiresAt);
      break;
    case "custom":
      throw new Error("Custom expiration dates must be provided directly");
    default:
      throw new Error(`Unsupported expiresAtType: ${expiresAtType}`);
  }

  return newDate;
}

/**
 * Detects which VirtualCardExpiresAt type a given date matches
 */
export function detectExpiresAtType(
  expiresAt: string | null | undefined,
  networkExpiresAt?: string | null | undefined
): {
  date: Date | null;
  type: VirtualCardExpiresAt;
  typeLabel: string;
} {
  const expiresAtMoment = moment.utc(expiresAt);

  if (!expiresAtMoment.isValid() || !expiresAt) {
    return {
      date: null,
      type: "custom",
      typeLabel: EXPIRATION_DESCRIPTIONS["custom"],
    };
  }

  // Check if the network expires at is valid and the same as the card expires at
  const networkExpiresAtMoment = moment.utc(networkExpiresAt);
  if (
    networkExpiresAtMoment.isValid() &&
    networkExpiresAt &&
    expiresAtMoment.toISOString() === networkExpiresAtMoment.toISOString()
  ) {
    return {
      date: expiresAtMoment.toDate(),
      type: "when_card_expires",
      typeLabel: EXPIRATION_DESCRIPTIONS["when_card_expires"],
    };
  }

  let type: VirtualCardExpiresAt = "custom";

  const now = moment.utc();
  const today = now.clone().startOf("day");
  const expiresAtDay = expiresAtMoment.clone().startOf("day");

  const hoursDiff = expiresAtMoment.diff(now, "hours", true);
  const dayDiff = expiresAtDay.diff(today, "day");

  if (hoursDiff > 0 && hoursDiff <= 24) {
    type = "24_hours";
  } else if (dayDiff >= 1 && dayDiff <= 90) {
    type = "90_days";
  } else if (
    expiresAtDay.isAfter(today, "day") &&
    expiresAtDay.isSameOrBefore(today.clone().add(1, "year"), "day")
  ) {
    type = "1_year";
  }

  return {
    date: expiresAtMoment.toDate(),
    type,
    typeLabel: EXPIRATION_DESCRIPTIONS[type],
  };
}

/**
 * Safely parses an expiration date string to a Date or null
 */
export function parseExpirationDate(
  expiresAt: string | null | undefined
): Date | null {
  if (!expiresAt) return null;

  const expiresAtMoment = moment.utc(expiresAt);
  return expiresAtMoment.isValid() ? expiresAtMoment.toDate() : null;
}

/**
 * Formats an expiration date as MM/YY (e.g., "12/25")
 * Returns "••/••" if the date is invalid or missing
 */
export function formatExpirationDate(
  expiresAt: string | null | undefined
): string {
  if (!expiresAt) return "••/••";

  const date = moment.utc(expiresAt);
  if (!date.isValid()) return "••/••";

  return date.format("MM/YY");
}
