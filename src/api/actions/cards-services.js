import api from "@/api/api";
import store from "@/store";
import IdentityService from "@/api/actions/identity-service.js";

export default class CardsServices {
  static async postCreateAPaymentSource(payload) {
    return await api().post(`/api/v1/card/vendor-flow/`, payload);
  }

  static async postActiveKYC(values) {
    return api().post("/api/v1/kyc/", values);
  }

  static async submitKYC(values) {
    return api().post("/api/v2/kyc/", values);
  }

  static async submitVirtualCardApplication(values) {
    return api().post("/api/v1/kyc-with-subscription/", values);
  }

  static async getPaymentSource() {
    return await api()
      .get(`/api/v1/card/`)
      .then((resp) => {
        store.dispatch("fundingSourcesList", resp.data.results);
      })
      .catch(() => {});
  }

  static async deleteFundingSource(id) {
    return await api().delete(`/api/v1/card/${id}/?force=true`);
  }

  /**
   * Switch the funding source of a card or all cards linked to the funding source
   * If no cardId is provided, all cards linked to the funding source will be switched and the funding source will be deleted
   * @param {string} fundingSourceId - The ID of the funding source to switch
   * @param {string} replacementFundingSourceId - The ID of the replacement funding source
   * @param {string} [cardId] - The ID of the card that is linked to the funding source
   * @returns {Promise<void>}
   */
  static async switchFundingSource(
    fundingSourceId,
    replacementFundingSourceId,
    cardId
  ) {
    return api().post("/api/v1/card/switch/", {
      funding_source: fundingSourceId,
      replacement_funding_source: replacementFundingSourceId,
      vcn: cardId,
    });
  }

  static async getLightningCheckAmount(
    fundingSourceId,
    replacementFundingSourceId,
    cardId
  ) {
    return await api()
      .get(`/api/v1/card/lightning-check/`, {
        params: {
          funding_source: fundingSourceId,
          replacement_funding_source: replacementFundingSourceId,
          virtual_card: cardId,
        },
      })
      .then((response) => {
        return response.data;
      });
  }

  static async deleteCard(identityId, cardId) {
    IdentityService.patchIdentityUpdatedAt(identityId);
    return await api().delete(
      `/api/v1/cloaked/identity/${identityId}/card/${cardId}/delete/`
    );
  }

  static async lockCard(identityId, cardId) {
    IdentityService.patchIdentityUpdatedAt(identityId);
    return await api().post(
      `/api/v1/cloaked/identity/${identityId}/card/${cardId}/lock/`
    );
  }

  static async unlockCard(identityId, cardId) {
    IdentityService.patchIdentityUpdatedAt(identityId);
    return await api().post(
      `/api/v1/cloaked/identity/${identityId}/card/${cardId}/unlock/`
    );
  }

  static async patchUpdateCloakedCardDetails(cardId, payload) {
    return await api().patch(`/api/v1/cloaked/card/${cardId}/`, payload);
  }

  static async patchUpdateCardDetails(id, payload) {
    return await api().patch(`/api/v1/card/${id}/`, payload);
  }

  static async getPrimaryCard() {
    return await api()
      .get(`/api/v1/card/primary/`)
      .then((resp) => {
        store.dispatch("addPrimaryCard", resp.data);
        return resp;
      })
      .catch((error) => {
        if (error.response.status === 404) {
          return;
        }
      });
  }

  static async getCardList() {
    return await api()
      .get(`/api/v1/cloaked/card?page_size=50/`)
      .then((response) => {
        store.dispatch("addCardList", response.data);
      });
  }

  static async getSingleCard(id) {
    return await api().get(`/api/v1/cloaked/card/${id}/`);
  }

  static async getFundingSourceCards(fundingSourceId) {
    return await api()
      .get(`/api/v1/cloaked/card?funding_source=${fundingSourceId}`)
      .then((response) => {
        return response.data;
      });
  }

  static async getCancelCardList() {
    return await api()
      .get(`/api/v1/cloaked/card?deleted=true&page_size=50/`)
      .then((response) => {
        store.dispatch("addCardList", response.data);
      });
  }

  static async getGiftCardList() {
    return await api()
      .get(`/api/v1/cloaked/card/gift-cards?page_size=50/`)
      .then((response) => {
        store.dispatch("addCardList", response.data);
      });
  }

  static async createIdentityCard(identityId, payload) {
    IdentityService.patchIdentityUpdatedAt(identityId);

    return await api().post(
      `/api/v1/cloaked/identity/${identityId}/card/mastercard/`,
      payload
    );
  }

