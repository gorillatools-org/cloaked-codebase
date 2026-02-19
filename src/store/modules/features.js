import {
  getAllFeatures,
  initialEnableDiscover,
} from "@/api/actions/feature-service";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

const defaultState = () => ({
  features: [],
});

export default {
  state: defaultState(),
  mutations: {
    setFeatures(state, features) {
      state.features = features;
    },
    resetState(state) {
      Object.assign(state, defaultState());
    },
  },
  getters: {
    getFeatures: (state) => state.features,
  },
  actions: {
    resetFeaturesStore({ commit }) {
      commit("resetState");
    },
    async fetchFeatures({ commit }) {
      const response = await getAllFeatures();
      const features = response.data || [];
      commit("setFeatures", features);
    },

    async initialEnableDiscover({ dispatch }, payload) {
      const { discoverFeatureId, featureIds } = payload;

      try {
        await initialEnableDiscover(discoverFeatureId, featureIds);
        dispatch("fetchFeatures");
      } catch {
        toast.error("Failed to enable features");
      }
    },
  },
};
