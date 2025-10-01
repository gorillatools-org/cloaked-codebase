import { ref } from "vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

const isFetching = ref(false);
const updatingRelative = ref(null);
const relatives = ref([]);

export const useRelativesApi = () => {
  const fetchRelatives = async () => {
    try {
      isFetching.value = true;

      const { data } = await DataDeleteService.getRelatives();

      relatives.value = data.results;
    } catch (error) {
      if (error) {
        // NOTE: do not throw toast if error is undefined
        // this is likely just because the api call was cut short on logout
        toast?.error("Failed to fetch relatives.");
      }
    } finally {
      isFetching.value = false;
    }
  };

  const updateRelative = async (id, isRelative) => {
    try {
      updatingRelative.value = id;

      await DataDeleteService.updateRelative(id, isRelative);
      await fetchRelatives();
    } catch {
      toast?.error("Failed to update relatives.");
    } finally {
      updatingRelative.value = null;
    }
  };

  return {
    relatives,
    isFetching,
    updatingRelative,
    fetchRelatives,
    updateRelative,
  };
};
