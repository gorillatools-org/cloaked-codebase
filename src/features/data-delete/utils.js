export const additionalSearchSteps = ["initial", "name", "age", "state"];

export const FUNNEL_STEP = {
  LOADER: "LOADER",
  OTP: "OTP",
  RESULTS: "RESULTS",
  NOT_YOU: "NOT_YOU",
  PAYMENT: "PAYMENT",
  SUCCESS: "SUCCESS",
};

export const cameFromBuyCloaked = () => {
  try {
    const referrerUrl = new URL(document?.referrer);
    return referrerUrl?.hostname === "www.buy.cloaked.com";
  } catch {
    return false;
  }
};
