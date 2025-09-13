<script setup>
import { computed, onBeforeMount, reactive } from "vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import ContactsService from "@/api/actions/contacts-service.js";
import {
  phone_format,
  getAccountInitials,
  getContactName,
} from "@/scripts/format.js";

import Button from "@/features/Button.vue";
import ContactIcon from "@/features/ui/ContactIcon.vue";
import ExpansionPanel from "@/features/ExpansionPanel.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";

import {
  CONTACT_TYPE,
  CONTACT_CARD_MODE,
  CONTACT_STATUS,
  CONTACT_ACTION,
} from "@/scripts/constants.js";
import { phone as phoneValidation } from "phone";
import { email as emailValidation } from "@/scripts/validation.js";
import InlineSvg from "@/features/InlineSvg.vue";

const PHONE = CONTACT_TYPE.PHONE;
const VIEW = CONTACT_CARD_MODE.VIEW;
const ADD = CONTACT_CARD_MODE.ADD;
const EDIT = CONTACT_CARD_MODE.EDIT;
const BLOCKED = CONTACT_STATUS.BLOCKED;
const APPROVE = CONTACT_ACTION.APPROVE;
const BLOCK = CONTACT_ACTION.BLOCK;

const emit = defineEmits(["contact-updated"]);

const props = defineProps({
  setPrimary: Boolean,
  index: { type: Number, default: null },
  contactId: { type: Number, default: null },
  cloakedContactId: { type: Number, default: null },
  associatedIdentityId: { type: Number, default: null },
  contactType: {
    validator(value) {
      return [CONTACT_TYPE.PHONE, CONTACT_TYPE.EMAIL].includes(value);
    },
    default: null,
  },
  startMode: {
    validator(value) {
      return [
        CONTACT_CARD_MODE.VIEW,
        CONTACT_CARD_MODE.ADD,
        CONTACT_CARD_MODE.EDIT,
      ].includes(value);
    },
    default: null,
  },
});

const toast = useToast();

const state = reactive({
  /* view, edit, block */
  mode: props?.startMode ? props.startMode : VIEW,
  /* the hiddeen email or phone number */
  cloakedValue: "",
  /* the original email or phone number */
  originalValue: "",
  firstName: "",
  lastName: "",
  contactDetail: "",
  /* check if the stored name is Unknown via Cloaked */
  nameCheck: {},
  originalName: "",
  contactCompany: "",
  contactCopyForBackup: null,
  /* unknown, approved, or blocked */
  status: CONTACT_STATUS.UNKNOWN,
  contactInitials: "",
  associatedIdentityId: props.associatedIdentityId
    ? props.associatedIdentityId
    : null,
  originalValueIsVisible: false,
});

const contactTypeIsPhone = computed(() => props.contactType === PHONE);
const modeDisplay = computed(
  () => state.mode.charAt(0).toUpperCase() + state.mode.slice(1)
);
const contactName = computed(() => `${state.firstName} ${state.lastName}`);
const originalValueLabel = computed(() => {
  if (state.originalValueIsVisible) {
    return `Hide Original ${contactTypeIsPhone.value ? "Number" : "Email"}`;
  }
  return `Show Original ${contactTypeIsPhone.value ? "Number" : "Email"}`;
});

const originalValueExplainer = computed(() => {
  return `This ${
    contactTypeIsPhone.value ? "number" : "email"
  } is not secure. Contacting the original ${
    contactTypeIsPhone.value ? "phone number" : "email address"
  } will expose your identity.`;
});

const cloakedValueLabel = computed(
  () => `Cloaked ${contactTypeIsPhone.value ? "Number" : "Email"}:`
);

const cloakedValueExplainer = computed(() => {
  return `Only send ${
    contactTypeIsPhone.value ? "texts to/call" : "messages to"
  } this contact to the Cloaked ${
    contactTypeIsPhone.value ? "number" : "email address"
  } to keep your contact information hidden.`;
});

const blockedContactExplainerParas = computed(() => {
  return [
    `This ${
      contactTypeIsPhone.value ? "number" : "email address"
    } has been blocked from contacting you, therefore their assigned Cloaked ${
      contactTypeIsPhone.value ? "phone number" : "email"
    } has been removed. Contacting their original ${
      contactTypeIsPhone.value ? "number" : "email"
    } could expose your real phone number.`,
    ` To start receiving ${
      contactTypeIsPhone.value ? "calls and texts" : "emails"
    } from them, you can unblock them at anytime and they will receive a Cloaked ${
      contactTypeIsPhone.value ? "phone number" : "email"
    }, keeping you protected.`,
  ];
});

