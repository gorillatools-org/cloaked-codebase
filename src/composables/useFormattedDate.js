import { computed } from "vue";
import { toValue } from "@vueuse/core/index";

export const useFormattedDate = (
  timestamp,
  {
    locale = "en-US",
    format = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  } = {}
) => {
  const formatter = new Intl.DateTimeFormat(locale, format);

  return computed(() => {
    if (!toValue(timestamp)) {
      return null;
    }

    return formatter.format(new Date(toValue(timestamp)));
  });
};
