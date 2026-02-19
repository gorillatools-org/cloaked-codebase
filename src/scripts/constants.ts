import type { User } from "@/types/user";

/* Constants for email and phone contacts, passed to <ContactsViewEdit /> and used in modal. Do not change unless API endpoint has changes */
export const CONTACT_TYPE = {
  PHONE: "phone",
  EMAIL: "email",
};
export const CONTACT_CARD_MODE = {
  VIEW: "view",
  EDIT: "edit",
  BLOCK: "block",
  ADD: "add",
};
export const CONTACT_STATUS = {
  APPROVED: "approved",
  BLOCKED: "blocked",
  UNKNOWN: "unknown",
};
export const CONTACT_ACTION = {
  APPROVE: "approve",
  BLOCK: "block",
};
export const CONTACT_ACTION_TO_STATUS = {
  approve: "approved",
  block: "blocked",
};

export const SUPPORTED_CARDS_COUNTRIES = ["US"];

export const getShouldShowCards = (user: User | null): boolean => {
  if (!user) return false;

  const userCountry = user?.country_at_registration
    ? user?.country_at_registration
    : user?.current_country;

  return (
    (user?.cloaked_card_enabled ||
      user?.cloaked_card_enabled_status === "enabled") &&
    SUPPORTED_CARDS_COUNTRIES.includes(userCountry)
  );
};

/* website url constants */
export const BASE_WEBSITE_URL = "https://www.cloaked.com";
export const WEBSITE_TERMS_OF_SERVICE_URL = `${BASE_WEBSITE_URL}/terms-of-service`;
export const WEBSITE_PRIVACY_POLICY_URL = `${BASE_WEBSITE_URL}/privacy-policy`;
export const WEBSITE_PAY_AGREEMENTS_URL = `${BASE_WEBSITE_URL}/cloaked-pay/legal`;
export const WEBSITE_REFERRAL_TERMS_URL = `${BASE_WEBSITE_URL}/referral-terms-exclusions`;
export const WEBSITE_WAYS_TO_USE_UTL = `${BASE_WEBSITE_URL}/faq/5-exciting-ways-to-use-the-cloaked-mobile-app`;
export const WEBSITE_ID_THEFT_URL = `${BASE_WEBSITE_URL}/id-theft-protection-terms-and-conditions`;
export const WEBSITE_ID_THEFT_ASSURANT_URL = `${BASE_WEBSITE_URL}/assurant-identity-theft-protection-summary-of-benefits`;
export const WEBSITE_ID_THEFT_ABOUT_URL = `${BASE_WEBSITE_URL}/features/id-theft-protection`;
export const WEBSITE_NUMBER_LOCK_FAQ_URL = `${BASE_WEBSITE_URL}/faq/what-is-number-locking-and-how-do-i-use-it`;
export const WEBSITE_BLOG_URL = `${BASE_WEBSITE_URL}/blog`;
export const WEBSITE_SHARING_UTMS_URL = `${BASE_WEBSITE_URL}/?utm_source=sharing&utm_medium=cloakedsharing&utm_campaign=sharing`;

/* help center url constants */
export const HELP_CENTER_BASE_URL = "https://help.cloaked.app/hc/en-us";
export const HELP_CENTER_REFERRAL_URL = `${HELP_CENTER_BASE_URL}/articles/23531618354324-Cloaked-Referrals`;
export const HELP_CENTER_IMPORT_URL = `${HELP_CENTER_BASE_URL}/sections/19705847998100-Importing-Passwords`;
export const HELP_CENTER_HOUSEKEEPING_URL = `${HELP_CENTER_BASE_URL}/articles/19471112047764-Housekeeping-How-to-get-fully-set-up`;
export const HELP_CENTER_TEXT_FAQ_URL = `${HELP_CENTER_BASE_URL}/articles/11841989344404-How-do-Phone-Calls-and-Text-Messages-Work`;
export const HELP_CENTER_FORWARDING_FAQ_URL = `${HELP_CENTER_BASE_URL}/articles/19026756336916-How-To-Manage-Email-Phone-Forwarding-via-Dashboard`;
export const HELP_CENTER_AUTOFILL_FAQ_URL = `${HELP_CENTER_BASE_URL}/articles/20198975857684-Frequently-Asked-Questions-about-Autofill`;
export const HELP_CENTER_DATA_DELETION_GUIDES_URL = `${HELP_CENTER_BASE_URL}/sections/32761225692948-Cloaked-Guides`;

/* Terms and Conditions - PDF */
export const AUTO_PAY_TERMS_URL =
  "https://cdn.prod.website-files.com/63ec0f977f0357126ec38bcd/691f1d472f79caf97003d072_AutoPay%20Authorization%20Terms.docx%20(1).pdf";

