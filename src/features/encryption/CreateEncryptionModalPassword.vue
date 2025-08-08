<script setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from "vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import store from "@/store";

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["continue"]);

const accountUsername = computed(() => store.state.authentication?.username);

const accessToken = computed(
  () => store.state.authentication?.auth?.access_token
);

const iframe = ref(null);
const iframeSrc = computed(
  () =>
    `${import.meta.env.VITE_API}auth/enable-encryption/?cloaked_redirect_uri=${
      import.meta.env.VITE_REDIRECT_URI
    }`
);

const iframeListener = ({ data: message }) => {
  if (message.event === "api-status" && message.data.ready === true) {
    iframe.value.contentWindow.postMessage(
      {
        event: "init-password",
        data: {
          username: accountUsername.value,
          access_token: accessToken.value,
        },
      },
      import.meta.env.VITE_API
    );
  }

  if (message.event === "enable-encryption-success") {
    emit("continue", message.data);
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
  <AppModalContent
    width="500px"
    class="create-encryption-password"
  >
    <iframe
      ref="iframe"
      :src="iframeSrc"
      class="create-encryption-password__iframe"
    />
  </AppModalContent>
</template>

<style scoped lang="scss">
.create-encryption-password {
  background: transparent;

  &__iframe {
    border: none;
    height: 680px;
    width: 500px;
    overflow: hidden;
  }
}
</style>
