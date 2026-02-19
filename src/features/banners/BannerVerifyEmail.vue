<script setup>
import { confirm_contact } from "@/api/actions/feedback";
import EmailService from "@/api/actions/email-service";
import AddVerifyEmail from "@/features/modals/AddVerifyEmail.vue";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import AtomTopBannerButton from "@/library/AtomTopBannerButton.vue";
import { useToast } from "@/composables/useToast.js";
import { markRaw } from "vue";
import store from "@/store";

const toast = useToast();
const emit = defineEmits(["emailVerified"]);

const props = defineProps({
  email: {
    type: Object,
    default: null,
  },
});

function open() {
  confirm_contact({
    type: "email",
    contact: props.email.email,
    id: props.email.id,
    callback: () => {
      const email = { ...props.email };
      EmailService.makePrimary(email.id);
      emit("emailVerified");
      toast.success("Email confirmed");
    },
  });
}

function addVerify() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddVerifyEmail),
      props: {
        setPrimary: true,
      },
      events: {
        "email-verified": () => {
          emit("emailVerified");
        },
      },
    },
  });
}
</script>

<template>
  <AtomTopBanner variant="info">
    <template v-if="props.email">
      Please verify your recovery email
      {{ props.email.email }}.
      <AtomTopBannerButton @click="open">Verify Email</AtomTopBannerButton>
    </template>
    <template v-else>
      Add recovery email to keep your account safe.
      <AtomTopBannerButton @click="addVerify">Add Email</AtomTopBannerButton>
    </template>
  </AtomTopBanner>
</template>