export const EXTENSION_STORE_URL =
  "https://chromewebstore.google.com/detail/cloaked-privacy-password/oppdbdefikkkihgbliidckokhgcmmiga";

export const BUY_CLOAKED_URL = "https://www.buy.cloaked.com";

/* dynamic url (AppsFlyer) constants */
export const DOWNLOAD_APP_URL = "https://download.cloaked.com";
export const AF_BASE_URL = "https://try.cloaked.com";
/* template ID for each env can also be found on AppsFlyer
under Engage > OneLink Management > select the env
and it will appear in the upper right hand corner */
export const DD_SHARE_URL = `${AF_BASE_URL}/${
  import.meta.env.VITE_AF_TEMPLATE_ID
}/3d9wiz1e`;
export const AF_SIGNUP_URL = `${AF_BASE_URL}/${
  import.meta.env.VITE_AF_TEMPLATE_ID
}/signup`;
/* social media urls */
export const TWITTER_URL = "https://twitter.com/keepitcloaked";
export const MEDIUM_URL = "https://keepitcloaked.medium.com";
export const DISCORD_URL = "https://cloaked.community";
export const JOBS_URL = "https://jobs.lever.co/cloaked-app";
export const TYPEFORM_WAITLIST_URL =
  "https://keepitcloaked.typeform.com/waitlist";
export const FREE_SHIRT_URL = "https://shop.keepitcloaked.com/";

export const SUPPORT_EMAIL = "support@cloaked.com";

export const SUPPORT_PHONE = "+18559751028";

export const IDENTITY_THEFT_PROTECTION_PHONE_CLOAKED_PAY = "1-833-568-6249";
export const IDENTITY_THEFT_PROTECTION_PHONE_REGULAR = "1-866-434-3572";

export const POSTHOG_URL = "https://mississippi.cloaked.com";

/* legacy hack for creating an identity "without" a url */
export const NO_URL_IDENTITY_DOMAIN = "cloaked.app";

export const FILE_PERMISSIONS = {
  TEXT_ALLOWED: ["png", "jpg", "jpeg", "pdf"],
  // NOTE: format is ".ext: mime-type"
  BANNED: [
    ".ade: application/msaccess",
    ".adp: application/msaccess",
    ".apk: application/vnd.android.package-archive",
    ".appx: application/vnd.ms-appx",
    ".appxbundle: application/vnd.ms-appx-bundle",
    ".bat: application/x-msdownload",
    ".cab: application/vnd.ms-cab-compressed",
    ".chm: application/vnd.ms-htmlhelp",
    ".cmd: text/cmd",
    ".com: application/x-msdownload",
    ".cpl: application/x-cpl",
    ".diagcab: application/vnd.ms-cab-diagnostic",
    ".diagcfg: application/vnd.ms-cab-diagnostic-config",
    ".diagpack: application/vnd.ms-cab-diagnostic-package",
    ".dll: application/x-msdownload",
    ".dmg: application/x-apple-diskimage",
    ".ex: application/x-msdownload",
    ".ex_: application/x-msdownload",
    ".exe: application/x-msdownload",
    ".hta: application/hta",
    ".img: application/octet-stream",
    ".ins: application/x-internet-signup",
    ".iso: application/octet-stream",
    ".isp: application/x-internet-signup",
    ".jar: application/java-archive",
    ".jnlp: application/x-java-jnlp-file",
    ".js: application/javascript",
    ".jse: application/javascript",
    ".lib: application/octet-stream",
    ".lnk: application/x-ms-shortcut",
    ".mde: application/msaccess",
    ".msc: application/octet-stream",
    ".msi: application/x-msdownload",
    ".msix: application/x-msix-package",
    ".msixbundle: application/vnd.ms-appx-msixbundle",
    ".msp: application/mspatch",
    ".mst: application/octet-stream",
    ".nsh: application/octet-stream",
    ".pif: application/x-ms-shortcut",
    ".ps1: application/octet-stream",
    ".scr: application/x-msdownload",
    ".sct: application/x-sct",
    ".shb: application/x-shockwave-flash",
    ".svg: image/svg+xml",
    ".sys: application/octet-stream",
    ".vb: application/octet-stream",
    ".vbe: application/octet-stream",
    ".vbs: text/vbscript",
    ".vhd: application/x-virtualbox-vhd",
    ".vxd: application/vnd.visio",
    ".wsc: text/scriptlet",
    ".wsf: application/x-wsf",
    ".wsh: application/x-wsh",
    ".xll: application/xll.ms-excel",
  ],
};

export const STRIPE_MANAGE_URL = import.meta.env.VITE_STRIPE_MANAGE_URL;

export const ACCOUNT_RESTRICTED_STATE = "CANCELED";

export const VIEW_TYPE = {
  LIST: "list",
  GRID: "grid",
};

