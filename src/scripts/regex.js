// urls
import { FILE_PERMISSIONS } from "@/scripts/constants";

export const urlCheck =
  /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
export const urlNotFirstPage = /page=[2-9]/i;

// search
export const beginningOfEveryWord = (query) => {
  // replace anything that's not a lower/uppercase letter, period, dash, or underscore with a boundary

  const updated = query.replace(/[^a-zA-Z0-9.@\-_/\s]+/g);
  return new RegExp(updated, "ig");
};
export const matchInWord = (query) => {
  const updated = query.replace(/[^a-zA-Z0-9.@\-_]+/g);
  return new RegExp(`(${updated})`, "ig");
};

export const isTypeBanned = (mime, name) => {
  const bannedTypes = FILE_PERMISSIONS.BANNED.map((type) => {
    const [ext, mime] = type.split(":");
    return {
      ext: ext.trim(),
      mime: mime.trim(),
    };
  });
  const ext = name.split(".").pop();
  return bannedTypes.find((f) => {
    return f.mime === mime || f.ext === `.${ext}`;
  });
};

export const emailCheck = (email) => {
  // eslint-disable-next-line no-control-regex
  return /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:\\[\x00-\x7F]|[^\x22\\])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)$/.test(
    email
  );
};

export const nameCheck = (name) => {
  // eslint-disable-next-line no-control-regex
  return /^[^\x00-\x1F!-&(-,/:-@[-_\x7B-\x7F]{1,100}$/.test(name);
};

export const isMobileDevice =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
export const isAndroid = /Android/i.test(navigator.userAgent);

export const codeCheck = (code) => {
  return !!code && code?.match(/[0-9]{6}/i);
};

export const regex = {
  urlCheck,
  urlNotFirstPage,
  beginningOfEveryWord,
  matchInWord,
  isTypeBanned,
  emailCheck,
  isMobileDevice,
  isAndroid,
  codeCheck,
};
