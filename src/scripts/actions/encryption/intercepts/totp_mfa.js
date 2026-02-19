export const read_totp_mfa = async (response, decrypt) => {
  if (response.data) {
    const { data } = response;
    if (data?.totp?.png && data?.totp?.uri) {
      data.totp = {
        png: await decrypt(data?.totp?.png),
        uri: await decrypt(data?.totp?.uri),
      };
    }
    response.data = data;
    return response;
  } else {
    return response;
  }
};
export const write_totp_mfa = async (request, encrypt) => {
  try {
    const { data } = request;
    if (data?.totp?.png && data?.totp?.uri) {
      data.totp = {
        png: await encrypt(data?.totp?.png),
        uri: await encrypt(data?.totp?.uri),
      };
      data.encrypted = true;
      data.encrypted_version = 2;
    }
    request.data = data;
    return request;
  } catch {
    return request;
  }
};
