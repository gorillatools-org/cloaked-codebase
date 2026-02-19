<script setup>
import { computed, onBeforeMount, onUnmounted, reactive, watch } from "vue";
import { password_confirm } from "@/scripts/actions/encryption";
import AuthService from "@/api/actions/auth-service";
import EmailService from "@/api/actions/email-service";
import PhoneSerivce from "@/api/actions/phone-service";
import MfaService from "@/api/actions/mfa-service";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import UserService from "@/api/actions/user-service";
import { phone_format } from "@/scripts/format";
import { getUserCountry } from "@/scripts/countries/countries";
import ValueDisplay from "@/features/ui/value-display";
import AsyncText from "@/features/AsyncText";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import MfaSetup from "@/routes/modals/preferences/MfaSetup.vue";
import ChangePassword from "@/routes/modals/preferences/ChangePassword.vue";
import AccountRecovery from "@/routes/modals/preferences/AccountRecovery.vue";
import AuthorizedDevices from "@/routes/modals/preferences/AuthorizedDevices.vue";
import ExportData from "@/routes/modals/preferences/ExportData.vue";
import DeleteAccount from "@/routes/modals/preferences/DeleteAccount.vue";
import ManageAccount from "@/routes/modals/preferences/ManageAccount.vue";
import CountryAccountIcon from "@/features/ui/CountryAccountIcon.vue";
import Button from "@/features/Button.vue";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import BaseText from "@/library/BaseText.vue";

const toast = useToast();

const state = reactive({
  emails: [],
  phones: [],
  mfaMethods: [],
  mfaDevices: [],
  kycPass: false,
  password: null,
  passwordError: null,
  kyc: {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  },
  card: {
    name: "",
    pan: "",
    expiry: "",
    code: "",
  },
  userHasTotpActivated: false,
  userDeleteIsScheduled: null,
  copied: false,
});

const { isEncryptionAvailable } = useEncryptionGate();

const isMfaActive = computed(() => {
  return state.mfaMethods.length > 0;
});

const rightPanel = computed(() => {
  return store.state.ui.preference.right;
});

const getUserDeleteIsScheduled = async () => {
  const response = await UserService.getUserState();
  state.userDeleteIsScheduled = response?.data?.state === "pending_deletion";
};

const showMfaSection = computed(() => {
  if (!isEncryptionAvailable.value) {
    return false;
  }

  /* Only show MFA to v2 users */
  if (store.state.authentication?.user?.encryption_status === 3) {
    return true;
  }
  return false;
});

const userCountryCode = computed(() =>
  getUserCountry(store.state.authentication?.user)
);

const closeModal = () => {
  store.dispatch("closeModal");
};

const getUsername = computed(() => {
  return store.getters["authentication/getUsername"];
});

const goRight = (panel) => {
  if (panel) {
    store.commit("openPreference", {
      selected: "account",
      right: panel,
    });
  } else {
    store.commit("openPreference", { selected: "account" });
  }
};
const toggleBack = (data) => {
  if (data) {
    Object.keys(data).map((key) => {
      this[key] = data[key];
    });
  }
  store.commit("openPreference", { selected: "account" });
};
function refreshEmails() {
  EmailService.getUserEmails()
    .then((res) => {
      state.emails = res?.data?.results;
    })
    .catch(() => {
      toast.error("Unable to fetch emails");
    });
}

