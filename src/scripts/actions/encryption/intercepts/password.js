import store from "@/store";

export const read_password = async (response, decrypt) => {
  if (response.data) {
    if (response.data.encrypted && response.data.password) {
      response.data.password = await decrypt(response.data.password);
    }
    return response;
  } else {
    return response;
  }
};
export const write_password = async (request, encrypt) => {
  try {
    const data = { ...request.data };
    if (data.password) {
      const isThisUserAV1User =
        store.state.authentication?.user?.encryption_status !== 3;
      data.password = await encrypt(data.password);
      data.encrypted = true;
      data.encrypted_version = isThisUserAV1User ? 1 : 2;
    }
    request.data = data;
    return request;
  } catch {
    return request;
  }
};
