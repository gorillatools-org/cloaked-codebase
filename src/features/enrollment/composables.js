import { computed } from "vue";
import { formatPhone } from "@/scripts/format.js";
import { toValue } from "@vueuse/core";

export const useFormattedName = (firstName, middleName, lastName) =>
  computed(() =>
    [toValue(firstName), toValue(middleName), toValue(lastName)]
      .filter(Boolean)
      .join(" ")
  );

export const useFormattedPhones = (phones) =>
  computed(() =>
    toValue(phones).map((phone) => ({
      phone,
      display: formatPhone(phone),
    }))
  );

export const displayAddress = (address) =>
  [
    address.address1,
    address.address2,
    address.city,
    [address.state, address.postal_code].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

export const useFormattedAddresses = (addresses) =>
  computed(() =>
    toValue(addresses).map((address) => ({
      address: address,
      display: displayAddress(address),
    }))
  );
