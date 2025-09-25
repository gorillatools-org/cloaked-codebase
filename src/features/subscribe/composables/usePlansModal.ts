import type { Plan } from "@/features/subscribe/types";
import { ref } from "vue";

type OnSubscribedCallback = (plan: Plan) => void;

const isPlansModalOpen = ref<boolean>(false);
const allowClose = ref<boolean>(true);
const onSubscribed = ref<OnSubscribedCallback | null>(null);

export const usePlansModal = () => {
  const openPlansModal = (
    shouldAllowClose = true,
    subscribedCallback: OnSubscribedCallback | null = null
  ) => {
    isPlansModalOpen.value = true;
    allowClose.value = shouldAllowClose;
    onSubscribed.value = subscribedCallback;
  };

  return {
    isPlansModalOpen,
    openPlansModal,
    allowClose,
    onSubscribed,
  };
};
