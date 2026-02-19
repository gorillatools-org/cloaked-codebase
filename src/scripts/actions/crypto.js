import wordList from "@/scripts/wordList";

export const createPassword = ({
  letters,
  numbers,
  symbols,
  similar,
  size,
  words,
}) => {
  const password = new Array(size).fill("");

  if (words) {
    return password
      .map(() => {
        return wordList[random(wordList.length) - 1];
      })
      .join(symbols ? "." : "");
  }
  const alpha = "abcdefghjklmnpqrstuvwxyzABCDEFGHJKMNOPQRSTUVWXYZ";
  const nums = "123456789";
  const sym = "@#$%_:.|~*(){}!;";
  const sim = "oO04ZLI";
  const fullSet = [
    letters ? alpha : "",
    numbers ? nums : "",
    symbols ? sym : "",
    similar ? sim : "",
  ]
    .filter((a) => !!a)
    .join("");

  return password
    .map(() => {
      return fullSet[random(fullSet.length) - 1];
    })
    .join("");
};

const random = (size) => {
  return Math.floor(Math.random() * size);
};
