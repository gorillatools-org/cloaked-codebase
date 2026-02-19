import { computed, toRef, watch } from "vue";
import type { Format } from "@number-flow/vue";
import store from "@/store";

export default function useCreationLimit() {
  const currencyFormatConfig: Format = {
    style: "currency",
    currency: "USD",
    currencyDisplay:
      "narrowSymbol" as Intl.NumberFormatOptions["currencyDisplay"],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  const _user = toRef(store.state.authentication, "user");

  const limit = computed(() => {
    return _user.value?.card_limits?.creation_limit;
  });

  const limitConsumed = computed(() => {
    return _user.value?.card_limits?.creation_limit_consumed;
  });

  const remainingLimit = computed(() => {
    return (limit.value ?? 0) - (limitConsumed.value ?? 0);
  });

  const limitFormatted = computed(() => {
    return _format(limit.value ?? 0);
  });

  const limitConsumedFormatted = computed(() => {
    return _format(limitConsumed.value ?? 0);
  });

  const remainingLimitFormatted = computed(() => {
    return _format(remainingLimit.value ?? 0);
  });

  const isNearLimit = computed(() => {
    return remainingLimit.value > 0 && remainingLimit.value <= 10000; // $100.00 in cents
  });

  const isReachedLimit = computed(() => {
    const minimumLimit = 100; // $1.00 in cents
    return remainingLimit.value <= minimumLimit;
  });

  const refresh = () => {
    return store.dispatch("authentication/getUser").then(() => {
      _user.value = store.state.authentication.user;
    });
  };

  const _format = (value: number) => {
    return new Intl.NumberFormat("en-US", currencyFormatConfig).format(
      value / 100
    );
  };

  watch(
    () => _user.value,
    () => {
      _user.value = store.state.authentication.user;

      // Force refreshing the card limits, preventing stale data since it's a nested object
      if (
        store.state.authentication.user &&
        store.state.authentication.user.card_limits
      ) {
        _user.value!.card_limits = {
          ...store.state.authentication.user.card_limits,
        };
      }
    },
    { immediate: true }
  );

  return {
    limit,
    limitConsumed,
    remainingLimit,
    remainingLimitFormatted,
    limitFormatted,
    limitConsumedFormatted,
    refresh,
    currencyFormatConfig,
    isNearLimit,
    isReachedLimit,
  };
}
