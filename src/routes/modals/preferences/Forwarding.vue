<script setup>
import {
  reactive,
  computed,
  nextTick,
  onBeforeMount,
  markRaw,
  onBeforeUnmount,
} from "vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";

import ValueDisplay from "@/features/ui/value-display";
import UiSwitchInput from "@/features/UiSwitchInput";

import PreferencesTitle from "./PreferencesTitle";
import PreferencesParagraph from "./PreferencesParagraph";
import PreferencesPanel from "./PreferencesPanel";
import PreferencesRadio from "./PreferencesRadio";
import AddVerifyEmail from "@/features/modals/AddVerifyEmail.vue";
import AddVerifyPhone from "@/features/modals/AddVerifyPhone.vue";
import PersonalInfoServices from "@/api/settings/personal-services";
import EmailService from "@/api/actions/email-service";
import PhoneService from "@/api/actions/phone-service";
import ForwardingService from "@/api/actions/forwarding-service";
import { phone_format } from "@/scripts/format";
import Button from "@/features/Button.vue";

const state = reactive({
  emailForwardingEnabled: false,
  phoneForwardingEnabled: false,
  emails: [],
  phones: [],
  updating: false,
});

onBeforeMount(() => {
  window.addEventListener("cloak:refresh-emails", refreshEmails);
  refreshData();
});

onBeforeUnmount(() => {
  window.removeEventListener("cloak:refresh-emails", refreshEmails);
});

const toast = useToast();

const forwardingEmail = computed(() =>
  verifiedEmails.value.find((item) => item.forwarding)
);

const verifiedEmails = computed(() =>
  state.emails.filter((item) => item.verified)
);

const emailForwardingLabel = computed(
  () => `Forwarding is ${state.emailForwardingEnabled ? "on" : "off"}`
);

const emailForwardingValue = computed(() => {
  if (state.emailForwardingEnabled) {
    return `Incoming emails will be forwarded to ${
      email.value ? email.value : "your email"
    }.`;
  }

  return "Incoming emails will be stored in the Cloaked app.";
});

const email = computed(() =>
  forwardingEmail.value ? forwardingEmail.value.email : ""
);

const forwardingEmailId = computed(() =>
  forwardingEmail.value ? forwardingEmail.value.id : ""
);

const forwardingPhone = computed(() => {
  const forwardingPhone = verifiedPhones.value.find((item) => item.forwarding);
  return forwardingPhone
    ? {
        ...forwardingPhone,
        formattedPhoneNumber: phone_format(forwardingPhone.phone_number),
      }
    : {};
});

const verifiedPhones = computed(() => {
  const verifiedPhones = state.phones.filter((item) => item.verified);
  return verifiedPhones?.length > 0
    ? verifiedPhones.map((phone) => {
        return {
          ...phone,
          formattedPhoneNumber: phone_format(phone.phone_number),
        };
      })
    : [];
});

const phoneForwardingLabel = computed(
  () => `Forwarding is ${state.phoneForwardingEnabled ? "on" : "off"}`
);

const phoneForwardingValue = computed(() => {
  if (state.phoneForwardingEnabled) {
    return `Incoming calls/texts will be forwarded to ${
      forwardingPhone.value?.formattedPhoneNumber || ""
    }.`;
  }

  return "Incoming calls/texts will be stored in the Cloaked app.";
});

const forwardingPhoneId = computed(() =>
  forwardingPhone.value ? forwardingPhone.value.id : ""
);

const refreshData = async () => {
  try {
    const promises = [refreshEmails(), refreshPhones()];
    await Promise.all(promises);

    const res = await ForwardingService.getDefaultForwardingData();
    const { data } = res;

    if (data.email) {
      state.emails = state.emails.map((email) => {
        if (email.id === data.email.id) {
          email.forwarding = true;
          state.emailForwardingEnabled = true;
        }
        return email;
      });
    } else {
      state.emailForwardingEnabled = false;
    }
    if (data.phone) {
      state.phones = state.phones.map((phone) => {
        if (phone.id === data.phone.id) {
          phone.forwarding = true;
          state.phoneForwardingEnabled = true;
        }
        return phone;
      });
    } else {
      state.phoneForwardingEnabled = false;
    }
  } catch {
    // Reset forwarding states on error
    state.emailForwardingEnabled = false;
    state.phoneForwardingEnabled = false;
    toast.error("Error getting forwarding data.");
  }
};

