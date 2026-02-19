<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from "vue";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import store from "@/store";
import { useToast } from "@/composables/useToast";

const iframeRef = ref(null);
const toast = useToast();
const accessToken = computed(
  () => store.state.authentication?.auth?.access_token
);

const privateKey = computed(
  () => store.state.authentication?.encryption?.private_key
);

const publicKey = computed(
  () => store.state.authentication?.encryption?.public_key
);

const emit = defineEmits(["input", "close"]);

const iframeSrc = computed(
  () =>
    `${import.meta.env.VITE_API}auth/biometric-enrollment/?cloaked_redirect_uri=${import.meta.env.VITE_REDIRECT_URI}`
);

const iframeListener = ({ data: message }) => {
  // enrollment iframe is loaded, send access_token
  if (message.event === "iframe-loaded") {
    console.log("iframe-loaded");
    iframeRef.value.contentWindow.postMessage(
      {
        event: "encryption-data",
        data: {
          access_token: accessToken.value,
          private_key: privateKey.value,
          public_key: publicKey.value,
        },
      },
      import.meta.env.VITE_API
    );
  }

  if (message.event === "enrollment-succeeded") {
    toast.success("Face recovery successfully enabled!");
    store.dispatch("authentication/getUser");
    emit("close");
  }

  if (message.event === "enrollment-failed") {
    toast.error("Face recovery failed. Please try again.");
    emit("close");
  }
  if (message.event === "close-webview") {
    emit("close");
  }
};

onBeforeMount(async () => {
  window.addEventListener("message", iframeListener);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", iframeListener);
});
</script>

<template>
  <AppModal
    :value="true"
    @input="$emit('input', $event)"
    @close="$emit('close')"
  >
    <Transition
      name="modal-content"
      mode="out-in"
    >
      <AppModalContent
        ref="modalContentRef"
        class="modal-remove-member"
        width="400px"
      >
        <iframe
          id="biometricsFrame"
          ref="iframeRef"
          :src="iframeSrc"
          class="account-biometrics"
          allow="camera"
          frameborder="0"
        />
      </AppModalContent>
    </Transition>
  </AppModal>
</template>

<style lang="scss" scoped>
.modal-remove-member {
  height: 700px;
  width: 400px;

  .account-biometrics {
    height: 100%;
    width: 100%;

    :deep(.main-content) {
      width: 400px;
      height: 700px;
    }
  }
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
