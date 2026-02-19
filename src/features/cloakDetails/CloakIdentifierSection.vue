<script setup>
import { computed, nextTick, onMounted, reactive, watch } from "vue";
import store from "@/store";
import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import { emailCheck } from "@/scripts/regex";
import moment from "moment";
import CloakGenerateEmailFlyout from "@/features/cloakDetails/CloakGenerateEmailFlyout.vue";
import CloakInfoRow from "@/features/cloakDetails/CloakInfoRow.vue";
import CloakedAddressSection from "@/features/cloakDetails/CloakedAddressSection.vue";
import { createPassword } from "@/scripts/actions/crypto.js";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import { phone as phone_standard } from "phone";
import { phone as isValidPhone } from "@/scripts/validation.js";
import { getUserCountry } from "@/scripts/countries/countries.js";
import { authDecrypt } from "@/scripts/actions/encryption.js";
import { formatter as cloakFormatter } from "@/store/modules/localdb.js";
import IdentityService from "@/api/actions/identity-service.js";
import ReuseService from "@/api/actions/reuse-service.js";
import { phone_format } from "@/scripts/format.js";
import TOTPContainer from "@/features/cloakDetails/TOTP/TOTPContainer.vue";
import EmailService from "@/api/actions/email-service.js";
import CloakGeneratePasswordFlyout from "@/features/cloakDetails/CloakGeneratePasswordFlyout.vue";
import { DEFAULT_PASSWORD_SETTINGS } from "@/scripts/constants.js";
import SubscriptionService from "@/api/settings/subscription-services.js";
import InlineSvg from "@/features/InlineSvg.vue";
import { cloakHelpers } from "@/scripts/cloakHelpers";
import { useCloakedAddressFeatureFlag } from "@/composables/useCloakedAddressFeatureFlag";

const toast = useToast();

const emit = defineEmits(["refresh"]);

const props = defineProps({
  cloak: { type: Object, default: null },
  readOnly: { type: Boolean, default: false },
  showLimits: { type: Boolean, default: false },
});

const featureFlag = computed(
  () => store.state.authentication?.user?.flags.hibp_dashboard_v1
);

const { cloakedAddressEnabled } = useCloakedAddressFeatureFlag();

const state = reactive({
  fetching: {
    phone: false,
    username: false,
    email: false,
    password: false,
  },
  updatingCloak: {
    phone: false,
    username: false,
    email: false,
    password: false,
    totp: false,
  },
  emailIsChangeable: true,
  showFlyout: null,
  decrypted: null,
  userTypedPassword: "",
  visiblePasswordStrength: false,
  visiblePasswordOptions: false,
  cloakCopyForUpdate: null,
  errors: {},
});

const showPhoneLimits = computed(() => props.showLimits && false);

const getPhoneNumberRemaining = computed(
  () => store.getters["settings/getPhoneNumberRemaining"]
);

const hasPhoneRemaining = computed(() => getPhoneNumberRemaining.value > 0);

const willExpire = computed(() => {
  const hasExpire = props.cloak?.cloaked_phone?.expiration;
  if (hasExpire) {
    return moment(props.cloak.cloaked_phone.expiration).format("MMM D, YYYY");
  }
  return false;
});

const helpTooltip = computed(() => {
  const nickname = props.cloak && props.cloak.nickname;

  return `This is the information ${nickname} can use to contact you.`;
});

const email = computed(() => props.cloak.email || "");

const password = computed(() => state.decrypted || password_source.value);

const password_source = computed(() => props.cloak.password || "");

const username = computed(() => props.cloak.username || "");

const phone = computed(() => props.cloak.phone || "" || "");

const formattedPhone = computed(() => phone_format(props.cloak.phone) || "");

onMounted(async () => {
  const email = props.cloak.cloaked_email;

  if (email && email.id) {
    try {
      const res = await EmailService.getCloakedEmailChangeable(email.id);
      const { data } = res;
      state.emailIsChangeable = data.changeable;
    } catch {
      toast.error(`Unable to verify if email is changeable`);
    }
  }
  authDecrypt(password_source.value).then((password) => {
    state.decrypted = password;
  });
});

