import { useRoute } from "vue-router";
import router from "@/routes/router";

const defaultParams = [
  { name: "fbclid", mapsTo: "fid", storageKey: "clk-fid" },
  { name: "ttclid", mapsTo: "tid", storageKey: "clk-tid" },
  { name: "gclid", mapsTo: "gid", storageKey: "clk-gid" },
  { name: "cntr_auctionId", mapsTo: "bid", storageKey: "clk-bid" },
];

export const useTrackingQueryParameters = () => {
  const route = useRoute();

  const getTrackingParams = (params = defaultParams) => {
    const queryParams = { ...route.query };

    params.forEach((param) => {
      const trackingId = route.query?.[param.name];
      if (trackingId) {
        localStorage.setItem(param.storageKey, trackingId);
        delete queryParams[param.name];
      }
    });

    router.replace({ query: queryParams });

    return new URLSearchParams(
      params
        .filter((param) => !!localStorage.getItem(param.storageKey))
        .reduce(
          (result, param) => ({
            ...result,
            [param.mapsTo]: localStorage.getItem(param.storageKey),
          }),
          {}
        )
    );
  };

  const clearTrackingParams = (params = defaultParams) => {
    params.forEach((param) => {
      localStorage.removeItem(param.storageKey);
    });
  };

  const withTrackingParams = (urlString) => {
    const url = new URL(urlString);

    for (let entry of getTrackingParams().entries()) {
      url.searchParams.append(...entry);
    }

    return url.toString();
  };

  return {
    getTrackingParams,
    clearTrackingParams,
    withTrackingParams,
  };
};
