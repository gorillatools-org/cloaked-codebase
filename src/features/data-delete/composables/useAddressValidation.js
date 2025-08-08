import { useValidation } from "@/composables/validation/useValidation.js";

export const useAddressValidation = (address, options) =>
  useValidation(address, options, (address, { isRequired }) => {
    if (!isRequired && !address) {
      return null;
    }

    if (!address) {
      return "Please select a valid address";
    }

    if (!address.city) {
      return "Please select an address with a valid city";
    }

    if (!address.state) {
      return "Please select an address with a valid state";
    }

    if (!address.country) {
      return "Please select an address with a valid country";
    }

    return null;
  });
