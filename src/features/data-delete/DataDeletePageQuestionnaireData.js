export const checkoutDiagnosticThreeQuestions = [
  {
    id: 1,
    type: "single-select",
    required: true,
    question: "How many spam calls do you get per day?",
    options: [
      { value: "none", label: "None (0-1 per day)" },
      { value: "few", label: "A few (2-4 per day)" },
      { value: "problem", label: "It's a problem (5-10 per day)" },
      { value: "way-too-many", label: "Way too many (10+ per day)" },
      { value: "none-of-above", label: "None of the above" },
    ],
  },
  {
    id: 2,
    type: "multi-select",
    required: false,
    question:
      "Which of the following have you used to protect yourself online?",
    options: [
      {
        value: "password-manager",
        label: "Password manager",
      },
      {
        value: "two-factor-auth",
        label: "Two factor authentication (2FA) for your accounts",
      },
      { value: "vpn", label: "VPN (Virtual Private Network) " },
      {
        value: "masking-service",
        label: "Google Voice, Hide My Email, or a similar masking service ",
      },
      { value: "data-removal", label: "Requested website remove your data" },
      { value: "other", label: "Other", isTextInput: true },
    ],
  },
  {
    id: 3,
    type: "multi-select",
    required: false,
    question: "Are you experiencing any security issues right now?",
    options: [
      {
        value: "fraudulent-charges",
        label: "Fraudulent charges on my bank or credit cards",
      },
      { value: "identity-theft", label: "Someone stole my identity" },
      { value: "stalking", label: "Someone is stalking me" },
      { value: "accounts-hacked", label: "My accounts got hacked" },
      {
        value: "unauthorized-login",
        label: "Someone is trying to log into my accounts",
      },
      { value: "credit-alerts", label: "Credit alerts about my information" },
      { value: "other", label: "Other", isTextInput: true },
    ],
  },
];
