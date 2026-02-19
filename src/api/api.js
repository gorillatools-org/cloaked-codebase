import axios from "axios";
import store from "@/store";
import { version } from "@/../package.json";
import { logout } from "@/scripts/actions/auth";
import Cache from "@/api/cache";
import {
  auto_encrypt_receive,
  auto_encrypt_send,
} from "@/scripts/actions/encryption";
import { refreshToken } from "@/scripts/actions/auth";
import { snakeCase } from "lodash-es";

let browser;
let os;
const userAgent = window.navigator.userAgent;

const generate = (source, customHeaders) => {
  return axios.create({
    baseURL: import.meta.env.VITE_API,
    cancelToken: source && source.token,
    headers: { ...headers(), ...customHeaders },
  });
};

export const headers = () => {
  const matches = import.meta.env.VITE_API.match(/http(?:s)?:\/\/([a-zA-Z]+)/);
  const env = (matches && matches[1]) || "develop";
  const headers = {
    "content-type": "application/json",
    "Cloaked-App-Version": `dashboard-${version}`,
    "Cloaked-Environment": env,
    "Cloaked-Device-Model": get_browser(),
    "Cloaked-Platform": "dashboard",
    "Cloaked-Os-Version": get_os(),
  };

  if (store.getters.auth_token) {
    headers.Authorization = `Bearer ${store.getters.auth_token}`;
  }
  if (store.state?.authentication?.user?.uuid) {
    headers["x-dashboard-api"] = `${store.state.authentication.user.uuid}`;
  }
  return headers;
};

export const headlessParams = () => {
  const requestHeaders = headers();
  delete requestHeaders["Authorization"];
  delete requestHeaders["content-type"];

  return Object.keys(requestHeaders).reduce((acc, key) => {
    return {
      ...acc,
      [snakeCase(key)]: requestHeaders[key],
    };
  }, {});
};

const get_os = () => {
  if (os) {
    return os;
  }
  if (userAgent.indexOf("Windows NT 11") !== -1) os = "Windows 11";
  if (userAgent.indexOf("Windows NT 10") !== -1) os = "Windows 10";
  if (userAgent.indexOf("Windows NT 6.3") !== -1) os = "Windows 8.1";
  if (userAgent.indexOf("Windows NT 6.2") !== -1) os = "Windows 8";
  if (userAgent.indexOf("Windows NT 6.1") !== -1) os = "Windows 7";
  if (userAgent.indexOf("Windows NT 6.0") !== -1) os = "Windows Vista";
  if (userAgent.indexOf("Windows NT 5.1") !== -1) os = "Windows XP";
  if (userAgent.indexOf("Windows NT 5.0") !== -1) os = "Windows 2000";
  if (userAgent.indexOf("Mac") !== -1) os = "Apple";
  if (userAgent.indexOf("X11") !== -1) os = "UNIX";
  if (userAgent.indexOf("Linux") !== -1) os = "Linux";
  return os;
};

const get_browser = () => {
  if (browser) {
    return browser;
  }
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browser = "chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browser = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browser = "safari";
  } else if (userAgent.match(/opr\//i)) {
    browser = "opera";
  } else if (userAgent.match(/edg/i)) {
    browser = "edge";
  } else {
    browser = null;
  }
  return browser;
};

export const cache = (anonymous, customHeaders) => {
  let api = generate(undefined, customHeaders);
  api = setInterceptors(api);
  return Cache(api, generate);
};

export default (anonymous, customHeaders) => {
  if (!store.getters.auth_token && !anonymous) {
    return {
      get() {
        return Promise.reject();
      },
      post() {
        return Promise.reject();
      },
      put() {
        return Promise.reject();
      },
    };
  }
  let api = generate(undefined, customHeaders);
  api = setInterceptors(api);
  return api;
};

const setInterceptors = (api) => {
  let stored_config;
  api.interceptors.request.use((config) => {
    stored_config = config;
    return new Promise((resolve) => {
      auto_encrypt_send(config).then((updated) => {
        resolve(updated);
      });
    });
  });

  api.interceptors.response.use(
    (response) => {
      return auto_encrypt_receive(response).then((updated) => {
        return updated;
      });
    },
    (error) => {
      if (error && error.response && error.response.status) {
        const code = error.response.status;
        if (code === 401) {
          if (
            !error.response.config.url.includes("token") &&
            !error.response.config.url.includes("logout")
          ) {
            return refreshToken().then(() => {
              const retry = generate();
              return retry[stored_config.method](
                stored_config.url,
                stored_config.data
              );
            });
          } else if (!error.response.config.url.includes("logout")) {
            return logout();
          }
        } else if (code === 418 || code === 429) {
          const customError = new Error(
            "Cannot complete request, please try again later"
          );
          customError.customMessage = customError.message;
          customError.response = error.response;
          customError.request = error.request;
          throw customError;
        } else {
          throw error;
        }
      } else {
        if (error?.code === "ERR_NETWORK") {
          const raw = error?.config?.url ?? "unknown";
          let safeUrl = raw;
          try {
            const u = new URL(raw, window.location.origin);
            safeUrl = u.origin + u.pathname;
          } catch {
            safeUrl = "unknown";
          }
          console.warn("[api] Network error", safeUrl, error.message);
        }
        throw error;
      }
    }
  );
  return api;
};
