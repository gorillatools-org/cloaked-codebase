import { computed, watch } from "vue";
import store from "@/store";
import {
  DATA_DELETE_REQUESTED,
  HAS_EXITED_DELETE_FLOW,
} from "@/scripts/userFlags";
import UserService from "@/api/actions/user-service";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";

const { isPlansModalOpen } = usePlansModal();

export const useDataDeleteOverlay = () => {
  const isDeleteDataOverlayOpen = computed(
    () =>
      store.getters.getFlag(DATA_DELETE_REQUESTED) &&
      !store.getters.getFlag(HAS_EXITED_DELETE_FLOW)
  );

  const openDataDeleteOverlay = () => {
    const promises = [
      UserService.setFlag({
        name: DATA_DELETE_REQUESTED,
        value: true,
      }),
      UserService.setFlag({
        name: HAS_EXITED_DELETE_FLOW,
        value: false,
      }),
    ];
    return Promise.all(promises);
  };

  const closeDataDeleteOverlay = () =>
    UserService.setFlag({
      name: DATA_DELETE_REQUESTED,
      value: false,
    });

  const openDataDeleteOverlayOrSubscribeModal = () =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve) => {
      if (store.getters["settings/isSubscribed"]) {
        await openDataDeleteOverlay();
        return resolve("opened");
      }

      store.dispatch("subscription/openSubscriptionModal");

      const unwatch = watch(
        () => ({
          isSubscribed: store.getters["settings/isSubscribed"],
          isSubscriptionModalOpen: isPlansModalOpen,
        }),
        async ({ isSubscribed, isSubscriptionModalOpen }) => {
          if (isSubscribed) {
            await openDataDeleteOverlay();
            isPlansModalOpen.value = false;
            resolve("opened");
            unwatch();
          } else if (!isSubscriptionModalOpen) {
            unwatch();
            resolve("dismissed");
          }
        }
      );
    });

  return {
    isDeleteDataOverlayOpen,
    openDataDeleteOverlay: openDataDeleteOverlayOrSubscribeModal,
    closeDataDeleteOverlay,
  };
};