export const MAIN_INBOX_PAGE_NAMES = [
  "Inbox",
  "Texts",
  "Calls",
  "Emails",
  "Requests",
  "Starred",
];
export const SPECIAL_INBOX_PAGE_NAMES = [
  "CategoryInbox",
  "CloakInbox",
  "FavoritesInbox",
  "RecentInbox",
  "StarredInbox",
];
export const INBOX_ROUTE_TYPE_CONVERSION = {
  Inbox: "all",
  Emails: "email",
  Texts: "message",
  Calls: "call",
  Requests: "requests",
  Starred: "starred",
};

export const INBOX_ATTACHMENT_MAX_FILE_LIMIT = 5;

export const INBOX_TYPES = {
  EMAIL: "email",
  MESSAGE: "message",
  CALL: "call",
};

export const SUBSCRIPTION_STORES_FORMATTED = {
  stripe: "Stripe",
  app_store: "the App Store",
  play_store: "the Play Store",
  paypal: "PayPal",
  unknown: "Cloaked Support", //Most legacy users
  manual_upgrade: "Cloaked Support", //Legacy users OR Important People that we wanted to have access to all paid features including DD
};

export const SUBSCRIPTION_STORES = {
  STRIPE: "stripe",
  APP_STORE: "app_store",
  PLAY_STORE: "play_store",
  PAYPAL: "paypal",
  UNKNOWN: "unknown",
  MANUAL_UPGRADE: "manual_upgrade",
};

export const GENERIC_ALL_FEATURES = [
  "Unlimited identities",
  "Unlimited email addresses",
  "Unlimited usernames and passwords",
  "Your own encrypted database",
  "Personalized communication controls",
];

export const PAID_US_FEATURES = [
  ...GENERIC_ALL_FEATURES,
  "Identity Theft Protection",
  "Data Deletion",
];

export const PAID_CA_FEATURES = [...GENERIC_ALL_FEATURES, "Data Deletion"];

export const US_UPGRADE_FEATURES = [
  "Identity Theft Protection",
  "Data Deletion",
];

export const CA_UPGRADE_FEATURES = ["Data Deletion"];

export const EXPIRED_RESTRICTEDPLAN_FEATURES = [
  "Editing of existing identities",
  "Unlimited phone numbers",
  "Unlimited email addresses",
  "Unlimited usernames and passwords",
  "Unlimited identities",
  "Personalized communication controls",
];

export const RESTRICTEDPLAN_FEATURES = [
  "Previously created identities",
  "Sending and receiving calls, texts, and emails",
];

