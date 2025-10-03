let modalId = 1;

const defaultState = () => ({
  visibleModals: {},
  modals: [],
});

export default {
  state: defaultState(),

  mutations: {
    addModal(state, modal) {
      state.modals = [...state.modals, modal];
    },
    removeModal(state, { id }) {
      state.modals = state.modals.filter((modal) => modal.id !== id);
    },
    showModal(state, { id }) {
      state.visibleModals[id] = true;
    },
    hideModal(state, { id }) {
      delete state.visibleModals[id];
    },
    hideAllModals(state) {
      state.visibleModals = {};
    },
    resetState(state) {
      Object.assign(state, defaultState());
    },
  },

  getters: {
    getModals: (store) => store.modals,
    getVisibleModals: (store) => store.modals,
  },

  actions: {
    openGlobalDeleteModal(
      { dispatch },
      { header, type, paragraphs = [], onClick = () => {}, disabled = false }
    ) {
      let headerTitle = header || "Are you sure you want to delete this?";

      if (type && !header) {
        headerTitle = headerTitle.replace("?", ` ${type}?`);
      }

      dispatch("openModal", {
        header: headerTitle,
        paragraphs,
        showCancel: true,
        showCloseInHeader: false,
        button: {
          text: "Yes, delete",
          danger: true,
          onClick,
          disabled,
        },
      });
    },

    openModal({ commit, state }, modalInfo) {
      const { customTemplate } = modalInfo;

      if (customTemplate && customTemplate.template) {
        const found = state.modals.find((modal) => {
          if (!modal.customTemplate || !modal.customTemplate.template) {
            return false;
          }

          if (modal.customTemplate.template === customTemplate.template) {
            return true;
          }

          return false;
        });

        if (found) {
          return;
        }
      }

      const modal = {
        id: modalInfo.id || modalId++,
        visible: true,
        customTemplate,
        header: modalInfo.header,
        subheader: modalInfo.subheader,
        paragraphs: modalInfo.paragraphs,
        cancelText: modalInfo.cancelText,
        cancelIcon: modalInfo.cancelIcon,
        showCancel:
          modalInfo.showCancel === undefined ? true : modalInfo.showCancel,
        cancelAction: modalInfo.cancelAction,
        cancelActionOnlyOnButtonClick:
          !!modalInfo.cancelActionOnlyOnButtonClick,
        triggerCancelActionAfterMainCTA:
          modalInfo.triggerCancelActionAfterMainCTA === undefined
            ? true
            : modalInfo.triggerCancelActionAfterMainCTA,
        showCloseInHeader: !!modalInfo.showCloseInHeader,
        hideFooter: !!modalInfo.hideFooter,
        closeAfterOnClick: !!modalInfo.closeAfterOnClick,
        width: modalInfo.width,
        input: modalInfo.input,
        ...modalInfo,
      };

      if (modalInfo.button) {
        modal.button = {
          text: modalInfo.button.text,
          danger: !!modalInfo.button.danger,
          onClick: modalInfo.button.onClick,
          disabled: modalInfo.button.disabled,
          icon: modalInfo.button.icon,
        };
      }

      commit("addModal", modal);
      commit("showModal", modal);
    },
    closeModal({ commit, state }, { id } = {}) {
      let modalId = id;

      if (!modalId) {
        const lastModal = state.modals[state.modals.length - 1];

        if (lastModal) {
          modalId = lastModal.id;
        } else {
          return;
        }
      }

      commit("hideModal", { id: modalId });
      commit("removeModal", { id: modalId });
    },
    resetModalStore({ commit }) {
      commit("resetState");
    },
  },
};
