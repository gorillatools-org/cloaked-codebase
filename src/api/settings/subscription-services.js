import api from "@/api/api";
import store from "@/store";

export default class SubscriptionService {
  static async getSubscription() {
    let endpoint = `/api/v1/subscription/`;

    return await api()
      .get(endpoint)
      .then(async ({ data }) => {
        if (data.message) {
          await store.dispatch("settings/saveSubscription", null);
        } else {
          await store.dispatch("settings/saveSubscription", data);
        }
        return data;
      });
  }

  static async registerPaypal(subscription_id) {
    let endpoint = "/api/v2/subscription/";
    const payload = {
      subscription_id: subscription_id,
      provider: "paypal",
    };
    return await api()
      .post(endpoint, payload)
      .then(({ data }) => {
        return data;
      });
  }

  static async checkPromoCode(product_id, promo_code) {
    let endpoint = "/api/v1/subscription/stripe/validate-promo-code/";
    return await api()
      .post(endpoint, { product_id, promo_code })
      .then(({ data }) => {
        return data;
      });
  }

  static async validateCoupon(product_id, promo_code) {
    let endpoint = "/api/v3/subscription/stripe/validate-promo-code/";
    return await api()
      .post(endpoint, { product_id, promo_code })
      .then(({ data }) => {
        return data;
      });
  }

  static async getStripeInfo() {
    const userId = store.state.authentication?.user?.id;
    const endpoint = `/api/v1/user/${userId}/stripe_email/`;

    return await api()
      .get(endpoint)
      .then(({ data }) => {
        store.dispatch("settings/saveStripe", data);
        return data;
      });
  }

  static async getPreviewSubscriptionChange(product_id) {
    let endpoint = "/api/v2/subscription/stripe/preview-subscription-change/";
    return await api()
      .post(endpoint, { product_id })
      .then(({ data }) => {
        return data;
      });
  }

  static async getSubscriptionPlans(params) {
    let queryArr = [];
    if (params) {
      Object.keys(params).forEach((key) =>
        queryArr.push(`${key}=${params[key]}`)
      );
    }
    const queryString = queryArr.length > 0 ? `?${queryArr.join("&")}` : "";
    const endpoint = `/api/v2/subscription/products/${queryString}`;
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async getPlanLimits() {
    let endpoint = "/api/v1/limits/";
    return await api()
      .get(endpoint)
      .then(async ({ data }) => {
        await store.dispatch("settings/saveLimits", data);
        return data;
      });
  }

  static async getPaymentIntent(product_id, promo = null) {
    let endpoint = "/api/v2/subscription/stripe/create-payment-intent/";
    const payload = {
      product_id: product_id,
    };
    if (promo) {
      payload.promo_code = promo;
    }
    return await api()
      .post(endpoint, payload)
      .then(({ data }) => {
        return data;
      });
  }

  static async getSetupIntent(product_id, promo = null) {
    let endpoint = "/api/v2/subscription/stripe/create-setup-intent/";
    const payload = {
      product_id: product_id,
    };
    if (promo) {
      payload.promo_code = promo;
    }
    return await api()
      .post(endpoint, payload)
      .then(({ data }) => {
        return data;
      });
  }

  static async createSetupIntent() {
    return await api()
      .post("/api/v3/subscription/stripe/create-setup-intent/")
      .then(({ data }) => {
        return data;
      });
  }

  static async subscribe(payload) {
    return await api()
      .post("/api/v3/subscription/stripe/subscribe/", payload)
      .then(({ data }) => {
        return data;
      });
  }

  static async getSubscriptionDetails() {
    let endpoint = "/api/v2/subscription/stripe/get-subscription-details/";
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async payNow() {
    let endpoint = "/api/v2/subscription/stripe/pay-now/";
    return await api()
      .post(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async getPlanInvitations() {
    let endpoint = "/api/v1/subscription/invitation/";
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async invitePlanMember(email) {
    let endpoint = "/api/v1/subscription/invitation/invite_user/";
    return await api()
      .post(endpoint, { email })
      .then(({ data }) => {
        return data;
      });
  }

  static async removePlanMember(id) {
    let endpoint = `/api/v1/subscription/invitation/${id}/`;
    return await api()
      .delete(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async acceptInvitation(payload) {
    let endpoint = "/api/v1/user/invitation/accept/";
    return await api()
      .post(endpoint, payload)
      .then(({ data }) => {
        store.dispatch("authentication/getUser"); // refetch user
        return data;
      });
  }

  static async removeSubscription() {
    let endpoint = "/api/v1/subscription/remove/";
    return await api()
      .post(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async cancelSubscription() {
    return await api()
      .post("/api/v2/subscription/cancel/recurring/")
      .then(({ data }) => {
        return data;
      });
  }

  static async getAddons() {
    let endpoint = "/api/v1/subscription/addon/";
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      })
      .catch((err) => {
        return err;
      });
  }

  static getTierSetupIntent(forceRefresh = false) {
    const payload = forceRefresh ? { force_refresh: true } : {};

    return api()
      .post("/api/v1/billing/subscription/stripe/create-setup-intent/", payload)
      .then(({ data }) => {
        return data;
      });
  }

  static async getCloakedPaySubscriptionPlans() {
    const endpoint = `/api/v2/subscription/cloaked-pay-products/`;
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      });
  }
}
