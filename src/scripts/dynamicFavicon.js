import { useFavicon } from "@vueuse/core";

const ENVIRONMENT_FAVICONS = {
  localhost: "/favicon/favicon-localhost.svg",
  develop: "/favicon/favicon-develop.svg",
  staging: "/favicon/favicon-staging.svg",
  production: "/favicon/favicon.svg",
};

export function initDynamicFavicon() {
  const environment = import.meta.env.VITE_APP_ENV || "production";
  const favicon = useFavicon();
  favicon.value = ENVIRONMENT_FAVICONS[environment];
}
