import { StateList } from "@/scripts/countries/states";

export const addressTypes = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
  { value: "po-box", label: "P.O. Box" },
  { value: "other", label: "Other" },
];

export const getFreshNewAddress = () => ({
  city: "",
  country: "",
  postal_code: "",
  state: "",
  street_address: "",
  type: "",
  unit: "",
});

export const getAddressFromAutofill = (autofill) => ({
  country: autofill?.country ?? "",
  state:
    StateList.find((state) => state.label === autofill?.address_level1)
      ?.value ?? "",
  city: autofill?.address_level2 ?? "",
  street_address: autofill?.street_address ?? "",
  unit: autofill?.unit ?? "",
  postal_code: autofill?.postal_code ?? "",
  type: "other",
});

export const getValueByStringPath = (object, path) =>
  path.reduce((object, key) => object?.[key], object);

export const setValueByStringPath = (object, path, value) => {
  let currentLevel = object;
  path.forEach((key, index) => {
    if (!currentLevel[key]) {
      currentLevel[key] = {};
    }

    if (index < path.length - 1) {
      currentLevel = currentLevel[key];
    } else {
      currentLevel[key] = value;
    }
  });
};

export const getDefaultLabel = (fieldType) => {
  const typeToLabel = {
    text: `Custom text`,
    url: `Secondary URL`,
    date: `Date`,
    bank: `Banking information`,
    auth: `Authentication key`,
    identification: `Identification number`,
    address: `Address`,
  };

  return typeToLabel[fieldType];
};
