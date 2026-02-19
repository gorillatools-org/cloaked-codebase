import { type AppScheme } from "@/composables/useColorScheme.ts";
import { type Appearance } from "@stripe/stripe-js";

export type StripeColorConfig = Record<string, Record<AppScheme, string>>;

export type StripeAppearanceGetter = (
  scheme: AppScheme,
  colors: Record<string, string>
) => Appearance;

export type StripeAppearanceOptions = {
  scheme: AppScheme;
  readOnly: boolean;
  error: boolean;
};

export type StripeAppearanceResolver = (
  options: StripeAppearanceOptions
) => Appearance;

// TODO: inject colors from lib (https://cloakedinc.atlassian.net/browse/ALL-21850)
export const colors: StripeColorConfig = {
  alert: {
    light: "#F24141",
    dark: "#F24141",
  },
  black5Light: {
    light: "rgba(0, 0, 0, 0.05)",
    dark: "rgba(0, 0, 0, 0.05)",
  },
  black15Light: {
    light: "rgba(0, 0, 0, 0.15)",
    dark: "rgba(0, 0, 0, 0.15)",
  },
  black5: {
    light: "rgba(0, 0, 0, 0.05)",
    dark: "rgba(255, 255, 255, 0.05)",
  },
  black10: {
    light: "rgba(0, 0, 0, 0.1)",
    dark: "rgba(255, 255, 255, 0.1)",
  },
  black15: {
    light: "rgba(0, 0, 0, 0.15)",
    dark: "rgba(255, 255, 255, 0.15)",
  },
  black20: {
    light: "rgba(0, 0, 0, 0.2)",
    dark: "rgba(255, 255, 255, 0.2)",
  },
  black40: {
    light: "rgba(0, 0, 0, 0.4)",
    dark: "rgba(255, 255, 255, 0.4)",
  },
  black60: {
    light: "rgba(0, 0, 0, 0.6)",
    dark: "rgba(255, 255, 255, 0.6)",
  },
  black70: {
    light: "rgba(0, 0, 0, 0.7)",
    dark: "rgba(255, 255, 255, 0.7)",
  },
  black100: {
    light: "rgba(0, 0, 0, 1)",
    dark: "rgba(255, 255, 255, 1)",
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

type StripeAppearanceResolverFactory = (options: {
  getEditable: StripeAppearanceGetter;
  getReadonly: StripeAppearanceGetter;
  getError: StripeAppearanceGetter;
  colors: StripeColorConfig;
}) => StripeAppearanceResolver;

export const createStripeAppearanceGetter: StripeAppearanceResolverFactory = (
  options
) => {
  const { getEditable, getReadonly, getError, colors } = options;

  return (options) => {
    const { scheme, readOnly, error } = options;

    const schemeColors = Object.keys(colors).reduce<Record<string, string>>(
      (result, color) => ({
        [color]: colors[color][scheme],
        ...result,
      }),
      {}
    );

    return readOnly
      ? getReadonly(scheme, schemeColors)
      : error
        ? getError(scheme, schemeColors)
        : getEditable(scheme, schemeColors);
  };
};
