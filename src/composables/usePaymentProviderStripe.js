import store from "@/store";
import { computed, ref, watch } from "vue";
import { merge } from "lodash-es";
import UserService from "@/api/actions/user-service";
import { toValue, useEventListener } from "@vueuse/core";
import { useColorScheme } from "@/composables/useColorScheme";
import { useChangeTracking } from "@/composables/useChangeTracking.js";
import { generateConsistentFakeName } from "@/utils/generateFakeName";

const appearanceBase = (variant) => ({
  theme: "flat",
  labels: variant === "flat" ? "floating" : "above",
  variables: {
    colorDanger: "#F24141",
    fontFamily: "STKBureauSans, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
    gridColumnSpacing: "8px",
    tabSpacing: "8px",
    gridRowSpacing: "12px",
  },
  rules: {
    ".Label": {
      fontSize: "13px",
    },
    ".Label--resting": {
      fontSize: "15px",
    },
    ".Label--floating": {
      fontSize: "13px",
      opacity: 0.3,
    },
    ".Error": {
      fontSize: "12px",
      fontWeight: 500,
      letterSpacing: "0.1px",
      lineHeight: "15px",
    },
    ".Input": {
      border: "none",
      transition: "none",
      fontSize: "15px",
    },
    ".Input--invalid": {
      boxShadow: "0 0 0 1px var(--colorDanger)",
    },
    ".Input:focus": {},
    ".Tab": {
      border: "none",
    },
  },
});

const appearanceLightMode = (variant) =>
  merge(JSON.parse(JSON.stringify(appearanceBase(variant))), {
    variables: {
      colorPrimary: "black",
      colorText: "black",
      colorTextPlaceholder: "rgba(0, 0, 0, 0.5)",
      tabIconSelectedColor: "black",
      colorPrimaryText: "black",
    },
    rules: {
      ".Input": {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      },
      ".Input:focus": {
        outline: "2px solid black",
      },
      ".Tab": {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      },
      ".Tab--selected": {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        outline: "3px solid black",
        border: "none",
      },
      ".Tab--selected:focus": {
        outline: "3px solid black",
      },
      ".Block": {
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      },
    },
  });

const appearanceDarkMode = (variant) =>
  merge(JSON.parse(JSON.stringify(appearanceBase(variant))), {
    variables: {
      colorPrimary: "white",
      colorText: "white",
      colorTextPlaceholder: "rgba(255, 255, 255, 0.5)",
      tabIconSelectedColor: "white",
      colorPrimaryText: "white",
    },
    rules: {
      ".Input": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
      ".Input:focus": {
        outline: "2px solid white",
      },
      ".Tab": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
      ".Tab--selected": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        outline: "3px solid white",
        border: "none",
      },
      ".Tab--selected:focus": {
        outline: "3px solid white",
      },
      ".Block": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    },
  });

const { colorScheme } = useColorScheme();

const { latestChangeId, trackChange } = useChangeTracking();

