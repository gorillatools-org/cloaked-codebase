import { computed } from "vue";
import { toValue } from "@vueuse/core/index";

export const useIntentPrice = (intent, price = "final") =>
  computed(() => {
    if (!toValue(intent)) {
      return null;
    }

    // prices in intents are strings
    return (
      parseInt(
        price === "final"
          ? toValue(intent).price
          : toValue(intent).original_price
      ) / 100
    );
  });
