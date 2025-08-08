<script setup>
import ValueDisplay from "@/features/ui/value-display";
import EmailService from "@/api/actions/email-service";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";

import { computed, markRaw } from "vue";
import AddVerifyEmail from "@/features/modals/AddVerifyEmail.vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";

const toast = useToast();

const props = defineProps({
  emails: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["refresh", "delete", "toggleBack"]);

const primaryEmail = computed(() => {
  return props.emails.find((email) => email.verified && email.primary);
});

function handleAddEmail() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddVerifyEmail),
      props: {
        setPrimary: true,
        title: primaryEmail.value
          ? "Enter a new recovery email"
          : "Add an email address",
      },
      events: {
        "email-verified": refresh,
        "email-created": refresh,
      },
    },
  });
}

function handleDelete(emailId) {
  const email = props.emails.find((item) => item.id === emailId);

  store.dispatch("openGlobalDeleteModal", {
    type: "email",
    onClick: () => {
      EmailService.deleteEmail(email.url)
        .then(() => {
          emit("delete", emailId);
          toast.success("Email deleted");
        })
        .catch(() => {
          toast.error(
            "Email is in use for 2FA. To delete, please remove from 2FA first."
          );
        });
    },
  });
}

function refresh() {
  emit("refresh");
}
</script>

<template>
  <PreferencesPanel>
    <ValueDisplay
      v-if="!primaryEmail"
      label="Add a recovery email"
      @add="handleAddEmail"
      @click="handleAddEmail"
    />
    <ValueDisplay
      v-else
      label="Recovery email"
      :value="primaryEmail.email"
      @edit="handleAddEmail"
      @delete="handleDelete(primaryEmail.id)"
    />
  </PreferencesPanel>
</template>
