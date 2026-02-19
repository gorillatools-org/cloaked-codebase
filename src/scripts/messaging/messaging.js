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

  const postMessageHelper = (payload) => {
    window.postMessage(
      {
        channelId,
        sourceId,
        payload,
      },
      targetOrigin
    );
  };

  const sendMessage = (payload) => {
    waitForHandshake.then(() => {
      if (payload?.unencrypted) {
        postMessageHelper(payload);
      } else {
        authEncrypt(JSON.stringify(payload))
          .then((encryptedPayload) => {
            postMessageHelper(encryptedPayload);
          })
          .catch((error) => {
            console.error("Failed to encrypt message:", error);
          });
      }
    });
  };

  const handleMessageHelper = (payload) => {
    messageListeners.forEach((listener) => {
      listener(payload);
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
        if (data?.payload?.unencrypted) {
          handleMessageHelper(data?.payload);
        } else {
          authDecrypt(data?.payload)
            .then((payloadString) => {
              const payload = JSON.parse(payloadString);
              handleMessageHelper(payload);
            })
            .catch((error) => {
              console.error("Failed to decrypt message:", error);
            });
        }
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
