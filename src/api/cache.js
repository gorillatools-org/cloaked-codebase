import moment from "moment";

import store from "@/store";

export default (api) => {
  api.interceptors.response.use((response) => {
    const url = response.config.url;
    const method = response.config.method;
    const skip = ["gt=", "token", "refresh", "logout"];
    const shouldSkip = skip.some((item) => {
      return url.match(new RegExp(item, "ig"));
    });
    if (!shouldSkip) {
      store.dispatch("addNetworkCache", { url, method, payload: response });
    }
    return response;
  });

  const getCache = async (url, method) => {
    const now = moment();
    const cache = store.state.localdb.cache?.find((item) => {
      return (
        item.url === url &&
        item.method === method &&
        moment(item.expires_at).isAfter(now)
      );
    });
    if (cache) {
      return JSON.parse(cache.payload);
    }
    return false;
  };

  return {
    get: async (path, headers) => {
      const cache = await getCache(path, "get");
      if (cache) {
        return new Promise((resolve) => {
          resolve(cache);
        });
      }
      return api.get(path, headers);
    },
    post: async (path, data, headers) => {
      const cache = await getCache(path, "post");
      if (cache) {
        return new Promise((resolve) => {
          resolve(cache);
        });
      }
      return api.post(path, data, headers);
    },
    put: async (path, data, headers) => {
      const cache = await getCache(path, "put");
      if (cache) {
        return new Promise((resolve) => {
          resolve(cache);
        });
      }
      return api.put(path, data, headers);
    },
    delete: async (path, headers) => {
      const cache = await getCache(path, "delete");
      if (cache) {
        return new Promise((resolve) => {
          resolve(cache);
        });
      }
      return api.delete(path, headers);
    },
  };
};