const getContactInfo = async ({ contactType, contactId }) => {
  try {
    const data = await ContactsService.fetchContactsInfoByType({
      contactType,
      contactId,
    });
    state.firstName = data.first_name;
    state.lastName = data.last_name;
    state.nameCheck = getContactName(data);
    state.originalName = data.original_name;
    state.associatedIdentityId = data.identity;
    state.contactCompany = data.company;
    state.cloakedValue = contactTypeIsPhone.value
      ? phone_format(data[`cloak_contact_${props.contactType}`])
      : data[`cloaked_contact_${props.contactType}`];
    state.originalValue = contactTypeIsPhone.value
      ? phone_format(data[`original_${props.contactType}`])
      : data[`original_${props.contactType}`];
    state.status = data.status;

    state.contactCopyForBackup = {
      first_name: data.first_name,
      last_name: data.last_name,
      company: data.company,
    };
  } catch {
    toast.error("Something went wrong. Please try again later.");
  }
};

const getExternalContactInitialsDisplay = () => {
  if (
    state.firstName ||
    (state.lastName && state.nameCheck?.firstName) ||
    state.nameCheck?.lastName
  ) {
    state.contactInitials = getAccountInitials(
      state.nameCheck?.firstName,
      state.nameCheck?.lastName
    );
    return state.contactInitials;
  } else if (state.originalName) {
    const nameArray = state.originalName.split(" ");
    return nameArray[1]
      ? getAccountInitials(nameArray[0], nameArray[1])
      : getAccountInitials(nameArray[0]);
  }
  return "";
};

const handleChangeMode = (newMode) => {
  state.mode = newMode;
};

const handleCancel = () => {
  if (state.mode === EDIT) {
    if (state.contactCopyForBackup?.first_name) {
      state.firstName = state.contactCopyForBackup?.first_name;
      state.lastName = state.contactCopyForBackup?.last_name;
    } else {
      state.firstName = "";
      state.lastName = "";
    }
  } else if (state.mode === ADD) {
    handleClose();
    return;
  }
  handleChangeMode(VIEW);
};

const toggleOriginalValueBtn = () => {
  state.originalValueIsVisible = !state.originalValueIsVisible;
};

const handleClose = () => {
  store.dispatch("closeModal");
};

const handleChangeStatus = async (newStatus) => {
  if (newStatus === BLOCK || newStatus === APPROVE) {
    try {
      const data = await ContactsService.changeContactStatus(
        props.contactType,
        props.contactId,
        newStatus
      );
      state.status = data.status;
      toast.success("Contact updated");
      handleChangeMode(VIEW);
      emit("contact-updated");
    } catch {
      toast.error("Something went wrong. Please try again later.");
    }
  }
  handleClose();
};

onBeforeMount(() => {
  switch (state.mode) {
    case VIEW:
    case EDIT:
      getContactInfo({
        contactType: props.contactType,
        contactId: props.contactId,
      });
      break;
    case ADD:
      state.nameCheck = { firstName: "", lastName: "" };
      break;
    default:
      break;
  }
});

const handleAddContact = async () => {
  if (contactTypeIsPhone.value) {
    const phoneObject = phoneValidation(state.contactDetail);
    if (!phoneObject.isValid || !phoneObject.phoneNumber) {
      toast.error("Please enter a valid phone number and country code.");
      return;
    }
  }

  if (!contactTypeIsPhone.value && !emailValidation(state.contactDetail)) {
    toast.error("Please enter a valid email address.");
    return;
  }
  try {
    const { data } = contactTypeIsPhone.value
      ? await ContactsService.addContactToPhone({
          cloakPhoneId: props.cloakedContactId,
          first_name: state.firstName,
          last_name: state.lastName,
          contact_number: phoneValidation(state.contactDetail).phoneNumber,
        })
      : await ContactsService.addContactToEmail({
          cloakEmailId: props.cloakedContactId,
          first_name: state.firstName,
          last_name: state.lastName,
          contact_email: state.contactDetail,
        });
    /* Update state with new contact data in view mode */
    toast.success("Contact added");
    emit("contact-updated");
    await getContactInfo({
      contactType: props.contactType,
      contactId: data.id,
    });
    handleChangeMode(VIEW);
  } catch (error) {
    if (error?.response?.data?.errors?.last_name) {
      toast.error("Last name cannot be blank.");
    }
    if (error?.response?.data?.errors?.first_name) {
      toast.error("First name cannot be blank.");
    }
    if (
      error?.response?.data?.errors?.first_name &&
      error?.response?.data?.errors?.last_name
    ) {
      toast.error("Please enter a valid first and last name.");
    }
  }
};

