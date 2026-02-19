import Hashids from "hashids";
const hashids = new Hashids();

const salt = () => {
  return 1234;
};
export const encode = (number) => {
  return hashids.encode(number * (salt() * 10000));
};

export const decode = (number) => {
  return hashids.decode(number)[0] / (salt() * 10000);
};

export const hash = {
  encode,
  decode,
};
