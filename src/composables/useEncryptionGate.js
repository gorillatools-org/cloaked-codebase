import { computed, ref, watch, nextTick } from "vue";
import { toValue } from "@vueuse/core/index";
import store from "@/store";

const isModalOpen = ref(false);
const modalContext = ref("default");

const isEncryptionAvailable = computed(
  () => !store.getters["authentication/user"]?.is_passwordless
);

export const useEncryptionGate = () => {
  const withEncryptionGate = (
    callback,
    { fallback, context = "default" } = {}
  ) => {
    if (toValue(isEncryptionAvailable)) {
      callback();
    } else {
      fallback?.();
      modalContext.value = context;
      isModalOpen.value = true;

      const unwatch = watch(
        () => ({
          isEncryptionAvailable: isEncryptionAvailable.value,
          isModalOpen: isModalOpen.value,
        }),
        ({ isEncryptionAvailable, isModalOpen }) => {
          if (isEncryptionAvailable) {
            nextTick(() => {
              callback();
            });
            unwatch();
          }

          if (!isModalOpen) {
            unwatch();
          }
        }
      );
    }
  };

  return {
    isModalOpen,
    modalContext,
    isEncryptionAvailable,
    withEncryptionGate,
  };
};
