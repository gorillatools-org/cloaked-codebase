import { useRoute } from "vue-router";
import { ref } from "vue";

export const useDataDeleteInput = () => {
  const route = useRoute();

  const dataDeleteInputForm = ref({
    firstName: route.query?.first_name?.toLowerCase(),
    lastName: route.query?.last_name?.toLowerCase(),
    age: route.query?.age,
    state: route.query?.state_abbreviation?.toUpperCase(),
    city: route.query?.city?.toUpperCase(),
    email: route.query?.email?.toLowerCase(),
    phone: route.query?.phone,
  });

  return {
    dataDeleteInputForm,
  };
};
