<script setup>
import { onMounted, computed, reactive, markRaw } from "vue";
import MigrationAnnouncement from "./MigrationAnnouncement.vue";
import AddVerifyEmail from "@/features/modals/AddVerifyEmail.vue";
import RecoveryServices from "@/api/settings/recovery-services";
import { logout } from "@/scripts/actions/auth";

import store from "@/store";
import { createPDF } from "@/scripts/tools.js";

const emit = defineEmits(["refresh"]);

const ANNOUNCEMENT = "announcement";
const ADD_RECOVERY_EMAIL = "add_recovery_email";
const LOGOUT = "logout";
const props = defineProps({
  userEncryptionVersion: {
    type: Number,
    required: true,
  },
});
const steps = reactive({
  availableSteps: [ANNOUNCEMENT],
  currentStep: ANNOUNCEMENT,
});
const data = reactive({
  emails: [],
});

const username = computed(() => {
  return store.state.authentication?.username;
});

const isV1User = computed(() => {
  return props.userEncryptionVersion === 1;
});

const supportEmail = computed(() => {
  const supportCloak = store.state.localdb.db_cloaks.find(
    (c) => c.protected && c.nickname.match(/team|support/i)
  );
  return supportCloak && supportCloak.email;
});

const deplayedLogout = () => {
  setTimeout(() => {
    logout();
  }, 1500);
};

const openLogoutModal = () => {
  store.dispatch("openModal", {
    header: "Sign in to continue",
    subheader:
      "In order to finish your security upgrade, we need to log you out of your Cloaked account. Please sign in again to complete the upgrade.",
    button: {
      text: "Continue",
      onClick: deplayedLogout,
    },
    preventClose: true,
    showCancel: false,
  });
};

const openEmailModal = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddVerifyEmail),
      props: {
        setPrimary: true,
        isMigration: true,
        logout: deplayedLogout,
      },
      events: {
        "email-verified": emit("refresh"),
        "email-created": emit("refresh"),
      },
    },
  });
};

const checkForRecoveryEmail = async () => {
  RecoveryServices.getPrimaryEmail().then((response) => {
    if (response.data?.results?.length > 0) {
      data.emails = response.data.results;
      if (data.emails.length > 0) {
        steps.availableSteps.push(ADD_RECOVERY_EMAIL);
      }
    }
  });
};

onMounted(async () => {
  await checkForRecoveryEmail();
});

const onDownloadAndContinue = () => {
  if (isV1User.value) {
    createPDF(store.state.encryption.secret_key, supportEmail?.value, username);
  }
  if (!data.emails?.length) {
    steps.currentStep = ADD_RECOVERY_EMAIL;
    openEmailModal();
  } else {
    steps.currentStep = LOGOUT;
    openLogoutModal();
  }
};
</script>

<template>
  <div>
    <MigrationAnnouncement
      v-if="steps.currentStep === ANNOUNCEMENT"
      :username="username"
      :is-v1-user="isV1User"
      @close="onDownloadAndContinue"
    />
  </div>
</template>
