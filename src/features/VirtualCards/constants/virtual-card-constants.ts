import type {
  VirtualCardExpiresAt,
  VirtualCardPeriod,
  VirtualCardPeriodApi,
  VirtualCardType,
} from "@/types/Wallet/virtual-card";

export const DEFAULT_FIXED_USES = 5;

export const EXPIRATION_DESCRIPTIONS: Record<VirtualCardExpiresAt, string> = {
  "24_hours": "24 Hours",
  "90_days": "90 Days",
  "1_year": "1 Year",
  when_card_expires: "When card expires",
  custom: "Custom",
};

export const CARD_PERIOD_DESCRIPTION_TO_TYPE: Record<
  string,
  VirtualCardPeriod
> = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
  "One-time": "one-time",
  Fixed: "fixed",
};

export const CARD_PERIOD_TYPE_TO_API_TYPE: Record<
  VirtualCardPeriod,
  VirtualCardPeriodApi
> = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  "one-time": "forever",
  fixed: "forever", // Fixed is treated as forever by the API
};

export const MAX_TRANSACTIONS_PER_TYPE: Record<VirtualCardType, number> = {
  MULTI_USE: 100,
  SINGLE_USE: 1,
};

export const CARD_PERIOD_TO_CARD_TYPE: Record<
  VirtualCardPeriod,
  VirtualCardType
> = {
  daily: "MULTI_USE",
  weekly: "MULTI_USE",
  monthly: "MULTI_USE",
  "one-time": "SINGLE_USE",
  fixed: "MULTI_USE",
};

export const CARD_PERIOD_TO_MAX_TRANSACTIONS: Record<
  VirtualCardPeriod,
  number
> = {
  daily: MAX_TRANSACTIONS_PER_TYPE[CARD_PERIOD_TO_CARD_TYPE["daily"]],
  weekly: MAX_TRANSACTIONS_PER_TYPE[CARD_PERIOD_TO_CARD_TYPE["weekly"]],
  monthly: MAX_TRANSACTIONS_PER_TYPE[CARD_PERIOD_TO_CARD_TYPE["monthly"]],
  "one-time": MAX_TRANSACTIONS_PER_TYPE[CARD_PERIOD_TO_CARD_TYPE["one-time"]],
  fixed: MAX_TRANSACTIONS_PER_TYPE[CARD_PERIOD_TO_CARD_TYPE["fixed"]],
};
