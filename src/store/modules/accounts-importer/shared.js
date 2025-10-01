export const FILE_TYPE_CSV = "text/csv";
export const FILE_TYPE_1PUX = ".1pux";
export const SUPPORTED_FILE_TYPES = [FILE_TYPE_CSV];

export const IMPORT_STATUS_PENDING = "PENDING";
export const IMPORT_STATUS_STARTED = "STARTED";
export const IMPORT_STATUS_RUNNING = "RUNNING";
export const IMPORT_STATUS_FINISHED = "FINISHED";
export const IMPORT_STATUS_FAILURE = "FAILURE";

export const FILE_UPLOAD_READY = "ready";
export const FILE_UPLOAD_LOADING = "loading";
export const FILE_UPLOAD_SUCCESS = "success";
export const FILE_UPLOAD_WARNING = "warning";
export const FILE_UPLOAD_WARNING_HAS_TABLE_HEAD = "warning-has-table-head";
export const FILE_UPLOAD_WARNING_EXTRA_COLUMNS = "warning-extra-columns";
export const FILE_UPLOAD_WARNING_EXTRA_FIELDS = "warning-extra-fields";
export const FILE_UPLOAD_ERROR = "error";
export const FILE_UPLOAD_ERROR_UNSUPPORTED = "error-unsupported";
export const FILE_UPLOAD_ERROR_ALTERNATE_DELIMITERS =
  "error-alternate-delimiters";
export const FILE_UPLOAD_ERROR_FILE_TOO_LARGE = "error-file-too-large";

export const FILE_UPLOAD_SUCCESS_STATES = [
  FILE_UPLOAD_SUCCESS,
  FILE_UPLOAD_WARNING,
  FILE_UPLOAD_WARNING_HAS_TABLE_HEAD,
  FILE_UPLOAD_WARNING_EXTRA_COLUMNS,
  FILE_UPLOAD_WARNING_EXTRA_FIELDS,
];

export const STATUS_READY = "READY";
export const STATUS_FIRST_DUPLICATE = "FIRST_DUPLICATE";
export const STATUS_DUPLICATE = "DUPLICATE";
export const STATUS_MISSING_IDENTITY_NAME = "MISSING_IDENTITY_NAME";
export const STATUS_MISSING_CREDENTIALS_AND_URL = "MISSING_CREDENTIALS_AND_URL";
export const STATUS_MISSING_CREDENTIALS = "MISSING_CREDENTIALS";
export const STATUS_MISSING_URL = "MISSING_URL";
export const STATUS_INVALID_URL = "INVALID_URL";
export const STATUS_INVALID_EMAIL = "INVALID_EMAIL";

export const STATUSES_READY = [STATUS_READY];
export const STATUSES_DUPLICATE = [STATUS_FIRST_DUPLICATE, STATUS_DUPLICATE];
export const STATUSES_MISSING_INFO = [
  STATUS_MISSING_IDENTITY_NAME,
  STATUS_MISSING_CREDENTIALS_AND_URL,
  STATUS_MISSING_CREDENTIALS,
  STATUS_MISSING_URL,
  STATUS_INVALID_EMAIL,
  STATUS_INVALID_URL,
];

export const NEXT_STATE_NOT_IMPORTED = "NOT_IMPORTED";
export const NEXT_STATE_UNLABELED_COLUMNS = "UNLABELED_COLUMNS";
export const NEXT_STATE_ALL_LABELED_AS_NOTES = "ALL_LABELED_AS_NOTES";
export const NEXT_STATE_MISSING_NAME_AND_URL = "MISSING_NAME_AND_URL";
export const NEXT_STATE_NO_IDENTITIES_SELECTED = "NO_IDENTITIES_SELECTED";
export const NEXT_STATE_OK = "OK";

export const FIELD_NICKNAME = "Nickname";
export const FIELD_EMAIL = "Email";
export const FIELD_PASSWORD = "Password";
export const FIELD_NOTES = "Notes";
export const FIELD_WEBSITE = "Website";
export const FIELD_FAVORITE = "Favorite";
export const FIELD_USERNAME = "Username";
export const FIELD_PHONE_NUMBER = "Phone number";
export const FIELD_DATE = "Date created";
export const FIELD_TOTP = "TOTP";

export const LABEL_NICKNAME = "Identity name";
export const LABEL_WEBSITE = "URL";
export const LABEL_USERNAME = "Username";
export const LABEL_PASSWORD = "Password";
export const LABEL_EMAIL = "Email address";
export const LABEL_PHONE_NUMBER = "Phone number";
export const LABEL_TOTP = "One-time passcode";
export const LABEL_NOTES = "Add to notes";
export const LABEL_DATE = "Date created";
export const LABEL_FAVORITE = "Favorite";
export const LABEL_IGNORE = "Ignore column";
export const LABEL_STATUS = "Status";