export const usePaymentProviderStripe = (
  plan,
  onSubscribed,
  stripeIntent,
  contactInformation,
  variant = "outline"
) => {
  const isProcessingStripePayment = ref(false);
  const stripeError = ref(null);
  const stripeRef = ref(null);
  const stripeFormState = ref(null);
  const isStripeFieldFocused = ref(false);

  let elements = null;
  let paymentElement = null;
  let viewportHeightBeforeKeyboard = null;

  const stripe = computed(() => store.getters["subscription/getStripe"]);

  // Detect keyboard dismiss via viewport resize (standard mobile keyboard detection)
  useEventListener(window.visualViewport, "resize", () => {
    if (!viewportHeightBeforeKeyboard || !isStripeFieldFocused.value) return;

    const currentHeight = window.visualViewport?.height ?? 0;
    const keyboardDismissed =
      currentHeight >= viewportHeightBeforeKeyboard - 50;

    if (keyboardDismissed) {
      isStripeFieldFocused.value = false;
      viewportHeightBeforeKeyboard = null;
    }
  });

  const loadWidget = (changeId) => {
    if (!stripeIntent.value || !stripeRef.value) {
      return;
    }

    if (stripeRef.value.scrollHeight > 0 && !stripeRef.value.style.height) {
      stripeRef.value.style.height = `${stripeRef.value.scrollHeight - 4}px`;
    }

    elements = stripe.value.elements({
      // https://docs.stripe.com/elements/appearance-api
      appearance:
        colorScheme.value === "dark"
          ? appearanceDarkMode(toValue(variant))
          : appearanceLightMode(toValue(variant)),
      clientSecret: stripeIntent.value.client_secret,
    });

    // just to get rid of "element will be mounted to an element with children" on re-mount warning
    Array.from(stripeRef.value.children)[0]?.remove();

    paymentElement = elements
      .create("payment", {
        layout: "tabs",
        paymentMethodOrder: ["card", "apple_pay", "google_pay"],
        terms: {
          card: "never",
        },
      })
      .on("ready", () => {
        setTimeout(() => {
          if (changeId === toValue(latestChangeId)) {
            stripeRef.value.style.height = "";
          }
        }, 500);
      })
      .on("change", (event) => {
        stripeFormState.value = event;
      })
      .on("focus", () => {
        isStripeFieldFocused.value = true;
        viewportHeightBeforeKeyboard = window.visualViewport?.height ?? null;
      })
      .on("blur", () => {
        isStripeFieldFocused.value = false;
      });

    paymentElement.mount(stripeRef.value);
  };

  const focusStripeForm = () => {
    if (stripeFormState.value?.complete) return;
    paymentElement?.focus();
  };

  const payWithStripe = async () => {
    try {
      isProcessingStripePayment.value = true;
      stripeError.value = null;

      const email =
        contactInformation?.value?.email ?? stripeIntent.value.email;

      const subscriptionPayload = {
        elements,
        redirect: "if_required",
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: generateConsistentFakeName(email),
              email,
            },
          },
        },
      };
      const result =
        stripeIntent.value.type === "payment"
          ? await stripe.value.confirmPayment(subscriptionPayload)
          : await stripe.value.confirmSetup(subscriptionPayload);

      if (result.error) {
        if (result.error.payment_intent.status !== "succeeded") {
          // If checks if stripe fails because payment for this product was already processed
          // If thats the case, do not show an error and succeed
          throw new Error(result.error);
        }
        return;
      }
    } catch {
      stripeError.value = "Could not process payment. Please try again.";
    } finally {
      isProcessingStripePayment.value = false;
    }
  };

  const subscribeWithStripe = async (awaitSubscriptionChange = true) => {
    try {
      isProcessingStripePayment.value = true;
      stripeError.value = null;

      const email =
        contactInformation?.value?.email ?? stripeIntent.value.email;

      const subscriptionPayload = {
        elements,
        redirect: "if_required",
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: generateConsistentFakeName(email),
              email,
            },
          },
        },
      };
      const result =
        stripeIntent.value.type === "payment"
          ? await stripe.value.confirmPayment(subscriptionPayload)
          : await stripe.value.confirmSetup(subscriptionPayload);

      if (result.error) {
        stripeError.value = "Could not process payment. Please try again.";
        return;
      }

      if (awaitSubscriptionChange) {
        await store.dispatch("subscription/awaitSubscriptionChange");
      }

      onSubscribed?.(toValue(plan));
      try {
        if (store.state.authentication?.user?.state === "pending_deletion") {
          const userId = store.state.authentication?.user?.id;
          const payload = {
            state: "active",
            immediate_delete: false,
          };
          const { data } = await UserService.deleteUserAccount({
            userId,
            payload,
          });
          store.commit("authentication/setUser", data);
        }
      } catch {
        throw new Error("User state not updated please contact support");
      }
    } catch (error) {
      if (error === "User state not updated please contact support") {
        stripeError.value = "User state not updated please contact support";
        return;
      }
      stripeError.value = "Could not process payment. Please try again.";
    } finally {
      isProcessingStripePayment.value = false;
    }
  };

  // watch effect kept being re-triggered with store changes
  watch(
    () => stripeIntent.value,
    () => loadWidget(trackChange())
  );

  watch(
    () => plan.value,
    () => (stripeError.value = null)
  );

  return {
    isProcessingStripePayment,
    stripeError,
    stripeRef,
    stripeFormState,
    isStripeFieldFocused,
    subscribeWithStripe,
    payWithStripe,
    focusStripeForm,
  };
};