const handleUpdateContact = async () => {
  try {
    const res = await ContactsService.saveChangesToContact({
      contactType: props.contactType,
      contactId: props.contactId,
      first_name: state.firstName,
      last_name: state.lastName,
      company: state.contactCompany,
    });
    state.contactCopyForBackup = {
      ...res.data,
    };
    handleChangeMode(VIEW);
    toast.success("Contact updated");
    emit("contact-updated");
  } catch (error) {
    if (error.response.data.errors.last_name) {
      toast.error("Last name cannot be blank.");
    }
    if (error.response.data.errors.first_name) {
      toast.error("First name cannot be blank.");
    }
    if (
      error.response.data.errors.first_name &&
      error.response.data.errors.last_name
    ) {
      toast.error("Please enter a valid first and last name.");
    }
  }
};
const handleSaveChanges = async () => {
  switch (state.mode) {
    case ADD:
      await handleAddContact();
      break;
    case EDIT:
      await handleUpdateContact();
      break;
    default:
      break;
  }
};
</script>

<template>
  <ModalTemplate
    class="contacts-modal"
    :show="true"
    @close="handleClose"
  >
    <template #header>
      <div
        v-if="state.mode === VIEW"
        class="contacts-header"
      >
        <div>
          <h1>Contact Details</h1>
        </div>
        <div>
          <span
            class="action-btn"
            @click="handleChangeMode(EDIT)"
          >
            Edit
          </span>
          <span>|</span>
          <span
            v-if="state.status === BLOCKED"
            class="action-btn"
            @click="handleChangeStatus(APPROVE)"
          >
            Unblock
          </span>
          <span
            v-else
            class="action-btn"
            @click="handleChangeMode(BLOCK)"
          >
            Block
          </span>
        </div>
      </div>
      <div
        v-if="state.mode === ADD"
        class="contacts-header"
      >
        <div>
          <h1>Add a contact</h1>
        </div>
        <div />
      </div>
      <div
        v-else-if="state.mode === EDIT"
        class="contacts-header"
      >
        <div>
          <h1>Edit Contact Details</h1>
        </div>
        <div>
          <span
            v-if="state.status === BLOCKED"
            class="action-btn"
            @click="handleChangeStatus(APPROVE)"
          >
            Unblock
          </span>
          <span
            v-else
            class="action-btn"
            @click="handleChangeMode(BLOCK)"
          >
            Block
          </span>
        </div>
      </div>
      <div
        v-else-if="state.mode === BLOCK"
        class="contacts-header"
      >
        <div>
          <h1>{{ modeDisplay }} this contact?</h1>
        </div>
      </div>
    </template>

    <template #body>
      <div>
        <ContactIcon
          :initials="getExternalContactInitialsDisplay()"
          :associated-identity-id="state.associatedIdentityId"
          :override="{ width: '72px', height: '72px' }"
        />
      </div>
      <div
        v-if="state.mode === VIEW || state.mode === EDIT"
        class="contact-body"
      >
        <span
          v-if="state.mode === VIEW"
          class="contact-saved-name"
        >
          {{ contactName || state.cloakedValue }}
          <InlineSvg
            v-if="state.status === BLOCKED"
            name="block-contact"
          />
        </span>
        <span
          v-if="state.mode === EDIT"
          class="contact-saved-name"
        >
          <input
            ref="firstName"
            v-model="state.firstName"
            class="input-contact-name"
            type="text"
            :placeholder="'First'"
            :title="state.firstName"
            autocomplete="off"
            maxlength="50"
            data-lpignore="true"
            @keydown.enter="handleSaveChanges"
          />
          <input
            ref="lastName"
            v-model="state.lastName"
            class="input-contact-name"
            type="text"
            :placeholder="'Last'"
            :title="state.lastName"
            autocomplete="off"
            maxlength="50"
            data-lpignore="true"
            @keydown.enter="handleSaveChanges"
          />
          <InlineSvg
            v-if="state.status === BLOCKED"
            name="block-contact"
          />
        </span>

        <ExpansionPanel
          :button-text="originalValueLabel"
          :duration="200"
          @on-click="toggleOriginalValueBtn"
        >
          <div class="exp-content">
            <h5>{{ state.originalValue }}</h5>
            <h6 class="modal-caption">
              {{ originalValueExplainer }}
            </h6>
          </div>
        </ExpansionPanel>
        <div
          v-if="state.status === BLOCKED"
          class="blocked-contact"
        >
          <h6
            v-for="(
              blockedContactExplainer, idx
            ) in blockedContactExplainerParas"
            :key="idx"
            class="modal-caption"
          >
            {{ blockedContactExplainer }}
          </h6>
        </div>
        <div v-else>
          <h6 class="modal-caption cloaked-value-label">
            {{ cloakedValueLabel }}
          </h6>
          <h5>{{ state.cloakedValue }}</h5>
          <h6 class="modal-caption">
            {{ cloakedValueExplainer }}
          </h6>
        </div>
      </div>

      <div
        v-else-if="state.mode === ADD"
        class="contact-body"
      >
        <h6 class="modal-caption">Name</h6>
        <span class="contact-saved-name">
          <input
            ref="firstName"
            v-model="state.firstName"
            class="input-contact-name"
            type="text"
            :placeholder="'First'"
            :title="state.firstName"
            autocomplete="off"
            maxlength="50"
            data-lpignore="true"
          />
          <input
            ref="lastName"
            v-model="state.lastName"
            class="input-contact-name"
            type="text"
            :placeholder="'Last'"
            :title="state.lastName"
            autocomplete="off"
            maxlength="50"
            data-lpignore="true"
          />
        </span>
        <h6 class="modal-caption">Contact info</h6>
        <span class="contact-saved-name new-contact-info">
          <input
            ref="contactDetail"
            v-model="state.contactDetail"
            class="input-contact-name input-contact-info"
            type="text"
            :placeholder="contactTypeIsPhone ? 'Phone number' : 'Email address'"
            :title="state.contactDetail"
            autocomplete="off"
            maxlength="60"
            data-lpignore="true"
            @keydown.enter="handleSaveChanges"
          />
        </span>
      </div>

      <div
        v-else-if="state.mode === BLOCK"
        class="block-contact"
      >
        <div class="modal-caption">
          {{ contactName }}
        </div>
        <div class="displayed-block-contact modal-caption">
          {{ state.cloakedValue }}
        </div>
        <div>
          will no longer be able to contact you unless you approve them again.
        </div>
      </div>
    </template>

    <template #footer>
      <template v-if="state.mode === EDIT">
        <Button
          type="secondary"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button @click="handleSaveChanges">Done</Button>
      </template>
      <template v-if="state.mode === ADD">
        <Button
          type="secondary"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button @click="handleSaveChanges">Save</Button>
      </template>
      <template v-else-if="state.mode === BLOCK">
        <Button
          type="secondary"
          @click="handleChangeMode(VIEW)"
        >
          Cancel
        </Button>
        <Button
          type="danger"
          class="titlecase"
          @click="handleChangeStatus(state.mode)"
        >
          {{ state.mode }}
        </Button>
      </template>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.contacts-modal {
  color: $color-primary-100;

  .content {
    max-width: 512px !important;
  }

  .contacts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $color-primary-100;

    span {
      cursor: default;
    }

    .action-btn {
      font-size: 12px;
      font-weight: 500;
      text-decoration: underline;
      padding: 8px;
      cursor: pointer;
    }
  }

  section {
    display: flex;
  }

  .contact-body {
    padding: 14px 26px 26px;

    .button-label {
      font-size: 12px;
    }
  }

  h5 {
    color: $color-primary-100;
    font-size: 12px;
    font-weight: 500;
    padding-bottom: 6px;
    word-break: break-all;
  }

  .exp-content {
    padding: 10px 0;
  }

  .modal-caption {
    color: $color-primary-70;
    font-size: 12px;
    font-weight: 400;
    padding-bottom: 6px;

    span {
      font-weight: 600;
    }
  }

  .block-contact {
    padding: 0 14px;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 400;

    .modal-caption {
      font-size: 16px;
      font-weight: 600;
      color: $color-primary-100;
    }

    .displayed-block-contact {
      max-width: 256px;
      word-wrap: break-word;
    }
  }

  .blocked-contact {
    padding-top: 16px;
  }

  .cloaked-value-label {
    padding: 16px 0;
  }

  .contact-saved-name {
    vertical-align: middle;
    display: inline-flex;
    font-weight: 600;
    font-size: 18px;
    padding-bottom: 20px;
    color: $color-primary-100;

    svg {
      color: $color-primary-100;
      vertical-align: middle;
      display: inline-flex;
      align-self: center;
      margin-left: 6px;
    }
  }

  .new-contact-info {
    padding-bottom: 0;
    width: 95%;
  }

  .input-contact-name {
    outline: none;
    flex: 1 1 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    font-size: 18px;
    width: 48%;
    color: $color-primary-100;
    background-color: $color-base-white-100;
    border-radius: 8px;
    border: 1px solid transparent;

    &::placeholder {
      color: $color-primary-70;
    }

    &:focus {
      border: 1px solid $color-primary-100;
      outline: 0;
    }
  }

  .input-contact-info {
    width: 100%;
  }
}

.titlecase {
  text-transform: capitalize;
}
</style>
