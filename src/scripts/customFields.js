import { authDecrypt, authEncrypt } from "@/scripts/actions/encryption";

const decryptCustomField = (encryptedCustomField) =>
  new Promise((resolve, reject) => {
    authDecrypt(encryptedCustomField.value).then((decryptedValueString) => {
      try {
        const decryptedValue = JSON.parse(decryptedValueString);

        resolve({
          id: encryptedCustomField.id,
          type: decryptedValue.t,
          label: decryptedValue.l,
          value: decryptedValue.v,
          isSecret: decryptedValue.s,
        });
      } catch (e) {
        reject(e);
      }
    });
  });

export const encryptCustomField = (decryptedCustomField) =>
  new Promise((resolve) => {
    authEncrypt(
      JSON.stringify({
        t: decryptedCustomField.type,
        l: decryptedCustomField.label,
        v: decryptedCustomField.value,
        s: decryptedCustomField.isSecret,
      })
    ).then((encryptedValue) => {
      resolve({
        id: decryptedCustomField.id,
        value: encryptedValue,
      });
    });
  });

export const withDecryptedCustomFields = async (populatedIdentity) => {
  try {
    populatedIdentity.customFields = await Promise.all(
      Object.keys(
        populatedIdentity?.stored_autofill?.custom_field ??
          populatedIdentity?.customFields ??
          {}
      )
        .map((key) => ({
          id: key,
          value:
            populatedIdentity?.stored_autofill?.custom_field?.[key] ??
            populatedIdentity?.customFields?.[key],
        }))
        .map((customField) => decryptCustomField(customField))
    );

    return populatedIdentity;
  } catch {
    return populatedIdentity;
  }
};

export const withEncryptedCustomFields = async (importedIdentity) => {
  try {
    const encryptedCustomFields = await Promise.all(
      importedIdentity.custom_field.map((customField) =>
        encryptCustomField(customField)
      )
    );

    importedIdentity.custom_field = {};

    encryptedCustomFields.forEach((customField) => {
      importedIdentity.custom_field[customField.id] = customField.value;
    });

    return importedIdentity;
  } catch {
    importedIdentity.customFields = {};
    return importedIdentity;
  }
};