export const DEFAULT_PASSWORD_SETTINGS = {
  letters: true,
  numbers: true,
  symbols: true,
  similar: false,
  size: 16,
  words: false,
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DATA_REMOVAL_STATUS = {
  SCANNING: "scanning",
  NO_RECORDS_FOUND: "no_records_found",
  REMOVAL_IN_PROGRESS: "removal_in_progress",
  REMOVED: "removed",
  ACTION_REQUIRED: "action_required",
  CONTINUED: "continued",
};

export const DATA_REMOVAL_STATUS_DISPLAY = {
  scanning: "Scanning",
  no_records_found: "No records found",
  removal_in_progress: "In progress",
  removed: "Complete",
  action_required: "Needs attention",
  continued: "Continued on next scan",
};

export const ESIM_STATE_DISPLAY = {
  unknown: "unknown",
  pending_initial_msisdn: "pending",
  msisdn_assigned: "pending",
  pending_confirmation: "pending",
  deactivated: "deactivated",
  suspended: "suspended",
  activated: "active",
};

export const LOCAL_STORAGE_KEYS = {
  TRIGGER_EXTENSION_DATA_REMOVAL: "cloaked_trigger_extension_data_removal",
};

export const CARD_FS_VERSION_OWN_CARD = 2;
export const CARD_FS_VERSION_STRIPE = 1;

export const CARD_TYPE = {
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
} as const;

export const CARD_PROVIDER_TYPE = {
  STRIPE_FLOW_DEBIT: "stripe_flow_debit",
  STRIPE_FLOW_CREDIT: "stripe_flow_credit",
  PLAID_STRIPE_FLOW_ACH: "plaid_stripe_flow_ach",
  CHECKOUT_FLOW_CREDIT: "checkout_flow_credit",
  CHECKOUT_FLOW_DEBIT: "checkout_flow_debit",
  CHECKOUT_FLOW_ACH: "checkout_flow_ach",
} as const;

export const CARD_LABEL_BY_PROVIDER_TYPE = {
  // Stripe
  stripe_flow_debit: "Debit",
  stripe_flow_credit: "Credit",
  plaid_stripe_flow_ach: "ACH",
  // Checkout
  checkout_flow_credit: "Credit",
  checkout_flow_debit: "Debit",
  checkout_flow_ach: "ACH",
};

export const CARD_LABEL_BY_PROVIDER_TYPE_UNKNOWN = "Unknown";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const CARD_PROVIDER_TYPE_UNKNOWN = "unknown";

export const EXTENSION_MESSAGE_TYPES = {
  EXTENSION_AUTH_COMPLETE: "EXTENSION_AUTH_COMPLETE",
  DASHBOARD_LOGGED_OUT: "DASHBOARD_LOGGED_OUT",
  OPERATOR_DASHBOARD_LINK_RESPONSE: "OPERATOR_DASHBOARD_LINK_RESPONSE",
  AUTO_PASSWORD_CHANGE_URL_RESPONSE: "AUTO_PASSWORD_CHANGE_URL_RESPONSE",
  EXTENSION_REQUESTED_TOKEN: "EXTENSION_REQUESTED_TOKEN",
};

export const constants = {
  CONTACT_TYPE,
  CONTACT_CARD_MODE,
  CONTACT_STATUS,
  CONTACT_ACTION,
  CONTACT_ACTION_TO_STATUS,
  SUPPORTED_CARDS_COUNTRIES,
  getShouldShowCards,
  BASE_WEBSITE_URL,
  WEBSITE_TERMS_OF_SERVICE_URL,
  WEBSITE_PRIVACY_POLICY_URL,
  WEBSITE_PAY_AGREEMENTS_URL,
  WEBSITE_REFERRAL_TERMS_URL,
  WEBSITE_WAYS_TO_USE_UTL,
  WEBSITE_ID_THEFT_URL,
  WEBSITE_ID_THEFT_ABOUT_URL,
  WEBSITE_NUMBER_LOCK_FAQ_URL,
  WEBSITE_BLOG_URL,
  WEBSITE_SHARING_UTMS_URL,
  HELP_CENTER_BASE_URL,
  HELP_CENTER_REFERRAL_URL,
  HELP_CENTER_IMPORT_URL,
  HELP_CENTER_HOUSEKEEPING_URL,
  HELP_CENTER_TEXT_FAQ_URL,
  HELP_CENTER_FORWARDING_FAQ_URL,
  HELP_CENTER_AUTOFILL_FAQ_URL,
  HELP_CENTER_DATA_DELETION_GUIDES_URL,
  BUY_CLOAKED_URL,
  DOWNLOAD_APP_URL,
  AF_BASE_URL,
  DD_SHARE_URL,
  AF_SIGNUP_URL,
  TWITTER_URL,
  MEDIUM_URL,
  DISCORD_URL,
  JOBS_URL,
  TYPEFORM_WAITLIST_URL,
  FREE_SHIRT_URL,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  IDENTITY_THEFT_PROTECTION_PHONE_CLOAKED_PAY,
  IDENTITY_THEFT_PROTECTION_PHONE_REGULAR,
  POSTHOG_URL,
  NO_URL_IDENTITY_DOMAIN,
  FILE_PERMISSIONS,
  STRIPE_MANAGE_URL,
  ACCOUNT_RESTRICTED_STATE,
  VIEW_TYPE,
  MAIN_INBOX_PAGE_NAMES,
  SPECIAL_INBOX_PAGE_NAMES,
  INBOX_ROUTE_TYPE_CONVERSION,
  INBOX_ATTACHMENT_MAX_FILE_LIMIT,
  INBOX_TYPES,
  SUBSCRIPTION_STORES_FORMATTED,
  SUBSCRIPTION_STORES,
  GENERIC_ALL_FEATURES,
  PAID_US_FEATURES,
  PAID_CA_FEATURES,
  US_UPGRADE_FEATURES,
  CA_UPGRADE_FEATURES,
  EXPIRED_RESTRICTEDPLAN_FEATURES,
  RESTRICTEDPLAN_FEATURES,
  DEFAULT_PASSWORD_SETTINGS,
  MONTHS,
  DATA_REMOVAL_STATUS,
  DATA_REMOVAL_STATUS_DISPLAY,
  ESIM_STATE_DISPLAY,
  CARD_FS_VERSION_OWN_CARD,
  CARD_FS_VERSION_STRIPE,
  CARD_TYPE,
  CARD_PROVIDER_TYPE,
  CARD_LABEL_BY_PROVIDER_TYPE,
  CARD_LABEL_BY_PROVIDER_TYPE_UNKNOWN,
  HTTP_STATUS,
  CARD_PROVIDER_TYPE_UNKNOWN,
  EXTENSION_MESSAGE_TYPES,
  AUTO_PAY_TERMS_URL,
};

// Data Deletion Limits
export const MAX_ADDRESSES_LIMIT = 25;
