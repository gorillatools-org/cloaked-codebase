import { ref } from "vue";
import { Loader } from "@googlemaps/js-api-loader";

let loadLibraryPromise = null;

const loadLibrary = async () => {
  if (loadLibraryPromise) {
    return loadLibraryPromise;
  }

  loadLibraryPromise = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
  }).importLibrary("places");

  return loadLibraryPromise;
};

const getDetail = (components, type) =>
  components.find((component) => component.types.includes(type))?.shortText;

export const useGooglePlaces = (countries = ["us", "ca"]) => {
  const addresses = ref([]);
  const isFetching = ref(false);

  async function fetchAddresses(input) {
    try {
      isFetching.value = true;

      const { AutocompleteSuggestion, AutocompleteSessionToken } =
        await loadLibrary();

      const { suggestions } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: new AutocompleteSessionToken(),
          language: "en-US",
          includedRegionCodes: countries,
        });

      const places = suggestions.map((suggestion) =>
        suggestion.placePrediction.toPlace()
      );

      await Promise.allSettled(
        places.map((place) =>
          place.fetchFields({
            fields: ["addressComponents"],
          })
        )
      );

      addresses.value = places
        .map((place) => place.addressComponents)
        .map((components) => ({
          address1: [
            getDetail(components, "street_number"),
            getDetail(components, "route"),
          ]
            .filter(Boolean)
            .join(" "),
          address2: getDetail(components, "subpremise") || null,
          city:
            getDetail(components, "locality") ||
            getDetail(components, "postal_town") ||
            getDetail(components, "sublocality") ||
            getDetail(components, "colloquial_area") ||
            getDetail(components, "neighborhood") ||
            getDetail(components, "administrative_area_level_3") ||
            getDetail(components, "administrative_area_level_2") ||
            null,
          state: getDetail(components, "administrative_area_level_1") || null,
          postal_code: getDetail(components, "postal_code") || null,
          country: getDetail(components, "country") || null,
        }))
        .filter((address) => {
          if (
            ["address1", "city", "state", "postal_code", "country"].some(
              (key) => !address[key]
            )
          ) {
            return false;
          }

          if (["country", "state"].some((key) => address[key].length !== 2)) {
            return false;
          }

          return ![
            "address1",
            "address2",
            "city",
            "state",
            "postal_code",
            "country",
          ].some((key) => address[key]?.includes?.("undefined"));
        });
    } finally {
      isFetching.value = false;
    }
  }

  const clearAddresses = () => {
    addresses.value = [];
  };

  return {
    isFetching,
    addresses,
    fetchAddresses,
    clearAddresses,
  };
};
