//import { read_user } from "./encryption/intercepts/user";
import { read_search } from "./encryption/intercepts/search";
import { read_trash } from "./encryption/intercepts/trash";
import {
  write_autofill,
  read_autofill,
  write_autofill_single,
  read_autofill_single,
} from "./encryption/intercepts/autofill";
import {
  read_identities,
  read_create_identity,
  write_create_identity,
} from "./encryption/intercepts/identities";
import {
  write_password,
  read_password,
} from "./encryption/intercepts/password";
import { write_import } from "./encryption/intercepts/importer";
import {
  write_card,
  read_card,
  write_giftcard,
} from "./encryption/intercepts/card";
import {
  read_activity_single,
  read_activity,
  read_activity_content,
} from "./encryption/intercepts/activity";
import {
  read_totp_mfa,
  // write_totp_mfa,
} from "./encryption/intercepts/totp_mfa.js";

const intercepts = {
  // NOTE: Keeping this in place because as a reminder not to do this
  // "/user/": {
  //   response: read_user,
  // },
  "/cloaked/autofill/": {
    request: write_autofill,
    response: read_autofill,
  },
  "/trash/": {
    response: read_trash,
  },
  "/cloaked/identity/[\\d]+/autofill/": {
    request: write_autofill,
  },
  "/cloaked/autofill/[\\d]+": {
    request: write_autofill_single,
    response: read_autofill_single,
  },
  "/cloaked/identity/[^/]*(?:populated=true)[^/]*$": {
    response: read_identities,
  },
  "/cloaked/identity/\\?alternate=true": {
    request: write_create_identity,
    response: read_create_identity,
  },
  "/cloaked/identity/[\\d]+/": {
    response: read_identities,
  },
  "v2/cloaked/identity/[^/]*(?:protected=false)[^/]*$": {
    response: read_identities,
  },
  "/cloaked/password/[\\d]+/$": {
    request: write_password,
    response: read_password,
  },
  "/search/identity/[^/]*": {
    response: read_search,
  },
  "/cloaked/autofill-card": {
    request: write_card,
    response: read_card,
  },
  "/cloaked/identity/[^/]*/card/mastercard/": {
    request: write_giftcard,
  },
  "/cloaked/importer/import": {
    request: write_import,
  },
  "/cloaked/activity/": {
    response: read_activity,
  },
  "/cloaked/activity/[\\d]+/content": {
    response: read_activity_content,
  },
  "/cloaked/activity/[\\d]+/$": {
    response: read_activity_single,
  },
  "/api/v1/auth/mfa/add/": {
    response: read_totp_mfa,
  },
  /* Not used yet but example for when we need this */
  // "/api/v1/auth/mfa/add/": {
  //   request: write_totp_mfa,
  // },
};

export const handler = async (target, method, encrypt_handler) => {
  const url = method === "response" ? target.config.url : target.url;
  if (url) {
    let handler = false;
    Object.keys(intercepts).map((key) => {
      if (
        url.match(new RegExp(key)) &&
        typeof intercepts[key][method] === "function"
      ) {
        handler = intercepts[key][method];
      }
    });
    if (handler) {
      return await handler(target, encrypt_handler);
    } else {
      return target;
    }
  } else {
    return target;
  }
};
