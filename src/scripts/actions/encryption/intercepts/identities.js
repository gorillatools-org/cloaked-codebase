import { autofill_decrypter } from "@/scripts/actions/encryption/intercepts/autofill";
import { autofillParamToTypes } from "@/features/cloakDetails/IdentitySharing/utils";

export const transform = async (results, decrypt) => {
  const promises = results.map(async (row) => {
    if (row.stored_autofill) {
      row.stored_autofill = await autofill_decrypter(
        row.stored_autofill,
        decrypt
      );
    }
    return row;
  });
  return await Promise.all(promises);
};

export const read_identities = async (response, decrypt) => {
  if (response.data) {
    if (response.data.results) {
      response.data.results = await transform(response.data.results, decrypt);
    } else {
      const row = await transform([response.data], decrypt);
      response.data = row[0];
    }
    return response;
  } else {
    return response;
  }
};

export const read_create_identity = async (response, decrypt) => {
  if (response.data.stored_password) {
    const updated = await transform([response.data], decrypt);
    response.data = updated[0];
    return response;
  } else {
    return response;
  }
};
export const write_create_identity = async (request, encrypt) => {
  if (request.data?.autofill) {
    const { autofill } = request.data;
    const customField = autofill?.custom_field || {};
    /* slightly different from the full list of autofill fields */
    const autofillFieldsToEncrypt = Object.keys(autofillParamToTypes);
    const autofillParamsToEncrypt = Object.keys(autofill).filter((item) =>
      autofillFieldsToEncrypt.includes(item)
    );

    const autofillPromises = autofillParamsToEncrypt.map(async (field) => {
      autofill.encrypted = true;
      autofill.encrypted_version = 2;
      return (autofill[field] = await encrypt(autofill[field]));
    });
    const customFieldsPromises = Object.keys(customField)?.map(async (id) => {
      return (customField[id] = await encrypt(customField[id]));
    });
    return Promise.all([...autofillPromises, ...customFieldsPromises]).then(
      () => {
        if (Object.keys(customField).length > 0) {
          autofill.custom_field = customField;
        }
        request.data.autofill = autofill;
        return request;
      }
    );
  } else {
    return request;
  }
};
