import { matchInWord } from "@/scripts/regex";
import { getIdentityNickname } from "@/scripts/format";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";

const boldenMatch = (text, query) => {
  const regex = matchInWord(query);
  return text.replace(regex, "<span class='highlight-bold'>$1</span>");
};

export const searchLocalCloaksGrouped = (cloaks, query) => {
  const groupedResults = {
    name: [],
    website: [],
    email: [],
    phone_number: [],
    other: [],
  };
  if (cloaks.length) {
    cloaks.filter((cloak) => {
      // remove all non-alphanumerical characters
      query = query.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") || "";

      const identityNickname = getIdentityNickname(cloak)
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const websiteUrl = cloak.website_url
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const emailAddress = cloak.email
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const phoneNumber = cloak.phone
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const username = cloak.username
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");

      if (identityNickname?.includes(query)) {
        identityNickname?.startsWith(query)
          ? groupedResults.name.unshift(cloak)
          : groupedResults.name.push(cloak);
      } else if (
        websiteUrl?.includes(query) &&
        !cloak.website_url.toLowerCase().includes(NO_URL_IDENTITY_DOMAIN)
      ) {
        websiteUrl.startsWith(query)
          ? groupedResults.website.unshift(cloak)
          : groupedResults.website.push(cloak);
      } else if (emailAddress?.includes(query)) {
        emailAddress.startsWith(query)
          ? groupedResults.email.unshift(cloak)
          : groupedResults.email.push(cloak);
      } else if (phoneNumber?.includes(query)) {
        phoneNumber.startsWith(query)
          ? groupedResults.phone_number.unshift(cloak)
          : groupedResults.phone_number.push(cloak);
      } else if (username?.includes(query)) {
        username.startsWith(query)
          ? groupedResults.other.unshift(cloak)
          : groupedResults.other.push(cloak);
      }
    });
  }
  return groupedResults;
};

export const searchLocalCloaksSingleList = (cloaks, query) => {
  const matches = [];
  if (cloaks.length) {
    cloaks.filter((cloak) => {
      query = query.toLowerCase().replace(/[^a-zA-Z0-9]/g, ""); // remove all non-alphanumerical characters

      const identityNickname = getIdentityNickname(cloak)
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const websiteUrl = cloak.website_url
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const emailAddress = cloak.email
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const phoneNumber = cloak.phone
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");
      const username = cloak.username
        ?.toLowerCase()
        ?.replace(/[^a-zA-Z0-9]/g, "");

      if (identityNickname?.includes(query)) {
        identityNickname.startsWith(query)
          ? matches.unshift(cloak)
          : matches.push(cloak);
      } else if (
        websiteUrl &&
        websiteUrl?.includes(query) &&
        !websiteUrl.includes(NO_URL_IDENTITY_DOMAIN)
      ) {
        websiteUrl.startsWith(query)
          ? matches.unshift(cloak)
          : matches.push(cloak);
      } else if (emailAddress && emailAddress.includes(query)) {
        emailAddress.startsWith(query)
          ? matches.unshift(cloak)
          : matches.push(cloak);
      } else if (phoneNumber && phoneNumber.includes(query)) {
        phoneNumber.startsWith(query)
          ? matches.unshift(cloak)
          : matches.push(cloak);
      } else if (username && username.includes(query)) {
        username.startsWith(query)
          ? matches.unshift(cloak)
          : matches.push(cloak);
      }
    });
  }
  return matches;
};

export const search = {
  searchLocalCloaksGrouped,
  searchLocalCloaksSingleList,
  boldenMatch,
};