const removeModal = () => {
  store.dispatch("openModal", {
    header: `Delete inactive phone numbers to prevent unwanted spam and tracking`,
    subheader:
      "This will delete the number's entire history from its identity.",
    button: {
      text: "Yes, Delete",
      onClick: removeNumber,
      danger: true,
    },
    cancelText: "Keep",
    cancelAction: keepNumber,
  });
};
const removeNumber = () => {
  ReuseService.expirePhoneNumbersByIds([props.cloak.cloaked_phone.id])
    .then(() => {
      toast.success(`You removed the phone number`);
      emit("refresh", { ...props.cloak, cloaked_phone: null });
    })
    .catch(() => {
      toast.error(`Something went wrong. Please try again.`);
    });
};
const keepNumber = () => {
  ReuseService.keepPhoneNumberById(props.cloak.cloaked_phone.id)
    .then(() => {
      toast.success(`You kept the phone number`);
      emit("refresh", {
        ...props.cloak,
        cloaked_phone: {
          ...props.cloak.cloaked_phone,
          expiration: null,
          state: "pending_expiration",
        },
      });
    })
    .catch(() => {
      toast.error(`Something went wrong. Please try again.`);
    });
};
const savePhone = (newVal, isAutofill) => {
  if (isValidPhone(newVal)) {
    save("phone_number", newVal, isAutofill);
    state.errors.phone_number = false;
  } else {
    toast.error("Please enter a valid phone number");
    state.errors = {
      ...state.errors,
      phone_number: true,
    };
    setTimeout(() => {
      state.errors.phone_number = false;
    }, 3000);
  }
};

const saveEmail = (newVal, isAutofill) => {
  if (newVal && !emailCheck(newVal)) {
    toast.error("Please enter a valid email address");
    state.errors.email = true;
    setTimeout(() => {
      state.errors.email = false;
    }, 3000);
    return;
  }
  save("email", newVal, isAutofill);
  email.value = newVal;
};
const getFieldType = (field) => {
  return cloakHelpers.getLatestDetailType(field, props.cloak);
};
const showConfirmUsernameModal = () => {
  if (username.value) {
    state.showFlyout = null;
    return store.dispatch("openModal", {
      header: `Are you sure you want to replace this username?`,
      subheader: "Adding a new username will delete the old one.",
      button: {
        text: "Replace",
        onClick: () => generateUsername(),
      },
    });
  }
  return generateUsername();
};
const showConfirmPhoneModal = () => {
  if (phone.value) {
    state.showFlyout = null;
    return store.dispatch("openModal", {
      header: `Are you sure you want to replace this phone?`,
      subheader: "Adding a new phone will delete the old one.",
      button: {
        text: "Replace",
        onClick: generatePhone,
      },
    });
  }
  return generatePhone();
};
const showConfirmEmailModal = (email_type) => {
  if (email.value) {
    state.showFlyout = null;
    return store.dispatch("openModal", {
      header: `Are you sure you want to replace this email?`,
      subheader: "Adding a new email will delete the old one.",
      button: {
        text: "Replace",
        onClick: () => generateEmail(email_type),
      },
    });
  }
  return generateEmail(email_type);
};
const handleGenerateEmail = () => {
  if (email.value) {
    if (!store.getters.isV2User) {
      state.showFlyout = "email";
      return;
    } else {
      return generateEmail("random");
    }
  }
  if (!store.getters.isV2User) {
    return generateEmail("random");
  }
  return generateEmail();
};
const showPasswordFlyout = ({ strength = false, options = true } = {}) => {
  state.visiblePasswordStrength = strength;
  state.visiblePasswordOptions = options;
  state.showFlyout = "password";
};
const hidePasswordFlyout = () => {
  state.showFlyout = null;
};
const handlePasswordInput = (value) => {
  state.userTypedPassword = value;

  if (!state.userTypedPassword) {
    hidePasswordFlyout();
  }
};
const handlePasswordTyping = () => {
  showPasswordFlyout({ strength: true, options: false });
};

