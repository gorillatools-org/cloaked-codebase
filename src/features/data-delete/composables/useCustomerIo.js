import { inject } from "vue";

export const useCustomerIo = () => {
  const cioanalytics = inject("cioanalytics");

  const identify = async ({ email, phone, source = "partnerships" }) => {
    if ((!email && !phone) || !cioanalytics?.identify) return;
    try {
      const id = btoa(email);
      const sourceUrl = window.location.href;

      const payload = {
        id,
        source,
        sourceUrl,
        email,
        phone,
      };

      await cioanalytics.identify(id, payload);
    } catch (err) {
      console.error("Customer.io identify failed:", err);
    }
  };

  return { identify };
};
