import {
  getAllFeatures,
  initialEnableDiscover,
} from "@/api/actions/feature-service";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

export default {
  state: {
    features: [],
  },
  mutations: {
    setFeatures(state, features) {
      state.features = features;
    },
  },
  getters: {
    getFeatures: (state) => state.features,
  },
  actions: {
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
