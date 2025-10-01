import { computed } from "vue";

export const useDateOfBirthParsing = (searchResult) => {
  const dateOfBirth = computed(() => {
    if (
      searchResult?.DOB?.month &&
      searchResult?.DOB?.day &&
      searchResult?.DOB?.year
    ) {
      return [searchResult.DOB?.month, "**", searchResult.DOB?.year.slice(2, 4)]
        .filter((value) => !!value)
        .join("/");
    }

    return "";
  });

  return {
    dateOfBirth,
  };
};
