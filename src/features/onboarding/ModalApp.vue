<script setup>
import { useAttrs } from "vue";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import AppModal from "@/features/ui/AppModal";
import AppModalClose from "@/features/ui/AppModalClose";
import AppModalTitle from "@/features/ui/AppModalTitle";
import AppModalContent from "@/features/ui/AppModalContent";
import AppModalImage from "@/features/ui/AppModalImage";
import AppModalParagraph from "@/features/ui/AppModalParagraph";
import AppModalFooter from "@/features/ui/AppModalFooter";
import Button from "@/features/Button.vue";
import { computed } from "vue";
import store from "@/store";
import gradientQrImage from "@/assets/images/gradient-qr.png";

const attrs = useAttrs();
defineEmits(["close"]);

const title =
  "Generate phone numbers, email addresses, and passwords on the go";

const showMobileAppModal = computed(() => {
  return store.state.ui.modals.mobileAppModal;
});

const username = computed(() => store.getters["authentication/getUsername"]);

function close() {
  store.dispatch("toggleMobileAppModal", false);
}
</script>

<template>
  <AppModal
    :value="showMobileAppModal"
    @input="close"
  >
    <AppModalContent>
      <AppModalClose
        v-bind="attrs"
        is-absolute
        @close="close"
      />
      <AppModalImage
        :src="gradientQrImage"
        :alt="title"
      />
      <AppModalTitle>
        {{ title }}
      </AppModalTitle>
      <AppModalParagraph>
        Scan this QR code with your phone camera or go to
        <a
          :href="DOWNLOAD_APP_URL"
          target="_blank"
          class="qr-link"
        >
          {{ DOWNLOAD_APP_URL.replace("https://", "") }}
        </a>
        on your mobile browser to install the Cloaked mobile app.
      </AppModalParagraph>
      <AppModalParagraph>
        Your account has been set up. Make sure to Sign In using
        <strong>{{ username }}</strong>
        as your username to access your subscription.
      </AppModalParagraph>
      <AppModalFooter>
        <Button
          type="secondary"
          @click="close"
        >
          Got it
        </Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.qr-link {
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
}
</style>
