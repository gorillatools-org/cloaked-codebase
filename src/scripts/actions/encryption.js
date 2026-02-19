const EThree = window?.E3kit?.EThree;
import store from "@/store";
import { handler } from "./transit-encryption";
import UserService from "@/api/actions/user-service";
import { posthogCapture } from "@/scripts/posthog";

let eThree;
let cloakEncrypt;

const log = (/*content*/) => {
  // if (import.meta.env.DEBUG_ENCRYPTION) {
  // console.log('ENCRYPTION LOG', content);
  // }
};

export const enabled = () => {
  const userIsV2User =
    store.state.authentication?.user &&
    store.state.authentication?.user?.encryption_status === 3;
  if (userIsV2User) {
    return true;
  } else if (
    store.state.encryption.active &&
    store.state.encryption.secret_key &&
    store.state.encryption.feature_flag_exists
  ) {
    return true;
  }
  return false;
};

export const getVirgilToken = async () => {
  try {
    const { data } = await UserService.getEncryptionStatus();
    return data.jwt_token;
  } catch (e) {
    log({ e });
    throw e;
  }
};

export const initiateEncryption = () => {
  return new Promise((resolve) => {
    (async () => {
      if (enabled()) {
        if (window.CloakedEncryption) {
          const build = await window.CloakedEncryption.build();
          cloakEncrypt = build.encryptionLib;
          resolve();
        }
        if (!eThree) {
          if (
            store.state.authentication?.user?.encryption_status !== 3 &&
            store.state.authentication?.auth?.access_token
          ) {
            try {
              eThree = await EThree.initialize(getVirgilToken);
            } catch {
              eThree = await EThree.initialize(getVirgilToken);
            }
            await connect();
            resolve();
          }
        }
      } else {
        resolve();
      }
    })();
  });
};

export const connect = async () => {
  try {
    await restorePrivateKey(store.state.encryption.secret_key);
  } catch (err) {
    log(`Failed initializing: ${err}`);
  }
};

export const register = async () => {
  const hasLocalPrivateKey = await eThree.hasLocalPrivateKey();
  if (!hasLocalPrivateKey) {
    try {
      //# start of snippet: e3kit_register
      await eThree.register();
      //# end of snippet: e3kit_register
      log(`Registered`);
    } catch (err) {
      this.log(`Failed registering: ${err}`);
      if (err.name === "IdentityAlreadyExistsError") {
        await eThree.cleanup();
        await eThree.rotatePrivateKey();
        log(`Rotated private key instead`);
      }
    }
  } else {
    log("Loaded Private Key from Local Storage!");
  }
};

export const cleanup = async () => {
  try {
    await eThree.cleanup();
    eThree = null;
    cloakEncrypt = null;
    return true;
  } catch {
    return true;
  }
};

export const restorePrivateKey = async (password) => {
  const hasLocalPrivateKey = await eThree.hasLocalPrivateKey();
  if (!hasLocalPrivateKey) {
    try {
      //# start of snippet: e3kit_restore_private_key
      await eThree.restorePrivateKey(password);
      //# end of snippet: e3kit_restore_private_key
      log(`Restored private key`);
    } catch (err) {
      log(`Failed restoring private key: ${err}`);
      if (err.name === "PrivateKeyAlreadyExistsError") {
        await eThree.cleanup();
        log(`Cleaned up. Trying again...`);
        await restorePrivateKey(password);
      } else if (err.name === "PrivateKeyNoBackupError") {
        log("Creating initial private key");
        await backupPrivateKey(password);
      } else if (err.name == "WrongKeyknoxPasswordError") {
        log("Wrong password entered.");

        // await this.cleanup();
        // await this.rotatePrivateKey();
        // await this.backupPrivateKey(password);
      }
    }
  }
};

