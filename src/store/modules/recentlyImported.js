import ImporterService from "@/api/actions/importer-service";

const defaultState = () => ({
  recentlyImported: [],
  nextPage: null,
  startTime: null,
});

export default {
  namespaced: true,
  state: defaultState(),
  mutations: {
    setRecentlyImported(state, payload) {
      state.recentlyImported = payload;
    },
    setNextPage(state, payload) {
      state.nextPage = payload;
    },
    setImportStartTime(state, timestamp) {
      state.startTime = timestamp;
    },
    reset(state) {
      Object.assign(state, defaultState());
    },
  },
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    async fetch({ state, commit, dispatch }, freshFetch) {
      freshFetch &&
        commit(
          "setNextPage",
          `/api/v1/cloaked/identity/?gt=${state.startTime}&protected=false&page_size=20&has_import_uuid=true`
        );

      freshFetch && commit("setRecentlyImported", []);

      if (!state.nextPage) {
        return state.recentlyImported;
      }

      try {
        const response = await ImporterService.getImportedIdentities(
          state.nextPage
        );
        const formattedCloaks = await dispatch(
          "updateCloaks",
          response.data.results,
          { root: true }
        );

        if (response.status === 200) {
          commit("setRecentlyImported", [
            ...state.recentlyImported,
            ...formattedCloaks,
          ]);
          commit("setNextPage", response.data.next);
          return state.recentlyImported;
        } else {
          commit("setRecentlyImported", []);
          commit("setNextPage", null);
          return state.recentlyImported;
        }
      } catch {
        commit("setRecentlyImported", []);
        commit("setNextPage", null);
        return state.recentlyImported;
      }
    },
  },
  getters: {
    hasNextPage: (state) => !!state.nextPage,
    getRecentlyImported: (state) => state.recentlyImported,
    getRecentImports: (state) =>
      state.recentlyImported
        .reduce((result, item) => {
          const existingImport = result.find(
            (existingImport) => existingImport.uuid === item.import_uuid
          );

          if (existingImport) {
            existingImport.identities.push(item);
            existingImport.date =
              existingImport.date < item.created_at
                ? item.created_at
                : existingImport.date;
            return result;
          }

          const newImport = {
            uuid: item.import_uuid,
            date: item.created_at,
            identities: [item],
          };

          return [...result, newImport];
        }, [])
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
  },
};