const handleGeneratePassword = () => {
  if (password.value) {
    showPasswordFlyout({ strength: false, options: true });
    return;
  }

  return generatePassword(DEFAULT_PASSWORD_SETTINGS);
};
const generatePhone = async () => {
  setFieldLoading("phone");
  updateCloakCopy();
  try {
    const res = await IdentityService.generateCloakedPhoneForIdentity(
      props.cloak.id
    );
    const { data } = res;
    updateCloakCopy({ replace_number: data.replace_number });
    setFieldLoadingDone("phone");
    SubscriptionService.getPlanLimits();
    state.errors.phone_number = false;
  } catch (e) {
    setFieldLoadingDone("phone");
    const message =
      e?.response?.data?.errors ||
      e?.response?.data?.message ||
      e?.response?.data?.detail ||
      "Something went wrong, please try again later";
    if (message.includes("verified")) {
      const userCountry = getUserCountry(store.state.authentication?.user);
      store.dispatch("openModal", {
        header: `Please verify your ${userCountry} phone number`,
        subheader: `To generate this Cloaked phone number, you will need to verify your ${userCountry} non-VOIP phone number.`,
        button: {
          text: "Go to Settings",
          onClick: () => {
            nextTick(() => {
              store.commit("openPreference", {
                selected: "account",
                right: "recovery",
              });
              router.push({
                name: "settings.account",
              });
            });
          },
        },
        cancelText: "I'll add one later",
      });
      return;
    }
    toast.error(message);
  }
};
const generateEmail = async (email_type) => {
  updateCloakCopy();

  state.showFlyout = null;
  if (state.emailIsChangeable) {
    const email = props.cloak.cloaked_email;
    setFieldLoading("email");
    if (props.cloak.is_cloaked_email) {
      const payload = {
        email_local_part: "",
        email_type,
      };

      try {
        const res = await EmailService.updateCloakedEmail({
          emailId: email.id,
          payload,
        });
        const { data } = res;
        setFieldLoadingDone("email");
        updateCloakCopy({
          email: data.cloaked_email.email,
          cloaked_email: data.cloaked_email,
        });
      } catch {
        setFieldLoadingDone("email");
      }
    } else {
      try {
        const res = await IdentityService.generateCloakedEmailForIdentity({
          id: props.cloak.id,
          payload: email_type,
        });
        const { data } = res;
        setFieldLoadingDone("email");
        updateCloakCopy({
          email: data.cloaked_email.email,
          cloaked_email: data.cloaked_email,
        });
      } catch {
        setFieldLoadingDone("email");
      }
    }
  }
};
const generateUsername = () => {
  const newUsername = createPassword({
    size: 3,
    words: true,
    symbols: false,
    letters: true,
  });

  save("username", newUsername, true, true);
};
const generatePassword = (settings) => {
  state.showFlyout = null;
  state.userTypedPassword = null;
  const newPassword = createPassword(settings);
  save("password", newPassword, false);
};

const save = (field, value, isAutofill, wasGenerated) => {
  // if its not autofill then its cloaked_email or cloaked_phone
  // and should already be saved
  value = value.trim();
  const cloakData = {};
  const payload = {
    cloak: state.cloakCopyForUpdate || props.cloak,
    updatedValueType: isAutofill ? "user_defined" : "cloaked",
    field,
  };
  if (field === "username" && wasGenerated) {
    payload.updatedValueType = "cloaked";
  }
  if (field === "password") {
    cloakData[field] = value;
    setFieldLoading("password");
    updateAutofill(field, value).then(() => {
      setFieldLoadingDone("password");
    });
  } else if (isAutofill) {
    updateAutofill(field, value);
    field = field.includes("phone") ? "phone_number" : field;
    cloakData[field] = value.trim();
  }
  updateCloakCopy(cloakData);
};

