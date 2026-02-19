import { AnalyticsBrowser } from "@customerio/cdp-analytics-browser";

const CUSTOMER_IO_WRITE_KEY = import.meta.env.VITE_CUSTOMER_IO_WRITE_KEY;

export default {
  install(app) {
    if (!CUSTOMER_IO_WRITE_KEY) {
      console.warn("[customerio] missing VITE_CUSTOMER_IO_WRITE_KEY");
      return;
    }
    const cio = AnalyticsBrowser.load({ writeKey: CUSTOMER_IO_WRITE_KEY });
    app.provide("cioanalytics", cio);
  },
};
