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
    return new Promise((resolve, reject) => {
      const executeCallback = async () => {
        try {
          const result = await callback();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (toValue(isEncryptionAvailable)) {
        executeCallback();
      } else {
        fallback?.();
        modalContext.value = context;
        isModalOpen.value = true;

        const unwatch = watch(
          [isEncryptionAvailable, isModalOpen],
          ([isEncryptionAvailable, modalOpenValue]) => {
            if (isEncryptionAvailable) {
              isModalOpen.value = false;
              nextTick(() => {
                executeCallback();
              });
              unwatch();
            } else if (!modalOpenValue) {
              reject(new Error("Encryption gate cancelled by user"));
              unwatch();
            }
          }
        );
      }
    });
  };

  return {
    isModalOpen,
    modalContext,
    isEncryptionAvailable,
    withEncryptionGate,
  };
};
