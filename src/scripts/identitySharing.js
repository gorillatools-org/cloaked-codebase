import { authDecrypt } from "@/scripts/actions/encryption";

const decryptSharingData = async (
  encryptedSharingData,
  { decryptedPassword, salt, private_key, public_key }
) => {
  const cloakedEncryption = await window.CloakedEncryption.build();

  const passwordSecretBoxKey =
    await cloakedEncryption.generatePasswordSecretBoxKey(
      decryptedPassword,
      salt
    );

  const privateKey = await cloakedEncryption.decryptPrivateKey(
    passwordSecretBoxKey,
    private_key
  );

  let decryptedSharingData = await cloakedEncryption.decryptWithPrivateKeyPair(
    encryptedSharingData,
    public_key,
    privateKey
  );

  decryptedSharingData = JSON.parse(decryptedSharingData).map((item) => ({
    id: item.i,
    type: item.t,
    label: item.l,
    sharedValue: item.v,
    isSecret: item.s,
  }));

  return decryptedSharingData;
};

export const encryptSharingData = async (
  decryptedSharingData,
  { public_key }
) => {
  const cloakedEncryption = await window.CloakedEncryption.build();

  return cloakedEncryption.encryptWithPublicKeyPair(
    JSON.stringify(
      decryptedSharingData.map((item) => ({
        i: item.id,
        t: item.type,
        l: item.label,
        v: item.sharedValue,
        s: item.isSecret,
      }))
    ),
    public_key
  );
};

export const withDecryptedSharing = async (populatedIdentity) => {
  try {
    if (populatedIdentity?.sharing?.data) {
      populatedIdentity.sharing.decryptedPassword = await authDecrypt(
        populatedIdentity.sharing.recipient_shared_password
      );

      populatedIdentity.sharing.data = await decryptSharingData(
        populatedIdentity.sharing.data,
        populatedIdentity.sharing
      );
    }

    return populatedIdentity;
  } catch {
    return populatedIdentity;
  }
};
