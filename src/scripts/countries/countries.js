import { AustralianTerritoriesList } from "@/scripts/countries/australianTerritories";
import { BrazilStatesList } from "@/scripts/countries/brazilStates";
import { CanadianProvinceList } from "@/scripts/countries/canadianProvinces";
import { ChineseProvincesList } from "@/scripts/countries/chineseProvinces";
import { KoreanRegionsList } from "@/scripts/countries/koreanRegions";
import { MalaysianTerritoriesList } from "@/scripts/countries/malaysianTerritories";
import { MexicanStatesList } from "@/scripts/countries/mexicanStates";
import { NewZealandRegionsList } from "@/scripts/countries/newZealandRegions";
import { StateList } from "@/scripts/countries/states";
import { UKCountriesList } from "@/scripts/countries/ukCountries";

export const getUserCountry = (user) => {
  if (!user) {
    return "US";
  }
  return user?.country_at_registration
    ? user?.country_at_registration
    : user?.current_country
      ? user?.current_country
      : "US";
};

export const LAUNCHED_COUNTRIES = ["US", "CA"];

export const phoneCountries = ["us", "ca", "gb", "es", "fr", "it", "de", "in"];

export const countryConfig = {
  US: {
    name: "United States",
    phoneCode: "1",
    addressLevelOneLabel: "State",
    addressLevelOneList: StateList,
  },
  DZ: { name: "Algeria", phoneCode: "213" },
  AD: { name: "Andorra", phoneCode: "376" },
  AO: { name: "Angola", phoneCode: "244" },
  AI: { name: "Anguilla", phoneCode: "1264" },
  AG: { name: "Antigua and Barbuda", phoneCode: "1268" },
  AR: { name: "Argentina", phoneCode: "54" },
  AM: { name: "Armenia", phoneCode: "374" },
  AW: { name: "Aruba", phoneCode: "297" },
  AU: {
    name: "Australia",
    phoneCode: "61",
    addressLevelOneLabel: "State/Territory",
    addressLevelOneList: AustralianTerritoriesList,
  },
  AT: { name: "Austria", phoneCode: "43" },
  AZ: { name: "Azerbaijan", phoneCode: "994" },
  BS: { name: "Bahamas (the)", phoneCode: "1242" },
  BH: { name: "Bahrain", phoneCode: "973" },
  BD: { name: "Bangladesh", phoneCode: "880" },
  BB: { name: "Barbados", phoneCode: "1246" },
  BY: { name: "Belarus", phoneCode: "375" },
  BE: { name: "Belgium", phoneCode: "32" },
  BZ: { name: "Belize", phoneCode: "501" },
  BJ: { name: "Benin", phoneCode: "229" },
  BM: { name: "Bermuda", phoneCode: "1441" },
  BT: { name: "Bhutan", phoneCode: "975" },
  BO: { name: "Bolivia (Plurinational State of)", phoneCode: "591" },
  BQ: { name: "Bonaire, Sint Eustatius and Saba", phoneCode: "599" },
  BA: { name: "Bosnia and Herzegovina", phoneCode: "387" },
  BW: { name: "Botswana", phoneCode: "267" },
  BR: {
    name: "Brazil",
    phoneCode: "55",
    addressLevelOneLabel: "State",
    addressLevelOneList: BrazilStatesList,
  },
  IO: { name: "British Indian Ocean Territory (the)", phoneCode: "246" },
  BN: { name: "Brunei Darussalam", phoneCode: "673" },
  BG: { name: "Bulgaria", phoneCode: "359" },
  BF: { name: "Burkina Faso", phoneCode: "226" },
  BI: { name: "Burundi", phoneCode: "257" },
  KH: { name: "Cambodia", phoneCode: "855" },
  CM: { name: "Cameroon", phoneCode: "237" },
  CA: {
    name: "Canada",
    phoneCode: "1",
    addressLevelOneLabel: "Province/Territory",
    addressLevelOneList: CanadianProvinceList,
  },
  CV: { name: "Cabo Verde", phoneCode: "238" },
  KY: { name: "Cayman Islands (the)", phoneCode: "1345" },
  CF: { name: "Central African Republic (the)", phoneCode: "236" },
  CL: { name: "Chile", phoneCode: "56" },
  CN: {
    name: "China",
    phoneCode: "86",
    addressLevelOneLabel: "Province",
    addressLevelOneList: ChineseProvincesList,
  },
  CO: { name: "Colombia", phoneCode: "57" },
  KM: { name: "Comoros (the)", phoneCode: "269" },
  CD: { name: "Congo (the Democratic Republic of the)", phoneCode: "242" },
  CK: { name: "Cook Islands (the)", phoneCode: "682" },
  CR: { name: "Costa Rica", phoneCode: "506" },
  HR: { name: "Croatia", phoneCode: "385" },
  CU: { name: "Cuba", phoneCode: "53" },
  CY: { name: "Cyprus", phoneCode: "90392" },
  CYP: { name: "Cyprus South", phoneCode: "357" },
  CZ: { name: "Czechia", phoneCode: "42" },
  DK: { name: "Denmark", phoneCode: "45" },
  DJ: { name: "Djibouti", phoneCode: "253" },
  DM: { name: "Dominica", phoneCode: "1809" },
  DO: { name: "Dominican Republic (the)", phoneCode: "1809" },
  EC: { name: "Ecuador", phoneCode: "593" },
  EG: { name: "Egypt", phoneCode: "20" },
  SV: { name: "El Salvador", phoneCode: "503" },
  GQ: { name: "Equatorial Guinea", phoneCode: "240" },
  ER: { name: "Eritrea", phoneCode: "291" },
  EE: { name: "Estonia", phoneCode: "372" },
  ET: { name: "Ethiopia", phoneCode: "251" },
  FK: { name: "Falkland Islands (the) [Malvinas]", phoneCode: "500" },
  FO: { name: "Faroe Islands (the)", phoneCode: "298" },
  FJ: { name: "Fiji", phoneCode: "679" },
  FI: { name: "Finland", phoneCode: "358" },
  FR: { name: "France", phoneCode: "33" },
  GF: { name: "French Guiana", phoneCode: "594" },
  PF: { name: "French Polynesia", phoneCode: "689" },
  GA: { name: "Gabon", phoneCode: "241" },
  GM: { name: "Gambia (the)", phoneCode: "220" },
  GE: { name: "Georgia", phoneCode: "7880" },
  DE: { name: "Germany", phoneCode: "49" },
  GH: { name: "Ghana", phoneCode: "233" },
  GI: { name: "Gibraltar", phoneCode: "350" },
  GR: { name: "Greece", phoneCode: "30" },
  GL: { name: "Greenland", phoneCode: "299" },
  GD: { name: "Grenada", phoneCode: "1473" },
  GP: { name: "Guadeloupe", phoneCode: "590" },
  GU: { name: "Guam", phoneCode: "671" },
  GT: { name: "Guatemala", phoneCode: "502" },
  GN: { name: "Guinea", phoneCode: "224" },
  GW: { name: "Guinea-Bissau", phoneCode: "245" },
  GY: { name: "Guyana", phoneCode: "592" },
  HT: { name: "Haiti", phoneCode: "509" },
  HN: { name: "Honduras", phoneCode: "504" },
  HK: { name: "Hong Kong", phoneCode: "852" },
  HU: { name: "Hungary", phoneCode: "36" },
  IS: { name: "Iceland", phoneCode: "354" },
  IN: { name: "India", phoneCode: "91" },
  ID: { name: "Indonesia", phoneCode: "62" },
  IR: { name: "Iran (Islamic Republic of)", phoneCode: "98" },
  IQ: { name: "Iraq", phoneCode: "964" },
  IE: { name: "Ireland", phoneCode: "353" },
  IL: { name: "Israel", phoneCode: "972" },
  IT: { name: "Italy", phoneCode: "39" },
  JM: { name: "Jamaica", phoneCode: "1876" },
  JP: { name: "Japan", phoneCode: "81" },
  JO: { name: "Jordan", phoneCode: "962" },
  KZ: { name: "Kazakhstan", phoneCode: "7" },
  KE: { name: "Kenya", phoneCode: "254" },
  KI: { name: "Kiribati", phoneCode: "686" },
  KP: { name: "North Korea", phoneCode: "850" },
  KR: {
    name: "South Korea",
    phoneCode: "82",
    addressLevelOneLabel: "Province",
    addressLevelOneList: KoreanRegionsList,
  },
  KW: { name: "Kuwait", phoneCode: "965" },
  KG: { name: "Kyrgyzstan", phoneCode: "996" },
  LA: { name: "Lao People's Democratic Republic (the)", phoneCode: "856" },
  LV: { name: "Latvia", phoneCode: "371" },
  LB: { name: "Lebanon", phoneCode: "961" },
  LS: { name: "Lesotho", phoneCode: "266" },
  LR: { name: "Liberia", phoneCode: "231" },
  LY: { name: "Libya", phoneCode: "218" },
  LI: { name: "Liechtenstein", phoneCode: "417" },
  LT: { name: "Lithuania", phoneCode: "370" },
  LU: { name: "Luxembourg", phoneCode: "352" },
  MO: { name: "Macao", phoneCode: "853" },
  MK: { name: "Republic of North Macedonia", phoneCode: "389" },
  MG: { name: "Madagascar", phoneCode: "261" },
  MW: { name: "Malawi", phoneCode: "265" },
  MY: {
    name: "Malaysia",
    phoneCode: "60",
    addressLevelOneLabel: "State/Territory",
    addressLevelOneList: MalaysianTerritoriesList,
  },
  MV: { name: "Maldives", phoneCode: "960" },
  ML: { name: "Mali", phoneCode: "223" },
  MT: { name: "Malta", phoneCode: "356" },
  MH: { name: "Marshall Islands (the)", phoneCode: "692" },
  MQ: { name: "Martinique", phoneCode: "596" },
  MR: { name: "Mauritania", phoneCode: "222" },
  YT: { name: "Mayotte", phoneCode: "269" },
  MX: {
    name: "Mexico",
    phoneCode: "52",
    addressLevelOneLabel: "State",
    addressLevelOneList: MexicanStatesList,
  },
  FM: { name: "Micronesia (Federated States of)", phoneCode: "691" },
  MD: { name: "Moldova (the Republic of)", phoneCode: "373" },
  MC: { name: "Monaco", phoneCode: "377" },
  MN: { name: "Mongolia", phoneCode: "976" },
  MS: { name: "Montserrat", phoneCode: "1664" },
  MA: { name: "Morocco", phoneCode: "212" },
  MZ: { name: "Mozambique", phoneCode: "258" },
  MM: { name: "Myanmar", phoneCode: "95" },
  NA: { name: "Namibia", phoneCode: "264" },
  NR: { name: "Nauru", phoneCode: "674" },
  NP: { name: "Nepal", phoneCode: "977" },
  NL: { name: "Netherlands (the)", phoneCode: "31" },
  NC: { name: "New Caledonia", phoneCode: "687" },
  NZ: {
    name: "New Zealand",
    phoneCode: "64",
    addressLevelOneLabel: "Region",
    addressLevelOneList: NewZealandRegionsList,
  },
  NI: { name: "Nicaragua", phoneCode: "505" },
  NE: { name: "Niger (the)", phoneCode: "227" },
  NG: { name: "Nigeria", phoneCode: "234" },
  NU: { name: "Niue", phoneCode: "683" },
  NF: { name: "Norfolk Island", phoneCode: "672" },
  MP: { name: "Northern Mariana Islands (the)", phoneCode: "670" },
  NO: { name: "Norway", phoneCode: "47" },
  OM: { name: "Oman", phoneCode: "968" },
  PK: { name: "Pakistan", phoneCode: "92" },
  PW: { name: "Palau", phoneCode: "680" },
  PA: { name: "Panama", phoneCode: "507" },
  PG: { name: "Papua New Guinea", phoneCode: "675" },
  PY: { name: "Paraguay", phoneCode: "595" },
  PE: { name: "Peru", phoneCode: "51" },
  PH: { name: "Philippines (the)", phoneCode: "63" },
  PL: { name: "Poland", phoneCode: "48" },
  PT: { name: "Portugal", phoneCode: "351" },
  PR: { name: "Puerto Rico", phoneCode: "1787" },
  QA: { name: "Qatar", phoneCode: "974" },
  RE: { name: "Réunion", phoneCode: "262" },
  RO: { name: "Romania", phoneCode: "40" },
  RU: { name: "Russian Federation (the)", phoneCode: "7" },
  RW: { name: "Rwanda", phoneCode: "250" },
  SM: { name: "San Marino", phoneCode: "378" },
  ST: { name: "Sao Tome and Principe", phoneCode: "239" },
  SA: { name: "Saudi Arabia", phoneCode: "966" },
  SN: { name: "Senegal", phoneCode: "221" },
  RS: { name: "Serbia", phoneCode: "381" },
  SC: { name: "Seychelles", phoneCode: "248" },
  SL: { name: "Sierra Leone", phoneCode: "232" },
  SG: { name: "Singapore", phoneCode: "65" },
  SK: { name: "Slovakia", phoneCode: "421" },
  SI: { name: "Slovenia", phoneCode: "386" },
  SB: { name: "Solomon Islands", phoneCode: "677" },
  SO: { name: "Somalia", phoneCode: "252" },
  ZA: { name: "South Africa", phoneCode: "27" },
  ES: { name: "Spain", phoneCode: "34" },
  LK: { name: "Sri Lanka", phoneCode: "94" },
  SH: {
    name: "Saint Helena, Ascension and Tristan da Cunha",
    phoneCode: "290",
  },
  KN: { name: "Saint Kitts and Nevis", phoneCode: "1869" },
  LC: { name: "Saint Lucia", phoneCode: "1758" },
  SD: { name: "Sudan (the)", phoneCode: "249" },
  SR: { name: "Suriname", phoneCode: "597" },
  SJ: { name: "Svalbard and Jan Mayen", phoneCode: "268" },
  SE: { name: "Sweden", phoneCode: "46" },
  CH: { name: "Switzerland", phoneCode: "41" },
  SY: { name: "Syrian Arab Republic", phoneCode: "963" },
  TW: { name: "Taiwan", phoneCode: "886" },
  TJ: { name: "Tajikistan", phoneCode: "7" },
  TH: { name: "Thailand", phoneCode: "66" },
  TG: { name: "Togo", phoneCode: "228" },
  TO: { name: "Tonga", phoneCode: "676" },
  TT: { name: "Trinidad and Tobago", phoneCode: "1868" },
  TN: { name: "Tunisia", phoneCode: "216" },
  TR: { name: "Turkey", phoneCode: "90" },
  TM: { name: "Turkmenistan", phoneCode: "993" },
  TC: { name: "Turks and Caicos Islands (the)", phoneCode: "1649" },
  TV: { name: "Tuvalu", phoneCode: "688" },
  UG: { name: "Uganda", phoneCode: "256" },
  UA: { name: "Ukraine", phoneCode: "380" },
  AE: { name: "United Arab Emirates (the)", phoneCode: "971" },
  GB: {
    name: "United Kingdom of Great Britain and Northern Ireland (the)",
    phoneCode: "44",
    addressLevelOneLabel: "Country",
    addressLevelOneList: UKCountriesList,
  },
  UY: { name: "Uruguay", phoneCode: "598" },
  UZ: { name: "Uzbekistan", phoneCode: "7" },
  VU: { name: "Vanuatu", phoneCode: "678" },
  VA: { name: "Holy See (the)", phoneCode: "379" },
  VE: { name: "Venezuela (Bolivarian Republic of)", phoneCode: "58" },
  VN: { name: "Viet Nam", phoneCode: "84" },
  VG: { name: "Virgin Islands (British)", phoneCode: "1284" },
  VI: { name: "Virgin Islands (U.S.)", phoneCode: "1340" },
  WF: { name: "Wallis and Futuna", phoneCode: "681" },
  YE: { name: "Yemen", phoneCode: "969" },
  YD: { name: "Yemen Sount", phoneCode: "967" },
  ZM: { name: "Zambia", phoneCode: "260" },
  ZW: { name: "Zimbabwe", phoneCode: "263" },
};

