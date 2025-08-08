import moment from "moment/moment";

export const getStringValue = (type, value) => {
  if (type === "address") {
    const address = value;
    return [
      [address?.street_address ?? "", address?.unit ?? ""]
        .filter((value) => !!value)
        .join(", "),
      [address?.city ?? "", address?.state ?? ""]
        .filter((value) => !!value)
        .join(", "),
      address?.country ?? "",
      address?.postal_code ?? "",
    ]
      .filter((value) => !!value)
      .join("\n");
  }

  if (type === "date") {
    return moment(value, "").format("YYYY-MM-DD");
  }

  return value.toString();
};

export const getCopyValue = (type, value) => {
  if (type === "address") {
    const address = value;
    return [
      address?.street_address ?? "",
      address?.unit ?? "",
      address?.city ?? "",
      address?.state ?? "",
      address?.country ?? "",
      address?.postal_code ?? "",
    ]
      .filter((value) => !!value)
      .join(", ");
  }

  return getStringValue(type, value);
};
