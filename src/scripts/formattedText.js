export const getFormattedNickname = (identity) => {
  let nickname = "(Unnamed)";
  if (identity) {
    if (identity.nickname) {
      nickname = identity.nickname;
    } else if (identity.n) {
      nickname = identity.n;
    } else if (identity.name) {
      nickname = identity.name;
    }
  }
  return nickname;
};

export const url = (value) => {
  if (value) {
    let url = value.match(/https?:\/\//)
      ? value
      : `https://${value.replaceAll(/^[^a-zA-Z0-9]+/g, "")}`;
    const rules = new RegExp(
      /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
      "i"
    );
    if (rules.exec(url)) {
      return url;
    }
  }
  return false;
};

export const password = (value) => {
  const rules = new RegExp(/^[a-zA-Z0-9-@#_]{8,20}/, "i");
  return rules.exec(value);
};

export const email = (value) => {
  const rules = new RegExp(
    /^[a-zA-Z0-9~\-_.+]+@[a-zA-Z0-9\-_]+\.[a-zA-Z0-9.]+$/,
    "i"
  );
  return rules.exec(value);
};

export const phone = (value) => {
  if (value) {
    const rules = new RegExp(/^\+?[0-9]{9,14}/, "i");
    return rules.exec(value.replaceAll(/[^0-9+]/gi, ""));
  }
  return false;
};

export const formattedText = {
  getFormattedNickname,
  url,
  password,
  email,
  phone,
};