export const COUNTRY_VALUE_ABREV_MAP = {}; // ex: { "United States": "US" }

// generates values for COUNTRY_VALUE_ABREV_MAP
Object.keys(countryConfig).forEach((key) => {
  COUNTRY_VALUE_ABREV_MAP[countryConfig[key].name] = key;
});

export const countries = (user) => {
  const currentCountryCode = getUserCountry(user);

  const sortedCountries = Object.keys(countryConfig).reduce((acc, code) => {
    if (LAUNCHED_COUNTRIES.includes(code)) {
      /* Add to the beginning of the list if it's a launched country */
      acc.unshift({ name: countryConfig[code].name, code });
      /*  Check if acc already has a divider */
      const hasDivider = acc.some((country) => country.code === "divider");
      if (!hasDivider) {
        acc.unshift({ name: "divider", code: "divider" });
      }
    } else {
      /* Otherwise push in as usual */
      acc.push({ name: countryConfig[code].name, code });
    }
    return acc;
  }, []);

  /* Move user's country to the top */
  const userCountryIndex = sortedCountries.findIndex(
    (country) => country.code === currentCountryCode
  );
  if (userCountryIndex > 0) {
    const userCountry = sortedCountries.splice(userCountryIndex, 1)[0];
    sortedCountries.unshift(userCountry);
  }

  return sortedCountries;
};
