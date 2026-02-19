import { createPassword } from "@/scripts/actions/crypto";
import { authEncrypt } from "@/scripts/actions/encryption";
import { invert } from "lodash-es";

export const generateSharingPassword = () =>
  createPassword({
    letters: true,
    numbers: true,
    symbols: true,
    similar: false,
    size: 20,
    words: false,
  });

export const generateSharingEncryption = async (
  password = generateSharingPassword()
) => {
  const cloakedEncryption = await window.CloakedEncryption.build();
  const sharedKeyPair = await cloakedEncryption.generateAsymmetricKeys();
  const salt = await cloakedEncryption.generateUserSalt();
  const sharedPasswordSecretBoxKey =
    await cloakedEncryption.generatePasswordSecretBoxKey(password, salt);
  const privateKey = await cloakedEncryption.encryptPrivateKey(
    sharedPasswordSecretBoxKey,
    sharedKeyPair.privateKey
  );

  const encryptedPassword = await authEncrypt(password);

  return {
    password: encryptedPassword,
    privateKey,
    salt,
    publicKey: sharedKeyPair.publicKey,
  };
};

export const generateNewPassword = async ({
  salt,
  private_key,
  public_key,
  decryptedPassword,
}) => {
  const cloakedEncryption = await window.CloakedEncryption.build();

  const sharedPasswordSecretBoxKey =
    await cloakedEncryption.generatePasswordSecretBoxKey(
      decryptedPassword,
      salt
    );

  const privateKey = await cloakedEncryption.decryptPrivateKey(
    sharedPasswordSecretBoxKey,
    private_key
  );

  const newPassword = generateSharingPassword();

  const newSharedPasswordSecretBoxKey =
    await cloakedEncryption.generatePasswordSecretBoxKey(newPassword, salt);

  const newPrivateKey = await cloakedEncryption.encryptPrivateKey(
    newSharedPasswordSecretBoxKey,
    privateKey
  );

  const newEncryptedPassword = await authEncrypt(newPassword);

  return {
    salt,
    publicKey: public_key,
    password: newEncryptedPassword,
    privateKey: newPrivateKey,
  };
};

export const identityKeyToType = {
  nickname: "std_name",
  website_url: "std_website",
  username: "std_username",
  email: "std_email",
  password: "std_password",
  phone: "std_phone",
};

export const identityKeyToLabel = {
  nickname: "Identity name",
  website_url: "URL",
  username: "Username",
  email: "Email",
  password: "Password",
  phone: "Phone",
};
export const autofillTypesToParms = {
  std_username: "autofill_username",
  std_email: "autofill_email",
  std_phone: "autofill_phone_number",
  std_password: "autofill_password",
};
export const autofillParamToTypes = invert(autofillTypesToParms);

export const customFieldTypes = [
  "text",
  "address",
  "url",
  "date",
  "bank",
  "auth",
  "identification",
  "totp_url",
  "totp_secret",
];

export const broadcastConstants = {
  USER_LOGGED_IN: "USER_LOGGED_IN",
  USER_SHARED_IDENTITY: "USER_SHARED_IDENTITY",
  USER_LOGGED_OUT: "USER_LOGGED_OUT",
  USER_SAVED_IDENTITY: "USER_SAVED_IDENTITY",
};