const backupPrivateKey = async (password) => {
  try {
    //# start of snippet: e3kit_backup_private_key
    await eThree.backupPrivateKey(password);
    //# end of snippet: e3kit_backup_private_key
    log(`Backed up private key`);
  } catch (err) {
    log(`Failed backing up private key: ${err}`);
    if (err.name === "CloudEntryExistsError") {
      await eThree.resetPrivateKeyBackup();
      this.log(`Reset private key backup. Trying again...`);
      await backupPrivateKey(password);
    } else if (err.name === "WrongKeyknoxPasswordError") {
      await eThree.resetPrivateKeyBackup();
      log(`Reset private key backup. Trying again...`);
      await backupPrivateKey(password);
    }
  }
};

export const authEncrypt = async (text) => {
  let encryptedText = null;
  const userIsV2User =
    store.state.authentication?.user &&
    store.state.authentication?.user?.encryption_status === 3;
  if (userIsV2User) {
    try {
      encryptedText = await cloakEncrypt.encryptWithPublicKeyPair(
        text,
        store.state.authentication.encryption.public_key
      );
      return encryptedText;
    } catch (err) {
      log(`Failed encrypting and signing on v2: ${err}`);
    }
  }
  try {
    encryptedText = await eThree.authEncrypt(text);
    return encryptedText;
  } catch (err) {
    log(`Failed encrypting and signing: ${err}`);
  }
  return text;
};

export const authDecryptV2 = async (text, public_key, private_key) => {
  let decryptedText = null;

  try {
    decryptedText = await cloakEncrypt.decryptWithPrivateKeyPair(
      text,
      public_key,
      private_key
    );
    return decryptedText;
  } catch (err) {
    log(`Failed encrypting and signing on v2: ${err}`);
  }
  return text;
};

export const password_confirm = async (password) => {
  const secretKey = await cloakEncrypt.generatePasswordSecretBoxKey(
    password,
    store.state.authentication.encryption.account_salt
  );
  return await cloakEncrypt.generatePasswordAuthKey(
    secretKey,
    store.state.authentication.encryption.account_salt
  );
};

export const sanity_check = async (salt, password, previousKey, newKey) => {
  try {
    const secretKey = await cloakEncrypt.generatePasswordSecretBoxKey(
      password,
      salt
    );
    const decryptedPrivateKey = await cloakEncrypt.decryptPrivateKey(
      secretKey,
      newKey
    );
    return decryptedPrivateKey === previousKey;
  } catch {
    return false;
  }
};

export const authDecrypt = async (text) => {
  let decryptedText = null;
  const userIsV2User =
    store.state.authentication?.user &&
    store.state.authentication?.user?.encryption_status === 3;
  if (userIsV2User) {
    try {
      decryptedText = await authDecryptV2(
        text,
        store.state.authentication.encryption.public_key,
        store.state.authentication.encryption.private_key
      );
      return decryptedText;
    } catch (err) {
      log(`Failed encrypting and signing on v2: ${err}`);
    }
  }
  try {
    decryptedText = await eThree.authDecrypt(text);
    return decryptedText;
  } catch (err) {
    log(`Failed decrypting and verifying: ${err}`);
  }
  try {
    posthogCapture("frontend_failed_decrypt_displayed");
  } catch (err) {
    log(`Failed capturing posthog: ${err}`);
  }
  return "FAILED TO DECRYPT";
};

export const change_password = async (
  currentRawPassword,
  newRawPassword,
  accountSalt,
  decryptedPrivateKey
) => {
  const encryptionSecretKey = await cloakEncrypt.generatePasswordSecretBoxKey(
    currentRawPassword,
    accountSalt
  );
  const currentPassword = await cloakEncrypt.generatePasswordAuthKey(
    encryptionSecretKey,
    accountSalt
  );
  const { encryptedPrivateKey, passwordAuthKey } =
    await cloakEncrypt.passwordChange(
      newRawPassword,
      decryptedPrivateKey,
      accountSalt
    );
  return { encryptedPrivateKey, passwordAuthKey, currentPassword };
};

export const auto_encrypt_send = async (request) => {
  if (enabled()) {
    if (request.method !== "get") {
      return await handler(request, "request", authEncrypt);
    }
  }
  return request;
};

export const auto_encrypt_receive = async (response) => {
  if (enabled()) {
    return handler(response, "response", authDecrypt);
  }
  return response;
};
