import { computed, type Ref } from "vue";
import type {
  DataDeleteSearchResult,
  DataDeleteSearchRelative,
  DataDeleteSearchLocation,
} from "@/types/data-delete-search";
import type { BaseIconName } from "@/library/baseIconTypes";
import type { TooltipContent, SearchDataItem, ConnectionItem } from "../types";
import { useRelativesParsing } from "../../composables/useRelativesParsing";
import { MAX_CONNECTIONS } from "../constants";

export function useDataDeleteNetworkConnections(
  searchResult: Ref<DataDeleteSearchResult>,
  brokersNames?: Ref<string[] | undefined>
) {
  const normalizedRelatives = computed(() => {
    return (searchResult.value.relatives || []).map((person) => ({
      ...person,
      name: formatPersonName(person),
      relation: person.relation ?? "Unknown",
    }));
  });

  const { partners, relatives, others } = useRelativesParsing(
    normalizedRelatives.value
  );

  const connectionItems = computed((): ConnectionItem[] => {
    const relativesList = [
      ...partners.value,
      ...relatives.value,
      ...others.value,
    ];

    return buildConnectionItems(
      relativesList,
      searchResult.value,
      brokersNames?.value || []
    );
  });

  const totalConnections = computed(() => connectionItems.value.length);

  function generateTooltipContent(index: number): TooltipContent {
    const item = connectionItems.value[index];
    if (!item) return { type: "relative", name: "", relation: "Connection" };

    return connectionItemToTooltip(item);
  }

  return { totalConnections, generateTooltipContent };
}

function formatPersonName(person: DataDeleteSearchRelative): string {
  return (
    person.fullName ||
    `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
    "Unknown"
  ).trim();
}

function formatLocation(location: DataDeleteSearchLocation): string {
  return [
    location.street,
    location.city,
    location.state?.abbreviation,
    location.zip,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildConnectionItems(
  relatives: DataDeleteSearchRelative[],
  searchResult: DataDeleteSearchResult,
  brokers: string[]
): ConnectionItem[] {
  const items: ConnectionItem[] = [];

  const addItems = <T>(source: T[], toItem: (item: T) => ConnectionItem) => {
    for (const item of source) {
      if (items.length >= MAX_CONNECTIONS) break;
      items.push(toItem(item));
    }
  };

  addItems(relatives, (r) => ({ type: "relative", data: r }));
  addItems(extractSearchDataItems(searchResult), (s) => ({
    type: "searchData",
    data: s,
  }));
  addItems(brokers, (b) => ({ type: "broker", data: b }));

  return items;
}

function extractSearchDataItems(
  searchResult: DataDeleteSearchResult
): SearchDataItem[] {
  const { emails, locations, phones } = searchResult;
  const items: SearchDataItem[] = [];
  const seen = new Set<string>();

  const add = (
    value: string | undefined,
    label: string,
    icon: BaseIconName
  ) => {
    if (value && !seen.has(value)) {
      seen.add(value);
      items.push({ value, label, icon });
    }
  };

  add(emails?.[0], "Email", "email");
  add(locations?.[0] && formatLocation(locations[0]), "Address", "home");
  add(phones?.[0], "Phone", "phone");

  emails?.forEach((v) => add(v, "Email", "email"));
  locations?.forEach((v) => add(formatLocation(v), "Address", "home"));
  phones?.forEach((v) => add(v, "Phone", "phone"));

  return items;
}

function connectionItemToTooltip(item: ConnectionItem): TooltipContent {
  switch (item.type) {
    case "relative":
      return {
        type: "relative",
        name: formatPersonName(item.data).toLowerCase(),
        relation: item.data.relation?.toLowerCase() || "Connection",
        icon: "user",
      };

    case "broker":
      return {
        type: "broker",
        name: item.data.toLowerCase(),
        relation: "Broker",
        icon: "document-search",
      };

    case "searchData":
      return {
        type: "searchData",
        name: item.data.value.toLowerCase(),
        relation: item.data.label,
        icon: item.data.icon,
      };
  }
}