  static async getTransactions() {
    return await api()
      .get(`/api/v1/cloaked/card/transaction/?page_size=100/`)
      .then((response) => {
        store.dispatch("setTransactions", response?.data);
        return response;
      })
      .catch((error) => {
        store.dispatch("setTransactions", { count: 0, results: [] });
        return error;
      });
  }

  static async getTransactionsByCardId(id) {
    return await api()
      .get(`/api/v1/cloaked/card/transaction/?card=${id}&page_size=100/`)
      .then((response) => {
        store.dispatch("setTransactions", response?.data);
        return response;
      })
      .catch((error) => {
        store.dispatch("setTransactions", { count: 0, results: [] });
        return error;
      });
  }

  static async getIdentityTransactions(id, canceled) {
    return await api()
      .get(`/api/v1/cloaked/identity/${id}/transaction?canceled=${canceled}/`)
      .then((response) => {
        store.dispatch("setTransactions", response?.data);
        return response;
      })
      .catch((error) => {
        store.dispatch("setTransactions", { count: 0, results: [] });
        return error;
      });
  }

  static async getIdentityCards(cloakId) {
    const url = `/api/v1/cloaked/identity/${cloakId}/card/`;
    return api()
      .get(url)
      .then(({ data }) => {
        store.commit("identityCards", data.results);
      });
  }

  static async getSingleIdentityCard(cloakId, cardId) {
    const url = `/api/v1/cloaked/identity/${cloakId}/card/${cardId}/`;
    return api()
      .get(url)
      .then((response) => {
        store.commit("currentCard", response.data);
        return response;
      });
  }

  static async getSingleGiftCard(cardId) {
    const url = `/api/v1/cloaked/card/${cardId}/gift-card/details/`;
    return api()
      .get(url)
      .then((response) => {
        store.commit("currentCard", response.data);
        return response;
      });
  }

  static async kycRetreive() {
    return api()
      .get(`/api/v1/kyc/retrieve/`)
      .then((response) => {
        store.commit("cardInformation", response.data);
      });
  }

  static async kycUpdate(payload) {
    return api().patch(`/api/v1/kyc/update/`, payload);
  }

  static async getFundingSources() {
    return await api()
      .get(`/api/v1/card/`)
      .then((response) => {
        store.dispatch("fundingSourcesList", response.data);
      });
  }

  static async setOnboardingAsCompleted() {
    return await api().post(`/api/v1/card/settings/onboarding/`, {
      onboarding_complete: true,
    });
  }

  static async enableSettings(payload) {
    return api().post("/api/v1/card/settings/enable/", payload);
  }

  static async getCardSettings() {
    return api()
      .get("/api/v1/card/settings/")
      .then((response) => {
        store.commit("cardSettings", response.data);
      });
  }

  static async addToWaitlist() {
    return api()
      .post("/api/v1/card/waitlist/")
      .then(() => {
        if (store.state.authentication?.user) {
          store.state.authentication.user.card_wait_list = true;
        }
      });
  }

  static async payAll() {
    return api().post("/api/v1/cloaked/card/pay-all/");
  }

  static async payCard(payload) {
    return api().post("/api/v1/cloaked/card/payments/", payload);
  }

  static async getStatements() {
    return api()
      .get("/api/v1/card/report/statement/ ")
      .then((response) => {
        store.state.cards.statements = response.data;
      });
  }

  static async getCardStatement(id) {
    return api().get(`/api/v1/card/report/statement/${id}/`);
  }

  static async exportTransactions() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];

    // Add 1 day to endDate
    const adjustedEndDate = new Date(formattedDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Adds one full day

    // Convert back to YYYY-MM-DD format
    const finalEndDate = adjustedEndDate.toISOString().split("T")[0];
    return api().get(
      `/api/v1/cloaked/card/transaction/export?start_date=2023-01-01&end_date=${finalEndDate}`
    );
  }

  static async exportTransactionsForCard(cardId) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];

    // Add 1 day to endDate
    const adjustedEndDate = new Date(formattedDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Adds one full day

    // Convert back to YYYY-MM-DD format
    const finalEndDate = adjustedEndDate.toISOString().split("T")[0];
    return api().get(
      `/api/v1/cloaked/card/transaction/export?card=${cardId}&start_date=2023-01-01&end_date=${finalEndDate}`
    );
  }

  static async patchTransactionNote(id, payload) {
    return api().patch(`/api/v1/cloaked/card/transaction/${id}/`, payload);
  }

  static async getOutstandingBalanceCards() {
    return api().get(`/api/v1/cloaked/card?outstanding_balance__gt=50/`);
  }

  static async addBankCard(payload) {
    return api()
      .post(`/api/v1/card/`, payload)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error("addBankCard failed:", error);
        throw error;
      });
  }
}
