export async function fetchErrorCodes() {
  const response = await fetch("https://errors.cloaked.com/v1/errors.json");
  const data = await response.json();
  return data;
}
