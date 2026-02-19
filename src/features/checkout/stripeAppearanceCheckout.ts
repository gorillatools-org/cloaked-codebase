import { merge } from "lodash-es";
import {
  colors,
  createStripeAppearanceGetter,
  type StripeAppearanceGetter,
} from "@/features/checkout/stripeAppearance.ts";
import {
  appearanceLibBase,
  appearanceLibEditable,
  appearanceLibError,
} from "@/features/checkout/stripeAppearanceLib.ts";

const appearanceCheckoutBase: StripeAppearanceGetter = (scheme, colors) =>
  merge(appearanceLibBase(scheme, colors), {
    rules: {
      ".Input--invalid": {
        color: colors.black100,
      },
    },
  });

const appearanceCheckoutEditable: StripeAppearanceGetter = (scheme, colors) =>
  merge(
    appearanceCheckoutBase(scheme, colors),
    appearanceLibEditable(scheme, colors),
    {
      rules: {
        ".Label": {
          color: colors.black70,
        },
        ".Input": {
          backgroundColor: colors.black5,
          border: `1px solid ${colors.black5}`,
          color: colors.black100,
        },
        ".Input::placeholder": {
          color: colors.black20,
        },
        ".Input:hover": {
          border: `1px solid ${colors.black10}`,
        },
        ".Input:hover:focus": {
          border: `1px solid ${colors.black70}`,
        },
        ".Input:focus": {
          border: `1px solid ${colors.black70}`,
        },
        ".Tab": {
          backgroundColor: colors.black5,
          border: `1px solid ${colors.black5}`,
          color: colors.black100,
        },
        ".Tab:hover": {
          border: `1px solid ${colors.black10}`,
        },
        ".Tab:focus": {
          border: `1px solid ${colors.black70}`,
        },
        ".Tab--selected": {
          backgroundColor: colors.black5,
          border: `1px solid ${colors.black70}`,
        },
        ".Tab--selected:hover": {
          border: `1px solid ${colors.black70}`,
        },
        ".Tab--selected:focus": {
          border: `1px solid ${colors.black70}`,
        },
        ".TabIcon": {
          fill: colors.black40,
        },
        ".TabIcon--selected": {
          fill: colors.black100,
        },
        ".TabLabel": {
          color: colors.black70,
        },
        ".TabLabel--selected": {
          color: colors.black100,
        },
        ".Block": {
          backgroundColor: colors.black5,
        },
        ".TermsText": {
          color: colors.black60,
        },
      },
    }
  );

const appearanceCheckoutReadonly: StripeAppearanceGetter = (scheme, colors) =>
  merge(appearanceCheckoutEditable(scheme, colors), {
    variables: {
      tabIconHoverColor: colors.black20, // couldn't fully override with rules
    },
    rules: {
      ".Input": {
        backgroundColor: colors.black5,
        border: `1px solid ${colors.black5}`,
        color: colors.black20,
        boxShadow: "none",
      },
      ".Input::placeholder": {
        color: colors.black20,
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
        boxShadow: "none",
      },
      ".Tab": {
        backgroundColor: colors.black5,
        border: `1px solid ${colors.black5}`,
        color: colors.black20,
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
        backgroundColor: colors.black5,
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
        fill: colors.black20,
      },
      ".TabIcon--selected": {
        fill: colors.black40,
      },
      ".TabLabel": {
        color: colors.black40,
      },
      ".TabLabel--selected": {
        color: colors.black40,
      },
    },
  });

const appearanceCheckoutError: StripeAppearanceGetter = (scheme, colors) =>
  merge(
    appearanceCheckoutEditable(scheme, colors),
    appearanceLibError(scheme, colors)
  );

export const getStripeAppearanceCheckout = createStripeAppearanceGetter({
  getReadonly: appearanceCheckoutReadonly,
  getError: appearanceCheckoutError,
  getEditable: appearanceCheckoutEditable,
  colors,
});
