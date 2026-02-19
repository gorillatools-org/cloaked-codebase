import { ref } from "vue";
import store from "@/store";
import AuthService from "@/api/actions/auth-service";
import { useDevice } from "@/composables/useDevice";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import posthog from "posthog-js";

export type DownloadAppDeepLinkResult = "desktop" | "deeplink" | "fallback";

export function useDeepLink() {
  const isCreatingDeepLink = ref(false);
  const { isMobile } = useDevice();

  const createAndRedirect = async (
    fetchDeepLink: () => Promise<{ url: string }>
  ): Promise<DownloadAppDeepLinkResult> => {
    if (!isMobile.value) {
      window.open(DOWNLOAD_APP_URL, "_blank");
      return "desktop";
    }

    try {
      isCreatingDeepLink.value = true;

      const { url } = await fetchDeepLink();

      if (!url) {
        throw new Error("No URL returned from API");
      }

      window.location.href = url;

      return "deeplink";
    } catch (error) {
      console.error(error);
      window.location.href = DOWNLOAD_APP_URL;

      return "fallback";
    } finally {
      isCreatingDeepLink.value = false;
    }
  };

  const openDownloadAppDeepLink = (
    username: string
  ): Promise<DownloadAppDeepLinkResult> => {
    return createAndRedirect(async () => {
      // We need to cast window to any to access the CloakedEncryption object
      const windowObject = window as any;

      if (!windowObject.CloakedEncryption) {
        throw new Error("CloakedEncryption not available");
      }

      const cloakedEncryption = await windowObject.CloakedEncryption.build();
      const hashedUsername =
        await cloakedEncryption.generateUsernameHash(username);

      return AuthService.createDeepLink({
        username: hashedUsername,
        posthog_uuid: getPosthogId(),
      });
    });
  };

  const openPhoneBasedDownloadAppDeepLink = (
    phoneNumber: string,
    turnstileToken: string
  ): Promise<DownloadAppDeepLinkResult> => {
    if (!turnstileToken) {
      return Promise.reject(new Error("Turnstile token not provided"));
    }

    return createAndRedirect(() =>
      AuthService.openPhoneBasedDownloadAppDeepLink({
        phone_number: phoneNumber,
        turnstile_token: turnstileToken,
        posthog_uuid: getPosthogId(),
      })
    );
  };

  function getPosthogId(): string | undefined {
    return (
      store.state.authentication?.user?.posthog_uuid ||
      posthog?.get_distinct_id?.()
    );
  }

  return {
    isCreatingDeepLink,
    openDownloadAppDeepLink,
    openPhoneBasedDownloadAppDeepLink,
  };
}