const handleEmailForwardingChange = async () => {
  state.emailForwardingEnabled = !state.emailForwardingEnabled;
  if (state.emailForwardingEnabled) {
    if (!verifiedEmails.value.length) {
      return handleAddEmail();
    }
    let email = verifiedEmails.value.find((email) => email.primary);
    if (!email) {
      email = verifiedEmails.value[0];
    }
    handleEmailUpdate(email.id);
  } else if (!state.emailForwardingEnabled) {
    try {
      await ForwardingService.disableEmailForwarding();
      state.updating = false;
      state.emails = state.emails.map((email) => {
        email.forwarding = false;
        return email;
      });

      toast.success("Forwarding email status saved.");
    } catch {
      toast.error("Error updating forwarding email status.");
      state.updating = false;
    }
  }
};

const handlePhoneForwardingChange = async () => {
  state.phoneForwardingEnabled = !state.phoneForwardingEnabled;

  if (state.phoneForwardingEnabled) {
    if (!verifiedPhones.value.length) {
      return handleAddPhone();
    }
    let phone = verifiedPhones.value.find((phone) => phone.primary);
    if (!phone) {
      phone = verifiedPhones.value[0];
    }
    handlePhoneUpdate(phone.id);
  } else if (!state.phoneForwardingEnabled) {
    try {
      await ForwardingService.disablePhoneForwarding();
      state.updating = false;
      state.phones = state.phones.map((phone) => {
        phone.forwarding = false;
        return phone;
      });

      toast.success("Forwarding phone status saved.");
    } catch {
      toast.error("Error updating forwarding phone status.");
      state.updating = false;
    }
  }
};

const handleEmailUpdate = async (emailId, justVerified) => {
  if (state.updating) {
    return;
  }
  state.updating = true;

  try {
    const res = await ForwardingService.enableEmailForwarding(emailId);
    const { data } = res;
    if (justVerified) {
      state.emails = [...state.emails, data.data.email];
    }
    state.emails = state.emails.map((email) => {
      if (email.id === data.data.email.id) {
        email.forwarding = true;
      } else {
        email.forwarding = false;
      }
      return email;
    });
    state.updating = false;
    toast.success("Forwarding email saved.");
  } catch {
    toast.error("Error updating forwarding email.");
    state.updating = false;
  }
};

const handleAddEmail = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddVerifyEmail),
      props: {
        setPrimary: true,
      },
      events: {
        "email-verified": (email) => handleEmailUpdate(email.id, true),
        cancel: cancelEmailVerify,
      },
    },
  });
};

const handlePhoneUpdate = async (phoneId, justVerified) => {
  if (state.updating) {
    return;
  }
  state.updating = true;

  try {
    const res = await ForwardingService.enablePhoneForwarding(phoneId);
    const { data } = res;
    if (justVerified) {
      state.phones = [...state.phones, data.data.phone];
    }
    state.phones = state.phones.map((phone) => {
      if (phone.id === data.data.phone.id) {
        phone.forwarding = true;
      } else {
        phone.forwarding = false;
      }
      return phone;
    });

    state.updating = false;
    toast.success("Forwarding phone saved.");
  } catch {
    toast.error("Error updating forwarding phone.");
    state.updating = false;
  }
};

const handleAddPhone = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddVerifyPhone),
      props: {
        setPrimary: true,
      },
      events: {
        "phone-verified": (phone) => handlePhoneUpdate(phone.id, true),
        cancel: cancelPhoneVerify,
      },
    },
  });
};

const cancelPhoneVerify = () => {
  if (!forwardingPhone.value?.id) {
    state.phoneForwardingEnabled = false;
  }
};

const cancelEmailVerify = () => {
  if (!forwardingEmail.value?.id) {
    state.emailForwardingEnabled = false;
  }
};

const handlePhoneDelete = (phoneId) => {
  const phone = state.phones.find((item) => item.id === phoneId);

  store.dispatch("openGlobalDeleteModal", {
    type: "phone",
    onClick: async () => {
      try {
        await PhoneService.deletePhone(phone.url);
        if (forwardingPhone.value.id === phoneId) {
          state.phoneForwardingEnabled = false;
        }
        state.phones = state.phones.filter((item) => item.id !== phoneId);
        nextTick(() => {
          if (!verifiedPhones.value.length) {
            state.phoneForwardingEnabled = false;
          }
        });

        toast.success("Phone deleted.");
      } catch (e) {
        const errorMessage =
          e.response?.data &&
          (
            Object.values(e.response?.data) ||
            (e.response.data && e.response.data)
          ).includes("in_use_with_2fa")
            ? "Phone is in use for 2FA. To delete, please remove from 2FA first."
            : "Unable to delete phone number. Please try again later.";
        toast.error(errorMessage);
        refreshData();
      }
    },
  });
};