function refreshPhones() {
  PhoneSerivce.getUserPhoneNumbers()
    .then((res) => {
      state.phones = res?.data?.results;
    })
    .catch(() => {
      toast.error("Unable to fetch phones");
    });
}
const getPhoneById = (id) => {
  return MfaService.getPhoneById(id)
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
};
const getEmailById = (id) => {
  return MfaService.getEmailById(id)
    .then((res) => {
      return res.data;
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
};
const getMethodSettingsDisplayLabel = (method) => {
  switch (method) {
    case "sms":
      return "2FA SMS number";
    case "call":
      return "2FA phone call number";
    case "email":
      return "2FA email address";
    case "totp":
      return "TOTP authenticator app";
    default:
      break;
  }
};
const getMfaMethods = async () => {
  MfaService.getEnabledMfaMethods()
    .then(async (response) => {
      const { enabled_methods } = response.data;
      state.mfaMethods = await Promise.all(
        enabled_methods.map(async (res) => {
          if (res.personal_phone_id) {
            const mfaPhoneDetails = await getPhoneById(res.personal_phone_id);
            mfaPhoneDetails.displayValue = phone_format(
              mfaPhoneDetails.phone_number
            );
            mfaPhoneDetails.method = res.method;
            mfaPhoneDetails.settingsDisplayLabel =
              getMethodSettingsDisplayLabel(res.method);
            return mfaPhoneDetails;
          } else if (res.personal_email_id) {
            const mfaEmailDetails = await getEmailById(res.personal_email_id);
            mfaEmailDetails.displayValue = mfaEmailDetails.email;
            mfaEmailDetails.method = res.method;
            mfaEmailDetails.settingsDisplayLabel =
              getMethodSettingsDisplayLabel(res.method);
            return mfaEmailDetails;
          } else if (res.method === "totp") {
            const mfaTotpDetails = {
              id: res.method_id,
              method: res.method,
              settingsDisplayLabel: getMethodSettingsDisplayLabel(res.method),
              displayValue: "TOTP authenticator app",
            };
            state.userHasTotpActivated = true;
            return mfaTotpDetails;
          }
        })
      );
      const hasTotpEnabled = enabled_methods.find(
        (method) => method?.method === "totp"
      );
      /* Edge case, if user has deleted totp as a method,
      set userHasTotpActivated to false so they can add it again */
      if (!hasTotpEnabled) {
        state.userHasTotpActivated = false;
      }
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
};
const getMfaDevices = async () => {
  return MfaService.getMfaDevices()
    .then(async (response) => {
      const { results } = response.data;
      state.mfaDevices = results
        .filter((res) => res.confirmed === true && res?.device_id)
        .filter((value, index, self) => {
          return (
            self.findIndex((v) => v.device_id === value.device_id) === index
          );
        });
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
};
const getMfaMethodsAndDevices = async () => {
  if (showMfaSection.value) {
    getMfaMethods();
    getMfaDevices();
    UserService.fetchGetStartedCheckList();
  }
};
const isMethodEmail = (method) => {
  /* For now it's just email or phone/sms for copy purposes */
  return method === "email";
};

const handleOpenRemoveModal = (method) => {
  state.password = null;
  state.passwordError = null;
  if (state.mfaMethods?.length === 1) {
    store.dispatch("openModal", {
      header:
        "Removing this method will disable two-factor authentication (2FA)",
      paragraphs: [
        "Since this is your only method for logging in with 2FA, removing it will also disable two-factor authentication.",
        "Please enter your password to confirm.",
      ],
      button: {
        text: "Remove",
        onClick: async () => {
          const isVerifiedPassword = await verifyPassword();
          if (isVerifiedPassword) {
            removeMethodAndDevices(method.id, method.method);
          }
        },
        danger: true,
        disabled: !state.password,
      },
      closeAfterOnClick: false,
      width: 512,
      input: {
        type: "password",
        placeholder: "Enter your password",
        label: "Password",
        value: state.password,
        handleInput: (value) => {
          state.password = value;
        },
        error: !!state.passwordError,
        errorMessage: state.passwordError,
      },
      events: {
        "mfa-devices-updated": getMfaMethodsAndDevices,
      },
    });
  } else {
    store.dispatch("openModal", {
      header: `Remove two-factor authentication ${
        isMethodEmail(method.method) ? "email" : "number"
      }?`,
      subheader: `You won't be able to sign in with two-factor authentication using this ${
        isMethodEmail(method.method) ? "email address" : "phone number"
      } again. You can always verify another ${
        isMethodEmail(method.method) ? "email address" : "phone number"
      } to continue using 2FA.`,
      button: {
        text: "Remove",
        onClick: () => removeMethodAndDevices(method.id, method.method),
        danger: true,
      },
      closeAfterOnClick: false,
      width: 512,
      events: {
        "mfa-devices-updated": getMfaMethodsAndDevices,
      },
    });
  }
};

const handleOpenMfaToggleModal = () => {
  state.passwordError = null;
  state.password = null;
  if (isMfaActive.value) {
    store.dispatch("openModal", {
      header: "Disable two-factor authentication",
      subheader:
        "Please enter your password to disable two-factor authentication. This will remove all devices and verified 2FA methods from your Cloaked account.",
      button: {
        text: "Disable",
        onClick: async () => {
          const isVerifiedPassword = await verifyPassword();
          if (isVerifiedPassword) {
            turnOffAllMfa();
            closeModal();
          }
        },
        danger: true,
        disabled: !state.password,
      },
      closeAfterOnClick: true,
      width: 512,
      input: {
        type: "password",
        placeholder: "Enter your password",
        label: "Password",
        value: state.password,
        handleInput: (value) => {
          state.password = value;
        },
        error: !!state.passwordError,
        errorMessage: state.passwordError,
      },
      events: {
        "mfa-devices-updated": getMfaMethodsAndDevices,
      },
    });
  }
};
const removeMethodAndDevices = (id, method) => {
  return MfaService.removeMethodAndDevices(id, method)
    .then(() => {
      toast.success("2FA method successfully removed.");
      getMfaMethodsAndDevices();
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
};
const verifyPassword = async () => {
  try {
    const hash = await password_confirm(state.password);
    const user = store.getters["authentication/user"];
    const userId = user.id;
    const passwordIsCorrect = await AuthService.confirmPassword(userId, hash);
    if (passwordIsCorrect) {
      state.password = null;
      state.passwordError = null;
      return true;
    } else {
      throw "invalid password";
    }
  } catch {
    state.passwordError = "Invalid password, please try again.";
    toast.error("Invalid password, please try again.");
  }
};
const turnOffAllMfa = () => {
  return MfaService.disableAllMfaForAccount()
    .then(() => {
      toast.success("Two-factor authentication disabled.");
      getMfaMethodsAndDevices();
    })
    .catch(() => {
      toast.error("Something went wrong. Please try again later.");
    });
};

const launchMfaSetup = () => {
  goRight("mfa-setup");
};

watch(
  () => showMfaSection.value,
  (newVal, oldVal) => {
    if (!oldVal && newVal) {
      getMfaMethodsAndDevices();
    }
  },
  { deep: true }
);

onBeforeMount(() => {
  getUserDeleteIsScheduled();
  refreshEmails();
  refreshPhones();
  getMfaMethodsAndDevices();
});

onUnmounted(() => {
  store.commit("setPreferenceRightPanel", {
    right: null,
  });
  store.commit("setPreferenceStep", {
    step: null,
  });
});

const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});

const isTouchDevice = computed(() => navigator.maxTouchPoints > 0);

const tooltipMessage = computed(() => {
  if (!kycValidated.value) {
    return "";
  }

  let message = isTouchDevice.value ? "Copied" : "Click to copy username hash";

  if (state.copied) {
    message = "Copied";
  }
  return message;
});
</script>
<template>
  <section class="preferences-account">
    <PreferencesPanel v-if="!rightPanel">
      <div class="preferences-account__username-row">
        <CountryAccountIcon
          :country-info="{ countryCode: userCountryCode }"
          :override="{ height: '48px', width: '48px' }"
          class="user-icon"
        />

        <div
          class="username"
          aria-id="CloakedUsername"
        >
          <BaseText
            variant="body-2-semibold"
            as="div"
            class="username-label"
          >
            Username
          </BaseText>
          <AsyncText
            :get-value="getUsername"
            :tooltip-message="tooltipMessage"
          />
        </div>
      </div>

      <ValueDisplay
        v-if="isEncryptionAvailable"
        label="Change password"
        dark-label
        class="add-margin"
        @click="goRight('password')"
      />

      <ValueDisplay
        label="Account recovery"
        dark-label
        @click="goRight('recovery')"
      />

      <ValueDisplay
        v-if="isEncryptionAvailable"
        label="Export my data"
        dark-label
        @click="goRight('export')"
      />

      <ValueDisplay
        v-if="!state.userDeleteIsScheduled"
        label="Manage account"
        danger
        @click="goRight('delete')"
      />

      <ValueDisplay
        v-if="state.userDeleteIsScheduled"
        label="Manage Account"
        dark-label
        @click="goRight('manage-account')"
      />

      <PreferencesTitle v-if="showMfaSection">
        Two-factor authentication (2FA)
      </PreferencesTitle>

      <PreferencesParagraph v-if="showMfaSection">
        For enhanced security, Cloaked recommends enabling two-factor
        authentication to ensure it's really you when signing in.
      </PreferencesParagraph>

      <ValueDisplay
        v-for="mfaMethod in state.mfaMethods"
        :key="mfaMethod?.id ? `${mfaMethod.id}-${mfaMethod.method}` : 'id'"
        :label="
          mfaMethod?.settingsDisplayLabel
            ? mfaMethod.settingsDisplayLabel
            : 'mfa device'
        "
        :value="
          mfaMethod?.displayValue ? mfaMethod.displayValue : 'an mfa device'
        "
        x-icon
        @delete="() => handleOpenRemoveModal(mfaMethod)"
      />

      <ValueDisplay
        v-if="showMfaSection"
        :label="
          state.mfaMethods.length > 0
            ? 'Add another option'
            : 'Set up two-factor authentication'
        "
        class="add-margin"
        @click="launchMfaSetup"
        @mfa-devices-updated="getMfaMethodsAndDevices"
      />
      <ValueDisplay
        v-if="showMfaSection && isMfaActive"
        label="Authorized devices"
        :value="
          state.mfaDevices.length < 1
            ? 'No authorized devices'
            : state.mfaDevices.length > 1
              ? `${state.mfaDevices[0].name} and ${
                  state.mfaDevices.length - 1
                } other${state.mfaDevices.length > 2 ? 's' : ''}`
              : `${state.mfaDevices[0].name}`
        "
        :class="{ no_devices: state.mfaDevices.length < 1 }"
        class="authorized_devices"
        @click="
          state.mfaDevices.length > 0 ? goRight('authorized-devices') : () => {}
        "
      />

      <div
        v-if="showMfaSection && isMfaActive"
        style="width: 100%; display: flex; padding: 24px 0"
        @mfa-devices-updated="getMfaMethodsAndDevices"
      >
        <Button
          type="danger"
          @click="handleOpenMfaToggleModal"
        >
          Disable two-factor authentication
        </Button>
      </div>
    </PreferencesPanel>

    <MfaSetup
      v-if="rightPanel === 'mfa-setup'"
      :user-has-totp-activated="state.userHasTotpActivated"
      @toggle-back="toggleBack"
      @mfa-devices-updated="getMfaMethodsAndDevices"
    />

    <ChangePassword
      v-if="rightPanel === 'password'"
      @toggle-back="toggleBack"
    />

    <AccountRecovery
      v-if="rightPanel === 'recovery'"
      @toggle-back="toggleBack"
    />

    <AuthorizedDevices
      v-if="rightPanel === 'authorized-devices'"
      :devices="state.mfaDevices"
      @toggle-back="toggleBack"
      @mfa-devices-updated="getMfaMethodsAndDevices"
    />

    <ExportData
      v-if="rightPanel === 'export'"
      @toggle-back="toggleBack"
    />

    <DeleteAccount
      v-if="rightPanel === 'delete'"
      @toggle-back="toggleBack"
      @refresh-user="getUserDeleteIsScheduled"
    />

    <ManageAccount
      v-if="rightPanel === 'manage-account'"
      @toggle-back="toggleBack"
      @refresh-user="getUserDeleteIsScheduled"
    />
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.preferences-account {
  &__username-row {
    display: flex;
    gap: 18px;
    margin-bottom: 16px;
    margin-top: 20px;
  }

  .username-label {
    color: $color-primary-70;
  }

  span {
    font-weight: 500;
  }

  .no_devices {
    &:hover {
      div,
      span,
      button {
        cursor: default !important;
      }
    }
  }
  .authorized_devices {
    span {
      text-transform: none;
    }
  }
}
</style>
