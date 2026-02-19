export const CHECKOUT_SUBMISSION_ERRORS = {
  createAccount: "Failed to create an account. Please try again.",
  processPayment: "Failed to process payment. Please try again.",
  submitPayment: "Failed to submit payment. Please try again.",
  logIn: "Failed to log in. Please try again.",
} as const;

export const CLOAKED_PLAN_FEATURES = [
  {
    title: "Mobile VPN",
    detail:
      "Mask your IP address for complete privacy & safety when browsing. Connect to servers in 68 countries to access region-restricted content.",
  },
  {
    title: "Data removal & dark web monitoring",
    detail:
      "Remove your personal information from 130+ data brokers + realtime dark web alerts for your sensitive info.",
  },
  {
    title: "Unlimited aliases & password manager",
    detail:
      "Generate and manage unlimited aliases - email addresses, phone numbers, passwords and usernames to protect your personal information from exposure.",
  },
  {
    title: "Call Guard spam protection",
    detail: "Block scam calls and robocalls instantly.",
  },
  {
    title: "$1 million identity theft insurance",
    detail:
      "Up to $1,000,000 in comprehensive insurance on your digital identity. (🇺🇸 only)",
  },
  {
    title: "Call, text, and email in one place",
    detail:
      "Every alias comes with a full-featured inbox that you can use inside of Cloaked or forward to your personal one.",
  },
  {
    title: "Custom password manager fields",
    detail:
      "Encrypt more than just login details to your identities with custom fields.",
  },
  {
    title: "Dedicated customer support",
    detail: "Cloaked support is one click away at any time ready to help you.",
  },
] as const;
