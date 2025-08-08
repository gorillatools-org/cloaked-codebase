import { onMounted, ref, watch } from "vue";
import UserService from "@/api/actions/user-service";
import store from "@/store";
import { toValue } from "@vueuse/core";
import { posthogCapture } from "@/scripts/posthog.js";
import SubscriptionService from "@/api/settings/subscription-services";

export const usePaymentProviderPaypal = (
  plan,
  onSubscribed,
  user,
  isEnabled,
  contactInformation
) => {
  const isLoadingPaypalWidget = ref(false);
  const isProcessingPaypalPayment = ref(false);
  const paypalError = ref(null);
  const paypalRef = ref(null);

  const loadWidget = () => {
    window.paypal
      ?.Buttons({
        // https://developer.paypal.com/sdk/js/reference/#style
        style: {
          shape: "pill",
          color: "gold",
          tagline: false,
          layout: "horizontal",
          label: "subscribe",
          disableMaxWidth: true,
          height: 53,
        },
        createSubscription: async (data, actions) => {
          isProcessingPaypalPayment.value = true;
          paypalError.value = null;

          posthogCapture("user_clicked_paypal_subscribe");

          // yes, it must return the result of this call
          return contactInformation?.value?.email
            ? actions.subscription.create({
                plan_id: plan.value.price_id,
                custom_id: toValue(user)?.uuid,
                subscriber: {
                  // warning, email address cannot be empty if we are submitting it
                  email_address: contactInformation.value.email,
                },
              })
            : actions.subscription.create({
                plan_id: plan.value.price_id,
                custom_id: toValue(user)?.uuid,
              });
        },
        onApprove: async ({ subscriptionID }) => {
          try {
            await SubscriptionService.registerPaypal(subscriptionID);
            await store.dispatch("subscription/awaitSubscriptionChange");
            onSubscribed?.(toValue(plan));
            // NOTE: this should happen in backend
            try {
              if (
                store.state.authentication?.user?.state === "pending_deletion"
              ) {
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
              throw new Error("User state not updated please contact support");
            }
          } finally {
            isProcessingPaypalPayment.value = false;
          }
        },
        onCancel: () => {
          isProcessingPaypalPayment.value = false;
        },
        onError: () => {
          isProcessingPaypalPayment.value = false;
          paypalError.value = "Could not process payment. Please try again.";
        },
        onInit: (data, actions) => {
          if (isEnabled) {
            watch(
              () => isEnabled.value,
              (isEnabled) => (isEnabled ? actions.enable() : actions.disable()),
              { immediate: true }
            );
          }

          isLoadingPaypalWidget.value = false;
        },
      })
      .render(paypalRef.value);
  };

  onMounted(() => {
    isLoadingPaypalWidget.value = true;

    if (!document.getElementById("paypal-js")) {
      const script = document.createElement("script");
      script.setAttribute(
        "src",
        `https://www.paypal.com/sdk/js?client-id=${
          import.meta.env.VITE_PAYPAL_CLIENT
        }&vault=true&intent=subscription&disable-funding=card,credit`
      );
      script.setAttribute("data-sdk-integration-source", "button-factory");
      script.setAttribute("id", "paypal-js");
      script.onload = loadWidget;
      document.head.appendChild(script);
    } else {
      loadWidget();
    }
  });

  watch(
    () => plan.value,
    () => (paypalError.value = null)
  );

  return {
    isLoadingPaypalWidget,
    isProcessingPaypalPayment,
    paypalError,
    paypalRef,
  };
};
