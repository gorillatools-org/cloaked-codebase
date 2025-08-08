import { phone_format } from "@/scripts/format";
import moment from "moment";

export const cloaked_email = (cloak) => {
  const cloaked = cloak && cloak.cloaked_email && cloak.cloaked_email.email;
  const autofill = autofill_field(cloak, "email");
  return {
    value: autofill || cloaked,
    cloaked: cloaked && (!autofill || autofill === cloaked),
  };
};

export const cloaked_phone = (cloak) => {
  const object =
    cloak &&
    (cloak.number_for_app || cloak.number_for_personal || cloak.cloaked_phone);
  let cloaked = object && object.phone_number;
  const autofill = autofill_field(cloak, "phone_number");
  if (object) {
    cloaked = phone_format(cloaked);
    if (object.ext) {
      cloaked = `${cloaked.replaceAll(" ", "")} ext. ${object.ext}`;
    }
  }
  return {
    value: autofill || cloaked,
    cloaked: cloaked && (!autofill || autofill === cloaked),
  };
};

export const cloaked_password = (cloak) => {
  const cloaked =
    cloak && cloak.stored_password && cloak.stored_password.password;
  const autofill = autofill_field(cloak, "password");
  return {
    value: autofill || cloaked,
    cloaked: cloaked && (!autofill || autofill === cloaked),
  };
};

export const autofill_field = (cloak, field) => {
  return cloak && cloak.stored_autofill && cloak.stored_autofill[field];
};

export const getLatestDetailValue = (key, cloak) => {
  const { autofill, cloaked } = getDetailHelper(key, cloak);
  const latestDetailType = getLatestDetailType(key, cloak);

  if (key.includes("phone")) {
    key = "phone_number";
  }

  switch (latestDetailType) {
    case "cloaked": {
      return cloaked ? cloaked[key] : null;
    }
    case "user_defined": {
      return autofill ? autofill[key] : null;
    }
    default: {
      if (key.includes("phone")) {
        return cloak.number_for_personal || cloak.number_for_app;
      }
      return null;
    }
  }
};

export const getLatestDetailObject = (key, cloak) => {
  const { autofill, cloaked } = getDetailHelper(key, cloak);
  const latestDetailType = getLatestDetailType(key, cloak);
  switch (latestDetailType) {
    case "cloaked": {
      return cloaked;
    }
    case "user_defined": {
      return autofill;
    }
    default: {
      return null;
    }
  }
};

export const getDetailHelper = (key, cloak) => {
  const autofill = cloak.stored_autofill;
  const cloaked_key = getCloakedKey(key);

  let cloaked = null;
  if (cloak[cloaked_key]) {
    cloaked = cloak[cloaked_key];
  }
  return { autofill, cloaked };
};

export const getLatestDetailType = (key, cloak) => {
  if (key.includes("phone")) {
    key = "phone_number";
  }

  const autofill_updated_at = `${key}_updated_at`;
  const cloaked_updated_at = "updated_at";
  const autofill = cloak.stored_autofill;
  const cloaked_key = getCloakedKey(key);
  const cloaked = cloak[cloaked_key];

  const autofill_time =
    autofill && autofill[key] && autofill[autofill_updated_at];
  const cloaked_time = cloaked && cloaked[key] && cloaked[cloaked_updated_at];

  if (autofill_time && cloaked_time) {
    if (moment(autofill_time) > moment(cloaked_time)) {
      return "user_defined";
    } else {
      return "cloaked";
    }
  } else if (autofill && autofill[key] && autofill_time) {
    return "user_defined";
  } else if (cloaked && cloaked[key] && cloaked_time) {
    return "cloaked";
  } else if (autofill && autofill[key]) {
    return "user_defined";
  } else if (cloaked && cloaked[key]) {
    return "cloaked";
  } else if (
    key.includes("phone") &&
    (cloak.number_for_personal || cloak.number_for_app)
  ) {
    return "cloaked";
  }
  return "none";
};

export const getAvailableIdentityFilters = (allCloaks) => {
  const filters = [
    {
      label: "All",
      value: "",
    },
  ];
  if (allCloaks.some((c) => c.phone)) {
    filters.push({
      label: "Phone",
      value: "has_phone",
    });
  }
  if (allCloaks.some((c) => c.email)) {
    filters.push({
      label: "Email",
      value: "has_email",
    });
  }
  if (
    allCloaks.some((c) =>
      !!c?.customFields?.length > 0
        ? c.customFields.some((field) =>
            ["totp_url", "totp_secret"].includes(field.type)
          )
        : false
    )
  ) {
    filters.push({
      label: "OTP",
      value: "has_totp",
    });
  }
  if (
    allCloaks.some(
      (c) =>
        (!!c.has_password || !!c.password) &&
        (!!c.email || !!c.username || !!c.phone)
    )
  ) {
    filters.push({
      label: "Logins",
      value: "has_login",
    });
  }
  return filters;
};

export const getAvailableCloakFilters = ({ allCloaks, sort, filter }) => {
  let cloaks = [...allCloaks];
  if (filter) {
    switch (filter) {
      case "has_phone":
        cloaks = cloaks.filter((c) => !!c.phone);
        break;
      case "has_totp":
        cloaks = cloaks.filter((c) =>
          !!c?.customFields?.length > 0
            ? c.customFields.some((field) =>
                ["totp_url", "totp_secret"].includes(field.type)
              )
            : false
        );
        break;
      case "has_email":
        cloaks = cloaks.filter((c) => !!c.email);
        break;
      case "has_login":
        cloaks = cloaks.filter(
          (c) =>
            (!!c.has_password || !!c.password) &&
            (!!c.email || !!c.username || !!c.phone)
        );
        break;
    }
  }
  if (sort) {
    switch (sort) {
      case "nickname":
        return cloaks.sort((a, b) => {
          return b?.nickname
            ?.toLowerCase()
            .localeCompare(a?.nickname?.toLowerCase());
        });
      case "-created_at":
        return cloaks.sort((a, b) => {
          return new Date(a.created_at) - new Date(b.created_at);
        });
      case "-last_used_at":
        return cloaks.sort((a, b) => {
          return new Date(b.last_used_at) - new Date(a.last_used_at);
        });
    }
  }
  return cloaks;
};

const getCloakedKey = (key) => {
  let cloaked_key = `cloaked_${key}`;

  if (key.includes("phone")) {
    cloaked_key = "cloaked_phone";
  }

  if (key === "password") {
    cloaked_key = "stored_password";
  }

  return cloaked_key;
};

export const cloakDetailRouteNames = [
  "cloak",
  "categorywithcloak",
  "favoriteswithcloak",
  "mutedwithcloak",
  "all",
];

export function getFilterFromRoute(route) {
  let filter = "";
  if (route.query.has_email) {
    filter = "has_email";
  } else if (route.query.has_totp) {
    filter = "has_totp";
  } else if (route.query.has_phone) {
    filter = "has_phone";
  } else if (route.query.has_login) {
    filter = "has_login";
  }
  return filter;
}

export const cloakHelpers = {
  cloaked_email,
  cloaked_phone,
  cloaked_password,
  autofill_field,
  getLatestDetailValue,
  getLatestDetailObject,
  getLatestDetailType,
  getAvailableIdentityFilters,
  getAvailableCloakFilters,
  cloakDetailRouteNames,
  getFilterFromRoute,
};