const updateCloakCopy = (updateData) => {
  const cloakCopy = {
    ...(state.cloakCopyForUpdate ? state.cloakCopyForUpdate : props.cloak),
    ...updateData,
  };
  state.cloakCopyForUpdate = { ...cloakCopy };
};
const patchAutofill = (name, payload) => {
  return IdentityService.patchAutofill(props.cloak.id, payload)
    .then(({ data }) => {
      setFieldLoadingDone(name);
      updateCloakCopy({ stored_autofill: data });
    })
    .catch(() => {
      setFieldLoadingDone(name);

      state.errors[name] = true;
      toast.error("There was an error saving, please try again");
    });
};
const updateAutofill = (name, value) => {
  const userAccountVersion = store.state.authentication?.user?.account_version;
  setFieldLoading(name);

  // password, email, phone, notes, username need this
  if (value !== undefined) {
    name = name.toLowerCase().includes("phone") ? "phone_number" : name;
    const payloadKey = `autofill_${name}`;

    if (
      name.toLowerCase().includes("phone") &&
      phone_standard(value) &&
      phone_standard(value).phoneNumber
    ) {
      value = phone_standard(value).phoneNumber;
    }

    const payload = { [payloadKey]: value };
    if (name === "password") {
      payload.encrypted = false;
    } else if (userAccountVersion > 1) {
      payload.encrypted = true;
    }
    payload.encrypted_version = userAccountVersion;

    return patchAutofill(name, payload);
  }
};
const deleteEmail = async () => {
  setFieldLoading("email");

  if (props.cloak.is_cloaked_email) {
    try {
      await IdentityService.deleteCloakedFieldAtUrl(
        props.cloak.cloaked_email_url
      );
      updateAutofill("email", "");
    } catch {
      setFieldLoadingDone("email");
    }
  } else {
    updateAutofill("email", "");
  }

  return updateCloakCopy({
    cloaked_email: null,
    is_cloaked_email: null,
    email: null,
  });
};
const deletePassword = async () => {
  setFieldLoading("password");

  if (props.cloak.password_url) {
    try {
      await IdentityService.deleteCloakedFieldAtUrl(props.cloak.password_url);
      updateAutofill("password", "");
    } catch {
      setFieldLoadingDone("password");
    }
  } else {
    updateAutofill("password", "");
  }
  updateCloakCopy({
    stored_password: null,
    password: "",
  });
};
const deletePhone = async () => {
  setFieldLoading("phone");
  updateCloakCopy({
    cloaked_phone: null,
    number_for_personal: null,
    number_for_app: null,
    is_cloaked_phone: null,
    phone: null,
  });

  if (props.cloak.is_cloaked_phone) {
    try {
      await IdentityService.deleteCloakedPhoneOnIdentity(props.cloak.id);
      updateAutofill("phone", "");
    } catch {
      setFieldLoadingDone("phone");
    }
  } else {
    updateAutofill("phone", "");
  }
};
const deleteUsername = () => {
  updateCloakCopy({
    username: "",
  });

  return updateAutofill("username", "");
};
const setFieldLoading = (field) => {
  if (field === "phone_number") {
    field = "phone";
  }
  state.fetching = {
    ...state.fetching,
    [field]: true,
  };
  state.updatingCloak = {
    ...state.updatingCloak,
    [field]: true,
  };

  state.updatingCloak;
};
const setFieldLoadingDone = (field) => {
  state.errors[field] = false;
  if (field === "phone_number") {
    field = "phone";
  }
  state.fetching = {
    ...state.fetching,
    [field]: false,
  };
};

