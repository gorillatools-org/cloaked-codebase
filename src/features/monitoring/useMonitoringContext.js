import { useSessionStorage } from "@vueuse/core";

const monitoringContext = useSessionStorage(
  "monitoring-context",
  import.meta.env.VITE_APP_ENV === "production" ? null : "test"
);

export const useMonitoringContext = () => {
  return monitoringContext;
};
