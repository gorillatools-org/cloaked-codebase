<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, watch } from "vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import CloakForwardingSection from "@/features/cloakDetails/CloakForwardingSection.vue";
import EmailService from "@/api/actions/email-service.js";
import PhoneService from "@/api/actions/phone-service.js";
import CommSettingsService from "@/api/actions/comm-settings-service.js";
import ForwardingService from "@/api/actions/forwarding-service.js";
import UiTooltip from "@/features/ui/ui-tooltip";
import InputSpinner from "@/features/InputSpinner";
import InlineSvg from "@/features/InlineSvg.vue";
import { cloakHelpers } from "@/scripts/cloakHelpers";

const props = defineProps({
  cloak: { type: Object, default: null },
  showEmailSection: { type: Boolean, default: false },
  showPhoneSection: { type: Boolean, default: false },
});

const toast = useToast();

const state = reactive({
  showing: false,
  emailsPopulated: [],
  emailForwarding: null,
  emailDefault: null,
  phoneDefault: null,
  messageForwarding: null,
  callForwarding: null,
  commSettings: {
    call: null,
    email: null,
    message: null,
  },
  loaded: false,
  hasOnlyUnverifiedEmails: false,
  hasOnlyUnverifiedPhones: false,
  sentToSettings: false,
  locked: false,
});

const helpTooltip =
  "Configure whether inbound activity stays in your Cloaked inbox or is forwarded to your device. If you haven't added a forwarding number or email yet click the dropdown to do so.";
const phonesVerifiedPopulated = computed(() => store.getters.getVerifiedPhones);
const emails = computed(() => state.emailsPopulated.map((e) => e.email));
const emailValue = computed(
  () =>
    (state.commSettings &&
      state.commSettings.email &&
      state.commSettings.email.send_rule === "specified" &&
      state.emailForwarding &&
      state.emailForwarding.email) ||
    ""
);
const emailForwardingAllowed = computed(
  () =>
    // if email exists, must be cloaked email,
    // if nothing exists, toggle should be enabled
    cloakHelpers.getLatestDetailObject("email", props.cloak) &&
    cloakHelpers.getLatestDetailType("email", props.cloak) === "cloaked"
);

const phones = computed(() =>
  phonesVerifiedPopulated.value.map((p) => p.phone_number)
);

const callPhoneValue = computed(
  () =>
    (state.callForwarding &&
      state.commSettings &&
      state.commSettings.call &&
      state.commSettings.call.send_rule === "specified" &&
      state.callForwarding &&
      state.callForwarding.phone_number) ||
    ""
);

const messagePhoneValue = computed(
  () =>
    (state.commSettings &&
      state.commSettings.message &&
      state.commSettings.message.send_rule === "specified" &&
      state.messageForwarding &&
      state.messageForwarding.phone_number) ||
    ""
);

const phoneForwardingAllowed = computed(
  () =>
    // if phone exists, must be cloaked email,
    // if nothing exists, toggle should be enabled
    cloakHelpers.getLatestDetailObject("phone", props.cloak) &&
    cloakHelpers.getLatestDetailType("phone", props.cloak) === "cloaked"
);

onBeforeUnmount(() => {
  unload();
});

const getUserEmails = async () => {
  try {
    const res = await EmailService.getUserEmailsByCreatedAt();
    const { data } = res;
    state.emailsPopulated = data.results.filter((d) => d.verified);

    const unverified = data.results.filter((d) => !d.verified);

    if (!state.emailsPopulated.length && unverified.length) {
      state.hasOnlyUnverifiedEmails = true;
    } else {
      state.hasOnlyUnverifiedEmails = false;
    }
  } catch {
    toast.error("There was a problem loading your emails.");
  }
};

const unload = () => {
  window.removeEventListener("cloak:refresh-emails", getUserEmails);
};

const toggleShow = () => {
  state.showing = !state.showing;
  if (state.showing) {
    load();
  } else {
    unload();
  }
};
const load = () => {
  refresh();
  window.addEventListener("cloak:refresh-emails", getUserEmails);
};

const refresh = () => {
  state.loaded = false;
  nextTick(() => {
    const promises = [
      getCommSettings(),
      getDefaultForwardingData(),
      getUserEmails(),
      getUserPhones(),
    ];
    Promise.all(promises).finally(() => {
      nextTick(() => {
        if (!state.emailDefault && emails.value.length) {
          state.emailDefault = emails.value[0];
        }
        if (!state.phoneDefault && phones.value.length) {
          state.phoneDefault = phones.value[0];
        }
        state.loaded = true;
      });
    });
  });
};

const setSettings = () => {
  state.sentToSettings = true;
};
// rewrite the below method as an arrow function

