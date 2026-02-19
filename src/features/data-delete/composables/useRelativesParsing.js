import { computed } from "vue";

const RELATIONS_PARTNER = [
  "Wife",
  "Husband",
  "Partner",
  "Fiancee",
  "Fiance",
  "Girlfriend",
  "Boyfriend",
  "Significant Other",
];

const RELATIONS_RELATIVES = [
  "Parent",
  "Sibling",
  "Mother",
  "Father",
  "Sister",
  "Brother",
  "Cousin",
  "In-Law",
  "Relative",
  "Child",
];

export const useRelativesParsing = (relations) => {
  const partners = computed(
    () =>
      relations?.filter((person) =>
        RELATIONS_PARTNER.includes(person.relation)
      ) ?? []
  );

  const relatives = computed(
    () =>
      relations?.filter((person) =>
        RELATIONS_RELATIVES.includes(person.relation)
      ) ?? []
  );

  const others = computed(() =>
    (
      relations?.filter(
        (person) =>
          ![...RELATIONS_PARTNER, ...RELATIONS_RELATIVES].includes(
            person.relation
          )
      ) ?? []
    ).sort((a) => (a.relation === "Unknown" ? 1 : -1))
  );

  return {
    partners,
    relatives,
    others,
  };
};
