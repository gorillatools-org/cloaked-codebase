import { merge } from "lodash-es";
import {
  colors,
  createStripeAppearanceGetter,
  type StripeAppearanceGetter,
} from "@/features/checkout/stripeAppearance.ts";

export const appearanceLibBase: StripeAppearanceGetter = (scheme, colors) => ({
  theme: scheme === "light" ? "stripe" : "night",
  labels: "above",
  disableAnimations: true,
  variables: {
    colorDanger: colors.alert, // couldn't fully override with rules
    tabIconHoverColor: colors.primary50, // couldn't fully override with rules
    fontFamily: "STKBureauSans, system-ui, sans-serif",
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

export const appearanceLibEditable: StripeAppearanceGetter = (scheme, colors) =>
  merge(appearanceLibBase(scheme, colors), {
    rules: {
      ".Label": {
        color: colors.primary50,
      },
      ".Input": {
        backgroundColor: colors.primary1,
        border: `1px solid ${colors.black20}`,
        color: colors.primary100,
        boxShadow: `0 5px 20px 0 ${colors.black5Light}`,
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
        boxShadow: `0 10px 24px 0 ${colors.black15Light}`,
      },
      ".Input--invalid": {
        border: "1px solid var(--colorDanger)",
        boxShadow: `0 5px 20px 0 ${colors.black5Light}`,
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
        boxShadow: `0 5px 20px 0 ${colors.black5Light}`,
      },
      ".Tab:hover": {
        border: `1px solid ${colors.black40}`,
      },
      ".Tab:focus": {
        border: `1px solid ${colors.primary100}`,
        boxShadow: `0 5px 20px 0 ${colors.black5Light}`,
      },
      ".Tab--selected": {
        backgroundColor: colors.primary1,
        border: `1px solid ${colors.primary100}`,
        boxShadow: `0 5px 20px 0 ${colors.black5Light}`,
      },
      ".Tab--selected:hover": {
        border: `1px solid ${colors.primary100}`,
      },
      ".Tab--selected:focus": {
        border: `1px solid ${colors.primary100}`,
        boxShadow: `0 5px 20px 0 ${colors.black5Light}`,
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

export const appearanceLibReadonly: StripeAppearanceGetter = (scheme, colors) =>
  merge(appearanceLibEditable(scheme, colors), {
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

export const appearanceLibError: StripeAppearanceGetter = (scheme, colors) =>
  merge(appearanceLibEditable(scheme, colors), {
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

export const getStripeAppearanceCheckout = createStripeAppearanceGetter({
  getReadonly: appearanceLibReadonly,
  getError: appearanceLibError,
  getEditable: appearanceLibEditable,
  colors,
});
