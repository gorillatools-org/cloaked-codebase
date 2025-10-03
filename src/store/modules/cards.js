const defaultState = () => ({
  kycModal: false,
  virtualCardModal: false,
  transactionsModal: false,
  fundingValidateModal: false,
  generateCardModal: false,
  kycValidated: false,
  fundingSource: false,
  fundingSources: [],
  currentCard: {},
  identityCards: "",
  cards: [],
  primaryFundingSource: "",
  transaction: null,
  cardInformation: null,
  rightPanel: {
    show: false,
    transaction: null,
    card: null,
    settings: false,
  },
  cardSettings: {},
  statements: [],
  transactions: [],
});
export default {
  state: defaultState(),

  mutations: {
    openKycModal: (state) => {
      state.kycModal = true;
    },
    closeKycModal: (state) => {
      state.kycModal = false;
    },
    openFundingValidateModal: (state) => {
      state.fundingValidateModal = true;
    },
    closeFundingValidateModal: (state) => {
      state.fundingValidateModal = false;
    },
    openVirtualCardModal: (state) => {
      state.virtualCardModal = true;
    },
    closeVirtualCardModal: (state) => {
      state.virtualCardModal = false;
      state.currentCard = "";
    },
    openGenerateCardModal: (state) => {
      state.generateCardModal = true;
    },
    closeGenerateCardModal: (state) => {
      state.generateCardModal = false;
    },
    openTransactionsModal: (state) => {
      state.transactionsModal = true;
    },
    closeTransactionsModal: (state) => {
      state.transactionsModal = false;
    },
    kycValidation: (state) => {
      state.kycValidated = true;
    },
    fundingSourceAdded: (state) => {
      state.fundingSource = true;
    },
    fundingSourcesList: (state, data) => {
      state.fundingSources = Object.assign({}, data);
    },
    addMoreFundingSources: (state, data) => {
      state.fundingSources.results = state.fundingSources.results.concat(
        data.results
      );
    },
    removeFundingSource: (state, fundingSourceId) => {
      state.fundingSources.results = state.fundingSources.results.filter(
        (fundingSource) => fundingSource.id !== fundingSourceId
      );
    },
    switchFundingSourceAutoPay: (state, data) => {
      const { fundingSourceId, enabled } = data;
      state.fundingSources.results = state.fundingSources.results.map(
        (fundingSource) => {
          if (fundingSource.id === fundingSourceId) {
            return { ...fundingSource, is_auto_debit: enabled ? true : false };
          }
          return fundingSource;
        }
      );
    },
    currentCard: (state, data) => {
      state.currentCard = Object.assign({}, data);
    },
    identityCards: (state, data) => {
      state.identityCards = Object.assign({}, data);
    },
    addCardList: (state, data) => {
      state.cards = Object.assign({}, data);
    },
    addMoreCards: (state, data) => {
      state.cards.results = state.cards.results.concat(data.results);
      state.cards.next = data.next;
    },
    addPrimaryCard: (state, data) => {
      state.primaryFundingSource = Object.assign({}, data);
    },
    updatePartialCard(state, data) {
      state.cards.results.forEach((card) => {
        if (card.id === data.id) {
          card = Object.assign(card, data);
        }
      });
    },
    addTransaction: (state, data) => {
      state.rightPanel.transaction = Object.assign({}, data);
      state.rightPanel.card = null;
      state.rightPanel.show = true;
    },
    removeTransaction: (state) => {
      state.rightPanel.transaction = null;
      state.rightPanel.show = false;
    },
    cardInformation(state, data) {
      state.cardInformation = Object.assign({}, data);
    },
    addCard(state, data) {
      state.rightPanel.card = Object.assign({}, data);
      state.rightPanel.transaction = null;
      state.rightPanel.show = true;
    },
    openSettings(state) {
      state.rightPanel.settings = true;
      state.rightPanel.transaction = null;
      state.rightPanel.card = null;
      state.rightPanel.show = true;
    },
    closeRightPanel(state) {
      state.rightPanel.show = false;
      setTimeout(() => {
        state.rightPanel.transaction = null;
        state.rightPanel.card = null;
        state.rightPanel.settings = false;
      }, 500);
    },
    cardSettings(state, data) {
      state.cardSettings = Object.assign({}, data);
    },
    setTransactions(state, data) {
      state.transactions = data;
    },
    resetState(state) {
      Object.assign(state, defaultState());
    },
  },

  actions: {
    resetCardsStore({ commit }) {
      commit("resetState");
    },
    openKycModal({ commit }) {
      commit("openKycModal");
      document.body.classList.add("overflow-hidden");
    },
    closeKycModal({ commit }) {
      commit("closeKycModal");
      document.body.classList.remove("overflow-hidden");
    },
    openTransactionsModal({ commit }) {
      commit("openTransactionsModal");
      document.body.classList.add("overflow-hidden");
    },
    closeTransactionsModal({ commit }) {
      commit("closeTransactionsModal");
      document.body.classList.remove("overflow-hidden");
    },
    openVirtualCardModal({ commit }) {
      commit("openVirtualCardModal");
      document.body.classList.add("overflow-hidden");
    },
    openGenerateCardModal({ commit }) {
      commit("openGenerateCardModal");
    },
    closeGenerateCardModal({ commit }) {
      commit("closeGenerateCardModal");
    },
    closeVirtualCardModal({ commit }) {
      commit("closeVirtualCardModal");
      document.body.classList.remove("overflow-hidden");
    },
    openFundingValidateModal({ commit }) {
      commit("openFundingValidateModal");
      document.body.classList.add("overflow-hidden");
    },
    closeFundingValidateModal({ commit }) {
      commit("closeFundingValidateModal");
      document.body.classList.remove("overflow-hidden");
    },
    kycValidation({ commit }) {
      commit("kycValidation");
    },
    fundingSourceAdded({ commit }) {
      commit("fundingSourceAdded");
    },
    addMoreFundingSources({ commit }, data) {
      commit("addMoreFundingSources", data);
    },
    removeFundingSource({ commit }, fundingSourceId) {
      commit("removeFundingSource", fundingSourceId);
    },
    switchFundingSourceAutoPay({ commit }, data) {
      commit("switchFundingSourceAutoPay", data);
    },
    addCardList({ commit }, data) {
      commit("addCardList", data);
    },
    addMoreCards({ commit }, data) {
      commit("addMoreCards", data);
    },
    addPrimaryCard({ commit }, data) {
      commit("addPrimaryCard", data);
    },
    updateCard({ commit }, data) {
      commit("updatePartialCard", data);
    },
    addTransaction({ commit }, data) {
      commit("addTransaction", data);
    },
    removeTransaction({ commit }) {
      commit("removeTransaction");
    },
    cardInformation({ commit }, data) {
      commit("cardInformation", data);
    },
    addCard({ commit }, data) {
      commit("addCard", data);
    },
    closeRightPanel({ commit }) {
      commit("closeRightPanel");
    },
    fundingSourcesList({ commit }, data) {
      commit("fundingSourcesList", data);
    },
    cardSettings({ commit }, data) {
      commit("cardSettings", data);
    },
    setTransactions({ commit }, data) {
      commit("setTransactions", data);
    },
    updateTransactions({ commit, state }, data) {
      let allTransactions = [...state.transactions.results];
      allTransactions = allTransactions.map((transaction) => {
        if (transaction.id === data.id) {
          return { ...transaction, ...data };
        }
        return transaction;
      });
      commit("setTransactions", {
        ...state.transactions,
        results: allTransactions,
      });
    },
  },

  getters: {
    verifiedFunding(state) {
      return state.fundingSources.filter(
        (fundingSource) => fundingSource.verifed === true
      );
    },
    virtualCardModal(state) {
      return state.virtualCardModal;
    },
  },
};
