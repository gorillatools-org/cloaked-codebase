// import api from "api";
import store from "@/store";
const fields = [
  "autofill_password",
  "autofill_email",
  "autofill_phone_number",
  "autofill_notes",
  "autofill_username",
  "autofill_first_name",
  "autofill_last_name",
  "autofill_dob",
  "autofill_sex",
  "autofill_street_address",
  "autofill_unit",
  "autofill_country",
  "autofill_postal_code",
  "autofill_address_line1",
  "autofill_address_line2",
  "autofill_address_level1",
  "autofill_address_level2",
  "autofill_address_level3",
  "autofill_address_level4",
  "autofill_otp",
];

export const autofill_encrypter = async (payload, encrypt) => {
  const data = { ...payload };
  let encrypt_fields = [...fields];
  const isThisUserAV1User =
    store.state.authentication?.user?.encryption_status !== 3;
  if (isThisUserAV1User) {
    encrypt_fields = ["autofill_password"];
  }

  const promises = encrypt_fields.map(async (f) => {
    if (data[f]) {
      data.encrypted = true;
      data.encrypted_version = isThisUserAV1User ? 1 : 2;
      data[f] = await encrypt(data[f]);
    }
    return data[f];
  });
  return Promise.all(promises).then(() => {
    return data;
  });
};

export const autofill_decrypter = async (payload, decrypt) => {
  const data = Array.isArray(payload) ? payload : [payload];
  const promisesData = data.map(async (row) => {
    if (row.encrypted_meta) {
      const keys = Object.keys(row.encrypted_meta).filter(
        (k) => !k.toLowerCase().includes("password")
      );
      const promises = keys.map(async (k) => {
        if (row.encrypted_meta[k]) {
          row[k] = await decrypt(row[k]);
        }
        return row[k];
      });
      return Promise.all(promises).then(() => {
        return row;
      });
    }
    return row;
  });
  return await Promise.all(promisesData).then((results) => {
    return Array.isArray(payload) ? results : results[0];
  });
};
export const read_autofill = async (response, decrypt) => {
  if (response.data && response.data.results) {
    response.data.results = await autofill_decrypter(
      response.data.results,
      decrypt
    );
  } else if (response.data) {
    response.data = await autofill_decrypter(response.data, decrypt);
  }
  return response;
};
export const write_autofill = async (request, encrypt) => {
  try {
    request.data = await autofill_encrypter(request.data, encrypt);
    return request;
  } catch {
    return request;
  }
};
export const read_autofill_single = async (response, decrypt) => {
  if (response.data) {
    const decrypted = await autofill_decrypter([response.data], decrypt);
    response.data = decrypted[0];
  }
  return response;
};
export const write_autofill_single = async (request, encrypt) => {
  try {
    request.data = await autofill_encrypter(request.data, encrypt);
    return request;
  } catch {
    return request;
  }
};
