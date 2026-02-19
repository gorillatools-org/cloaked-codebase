import store from "@/store";

const fields = [
  "email",
  "address",
  "firstname",
  "lastname",
  "notes",
  "otp",
  "password",
  "phone",
  "username",
];

export const write_import = async (request, encrypt) => {
  let maps = fields;
  const userIsNotV2User =
    store.state.authentication?.user?.encryption_status !== 3;
  if (userIsNotV2User) {
    maps = ["password"];
  }
  const promisesData = request.data.accounts.map(async (row) => {
    const miniPromises = maps.map(async (f) => {
      if (row[f]) {
        row[f] = await encrypt(row[f]);
        row.encrypted = true;
        row.encrypted_version = userIsNotV2User ? 1 : 2;
      }
    });
    return await Promise.all(miniPromises).then(() => {
      return row;
    });
  });
  return await Promise.all(promisesData).then((results) => {
    request.data.accounts = results;
    return request;
  });
};
