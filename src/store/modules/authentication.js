import AuthService from "@/api/actions/auth-service";
import router from "@/routes/router";
import { refresh_channel, refreshToken } from "@/scripts/actions/auth";
import { authDecrypt } from "@/scripts/actions/encryption";
import PersonalInfoService from "@/api/settings/personal-services";
import moment from "moment";
import UserService from "@/api/actions/user-service";
import { nextTick, watch } from "vue";
import { useToast } from "@/composables/useToast.js";
import { DATA_DELETE_REQUESTED } from "@/scripts/userFlags";
import { initializeExtensionAuth } from "@/features/extension-auth/core";
import { extensionMessaging } from "@/scripts/messaging";
import { EXTENSION_MESSAGE_TYPES } from "@/scripts/constants";
import { initiateEncryption } from "@/scripts/actions/encryption";

const { success, error } = useToast();

const defaultState = () => ({
  auth: null,
  guest: null,
  encryption: null,
  user: null,
  username: null,
  migration: null,
  extension: null,
  collections: [],
  MfaMethods: [],
});
let timeout;
export default {
  namespaced: true,
  state: defaultState(),

  mutations: {
    setMfaMethods(state, methods) {
      state.MfaMethods = methods;
    },
    setExtensionAuth: (state, { oauth }) => {
      if (oauth?.expires_in) {
        const expires_at = moment().add(oauth.expires_in, "seconds").format();
        state.extension = {
          ...oauth,
          expires_at,
        };
      } else {
        state.extension = oauth;
      }
    },
    setPayload: (state, { payload }) => {
      state.encryption = payload.encryption;
      state.collections = payload.user.collections;
      state.user = payload.user;

      const extension_key = Object.keys(payload.auth ?? {}).filter(
        (k) => k !== import.meta.env.VITE_CLIENT_ID
      );
      state.extension =
        payload?.auth?.[extension_key[0]] || state.extension || null;
    },
    setAuth(state, { oauth }) {
      state.auth = {
        access_token: oauth.access_token,
        refresh_token: oauth.refresh_token,
        // eslint-disable-next-line no-constant-condition
        expires_in: typeof (oauth.expires_in === "string")
          ? moment().add(oauth.expires_in, "seconds").format()
          : oauth.expires_in,
      };
      state.migration = null;
    },
    setGuest(state, data) {
      if (data) {
        state.guest = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        };
      } else {
        state.guest = null;
      }
    },
    updateUser(state, userInfo) {
      state.user = { ...state.user, ...userInfo };
    },
    setUser(state, user) {
      state.user = user;
      if (user?.account_version === 2 && user?.username_encrypted) {
        return authDecrypt(user.username_encrypted).then((decrypted) => {
          state.username = decrypted;
          return decrypted;
        });
      }
    },
    setUsername(state, username) {
      state.username = username;
    },
    setMigration(state, payload) {
      state.migration = payload;
    },
    setLogout: (state) => {
      Object.assign(state, defaultState());
    },
    replaceState: (state, newState) => {
      Object.assign(state, newState);
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.auth && state.auth.access_token;
    },
    isGuestAuthenticated(state) {
      return !!state.guest && state.guest.access_token;
    },
    username(state) {
      if (state.username) {
        return state.username;
      }
      return "...";
    },
    user(state) {
      return state.user;
    },
    authToken(state) {
      return state.auth.access_token;
    },
    collection: (state) => (collection_name) => {
      return state.collections.find((f) => f.name === collection_name).url;
    },
    isPendingDeletion(state) {
      return state.user.state === "pending_deletion";
    },
    getUsername(state) {
      if (state.username && !state.username.match(/^boxSeal/)) {
        return state.username;
      }

      return "...";
    },
  },
  actions: {
    waitForAuthentication({ getters }) {
      return new Promise((resolve) => {
        const unwatch = watch(
          () => getters.isAuthenticated || getters.isGuestAuthenticated,
          (isAuthenticated) => {
            if (!isAuthenticated) {
              return;
            }

            resolve();
            nextTick(() => unwatch());
          },
          { immediate: true }
        );
      });
    },
    handleAcceptInvite: ({ state, dispatch }, inviteCode) => {
      const unwatch = watch(
        () => state.user?.created_at,
        async (newValue) => {
          if (newValue) {
            nextTick(() => unwatch());

            const shouldGetDataDeletion =
              new Date().getTime() -
                new Date(state.user?.created_at).getTime() <
              15 * 60 * 1000;

            try {
              await dispatch(
                "subscription/acceptInvite",
                {
                  code: inviteCode,
                  enable_data_deletion: shouldGetDataDeletion,
                },
                {
                  root: true,
                }
              );

              success("Invite accepted!");

              if (shouldGetDataDeletion) {
                UserService.setFlag({
                  name: DATA_DELETE_REQUESTED,
                  value: true,
                });
              }
            } catch {
              error(`Invitation couldn't be accepted`);
            }
          }
        },
        { immediate: true }
      );
    },
    bootFromMigration: ({ dispatch, commit, state }) => {
      commit("setPayload", { payload: state.migration.payload });
      dispatch("setAccessToken", { oauth: state.migration.oauth });
      router.push({ path: "/" }).catch((e) => e);
    },
    setExtensionToken: (
      { dispatch, commit },
      { payload, codeVerifier, client_id }
    ) => {
      return dispatch("getAuthToken", {
        payload,
        codeVerifier,
        client_id,
        handler: ({ data }) => {
          commit("setExtensionAuth", { oauth: data });
          dispatch("broadcastExtensionAuthSuccess");
        },
      });
    },
    authWithAccessToken: async (
      { dispatch, commit, state },
      { accessToken }
    ) => {
      try {
        commit("setAuth", {
          oauth: {
            access_token: accessToken,
            refresh_token: "",
            expires_in: 3600,
          },
        });

        await dispatch("getUser");

        if (state.user?.encryption_status === 3 && !state.encryption) {
          commit("setPayload", {
            payload: {
              user: state.user,
              encryption: {
                public_key: null,
                private_key: null,
              },
              auth: {},
            },
          });
        }

        await initiateEncryption();
        await dispatch("setRefreshTimeout");
      } catch (error) {
        commit("setAuth", {
          oauth: {
            access_token: "",
            refresh_token: "",
            expires_in: 0,
          },
        });

        throw error;
      }
    },
    handleAuthSuccess(
      { dispatch, commit },
      { oauth, payload, username, reload = false }
    ) {
      commit("setPayload", { payload });
      dispatch("setAccessToken", { oauth: oauth.data });
      if (username) {
        commit("setUsername", username);
      }

      refresh_channel?.postMessage("refresh");
      if (reload) {
        window.location.reload();
      }
    },
    setAuthPayload: (
      { dispatch, state },
      { payload, codeVerifier, client_id, username, isLoggingIn }
    ) => {
      if (state.user && state.user.id !== payload.user.id) {
        return dispatch("getAuthToken", {
          payload,
          codeVerifier,
          client_id,
          handler: (oauth) => {
            if (!isLoggingIn) {
              dispatch("logout", {}, { root: true });
            }

            dispatch("handleAuthSuccess", {
              oauth,
              payload,
              username,
              reload: true,
            });
          },
        });
      } else {
        return dispatch("getAuthToken", {
          payload,
          codeVerifier,
          client_id,
          handler: (oauth) => {
            dispatch("handleAuthSuccess", {
              oauth,
              payload,
              username,
            });
          },
        });
      }
    },
    getAuthToken(ignore, { payload, codeVerifier, handler, client_id }) {
      const code = payload.auth[client_id]?.code;
      if (code) {
        const data = {
          grant_type: "authorization_code",
          client_id: client_id,
          redirect_uri: payload.auth[client_id].redirect_uri.split("?")[0],
          code: code,
          code_verifier: codeVerifier,
        };

        return AuthService.login(data).then(handler);
      }
      return Promise.reject();
    },
    getUser({ commit }) {
      return UserService.getUserDetails().then(({ data }) => {
        const user = data.results[0];
        commit("encryptionStatus", user.has_setup_encryption, { root: true });
        commit("encryptionFeatureFlag", user.flags.encryption, {
          root: true,
        });
        commit("setUser", user);
        return PersonalInfoService.getInfo();
      });
    },
    setTimeout(ignore, expires) {
      if (timeout) {
        clearTimeout(timeout);
      }
      const momentObject =
        expires instanceof moment ? expires : moment(expires);
      const time =
        typeof expires === "number"
          ? expires
          : momentObject.diff(moment(), "seconds") - 30;
      const fireTime = time > 30 ? time : 1;
      timeout = setTimeout(refreshToken, fireTime * 1000);
    },
    setAccessToken({ commit, dispatch }, { oauth }) {
      const expires = oauth.expires_in;
      dispatch("setTimeout", expires);
      commit("setAuth", { oauth });
    },
    setGuestToken({ commit }, data) {
      commit("setGuest", data);
    },
    setRefreshTimeout({ state, dispatch }) {
      const now = moment().add(30, "seconds");
      const expires = state.auth.expires_in;
      const test = state.auth && state.auth.expires_in && now.isAfter(expires);
      if (test) {
        refreshToken();
      } else {
        dispatch("setTimeout", expires);
      }
    },
    logout({ commit }) {
      commit("setLogout");
    },
    reset({ commit }) {
      commit("setLogout");
    },
    setMfaMethods({ commit }, enabledMethods) {
      commit("setMfaMethods", enabledMethods);
    },
    async initiateExtensionAuth(
      _context,
      options = { silent: true, debug: false }
    ) {
      try {
        if (options.debug) {
          console.log("[Store] Starting extension authentication flow...");
        }

        await initializeExtensionAuth(router, options);
        return { success: true };
      } catch (error) {
        console.error("Extension authentication initiation failed:", {
          error: error?.message || error,
        });
        throw error;
      }
    },
    async broadcastExtensionAuthSuccess({ state }) {
      if (!state.extension?.access_token) {
        console.warn("No extension tokens to broadcast");
        return;
      }

      try {
        if (extensionMessaging?.sendMessage) {
          await extensionMessaging.sendMessage({
            type: EXTENSION_MESSAGE_TYPES.EXTENSION_AUTH_COMPLETE,
            unencrypted: true,
          });
        }
      } catch (err) {
        console.warn("Failed to broadcast auth success to extension:", err);
        throw err; // Re-throw to let caller handle if needed
      }
    },
  },
};
