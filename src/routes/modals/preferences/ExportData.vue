<script setup>
import moment from "moment";
import { get } from "lodash-es";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesFooter from "@/routes/modals/preferences/PreferencesFooter.vue";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";

import ValueDisplay from "@/features/ui/value-display.vue";
import Button from "@/features/Button.vue";
import UiProgress from "@/features/UiProgress.vue";
import { downloadFile } from "@/scripts/tools.js";
import { authDecrypt, password_confirm } from "@/scripts/actions/encryption.js";
import AuthService from "@/api/actions/auth-service.js";
import IdentityService from "@/api/actions/identity-service.js";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import { computed, reactive, watch } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";

const toast = useToast();

const emit = defineEmits(["toggleBack", "next-step"]);

const props = defineProps({
  viewStep: { type: String, default: null },
  navDisabled: Boolean,
});

const options = {
  IDENTITY: "IDENTITY",
  ACTIVITY: "INBOX",
  ALL: "ALL",
};

const steps = ["password", "export"];

const state = reactive({
  step: 0,
  password: "",
  invalidPassword: false,
  loadingPassword: false,
  selectedOption: null,
  downloadReady: false,
  loadingIdentities: false,
  totalIdentities: 0,
  identities: [],
});

const user = computed(() => store.state.user);

const currentStep = computed(() => {
  return steps[state.step];
});

const progress = computed(() => {
  const progress = {
    label: "Exporting Cloaked identities...",
    counter: state.identities.length,
    counterTotal: state.totalIdentities,
  };

  if (progress.counter && progress.counter === progress.counterTotal) {
    progress.label = "Finished";
  }

  return progress;
});

