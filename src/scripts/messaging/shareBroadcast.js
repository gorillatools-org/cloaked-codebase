import { broadcastConstants } from "@/features/cloakDetails/IdentitySharing/utils";

export const initShareBroadcast = () => {
  const bc = new BroadcastChannel("share_channel");
  bc.postMessage(broadcastConstants.USER_LOGGED_IN);
  bc.onmessage = (e) => {
    if (
      e.data === broadcastConstants.USER_LOGGED_OUT ||
      e.data === broadcastConstants.USER_SAVED_IDENTITY
    ) {
      setTimeout(() => {
        bc.close();
      }, 1000);
    }
  };
};
