import moment from "moment";
import Dexie, { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";

import {
  getLatestDetailValue,
  getLatestDetailType,
} from "@/scripts/cloakHelpers.js";
import { withDecryptedSharing } from "@/scripts/identitySharing.js";
import { withDecryptedCustomFields } from "@/scripts/customFields.js";
import IdentityService from "@/api/actions/identity-service.js";

export const db = new Dexie("dashdb");

db.version(5)
  .stores({
    cloaks: "id, nickname, email, phone, username, website_url, updated_at", // Primary key and indexed props,
    properties: "key, value",
    cache: "key, url, method, payload, expires_at",
  })
  .upgrade((tx) => {
    // Clear the deprecated suggestions store if it exists from v4
    if (tx.storeNames.includes("suggestions")) {
      return tx.table("suggestions").clear();
    }
  });

export const cleanDb = () => {
  return Promise.allSettled([
    db.cache.clear(),
    db.cloaks.clear(),
    db.properties.clear(),
  ]);
};
export const formatter = (cloak, userId) => {
  //serialize cloaked email
  let cloaked_email_url = cloak.cloaked_email_url;
  let email_enabled = cloak.email_enabled;
  let email = cloak.email;
  let is_cloaked_email = cloak.is_cloaked_email;
  if (cloak.cloaked_email) {
    if (
      typeof cloak.cloaked_email === "object" &&
      cloak.cloaked_email != null
    ) {
      cloaked_email_url = cloak.cloaked_email.url;
      email = getLatestDetailValue("email", cloak);
      email_enabled = cloak.cloaked_email.enabled;
      is_cloaked_email = getLatestDetailType("email", cloak) === "cloaked";
    } else if (typeof cloak.cloaked_email === "string") {
      cloaked_email_url = cloak.cloaked_email;
    }
  }

  //serialize cloaked phone

  let cloaked_phone_url = cloak.cloaked_phone_url;
  let phone = cloak.phone;
  let phone_enabled = cloak.phone_enabled;
  const phoneData =
    cloak.cloaked_phone || cloak.number_for_personal || cloak.number_for_app;
  let is_cloaked_phone = cloak.is_cloaked_phone;

  if (phoneData) {
    if (typeof phoneData === "object" && phoneData != null) {
      cloaked_phone_url = phoneData.url;
      phone = getLatestDetailValue("phone", cloak);
      phone_enabled = phoneData.enabled;
      is_cloaked_phone = getLatestDetailType("phone", cloak) === "cloaked";
    } else if (typeof phoneData === "string") {
      cloaked_phone_url = phoneData;
    }
  }

  //serialize stored password
  let password = cloak.password;
  let password_url = cloak.password_url;
  if (cloak.stored_password && typeof cloak.stored_password === "object") {
    password = cloak.stored_password.password;
    password_url = cloak.stored_password.url;
  } else if (
    cloak.stored_password &&
    typeof cloak.stored_password === "string"
  ) {
    password_url = cloak.stored_password;
  }

  //serialize cloaked cards
  let cloaked_card = cloak.cloaked_card;

  if (cloak.cloaked_card && typeof cloak.cloaked_card === "object") {
    cloaked_card = cloak.cloaked_card;
  }

  //serialize autofill
  let username = cloak.username;
  let notes = cloak.notes;
  let stored_autofill_id = cloak.stored_autofill_id;
  if (cloak.stored_autofill && typeof cloak.stored_autofill === "object") {
    if (cloak.stored_autofill.email) {
      email = getLatestDetailValue("email", cloak);
    }
    if (cloak.stored_autofill.phone || cloak.stored_autofill.phone_number) {
      phone = getLatestDetailValue("phone", cloak);
    }
    if (cloak.stored_autofill.username) {
      username = getLatestDetailValue("username", cloak);
    }
    if (cloak.stored_autofill.password) {
      password = getLatestDetailValue("password", cloak);
    }
    if (cloak.stored_autofill.notes) {
      notes = cloak.stored_autofill.notes;
    }

    stored_autofill_id = cloak.stored_autofill.id;
  }

  let website_name = cloak.website_name;
  if (cloak.website && typeof cloak.website === "object") {
    website_name = cloak.website.name;
  }

  let muted = cloak.muted;
  if (muted == null) {
    if (is_cloaked_email || is_cloaked_phone) {
      muted = true;
      if (is_cloaked_email && email_enabled) {
        muted = false;
      }
      if (is_cloaked_phone && phone_enabled) {
        muted = false;
      }
    }
  }

  return {
    id: cloak.id,
    nickname: cloak.nickname,
    email,
    is_cloaked_email,
    cloaked_email_url,
    email_enabled,
    phone,
    is_cloaked_phone,
    cloaked_phone_url,
    phone_enabled,
    muted,
    logo_url: cloak.logo_url,
    color: cloak.color,
    secondary_color: cloak.secondary_color,
    cloak_brand_color: cloak.cloak_brand_color,
    username,
    website_url: cloak.website_url,
    favorited: cloak.favorited ?? cloak.favorite,
    created_at: cloak.created_at,
    updated_at: cloak.updated_at,
    password,
    password_url,
    cloaked_card,
    protected: cloak.protected,
    notes,
    url: cloak.url,
    app_ref: cloak.app_ref,
    user: cloak.user || `${import.meta.env?.VITE_API}api/v1/user/${userId}/`,
    stored_autofill_id,
    replace_number: cloak.replace_number,
    website_name,
    import_uuid: cloak.import_uuid,
    customFields: cloak.customFields ? [...cloak.customFields] : [],
    has_password: cloak.has_password,
    categories:
      (!!cloak.cat && [...cloak.cat]) ||
      (!!cloak.categories && [...cloak.categories]) ||
      [],
  };
};

export default {
  state: {
    db_cloaks: useObservable(liveQuery(() => db.cloaks.toArray())),
    dbLoaded: false,
    cache: useObservable(liveQuery(() => db.cache.toArray())),
    cloakCount: 0,
  },

  mutations: {
    setLoaded(state, { status, cloakCount }) {
      state.dbLoaded = status;
      state.cloakCount = cloakCount;
    },
    resetState(state) {
      state.dbLoaded = false;
      state.cloakCount = 0;
    },
  },

  getters: {
    allCloaks: (state) => {
      return state.db_cloaks;
    },
    allImportedCloaks: (state) => {
      return state.db_cloaks.filter((cloak) => cloak.import_uuid);
    },
  },

  actions: {
    resetLocalDBStore({ commit }) {
      commit("resetState");
      cleanDb();
    },
    setLoaded({ commit }, value) {
      commit("setLoaded", value);
    },
    async updateCloaksAndFormat(params, { cloaks, userId }) {
      const formattedCloaks = cloaks.map((cloak) => formatter(cloak, userId));
      await db.cloaks.bulkPut(formattedCloaks);
      return formattedCloaks;
    },

    removeCloaks(params, cloaksIds) {
      db.cloaks.bulkDelete(cloaksIds);
    },
    fetchPopulatedData({ dispatch }, cloak) {
      if (cloak) {
        return IdentityService.fetchPopulatedIdentityV1(cloak.id).then(
          async ({ data }) => {
            const populatedCloak = {
              ...data,
              populated: true,
            };

            let decryptedPopulatedCloak =
              await withDecryptedCustomFields(populatedCloak);

            decryptedPopulatedCloak = await withDecryptedSharing(
              decryptedPopulatedCloak
            );
            dispatch("updateCloaks", [decryptedPopulatedCloak]);

            return populatedCloak;
          }
        );
      }
      return Promise.resolve(cloak);
    },
    addNetworkCache(object, { url, method, payload }) {
      const expires_at = moment().add(2, "hours").toDate();
      db.cache.put({
        key: `${url}::${method}`,
        url,
        method,
        payload: JSON.stringify(payload),
        expires_at,
      });
    },
    async deleteCacheAllPages(object, { url }) {
      const urlSplit = url.split("page=");
      url = urlSplit[0];
      await db.cache.where("url").startsWithIgnoreCase(url).toArray();
      await db.cache.where("url").startsWithIgnoreCase(url).delete();
    },
    async updateActivityCachedData(object, { threadId, key, value }) {
      // NOTE: key is the field to update, value is the new value of that field
      const activityUrl = "api/v2/cloaked/activity/";
      const matches = await db.cache
        .where("url")
        .startsWithIgnoreCase(activityUrl)
        .toArray();
      return matches.forEach(async (match) => {
        let changeMade = false;
        const payload = JSON.parse(match.payload);
        if (payload.data.count) {
          const newPayloadResults = payload.data.results.map((result) => {
            const type = result.email
              ? "email"
              : result.message
                ? "message"
                : result.call
                  ? "call"
                  : null;
            if (result.thread_id === threadId && type) {
              changeMade = true;
              result = { ...result, [type]: { ...result[type], [key]: value } };
            }
            return result;
          });
          payload.data.results = newPayloadResults;

          if (changeMade) {
            return await db.cache.put({
              key: match.key,
              url: match.url,
              method: match.method,
              payload: JSON.stringify(payload),
              expires_at: match.expires_at,
            });
          }
        }
      });
    },
    async updateThreadCachedData(object, { threadId, key, value }) {
      // NOTE: key is the field to update, value is the new value of that field
      const activityUrl = "api/v2/cloaked/activity/";
      const matches = await db.cache
        .where("url")
        .startsWithIgnoreCase(activityUrl)
        .toArray();
      return matches.forEach(async (match) => {
        let changeMade = false;
        const payload = JSON.parse(match.payload);
        if (payload.data.count) {
          const newPayloadResults = [];
          payload.data.results.forEach((result) => {
            if (result.thread_id === threadId) {
              changeMade = true;
              result = { ...result, [key]: value };
            }
            return newPayloadResults.push(result);
          });
          payload.data.results = newPayloadResults;

          if (changeMade) {
            return await db.cache.put({
              key: match.key,
              url: match.url,
              method: match.method,
              payload: JSON.stringify(payload),
              expires_at: match.expires_at,
            });
          }
        }
      });
    },
  },
};
