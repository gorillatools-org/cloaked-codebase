import { computed, type MaybeRefOrGetter } from "vue";
import moment from "moment";
import type {
  VirtualCard,
  VirtualCardPeriod,
} from "@/types/Wallet/virtual-card";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";
import useVirtualCardModals from "@/features/VirtualCards/composables/useVirtualCardModals";
import { formatCurrency } from "../utils/currency-utils";
import { CARD_PERIOD_DESCRIPTION_TO_TYPE } from "../constants/virtual-card-constants";
import type { DropdownSelectOption } from "../base/VCBaseDropdownSelect.vue";

export default function useVirtualCardLimit(
  card: MaybeRefOrGetter<VirtualCard | string>
) {
  const { card: _card } = useVirtualCard(card);
  const { openSpendingLimitModal } = useVirtualCardModals(card);

  const cardLimit = computed(() => {
    return (_card.value?.transaction_period_limit ?? 0) / 100;
  });

  const transactionsLimit = computed(() => {
    return _card.value?.transaction_period_max_transactions ?? 0;
  });

  const periodApi = computed(() => {
    return _card.value?.transaction_period;
  });

  const periodOptions = computed<DropdownSelectOption<VirtualCardPeriod>[]>(
    () => {
      return Object.keys(CARD_PERIOD_DESCRIPTION_TO_TYPE).map((key: string) => {
        return {
          label: key,
          value: CARD_PERIOD_DESCRIPTION_TO_TYPE[key],
        };
      });
    }
  );

  const spent = computed(() => _card.value?.spent_period ?? 0);

  const limit = computed(() => _card.value?.transaction_period_limit ?? 0);

  const availableLimit = computed(() => {
    return (_card.value?.transaction_period_limit || 0) - spent.value;
  });

  const formattedSpent = computed(() => formatCurrency(spent.value));

  const formattedLimit = computed(() => formatCurrency(limit.value));

  const formattedAvailableLimit = computed(() => {
    return formatCurrency(availableLimit.value);
  });

  const availableLimitPercentage = computed(() => {
    if (!limit.value || limit.value <= 0) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(100, (availableLimit.value / limit.value) * 100)
    );
  });

  const spentPercentage = computed(() => {
    if (!limit.value || limit.value <= 0) return 0;
    return Math.max(0, Math.min(100, (spent.value / limit.value) * 100));
  });

  const periodDescription = computed(() => {
    if (periodApi.value === "daily") {
      return "per day";
    } else if (periodApi.value === "weekly") {
      return "per week";
    } else if (periodApi.value === "monthly") {
      return "per month";
    } else if (periodApi.value === "forever" && transactionsLimit.value === 1) {
      return "One-time";
    } else if (periodApi.value === "forever" && transactionsLimit.value > 1) {
      return `up to ${transactionsLimit.value} uses`;
    }

    return "unknown";
  });

  const period = computed<VirtualCardPeriod | "unknown">(() => {
    if (periodApi.value === "daily") {
      return "daily";
    } else if (periodApi.value === "weekly") {
      return "weekly";
    } else if (periodApi.value === "monthly") {
      return "monthly";
    } else if (periodApi.value === "forever" && transactionsLimit.value === 1) {
      return "one-time";
    } else if (periodApi.value === "forever" && transactionsLimit.value > 1) {
      return "fixed";
    }

    return "unknown";
  });

  const renewalDescription = computed(() => {
    const period = _card.value?.transaction_period;
    const maxTransactions =
      _card.value?.transaction_period_max_transactions || 0;

    if (period === "daily") {
      const renewalDate = moment().add(1, "day");
      return `Renews tomorrow, ${renewalDate.format("MMMM Do")}`;
    }

    if (period === "weekly") {
      const currentDay = moment().day();
      const renewalDate =
        currentDay === 1 ? moment().add(1, "week").day(1) : moment().day(8);
      const isTomorrow = renewalDate.isSame(moment().add(1, "day"), "day");

      if (isTomorrow) {
        return `Renews tomorrow, ${renewalDate.format("MMMM Do")}`;
      }

      return `Renews on ${renewalDate.format("dddd")}, ${renewalDate.format("MMMM Do")}`;
    }

    if (period === "monthly") {
      const renewalDate = moment().add(1, "month").startOf("month");
      const isTomorrow = renewalDate.isSame(moment().add(1, "day"), "day");

      if (isTomorrow) {
        return `Renews tomorrow, ${renewalDate.format("MMMM Do")}`;
      }

      return `Renews on ${renewalDate.format("dddd")}, ${renewalDate.format("MMMM Do")}`;
    }

    if (period === "forever") {
      if (maxTransactions === 1) {
        return `One-time use`;
      }

      if (maxTransactions > 1) {
        return `Valid for ${maxTransactions} uses`;
      }
    }

    return "Couldn't load refresh schedule";
  });

  return {
    openSpendingLimitModal,
    cardLimit,
    periodApi,
    spent,
    limit,
    availableLimit,
    formattedSpent,
    formattedLimit,
    formattedAvailableLimit,
    availableLimitPercentage,
    spentPercentage,
    periodDescription,
    transactionsLimit,
    renewalDescription,
    periodOptions,
    period,
  };
}
