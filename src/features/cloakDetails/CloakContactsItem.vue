<script setup>
import { ref, markRaw } from "vue";
import {
  getAccountInitials,
  getContactName,
  phone_format,
} from "@/scripts/format";
import BlockContactsConfirmation from "@/features/modals/contacts/BlockContactsConfirmation.vue";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import CloakInfoRowButton from "@/features/cloakDetails/CloakInfoRowButton.vue";
import Button from "@/features/Button.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import ContactIcon from "@/features/ui/ContactIcon.vue";
import { tools } from "@/scripts/tools";
import { constants } from "@/scripts/constants";

const emit = defineEmits(["change-status", "edit"]);
const props = defineProps({
  contact: {
    type: Object,
    required: true,
  },
  identityId: {
    type: Number,
    required: true,
  },
});

const isMenuOpen = ref(false);

const getContactDisplayName = (contactDetails) => {
  const { firstName, lastName } = getContactName(contactDetails);
  if (firstName || lastName) {
    return `${firstName} ${lastName}`;
  } else if (contactDetails?.cloak_contact_phone) {
    return phone_format(contactDetails.cloak_contact_phone);
  } else if (contactDetails?.cloaked_contact_email) {
    return contactDetails.cloaked_contact_email;
  }
};

const getContactInitialsDisplay = (contactDetails) => {
  const { firstName, lastName } = getContactName(contactDetails);
  if (firstName || lastName) {
    return getAccountInitials(firstName, lastName);
  } else if (contactDetails.original_name) {
    const nameArray = contactDetails.original_name.split(" ");
    return nameArray[1]
      ? getAccountInitials(nameArray[0], nameArray[1])
      : getAccountInitials(nameArray[0]);
  }
  return "";
};

const copy = (value) => {
  tools.copyToClipboard(value);
};

function blockContact() {
  return emit("change-status", {
    contactId: props.contact.id,
    contactType: props.contact?.original_phone
      ? constants.CONTACT_TYPE.PHONE
      : constants.CONTACT_TYPE.EMAIL,
    newStatus: constants.CONTACT_ACTION.BLOCK,
  });
}

function showBlockConfirmation() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(BlockContactsConfirmation),
      props: {
        contact: props.contact,
        identityId: props.identityId,
      },
      events: {
        blockContact: blockContact,
      },
    },
  });
}
</script>

<template>
  <div
    class="cloak-contact centered-flex-row"
    :class="{ 'cloak-contact--menu-open': isMenuOpen }"
  >
    <div class="centered-flex-row small-width">
      <ContactIcon
        :show-block-icon="contact.status === constants.CONTACT_STATUS.BLOCKED"
        :initials="getContactInitialsDisplay(props.contact)"
        :override="{ width: '24px', height: '24px' }"
      />
      <h5>{{ getContactDisplayName(props.contact) }}</h5>
    </div>
    <UiMenu
      v-if="props.contact.status !== constants.CONTACT_STATUS.BLOCKED"
      :value="isMenuOpen"
      width="188px"
      placement="bottom-end"
      @input="(event) => (isMenuOpen = event)"
    >
      <CloakInfoRowButton
        class="mini-btn"
        icon
        :active="isMenuOpen"
      >
        <InlineSvg name="kabob" />
      </CloakInfoRowButton>

      <template #content>
        <UiMenuButton
          title="Edit"
          @click="
            emit('edit', {
              contactId: props.contact.id,
              contactType: props.contact?.original_phone
                ? constants.CONTACT_TYPE.PHONE
                : constants.CONTACT_TYPE.EMAIL,
            })
          "
        >
          <template #icon>
            <InlineSvg name="edit-pencil-larger" />
          </template>
        </UiMenuButton>
        <UiMenuButton
          title="Copy"
          @click="
            copy(
              props.contact?.original_phone &&
                props.contact?.cloak_contact_phone
                ? props.contact.cloak_contact_phone
                : props.contact.cloaked_contact_email
            )
          "
        >
          <template #icon>
            <InlineSvg name="copy" />
          </template>
        </UiMenuButton>
        <UiMenuSeparator />
        <UiMenuButton
          title="Block"
          @click="showBlockConfirmation"
        >
          <template #icon>
            <InlineSvg name="block" />
          </template>
        </UiMenuButton>
      </template>
    </UiMenu>

    <Button
      v-if="contact.status === constants.CONTACT_STATUS.BLOCKED"
      class="unblock-button"
      @click="
        emit('change-status', {
          contactId: props.contact.id,
          contactType: props.contact?.original_phone
            ? constants.CONTACT_TYPE.PHONE
            : constants.CONTACT_TYPE.EMAIL,
          newStatus: constants.CONTACT_ACTION.APPROVE,
        })
      "
    >
      Unblock
    </Button>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.centered-flex-row {
  display: flex;
  flex-direction: row;
  flex-grow: 0;
  flex-shrink: 0;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  color: $color-primary-100;
  position: relative;

  &.small-width {
    max-width: calc(100% - 32px) !important;
  }

  .ui-menu {
    visibility: hidden;
  }

  &.cloak-contact {
    border-radius: 99px;
    padding: 4px;
    justify-content: space-between;
    border: 1px solid transparent;

    &--menu-open,
    &:hover {
      border: 1px solid $color-primary-10-light;

      .ui-menu {
        visibility: visible;
      }
    }

    h5 {
      font-size: 12px;
      font-weight: 500;
      margin-left: 12px;
    }

    .ui-menu {
      padding: 4px;

      .mini-btn {
        width: 24px;
        height: 24px;
        min-width: 24px;
        color: $color-primary-100;
      }
    }

    .unblock-button {
      font-size: 10px;
      padding: 6px 8px;
      height: 24px;
      flex-shrink: 0;
      position: absolute;
      right: 3px;
    }
  }
}
</style>
