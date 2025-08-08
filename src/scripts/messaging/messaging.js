// could be published as a private NPM package
import { authDecrypt, authEncrypt } from "@/scripts/actions/encryption";

export const createMessaging = ({
  targetOrigin = "*",
  channelId = "EXTENSION_DASHBOARD",
  sourceId = Date.now().toString(),
  callback,
} = {}) => {
  const HANDSHAKE_MESSAGE_TYPE = `${channelId}_HANDSHAKE`;

  const waitForHandshake = new Promise((resolve) => {
    const handshakeMessageHandler = ({ data, origin }) => {
      if (
        data?.channelId === channelId &&
        data?.sourceId !== sourceId &&
        origin === targetOrigin &&
        data?.payload?.type === HANDSHAKE_MESSAGE_TYPE
      ) {
        window.postMessage(
          {
            channelId,
            sourceId,
            payload: { type: HANDSHAKE_MESSAGE_TYPE },
          },
          targetOrigin
        );

        window.removeEventListener("message", handshakeMessageHandler);
        if (callback) {
          callback();
        }
        resolve();
      }
    };

    window.postMessage(
      {
        channelId,
        sourceId,
        payload: { type: HANDSHAKE_MESSAGE_TYPE },
      },
      targetOrigin
    );

    window.addEventListener("message", handshakeMessageHandler);
  });

  let readyToListen = null;
  const waitForReadyToListen = new Promise(
    (resolve) => (readyToListen = resolve)
  );

  let messageListeners = [];

  const addListener = (listener) => {
    messageListeners.push(listener);
  };

  const removeListener = (listener) => {
    messageListeners = messageListeners.filter(
      (registeredListener) => registeredListener !== listener
    );
  };

  const sendMessage = (payload) => {
    waitForHandshake.then(() => {
      authEncrypt(JSON.stringify(payload)).then((payload) => {
        window.postMessage(
          {
            channelId,
            sourceId,
            payload,
          },
          targetOrigin
        );
      });
    });
  };

  window.addEventListener("message", ({ data, origin }) => {
    if (
      data?.channelId === channelId &&
      data?.sourceId !== sourceId &&
      origin === targetOrigin &&
      data?.payload?.type !== HANDSHAKE_MESSAGE_TYPE
    ) {
      waitForReadyToListen.then(() => {
        authDecrypt(data?.payload).then((payloadString) => {
          const payload = JSON.parse(payloadString);
          messageListeners.forEach((listener) => {
            listener(payload);
          });
        });
      });
    }
  });

  return {
    addListener,
    removeListener,
    sendMessage,
    readyToListen,
  };
};
