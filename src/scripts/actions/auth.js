import store from "@/store";
import { cleanup, initiateEncryption } from "./encryption";
import AuthService from "@/api/actions/auth-service";
import UserService from "@/api/actions/user-service";
import { cleanDb } from "@/store/modules/localdb";
import PersonalInfoService from "@/api/settings/personal-services";
import SubscriptionService from "@/api/settings/subscription-services";
import router from "@/routes/router";
export const auth_channel = new BroadcastChannel("auth_channel");
export const refresh_channel = new BroadcastChannel("refresh_channel");

function generateRandomString(length) {
  return Array.from(
    window.crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2))),
    (b) => ("0" + (b & 0xff).toString(16)).slice(-2)
  ).join("");
}

async function generateCodeChallenge(algorithm = "SHA-256", codeVerifier) {
  const digest = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(codeVerifier)
  );

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function generateCodeChallengeAndVerifier(
  algorithm = "SHA-256",
  length = 43
) {
  const codeVerifier = generateRandomString(length);
  const codeChallenge = await generateCodeChallenge(algorithm, codeVerifier);

  return [codeVerifier, codeChallenge];
}

export async function generatePkceRequirements() {
  return await generateCodeChallengeAndVerifier();
}

window.addEventListener("storage", (storage) => {
  if (storage.key === "logout" && storage.newValue === "true") {
    logout();
  }
});

export const logout = async ({
  dontSendEvent = false,
  callApi = true,
} = {}) => {
  if (!dontSendEvent) {
    auth_channel.postMessage("logout");
  }
  if (callApi) {
    // dont call API if auth/access tokens are invalid
    // because it will always return a 401
    try {
      await AuthService.logout();
    } catch {
      // do nothing
    }
  }

  await cleanDb();
  window.localStorage.clear();
  cleanup();
  store.dispatch("logout", {}, { root: true });
  setTimeout(() => {
    router.push({ name: "login" });
  }, 100);
};

let attempts = 0;
export const refreshToken = () => {
  const payload = {
    grant_type: "refresh_token",
    client_id: import.meta.env.VITE_CLIENT_ID,
    refresh_token: store.getters.refresh_token,
  };

  return AuthService.login(payload)
    .then((response) => {
      attempts = 0;
      if (!store.state.authentication?.user) {
        store.dispatch("getUser");
      }
      return store.dispatch("authentication/setAccessToken", {
        oauth: response.data,
      });
    })
    .catch(() => {
      if (attempts < 3) {
        attempts++;
        return refreshToken();
      }
      attempts = 0;
      return logout({ callApi: false });
    });
};

let appBootPromise = null;

export let appBoot = async () => {
  try {
    if (appBootPromise) {
      return appBootPromise;
    }
    await initiateEncryption();
    // eslint-disable-next-line no-async-promise-executor
    appBootPromise = new Promise(async (resolve) => {
      await store.dispatch("authentication/getUser");
      await store.dispatch("authentication/setRefreshTimeout");
      await cleanDb();
      await Promise.allSettled[
        (UserService.getFlags(),
        SubscriptionService.getSubscription(),
        SubscriptionService.getPlanLimits(),
        PersonalInfoService.getUserProfile())
      ];
      resolve();
    });

    return appBootPromise;
  } catch {
    // do nothing
  }
};