watch(
  () => password_source.value,
  (value) => {
    authDecrypt(value).then((password) => {
      state.decrypted = password;
    });
  },
  { deep: true }
);
watch(
  () => state.fetching,
  (newValue, oldValue) => {
    const isLoadingNew = Object.values(newValue).includes(true);
    const isLoadingOld = Object.values(oldValue).includes(true);
    if (isLoadingOld && !isLoadingNew) {
      emit("refresh", cloakFormatter({ ...state.cloakCopyForUpdate }), () => {
        if (!Object.values(state.fetching).includes(true)) {
          state.updatingCloak = {
            phone: false,
            username: false,
            email: false,
            password: false,
          };
        }
      });
    }
  },
  { deep: true }
);
</script>
<template>
  <section class="cloak-identifier-section">
    <header class="cloak-identifier-section__header">
      <h3 class="cloak-identifier-section__header-title">
        <span>Your identity</span>

        <UiTooltip
          :title="helpTooltip"
          position="top"
          max-width="192"
          align-x="center"
        >
          <InlineSvg name="more-info-q" />
        </UiTooltip>
      </h3>
    </header>

    <div
      class="cloak-identifier-section__group cloak-identifier-section__group--no-separator"
    >
      <div
        v-if="showPhoneLimits"
        class="number-remaining"
        :class="{ none: !hasPhoneRemaining }"
      >
        You have {{ hasPhoneRemaining ? getPhoneNumberRemaining : 0 }} phone
        numbers left
      </div>
      <CloakInfoRow
        field="phone"
        placeholder="Enter a phone number"
        :initial-value="formattedPhone"
        :loading="state.updatingCloak.phone"
        :field-type="getFieldType('phone')"
        :error="!!state.errors.phone_number"
        :read-only="props.readOnly"
        :nickname="props.cloak.nickname"
        :phone-object="props.cloak.cloaked_phone"
        :identity-id="props.cloak.id"
        @generate="showConfirmPhoneModal"
        @save="savePhone"
        @delete="deletePhone"
        @refresh="$emit('refresh')"
      />
      <div
        v-if="willExpire"
        class="alert-phone-expire"
      >
        <span>This number will be auto-deleted on {{ willExpire }}</span>
        <button @click="removeModal">
          <InlineSvg name="more-info-q" />
        </button>
      </div>
      <CloakInfoRow
        field="email"
        placeholder="Enter an email address"
        :initial-value="email"
        :loading="state.updatingCloak.email"
        :field-type="getFieldType('email')"
        :error="
          !!state.errors.email || (featureFlag && email === 'email@email.com')
        "
        :read-only="props.readOnly"
        :identity-id="props.cloak.id"
        @generate="handleGenerateEmail"
        @save="saveEmail"
        @delete="deleteEmail"
      >
        <template #input-before>
          <CloakGenerateEmailFlyout
            :visible="state.showFlyout === 'email'"
            @generate="showConfirmEmailModal"
            @close="state.showFlyout = null"
          />
        </template>
      </CloakInfoRow>

      <div
        v-if="email === 'email@email.com' && featureFlag"
        class="breached-alert"
      >
        <span>Your email has been breached! 🤯</span>
      </div>

      <CloakedAddressSection
        v-if="cloakedAddressEnabled"
        :cloak="cloak"
        :read-only="props.readOnly"
      />

      <CloakInfoRow
        field="username"
        placeholder="Enter a username"
        :initial-value="username"
        :loading="state.updatingCloak.username"
        :field-type="getFieldType('username')"
        :error="!!state.errors.username"
        :read-only="props.readOnly"
        :identity-id="props.cloak.id"
        @generate="showConfirmUsernameModal"
        @save="(newVal, isAutofill) => save('username', newVal, isAutofill)"
        @delete="deleteUsername"
      />

      <CloakInfoRow
        field="password"
        placeholder="Enter a password"
        :initial-value="password"
        :loading="state.updatingCloak.password"
        field-type="user_defined"
        :error="
          !!state.errors.password || (featureFlag && password === 'password123')
        "
        :read-only="props.readOnly"
        :identity-id="props.cloak.id"
        :breached="featureFlag && password === 'password123'"
        @input="handlePasswordInput"
        @keypress="handlePasswordTyping"
        @generate="handleGeneratePassword"
        @save="(newVal, isAutofill) => save('password', newVal, isAutofill)"
        @delete="deletePassword"
      >
        <template #input-before>
          <CloakGeneratePasswordFlyout
            :visible="state.showFlyout === 'password'"
            :show-generate-options="true"
            @generate="generatePassword"
            @close="state.showFlyout = null"
          />
        </template>
      </CloakInfoRow>

      <div
        v-if="password === 'password123' && featureFlag"
        class="breached-alert"
      >
        <span>Your password has been breached! 🤯</span>
      </div>

      <TOTPContainer
        v-if="store.getters.isV2User"
        :identity="props.cloak"
        :loading="state.updatingCloak.totp"
        :read-only="props.readOnly"
        :errors="state.errors.totp"
        @set-loading="state.updatingCloak.totp = $event"
        @set-errors="state.errors.totp = $event"
        @refresh="emit('refresh', $event)"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.breached-alert {
  padding-left: 110px;
  color: $color-alert;
  font-size: 12px;
  font-weight: 500;
  margin: 10px 0;
}

.number-remaining {
  border-radius: 29px;
  background-color: $color-primary-10;
  color: $color-primary-100;
  display: flex;
  padding: 8px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;

  &.none {
    color: $color-base-white-100-dark;
    background-color: $color-alert-tint;
  }
}

.alert-phone-expire {
  border-radius: 10px;
  border: 1px solid $color-warning;
  background: $color-warning-20;
  padding: 8px 10px 8px 12px;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    color: $color-primary-100;
  }

  button {
    color: $color-primary-100;
    background-color: transparent;
    border: none;
    cursor: pointer;

    svg {
      position: relative;
      top: 3px;
    }
  }
}

.cloak-identifier-section {
  &__header {
    display: flex;
    align-items: center;
    padding: 20px 24px 8px;
    margin-top: 0;

    + .cloak-identifier-section__group {
      padding-top: 0;
    }
  }

  &__header-title {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__group {
    border-top: 1px solid $color-base-white-10;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    &--no-separator {
      border-top: none;
    }
  }
}
</style>