const handleEmailDelete = (emailId) => {
  const email = state.emails.find((item) => item.id === emailId);
  const forwardingEmailCopy = { ...forwardingEmail.value };

  store.dispatch("openGlobalDeleteModal", {
    type: "email",
    onClick: async () => {
      try {
        await EmailService.deleteEmail(email.url);
        if (forwardingEmailCopy.id === emailId) {
          state.emailForwardingEnabled = false;
        }

        state.emails = state.emails.filter((item) => item.id !== emailId);
        nextTick(() => {
          if (!verifiedEmails.value.length) {
            state.emailForwardingEnabled = false;
          }
        });

        return toast.success("Email deleted");
      } catch (e) {
        const errorMessage =
          e.response?.data &&
          (
            Object.values(e.response.data) ||
            (e.response.data && e.response.data)
          ).includes("in_use_with_2fa")
            ? "Email is in use for 2FA. To delete, please remove from 2FA first."
            : "Unable to delete email. Please try again later.";
        toast.error(errorMessage);
        return refreshData();
      }
    },
  });
};

const refreshEmails = () => {
  return PersonalInfoServices.getPersonalEmails().then((emails) => {
    state.emails = emails;
    return state.emails;
  });
};

const refreshPhones = () => {
  return PersonalInfoServices.getPersonalPhones().then((phones) => {
    state.phones = phones;
    return state.phones;
  });
};
</script>
<template>
  <PreferencesPanel class="forwarding-pref">
    <PreferencesTitle>
      Forward incoming emails to your personal inbox?
    </PreferencesTitle>

    <PreferencesParagraph>
      This will only affect future emails. Settings for your existing Cloaked
      identities will be unaffected.
    </PreferencesParagraph>

    <ValueDisplay
      :label="emailForwardingLabel"
      :value="emailForwardingValue"
      dark-label
      light-value
      no-separator
      class="add-margin"
    >
      <template #actions>
        <UiSwitchInput
          :value="state.emailForwardingEnabled"
          @change="handleEmailForwardingChange"
        />
      </template>
    </ValueDisplay>

    <PreferencesRadio
      v-for="verifiedEmail in verifiedEmails"
      :key="verifiedEmail.id"
      :label="verifiedEmail.email"
      :value="forwardingEmailId"
      :input-value="verifiedEmail.id"
      group-name="emails"
      deletable
      :disabled="!state.emailForwardingEnabled"
      @update="handleEmailUpdate"
      @delete="handleEmailDelete"
    />

    <Button
      v-if="state.emailForwardingEnabled"
      @click="handleAddEmail"
    >
      Add an email address
    </Button>

    <PreferencesTitle>
      Forward incoming calls and texts to your personal phone?
    </PreferencesTitle>

    <PreferencesParagraph>
      This will only affect future calls and texts. Settings for your existing
      Cloaked identities will be unaffected.
    </PreferencesParagraph>

    <ValueDisplay
      :label="phoneForwardingLabel"
      :value="phoneForwardingValue"
      dark-label
      light-value
      no-separator
      class="add-margin"
    >
      <template #actions>
        <UiSwitchInput
          :value="state.phoneForwardingEnabled"
          @change="handlePhoneForwardingChange"
        />
      </template>
    </ValueDisplay>

    <PreferencesRadio
      v-for="phone in verifiedPhones"
      :key="phone.id"
      :label="phone.formattedPhoneNumber"
      :value="forwardingPhoneId"
      :input-value="phone.id"
      group-name="phones"
      deletable
      :disabled="!state.phoneForwardingEnabled"
      @update="handlePhoneUpdate"
      @delete="handlePhoneDelete"
    />

    <Button
      v-if="state.phoneForwardingEnabled"
      @click="handleAddPhone"
    >
      Add a phone number
    </Button>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.forward_toggle {
  .select-wrapper {
    background-color: $color-primary-5;
  }

  .field {
    background-color: $color-primary-5;

    &.phone {
      .action {
        position: relative;
        top: 0 !important;
        margin-top: 2px !important;
      }
    }
  }
}

.forwarding-pref {
  .preferences-paragraph + .forwarding-container {
    margin-top: 35px;
  }

  .forwarding-container + .preferences-title {
    margin-top: 32px;
  }

  .button {
    margin-top: 32px;
  }
}
</style>