const getDefaultForwardingData = async () => {
  try {
    const res = await ForwardingService.getDefaultForwardingData();
    const { data } = res;
    state.emailDefault = data.email && data.email.email;
    state.phoneDefault = data.phone && data.phone.phone_number;
  } catch {
    toast.error("There was a problem loading your default forwarding data.");
  }
};
const getUserPhones = async () => {
  try {
    const res = await PhoneService.getUserPhoneNumbersByCreatedAt();
    const { data } = res;
    const verifiedPhones = data.results.filter((d) => d.verified);
    store.dispatch("setVerifiedPhones", verifiedPhones);

    const unverified = data.results.filter((d) => !d.verified);

    if (!verifiedPhones.length && unverified.length) {
      state.hasOnlyUnverifiedPhones = true;
    } else {
      state.hasOnlyUnverifiedPhones = false;
    }
  } catch {
    toast.error("There was a problem loading your phone numbers.");
  }
};
const getCommSettings = async () => {
  try {
    const res = await CommSettingsService.getCommSettingsForIdentity(
      props.cloak.id
    );
    const { data } = res;
    let newCommSettings = data;

    if (data.email && data.email.email_id) {
      getEmailData(data.email.email_id);
    } else if (!data.email || (data.email && !data.email.filter_rule)) {
      newCommSettings = {
        ...newCommSettings,
        email: {
          ...newCommSettings.email,
          filter_rule: "allow_all",
        },
      };
    }

    const callMessagePhoneAreSame =
      data.call &&
      data.message &&
      data.message.phone_id &&
      data.call.phone_id &&
      data.message.phone_id === data.call.phone_id;

    if (callMessagePhoneAreSame) {
      getPhoneData(data.call.phone_id, ["message", "call"]);
    } else if (data.call && data.call.phone_id) {
      getPhoneData(data.call.phone_id, ["call"]);
    } else if (data.message && data.message.phone_id) {
      getPhoneData(data.message.phone_id, ["message"]);
    }

    if (!data.message || (data.message && !data.message.filter_rule)) {
      newCommSettings = {
        ...newCommSettings,
        message: {
          ...newCommSettings.message,
          filter_rule: "manual_screen",
        },
      };
    }
    if (!data.call || (data.call && !data.call.filter_rule)) {
      newCommSettings = {
        ...newCommSettings,
        call: {
          ...newCommSettings.call,
          filter_rule: "manual_screen",
        },
      };
    }
    state.commSettings = newCommSettings;
  } catch {
    toast.error("There was a problem loading your communication settings.");
  }
};
const updateFilterRule = async (filter_rule, field) => {
  try {
    const payload = {
      [field]: {
        filter_rule,
      },
    };

    await CommSettingsService.updateCommSettingsForIdentity({
      identityId: props.cloak.id,
      payload,
    });

    state.commSettings = {
      ...state.commSettings,
      [field]: {
        ...state.commSettings[field],
        filter_rule,
      },
    };
  } catch {
    toast.error("There was a problem updating your settings.");
  }
};
const getEmailData = async (emailId) => {
  try {
    const res = await EmailService.getEmailById(emailId);
    const { data } = res;
    state.emailForwarding = data;
  } catch {
    toast.error("There was a problem loading your email data.");
  }
};
const getPhoneData = async (phoneId, typesToUpdate) => {
  try {
    const res = await PhoneService.getPhoneById(phoneId);
    const { data } = res;
    typesToUpdate.forEach((phoneSettingType) => {
      state[`${phoneSettingType}Forwarding`] = data;
    });
  } catch {
    toast.error("There was a problem loading your phone data.");
  }
};
const deselect = async (field) => {
  if (field === "email") {
    state.emailForwarding = null;
  }
  if (field === "message") {
    state.messageForwarding = null;
  }
  if (field === "call") {
    state.callForwarding = null;
  }

  // const payloadKey = field === "email" ? "email_id" : "phone_id";
  const payload = {
    [field]: {
      send_rule: "push",
      // [payloadKey]: null,
    },
  };

  try {
    await CommSettingsService.updateCommSettingsForIdentity({
      identityId: props.cloak.id,
      payload,
    });
  } catch {
    toast.error("There was a problem updating your settings.");
  }
};
const select = async (option, field) => {
  let selected;
  const payload = {};

  if (field === "email") {
    selected = state.emailsPopulated.find((e) => e.email === option);
    state.emailForwarding = selected;
  }
  if (field === "message") {
    selected = phonesVerifiedPopulated.value.find(
      (e) => e.phone_number === option
    );
    state.messageForwarding = selected;
  }
  if (field === "call") {
    selected = phonesVerifiedPopulated.value.find(
      (e) => e.phone_number === option
    );
    state.callForwarding = selected;
  }

  if (!selected) {
    return;
  }

  const payloadKey = field === "email" ? "email_id" : "phone_id";
  payload[field] = {
    send_rule: "specified",
    [payloadKey]: selected.id,
  };
  if (
    state.commSettings &&
    state.commSettings[field] &&
    state.commSettings[field].filter_rule
  ) {
    payload[field].filter_rule = state.commSettings[field].filter_rule;
  }

  try {
    await CommSettingsService.updateCommSettingsForIdentity({
      identityId: props.cloak.id,
      payload,
    });
    state.commSettings = {
      ...state.commSettings,
      [field]: {
        ...state.commSettings[field],
        ...payload[field],
      },
    };
  } catch {
    toast.error("There was a problem updating your settings.");
  }
};

