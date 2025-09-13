import { ref } from "vue";

const isPlansModalOpen = ref(false);
const allowClose = ref(true);

export const usePlansModal = () => {
  const openPlansModal = (shouldAllowClose = true) => {
    isPlansModalOpen.value = true;
    allowClose.value = shouldAllowClose;
  };

  return {
    isPlansModalOpen,
    openPlansModal,
    allowClose,
  };
};