export const CUSTOM_FIELD_TEXT = "Custom Text";
export const CUSTOM_FIELD_ADDRESS = "Custom Address";
export const CUSTOM_FIELD_AUTH_KEY = "Custom Auth Key";
export const CUSTOM_FIELD_BANKING_INFO = "Custom Banking Information";
export const CUSTOM_FIELD_IDENTIFICATION = "Custom Identification";
export const CUSTOM_FIELD_DATE = "Custom Date";
export const CUSTOM_FIELD_URL = "Custom URL";

export const LABEL_CUSTOM_TEXT = "Custom Text";
export const LABEL_CUSTOM_ADDRESS = "Address";
export const LABEL_CUSTOM_AUTH_KEY = "Authentication key";
export const LABEL_CUSTOM_BANKING_INFO = "Banking information";
export const LABEL_CUSTOM_IDENTIFICATION = "Identification number ";
export const LABEL_CUSTOM_DATE = "Date";
export const LABEL_CUSTOM_URL = "Secondary URL";

export const FIELD_TO_LABEL_MAPPING = {
  [FIELD_NICKNAME]: LABEL_NICKNAME,
  [FIELD_WEBSITE]: LABEL_WEBSITE,
  [FIELD_USERNAME]: LABEL_USERNAME,
  [FIELD_PASSWORD]: LABEL_PASSWORD,
  [FIELD_EMAIL]: LABEL_EMAIL,
  [FIELD_PHONE_NUMBER]: LABEL_PHONE_NUMBER,
  [FIELD_TOTP]: LABEL_TOTP,
  [FIELD_NOTES]: LABEL_NOTES,
  [FIELD_DATE]: LABEL_DATE,
  [FIELD_FAVORITE]: LABEL_FAVORITE,
  [LABEL_IGNORE]: LABEL_IGNORE,
  [LABEL_STATUS]: LABEL_STATUS,
  [CUSTOM_FIELD_TEXT]: LABEL_CUSTOM_TEXT,
  [CUSTOM_FIELD_ADDRESS]: LABEL_CUSTOM_ADDRESS,
  [CUSTOM_FIELD_AUTH_KEY]: LABEL_CUSTOM_AUTH_KEY,
  [CUSTOM_FIELD_BANKING_INFO]: LABEL_CUSTOM_BANKING_INFO,
  [CUSTOM_FIELD_IDENTIFICATION]: LABEL_CUSTOM_IDENTIFICATION,
  [CUSTOM_FIELD_DATE]: LABEL_CUSTOM_DATE,
  [CUSTOM_FIELD_URL]: LABEL_CUSTOM_URL,
};

export const CUSTOM_LABELS = [
  { label: LABEL_CUSTOM_TEXT, value: CUSTOM_FIELD_TEXT, isUnique: false },
  { label: LABEL_CUSTOM_ADDRESS, value: CUSTOM_FIELD_ADDRESS, isUnique: false },
  {
    label: LABEL_CUSTOM_AUTH_KEY,
    value: CUSTOM_FIELD_AUTH_KEY,
    isUnique: false,
  },
  {
    label: LABEL_CUSTOM_BANKING_INFO,
    value: CUSTOM_FIELD_BANKING_INFO,
    isUnique: false,
  },
  {
    label: LABEL_CUSTOM_IDENTIFICATION,
    value: CUSTOM_FIELD_IDENTIFICATION,
    isUnique: false,
  },
  { label: LABEL_CUSTOM_DATE, value: CUSTOM_FIELD_DATE, isUnique: false },
  { label: LABEL_CUSTOM_URL, value: CUSTOM_FIELD_URL, isUnique: false },
  { label: LABEL_IGNORE, value: LABEL_IGNORE, isWarning: true },
];

export const CUSTOM_FIELD_TO_TYPE_MAPPING = {
  [CUSTOM_FIELD_TEXT]: "text",
  [CUSTOM_FIELD_ADDRESS]: "address",
  [CUSTOM_FIELD_AUTH_KEY]: "auth",
  [CUSTOM_FIELD_BANKING_INFO]: "bank",
  [CUSTOM_FIELD_IDENTIFICATION]: "identification",
  [CUSTOM_FIELD_DATE]: "date",
  [CUSTOM_FIELD_URL]: "url",
};

export const IMPORT_OPTION_ONE_PASSWORD = "1-password";
export const IMPORT_OPTION_DASHLANE = "dashlane";
export const IMPORT_OPTION_LASTPASS = "lastpass";
export const IMPORT_OPTION_BITWARDEN = "bitwarden";
export const IMPORT_OPTION_KEEPER = "keeper";
export const IMPORT_OPTION_KEYCHAIN = "keychain";
export const IMPORT_OPTION_OTHER_MANAGER = "other-manager";
export const IMPORT_OPTION_CHROME = "chrome";
export const IMPORT_OPTION_BRAVE = "brave";
export const IMPORT_OPTION_SAFARI = "safari";
export const IMPORT_OPTION_FIREFOX = "firefox";
export const IMPORT_OPTION_EDGE = "edge";
export const IMPORT_OPTION_OPERA = "opera";
export const IMPORT_OPTION_OTHER_BROWSER = "other-browser";
export const IMPORT_OPTION_CSV = "csv";
export const STORAGE_KEY_IMPORT_USED = "import-used";