watch(
  () => props.showEmailSection,
  (newValue, oldValue) => {
    if (state.showing && newValue && !oldValue) {
      refresh();
    }
  },
  { deep: true }
);
watch(
  () => props.showPhoneSection,
  (newValue, oldValue) => {
    if (state.showing && newValue && !oldValue) {
      refresh();
    }
  },
  { deep: true }
);

watch(
  () => store.getters.getDefaultForwardingEmail,
  (newValue, oldValue) => {
    if (state.showing && newValue && !oldValue) {
      refresh();
    }
  },
  { deep: true }
);

watch(
  () => store.getters.getDefaultForwardingEmail,
  (newEmail, oldEmail) => {
    state.emailDefault = (newEmail && newEmail.email) || null;
    if (!oldEmail && newEmail && newEmail.email && state.sentToSettings) {
      state.sentToSettings = false;
      nextTick(() => {
        select(newEmail.email, "email");
      });
    }
  },
  { deep: true }
);

watch(
  () => store.getters.getDefaultForwardingPhone,
  (newPhone, oldPhone) => {
    state.phoneDefault = (newPhone && newPhone.phone) || null;
    if (!oldPhone && newPhone && newPhone.phone && state.sentToSettings) {
      state.sentToSettings = false;
      nextTick(() => {
        select(newPhone.phone, "phone");
      });
    }
  },
  { deep: true }
);
</script>
<template>
  <section class="cloak-communication-section">
    <header class="cloak-communication-section__header">
      <h3 class="cloak-communication-section__header-title">
        <span>Communication Settings</span>

        <UiTooltip
          :title="helpTooltip"
          position="top"
          max-width="220"
          align-x="center"
        >
          <InlineSvg name="more-info-q" />
        </UiTooltip>
      </h3>
      <button @click="toggleShow">
        {{ state.showing ? "Close" : "Open" }}
      </button>
    </header>
    <div v-if="state.showing">
      <div
        v-if="state.loaded"
        class="cloak-communication-section__group cloak-communication-section__group--no-separator"
      >
        <CloakForwardingSection
          v-if="props.showEmailSection"
          field="email"
          title="Incoming emails"
          :selected="emailValue"
          :options="emails"
          :allowed="emailForwardingAllowed"
          :rules="state.commSettings.email"
          :default-value="state.emailDefault"
          :unverified-entries="state.hasOnlyUnverifiedEmails"
          @select="(selected) => select(selected, 'email')"
          @deselect="() => deselect('email')"
          @update-filter-rule="
            (filter_rule) => updateFilterRule(filter_rule, 'email')
          "
          @sent-to-settings="setSettings"
        />
        <CloakForwardingSection
          v-if="props.showPhoneSection"
          field="call"
          title="Incoming call"
          :locked="state.locked"
          :selected="callPhoneValue"
          :options="phones"
          :allowed="phoneForwardingAllowed"
          :rules="state.commSettings.call"
          :default-value="state.phoneDefault"
          :unverified-entries="state.hasOnlyUnverifiedPhones"
          @select="(selected) => select(selected, 'call')"
          @deselect="() => deselect('call')"
          @update-filter-rule="
            (filter_rule) => updateFilterRule(filter_rule, 'call')
          "
          @sent-to-settings="setSettings"
        />
        <CloakForwardingSection
          v-if="props.showPhoneSection"
          field="message"
          title="Incoming text"
          :locked="state.locked"
          :rules="state.commSettings.message"
          :selected="messagePhoneValue"
          :options="phones"
          :allowed="phoneForwardingAllowed"
          :default-value="state.phoneDefault"
          :unverified-entries="state.hasOnlyUnverifiedPhones"
          @select="(selected) => select(selected, 'message')"
          @deselect="() => deselect('message')"
          @update-filter-rule="
            (filter_rule) => updateFilterRule(filter_rule, 'message')
          "
          @sent-to-settings="setSettings"
        />
      </div>
      <div
        v-else
        class="spinner-wrapper"
      >
        <InputSpinner />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.cloak-communication-section {
  padding: 20px 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
      background-color: transparent;
      border: none;
      cursor: pointer;
      font-weight: 500;
      font-size: 12px;
      line-height: 18px;
      color: $color-primary-100;
    }

    margin-top: 0;

    + .cloak-communication-section__group {
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
    display: flex;
    flex-direction: column;
    gap: 4px;

    &--no-separator {
      border-top: none;
    }
  }

  .spinner-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 42px;
    margin-top: 20px;
  }
}
</style>
