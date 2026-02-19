import { merge } from "lodash-es";
import { type AppScheme } from "@/composables/useColorScheme.ts";
import { type Appearance } from "@stripe/stripe-js";

// TODO: inject colors from lib (https://cloakedinc.atlassian.net/browse/ALL-21850)
const colors: Record<string, Record<AppScheme, string>> = {
  alert: {
    light: "#F24141",
    dark: "#F24141",
  },
  black5: {
    light: "rgba(0, 0, 0, 0.05)",
    dark: "rgba(0, 0, 0, 0.05)",
  },
  black15: {
    light: "rgba(0, 0, 0, 0.15)",
    dark: "rgba(0, 0, 0, 0.15)",
  },
  black20: {
    light: "rgba(0, 0, 0, 0.2)",
    dark: "rgba(0, 0, 0, 0.2)",
  },
  black40: {
    light: "rgba(0, 0, 0, 0.4)",
    dark: "rgba(0, 0, 0, 0.4)",
  },
  primary1: {
    light: "rgba(250, 250, 250, 100%)",
    dark: "rgba(13, 13, 13, 100%)",
  },
  primary5: {
    light: "rgba(247, 247, 247, 100%)",
    dark: "rgba(19, 19, 19, 100%)",
  },
  primary20: {
    light: "rgba(209, 210, 211, 100%)",
    dark: "rgba(71, 75, 79, 100%)",
  },
  primary50: {
    light: "rgba(140, 142, 145, 100%)",
    dark: "rgba(140, 142, 145, 100%)",
  },
  primary100: {
    light: "rgba(0, 0, 0, 100%)",
    dark: "rgba(255, 255, 255, 100%)",
  },
};

const appearanceBase = (
  scheme: AppScheme,
  colors: Record<string, string>
): Appearance => ({
  theme: scheme === "light" ? "stripe" : "night",
  labels: "above",
  disableAnimations: true,
  variables: {
    colorDanger: colors.alert, // couldn't fully override with rules
    tabIconHoverColor: colors.primary50, // couldn't fully override with rules
    fontFamily: "Urbanist, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "12px",
    gridColumnSpacing: "8px",
    tabSpacing: "4px",
    gridRowSpacing: "8px",
    fontSmooth: "always",
  },
  rules: {
    ".Label": {
      fontSize: "13px",
      fontWeight: "500",
    },
    ".Input": {
      padding: "23px 16px",
      fontSize: "15px",
      fontWeight: "600",
      transition: "none",
    },
    ".Input::placeholder": {
      fontWeight: "600",
      fontSize: "15px",
    },
    ".Input--invalid": {
      color: colors.primary100,
    },
    ".Tab": {
      fontSize: "13px",
      fontWeight: "600",
      padding: "14px 16px",
      transition: "none",
    },
    ".TabIcon": {
      transition: "none",
    },
    ".TabLabel": {
      transition: "none",
    },
    ".Error": {
      fontSize: "13px",
      fontWeight: "500",
    },
    ".TermsText": {
      fontSize: "13px",
      fontWeight: "400",
    },
  },
});

const appearanceEditable = (
  scheme: AppScheme,
  colors: Record<string, string>
): Appearance =>
  merge(JSON.parse(JSON.stringify(appearanceBase(scheme, colors))), {
    rules: {
      ".Label": {
        color: colors.primary50,
      },
      ".Input": {
        backgroundColor: colors.primary1,
        border: `1px solid ${colors.black20}`,
        color: colors.primary100,
        boxShadow: `0 5px 20px 0 ${colors.black5}`,
      },
      ".Input::placeholder": {
        color: colors.primary20,
      },
      ".Input:hover": {
        border: `1px solid ${colors.black40}`,
      },
      ".Input:hover:focus": {
        border: `1px solid ${colors.primary100}`,
      },
      ".Input:focus": {
        border: `1px solid ${colors.primary100}`,
        boxShadow: `0 10px 24px 0 ${colors.black15}`,
      },
      ".Input--invalid": {
        border: "1px solid var(--colorDanger)",
        boxShadow: `0 5px 20px 0 ${colors.black5}`,
      },
      ".Input--invalid:hover": {
        border: "1px solid var(--colorDanger)",
      },
      ".Input--invalid:focus": {
        border: "1px solid var(--colorDanger)",
      },
      ".Input--invalid:hover:focus": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab": {
        backgroundColor: colors.primary1,
        border: `1px solid ${colors.black20}`,
        color: colors.primary100,
        boxShadow: `0 5px 20px 0 ${colors.black5}`,
      },
      ".Tab:hover": {
        border: `1px solid ${colors.black40}`,
      },
      ".Tab:focus": {
        border: `1px solid ${colors.primary100}`,
        boxShadow: `0 5px 20px 0 ${colors.black5}`,
      },
      ".Tab--selected": {
        backgroundColor: colors.primary1,
        border: `1px solid ${colors.primary100}`,
        boxShadow: `0 5px 20px 0 ${colors.black5}`,
      },
      ".Tab--selected:hover": {
        border: `1px solid ${colors.primary100}`,
      },
      ".Tab--selected:focus": {
        border: `1px solid ${colors.primary100}`,
        boxShadow: `0 5px 20px 0 ${colors.black5}`,
      },
      ".TabIcon": {
        fill: colors.primary50,
      },
      ".TabIcon--selected": {
        fill: colors.primary100,
      },
      ".TabLabel": {
        color: colors.primary50,
      },
      ".TabLabel--selected": {
        color: colors.primary100,
      },
      ".Block": {
        backgroundColor: colors.primary1,
      },
      ".TermsText": {
        color: colors.primary50,
      },
    },
  });

