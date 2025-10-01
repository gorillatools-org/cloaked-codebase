import { computed, watch, type Ref } from "vue";
import { type ExtensionAuthOptions } from "@/features/extension-auth/core";
import { useStore } from "vuex";

interface ExtensionAuthCallbackReturn {
  startExtensionAuth: (_options?: {
    silent?: boolean;
    debug?: boolean;
  }) => Promise<void>;
  isExtensionAuthenticated: Ref<boolean>;
}

export function useExtensionAuthCallback(): ExtensionAuthCallbackReturn {
  const store = useStore();

  const extensionAuth = computed(() => store.state.authentication.extension);
  const isExtensionAuthenticated = computed(
    () => !!extensionAuth.value?.access_token
  );

  const initiateAuth = async (
    options?: ExtensionAuthOptions
  ): Promise<void> => {
    return store.dispatch("authentication/initiateExtensionAuth", options);
  };

  const startExtensionAuth = async (options?: {
    silent?: boolean;
    debug?: boolean;
  }): Promise<void> => {
    let stopWatcher: any = null;

    try {
      // The store action now handles both simplified and OAuth approaches internally
      await initiateAuth(options);

      // If we reach here and tokens aren't already stored, wait for them
      // (This handles the case where OAuth flow is still in progress)
      if (!isExtensionAuthenticated.value) {
        return new Promise((resolve, reject) => {
          // Set up timeout for authentication
          const timeout = setTimeout(() => {
            stopWatcher?.();
            reject(
              new Error("Extension authentication timeout - please try again")
            );
          }, 30000); // 30 second timeout

          stopWatcher = watch(
            isExtensionAuthenticated,
            (newValue) => {
              if (newValue) {
                clearTimeout(timeout);
                stopWatcher?.();
                resolve();
              }
            },
            { immediate: false }
          );
        });
      }

      // If tokens are already present, authentication was successful (simplified approach)
      return;
    } catch (error: any) {
      if (stopWatcher) {
        stopWatcher();
      }

      // Provide user-friendly error messages
      const errorMessage = error?.message || error;
      if (typeof errorMessage === "string") {
        if (errorMessage.includes("Extension is not installed")) {
          throw new Error(
            "Browser extension is not installed. Please install the Cloaked extension and try again."
          );
        } else if (errorMessage.includes("timeout")) {
          throw new Error("Authentication timed out. Please try again.");
        } else if (errorMessage.includes("Failed to generate")) {
          throw new Error(
            "Authentication failed. Please check your internet connection and try again."
          );
        } else if (errorMessage.includes("iframe")) {
          throw new Error(
            "Authentication window failed to load. Please try again."
          );
        }
      }

      throw new Error(
        errorMessage || "Extension authentication failed. Please try again."
      );
    }
  };

  return {
    startExtensionAuth,
    isExtensionAuthenticated,
  };
}