watch(
  () => currentStep.value,
  () => {
    if (currentStep.value === "export") {
      exportIdentities();
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.viewStep,
  () => {
    if (props.viewStep) {
      const found = steps.findIndex((item) => item === props.viewStep);

      if (found >= 0) {
        state.step = found;
      }
    }
  },
  { immediate: true, deep: true }
);

function nextStep() {
  if (props.navDisabled) {
    return emit("next-step");
  }

  let next = state.step + 1;
  const maxStep = steps.length - 1;

  if (next >= maxStep) {
    next = maxStep;
  }

  state.step = next;
}

function handleGoBack() {
  if (state.step > 0) {
    state.step = state.step - 1;
  } else {
    emit("toggleBack");
  }
}

async function validatePassword() {
  const userId = user.value.id;
  state.loadingPassword = true;
  let password = state.password;
  if (store.state.authentication?.user?.encryption_status === 3) {
    password = await password_confirm(state.password);
  }
  AuthService.confirmPassword(userId, password)
    .then(() => {
      state.invalidPassword = false;
      nextStep();
    })
    .catch(() => {
      state.invalidPassword = true;
      toast.error("Invalid password, please try again");
    })
    .finally(() => {
      state.loadingPassword = false;
    });
}

function setOption(option) {
  state.selectedOption = option;
  nextStep();
}

function exportIdentities() {
  const getIdentities = ({ url, setTotal }) => {
    return IdentityService.fetchIdentities(url).then(({ data }) => {
      if (setTotal) {
        state.totalIdentities = data.count;
      }

      state.identities = [...state.identities, ...data.results];

      if (data.next) {
        return getIdentities({ url: data.next });
      }
    });
  };

  state.loadingIdentities = true;

  const pageSize = 20;

  const url = `/api/v2/cloaked/identity/?protected=false&page_size=${pageSize}`;

  getIdentities({ url, setTotal: true })
    .then(() => {
      return downloadIdentities();
    })
    .catch(() => {
      toast.error("Error exporting");
      state.identities = [];
      state.totalIdentities = 0;
    })
    .finally(() => {
      state.loadingIdentities = false;
    });
}

async function downloadIdentities() {
  const dateLabel = moment().format("YYYY-MM-DD");

  const columns = [
    {
      title: "Name",
      value: "nickname",
    },
    {
      title: "URL",
      value: "website_url",
    },
    {
      title: "Email",
      value: (identity) => {
        const cloaked = get(identity, "cloaked_email.email");
        const autofill = get(identity, "stored_autofill.email");
        return cloaked || autofill;
      },
    },
    {
      title: "Phone",
      value: (identity) => {
        const cloaked = get(identity, "cloaked_phone.phone_number");
        const autofill = get(identity, "stored_autofill.phone_number");

        return cloaked || autofill;
      },
    },
    {
      title: "Username",
      value: "stored_autofill.username",
    },
    {
      title: "Password",
      value: async (identity) => {
        const cloaked = get(identity, "stored_password.password");
        const autofill = get(identity, "stored_autofill.password");

        const password = cloaked || autofill;

        return await authDecrypt(password);
      },
    },
    {
      title: "Notes",
      value: "stored_autofill.notes",
    },
  ];

  const eol = "\r\n";

  const rows = [columns.map((col) => col.title).join(",")];

  for (const identity of state.identities) {
    const row = [];

    for (const column of columns) {
      let value;

      if (typeof column.value === "function") {
        if (column.value.constructor.name === "AsyncFunction") {
          value = await column.value(identity);
        } else {
          value = column.value(identity);
        }
      } else {
        value = get(identity, column.value, "");
      }

      value = value ?? "";
      // wrap value and escape double quotes
      row.push(`"${value.replaceAll('"', '""')}"`);
    }

    rows.push(row.join(","));
  }

  state.downloadReady = true;

  downloadFile({
    fileContents: rows.join(eol),
    fileName: `export-${dateLabel}.csv`,
  });
}
</script>

<template>
  <PreferencesPanel class="export-data">
    <template
      v-if="!props.navDisabled"
      #header
    >
      <PreferencesHeader @go-back="handleGoBack" />
    </template>

    <template v-if="currentStep === 'password'">
      <PreferencesTitle>Export my data</PreferencesTitle>
      <PreferencesParagraph>
        Please enter your password to continue.
      </PreferencesParagraph>

      <PreferencesInput
        :value="state.password"
        label="Password"
        type="password"
        placeholder="Your Password"
        :error="state.invalidPassword"
        :disabled="state.loadingPassword"
        @input="(event) => (state.password = event)"
        @save="validatePassword"
      />
    </template>

    <template v-if="currentStep === 'options'">
      <PreferencesTitle>Choose data to export</PreferencesTitle>

      <div class="export-data__options">
        <ValueDisplay
          label="Identity data"
          value="Passwords, email addresses, phone numbers, usernames, notes"
          @click="setOption(options.IDENTITY)"
        />

        <ValueDisplay
          label="Inbox data (large file size)"
          value="Emails, text messages, calls"
          @click="setOption(options.ACTIVITY)"
        />

        <ValueDisplay
          label="All data (large file size)"
          @click="setOption(options.ALL)"
        />
      </div>
    </template>

    <template v-if="currentStep === 'export'">
      <div class="header-icon-row">
        <InlineSvg
          v-if="!state.downloadReady"
          name="hourglass-round"
        />
        <InlineSvg
          v-else
          name="download-round"
          class="success"
        />
      </div>

      <template v-if="!state.downloadReady">
        <PreferencesTitle big>
          Getting your data ready for export
        </PreferencesTitle>

        <PreferencesParagraph>
          While most exports finish in about 5 minutes, this might take a while.
          Feel free to leave this tab open and return later.
        </PreferencesParagraph>
      </template>

      <template v-if="state.downloadReady">
        <PreferencesTitle big>Export completed</PreferencesTitle>

        <PreferencesParagraph>
          {{ state.totalIdentities }} Cloaked identities exported successfully.
        </PreferencesParagraph>
      </template>

      <UiProgress
        :label="progress.label"
        :counter="progress.counter"
        :counter-total="progress.counterTotal"
      />
    </template>

    <template #footer>
      <PreferencesFooter v-if="currentStep === 'password'">
        <Button
          :disabled="state.loadingPassword || !state.password"
          :loading="state.loadingPassword"
          @click="validatePassword"
        >
          Continue
        </Button>
      </PreferencesFooter>

      <PreferencesFooter v-if="currentStep === 'export'">
        <Button
          type="secondary"
          :disabled="state.loadingIdentities || !state.downloadReady"
          :loading="state.loadingIdentities"
          @click="downloadIdentities"
        >
          Download again
        </Button>

        <Button
          :disabled="state.loadingIdentities"
          @click="emit('toggleBack')"
        >
          Done
        </Button>
      </PreferencesFooter>
    </template>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.export-data {
  .preferences-input {
    margin-top: 37px;
  }

  .ui-progress {
    margin-top: 36px;
  }

  &__options {
    margin-top: 32px;
  }

  .header-icon-row {
    margin-bottom: 24px;

    svg {
      color: $color-primary-70;

      &.success {
        color: $color-info;
      }
    }
  }
}
</style>