const appearanceReadonly = (
  scheme: AppScheme,
  colors: Record<string, string>
): Appearance =>
  merge(JSON.parse(JSON.stringify(appearanceEditable(scheme, colors))), {
    variables: {
      tabIconHoverColor: colors.primary20, // couldn't fully override with rules
    },
    rules: {
      ".Input": {
        backgroundColor: colors.primary5,
        border: `1px solid ${colors.black5}`,
        color: colors.primary20,
        boxShadow: "none",
        // cursor: "not-allowed", // TODO: no supported, find a replacement
      },
      ".Input::placeholder": {
        color: colors.primary20,
      },
      ".Input:hover": {
        border: `1px solid ${colors.black5}`,
      },
      ".Input:hover:focus": {
        border: `1px solid ${colors.black5}`,
      },
      ".Input:focus": {
        border: `1px solid ${colors.black5}`,
        boxShadow: "none",
      },
      ".Input--invalid": {
        border: "1px solid var(--colorDanger)",
        boxShadow: "none",
      },
      ".Input--invalid:hover": {
        border: "1px solid var(--colorDanger)",
      },
      ".Input--invalid:focus": {
        border: "1px solid var(--colorDanger)",
      },
      ".Input--invalid:hover:focus": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab": {
        backgroundColor: colors.primary5,
        border: `1px solid ${colors.black5}`,
        color: colors.primary20,
        boxShadow: `none`,
      },
      ".Tab:hover": {
        border: `1px solid ${colors.black5}`,
      },
      ".Tab:focus": {
        border: `1px solid ${colors.black5}`,
        boxShadow: `none`,
      },
      ".Tab--selected": {
        backgroundColor: colors.primary5,
        border: `1px solid ${colors.black20}`,
        boxShadow: `none`,
      },
      ".Tab--selected:hover": {
        border: `1px solid ${colors.black20}`,
      },
      ".Tab--selected:focus": {
        border: `1px solid ${colors.black20}`,
        boxShadow: `none`,
      },
      ".TabIcon": {
        fill: colors.primary20,
      },
      ".TabIcon--selected": {
        fill: colors.primary50,
      },
      ".TabLabel": {
        color: colors.primary50,
      },
      ".TabLabel--selected": {
        color: colors.primary50,
      },
    },
  });

const appearanceError = (
  scheme: AppScheme,
  colors: Record<string, string>
): Appearance =>
  merge(JSON.parse(JSON.stringify(appearanceEditable(scheme, colors))), {
    rules: {
      ".Input": {
        border: "1px solid var(--colorDanger)",
      },
      ".Input:hover": {
        border: "1px solid var(--colorDanger)",
      },
      ".Input:hover:focus": {
        border: "1px solid var(--colorDanger)",
      },
      ".Input:focus": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab:hover": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab:focus": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab--selected": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab--selected:hover": {
        border: "1px solid var(--colorDanger)",
      },
      ".Tab--selected:focus": {
        border: "1px solid var(--colorDanger)",
      },
    },
  });

export type StripeAppearanceOptions = {
  scheme: AppScheme;
  readOnly: boolean;
  error: boolean;
};

export const getStripeAppearance = (
  options: StripeAppearanceOptions
): Appearance => {
  const { scheme, readOnly, error } = options;

  const schemeColors = Object.keys(colors).reduce<Record<string, string>>(
    (result, color) => ({
      [color]: colors[color][scheme],
      ...result,
    }),
    {}
  );

  return readOnly
    ? appearanceReadonly(scheme, schemeColors)
    : error
      ? appearanceError(scheme, schemeColors)
      : appearanceEditable(scheme, schemeColors);
};
