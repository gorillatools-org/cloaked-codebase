import { computed } from "vue";

export const useNameParsing = (searchResult) => {
  const name = computed(() => {
    const name =
      searchResult.name ??
      [searchResult.firstName, searchResult.lastName]
        .filter((value) => !!value)
        .join(" ");

    return name?.toLowerCase();
  });

  const nameAndAge = computed(() =>
    [name.value, searchResult.age].filter((value) => !!value).join(", ")
  );

  return {
    name,
    nameAndAge,
  };
};
