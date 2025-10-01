import store from "@/store";

export const read_card = async (response, decrypt) => {
  if (response.data && response.data.results) {
    const promises = response.data.results.map(async (row) => {
      row.cardholder_name = await decrypt(row.cardholder_name);
      row.card_number = await decrypt(row.card_number);
      row.expiry_date = await decrypt(row.expiry_date);
      row.last_4_digits = await decrypt(row.last_4_digits);
      row.card_type = await decrypt(row.card_type);
      row.cvv = await decrypt(row.cvv);
      row.billing_name = await decrypt(row.billing_name);
      row.billing_address_1 = await decrypt(row.billing_address_1);
      row.billing_address_2 = await decrypt(row.billing_address_2);
      row.billing_city = await decrypt(row.billing_city);
      row.billing_state = await decrypt(row.billing_state);
      row.billing_zip = await decrypt(row.billing_zip);
      row.billing_country = await decrypt(row.billing_country);
      return row;
    });
    return await Promise.all(promises).then((results) => {
      response.data.results = results;
      return response;
    });
  } else {
    return response;
  }
};
export const write_card = async (request, encrypt) => {
  try {
    const isThisUserAV1User =
      store.state.authentication?.user?.encryption_status !== 3;
    const data = { ...request.data };
    if (data.card_number) {
      const cardholder_name =
        data.cardholder_name && (await encrypt(data.cardholder_name));
      const card_number = data.card_number && (await encrypt(data.card_number));
      const expiry_date = data.expiry_date && (await encrypt(data.expiry_date));
      const cvv = data.cvv && (await encrypt(data.cvv));
      const billing_name =
        data.billing_name && (await encrypt(data.billing_name));
      const billing_address_1 =
        data.billing_address_1 && (await encrypt(data.billing_address_1));
      const billing_address_2 =
        data.billing_address_2 && (await encrypt(data.billing_address_2));
      const billing_city =
        data.billing_city && (await encrypt(data.billing_city));
      const billing_state =
        data.billing_state && (await encrypt(data.billing_state));
      const billing_zip = data.billing_zip && (await encrypt(data.billing_zip));
      const billing_country =
        data.billing_country && (await encrypt(data.billing_country));
      const last_4_digits =
        data.last_4_digits && (await encrypt(data.last_4_digits));
      const card_type = data.card_type && (await encrypt(data.card_type));

      if (card_number) {
        data.cardholder_name = cardholder_name;
        data.card_number = card_number;
        data.expiry_date = expiry_date;
        data.cvv = cvv;
        data.last_4_digits = last_4_digits;
        data.card_type = card_type;
        data.billing_name = billing_name;
        data.billing_address_1 = billing_address_1;
        data.billing_address_2 = billing_address_2;
        data.billing_city = billing_city;
        data.billing_state = billing_state;
        data.billing_zip = billing_zip;
        data.billing_country = billing_country;
        data.encrypted_version = isThisUserAV1User ? 1 : 2;
        data.encrypted = true;
        request.data = data;
      }
    }
    return request;
  } catch {
    return request;
  }
};

export const write_giftcard = async (request) => {
  try {
    const isThisUserAV1User =
      store.state.authentication?.user?.encryption_status !== 3;
    const data = { ...request.data };
    /* Note to Aaron, if any data needs to be encrypted in the giftcard request, you can do so like this */
    // if (data.username) {
    //   const username = data.username && (await encrypt(data.username));
    //   request.data.username = username;
    // }

    /* the username hash */
    if (data.shared_username) {
      const cloakedEncryption = await window.CloakedEncryption.build();
      const hashedUsername = await cloakedEncryption.generateUsernameHash(
        data.shared_username
      );

      /* Rewrite the incoming string username as a hash */
      data.shared_username = hashedUsername;
    }
    data.encrypted_version = isThisUserAV1User ? 1 : 2;
    request.data = data;
    return request;
  } catch {
    return request;
  }
};
