<script setup>
import ValueDisplay from "@/features/ui/value-display";
import EmailService from "@/api/actions/email-service";
import PhoneService from "@/api/actions/phone-service";

import store from "@/store";
import router from "@/routes/router";
import { reactive, onBeforeMount, computed } from "vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import AccountRecoveryPhone from "@/routes/modals/preferences/AccountRecoveryPhone.vue";
import AccountRecoveryEmail from "@/routes/modals/preferences/AccountRecoveryEmail.vue";

const emit = defineEmits(["toggleBack"]);

onBeforeMount(() => {
  refreshEmails();
  refreshPhones();
});

const state = reactive({
  emails: [],
  phones: [],
});

const showRecoveryPassphraseSection = computed(() => {
  return (
    store.state.authentication?.user?.encryption_status === 1 ||
    store.state.authentication?.user?.encryption_status === 3
  );
});

function refreshEmails() {
  return EmailService.getUserEmails().then(({ data }) => {
    state.emails = data.results;
  });
}

function refreshPhones() {
  return PhoneService.getUserPhoneNumbers().then(({ data }) => {
    state.phones = data.results;
  });
}

function deleteEmail(emailId) {
  state.emails = state.emails.filter((item) => item.id !== emailId);
}

function deletePhone(phoneId) {
  state.phones = state.phones.filter((item) => item.id !== phoneId);
}

function goToRecoveryPassphrase() {
  router.push({ name: "settings.recovery" });
}
</script>

<template>
  <PreferencesPanel class="panel-offset">
    <template #header>
      <PreferencesHeader @go-back="emit('toggleBack')" />
    </template>

    <PreferencesTitle>Maintain your account access</PreferencesTitle>

    <PreferencesParagraph>
      These can be used to make sure it's really you signing in, reach you if
      there's suspicious activity in your account, or recover a lost password.
    </PreferencesParagraph>

    <div class="section forward-panel">
      <AccountRecoveryPhone
        :phones="state.phones"
        @toggle-back="emit('toggleBack')"
        @refresh="refreshPhones"
        @delete="(phoneId) => deletePhone(phoneId)"
      />
      <AccountRecoveryEmail
        :emails="state.emails"
        @toggle-back="emit('toggleBack')"
        @refresh="refreshEmails"
        @delete="(emailId) => deleteEmail(emailId)"
      />
      <ValueDisplay
        v-if="showRecoveryPassphraseSection"
        label="Download recovery kit"
        @click="goToRecoveryPassphrase"
      />
    </div>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
.forward-panel {
  margin-top: 24px;
}
</style>
