import { type AppScheme } from "@/composables/useColorScheme";

export const getStripeModalAppearance = (colorScheme: AppScheme) => {
  const isDark = colorScheme === "dark";

  return {
    theme: "none" as const,
    labels: "above" as const,
    disableAnimations: true,
    variables: {
      colorDanger: "#F24141",
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
        color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(140, 142, 145, 1)",
      },
      ".Input": {
        padding: "23px 16px",
        fontSize: "15px",
        fontWeight: "600",
        transition: "none",
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 1)"
          : "rgba(250, 250, 250, 1)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0, 0, 0, 0.2)",
        color: isDark ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
      ".Input::placeholder": {
        fontWeight: "600",
        fontSize: "15px",
        color: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(209, 210, 211, 1)",
      },
      ".Input:hover": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.4)"
          : "1px solid rgba(0, 0, 0, 0.4)",
      },
      ".Input:focus": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 1)"
          : "1px solid rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 10px 24px 0 rgba(0, 0, 0, 0.4)"
          : "0 10px 24px 0 rgba(0, 0, 0, 0.15)",
      },
      ".Tab": {
        fontSize: "13px",
        fontWeight: "600",
        padding: "14px 16px",
        transition: "none",
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 1)"
          : "rgba(250, 250, 250, 1)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0, 0, 0, 0.2)",
        color: isDark ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
      ".Tab:hover": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.4)"
          : "1px solid rgba(0, 0, 0, 0.4)",
      },
      ".Tab:focus": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 1)"
          : "1px solid rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
      ".Tab--selected": {
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 1)"
          : "rgba(250, 250, 250, 1)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 1)"
          : "1px solid rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  };
};
