<script setup>
import { computed, reactive, ref, markRaw } from "vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import AtomPaginationWidget from "@/library/AtomPaginationWidget.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import ContactsService from "@/api/actions/contacts-service.js";
import CloakContactsItem from "@/features/cloakDetails/CloakContactsItem.vue";
import ContactsViewEdit from "@/features/modals/contacts/ContactsViewEdit.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import ButtonAdd from "@/features/ButtonAdd.vue";
import InputSpinner from "@/features/InputSpinner.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { constants } from "@/scripts/constants";

const APPROVE = constants.CONTACT_ACTION.APPROVE;
const BLOCK = constants.CONTACT_ACTION.BLOCK;
const ADD = constants.CONTACT_CARD_MODE.ADD;
const PHONE = constants.CONTACT_TYPE.PHONE;
const EMAIL = constants.CONTACT_TYPE.EMAIL;

const props = defineProps({
  identityId: { type: Number, default: null },
  cloakedPhoneId: { type: Number, default: null },
  cloakedEmailId: { type: Number, default: null },
});

const toast = useToast();

const state = reactive({
  showing: false,
  emailContactsCount: 0,
  phoneContactsCount: 0,
  displayContacts: [],
  currentPage: 1,
  displayEmailRes: 0,
  displayPhoneRes: 0,
  nextEmailPage: null,
  previousEmailPage: null,
  nextPhonePage: null,
  previousPhonePage: null,
  loaded: false,
});

const maxIndivualResultsPerPage = 5;
const isMenuOpen = ref(false);

const totalContactsCount = computed(
  () => state.emailContactsCount + state.phoneContactsCount
);

const load = () => {
  fetchContactsPage();
};
const toggleShow = () => {
  state.showing = !state.showing;
  if (state.showing) {
    load();
  }
};

const fetchContactsPage = async () => {
  state.loaded = false;
  const emailContactsInfo = await ContactsService.fetchEmailContactsPage(
    props.identityId,
    1
  );
  state.nextEmailPage = emailContactsInfo.next;
  state.previousEmailPage = emailContactsInfo.previous;
  state.emailContactsCount = emailContactsInfo.count;

  const phoneContactsInfo = await ContactsService.fetchPhoneContactsPage(
    props.identityId,
    1
  );
  state.nextPhonePage = phoneContactsInfo.next;
  state.previousPhonePage = phoneContactsInfo.previous;
  state.phoneContactsCount = phoneContactsInfo.count;

  state.displayEmailRes = emailContactsInfo.results?.length || 0;
  state.displayPhoneRes = phoneContactsInfo.results?.length || 0;
  state.displayContacts = [
    ...emailContactsInfo.results,
    ...phoneContactsInfo.results,
  ];
  state.currentPage = 1;
  state.loaded = true;
};
const fetchNumberContactsPage = async (page) => {
  let collectDisplayContacts = [];

  if (Math.ceil(state.emailContactsCount / maxIndivualResultsPerPage) >= page) {
    const emailContactsInfo = await ContactsService.fetchEmailContactsPage(
      props.identityId,
      page
    );
    state.nextEmailPage = emailContactsInfo.next;
    state.previousEmailPage = emailContactsInfo.previous;
    state.emailContactsCount = emailContactsInfo.count;
    state.displayEmailRes = emailContactsInfo.results?.length || 0;
    collectDisplayContacts.push(...emailContactsInfo.results);
  } else {
    state.displayEmailRes = 0;
  }

  if (Math.ceil(state.phoneContactsCount / maxIndivualResultsPerPage) >= page) {
    const phoneContactsInfo = await ContactsService.fetchPhoneContactsPage(
      props.identityId,
      page
    );
    state.nextPhonePage = phoneContactsInfo.next;
    state.previousPhonePage = phoneContactsInfo.previous;
    state.phoneContactsCount = phoneContactsInfo.count;
    state.displayPhoneRes = phoneContactsInfo.results?.length || 0;
    collectDisplayContacts.push(...phoneContactsInfo.results);
  } else {
    state.displayPhoneRes = 0;
  }
  state.displayContacts = collectDisplayContacts;
  state.currentPage = page;
};

const getOveralOffset = () => {
  const emailOffset = getEmailPageCount();
  const phoneOffset = getPhonePageCount();
  const overallOffsetStart =
    state.currentPage === 1
      ? 1
      : emailOffset.offsetStart + phoneOffset.offsetStart;
  const overallOffsetEnd = emailOffset.offsetEnd + phoneOffset.offsetEnd;

  return `${overallOffsetStart} - ${overallOffsetEnd} of ${totalContactsCount.value}`;
};
const getEmailPageCount = () => {
  if (state.emailContactsCount) {
    if (state.displayEmailRes) {
      const offsetStart =
        (state.currentPage - 1) * maxIndivualResultsPerPage + 1;
      const offsetEnd = offsetStart + state.displayEmailRes - 1;
      return { offsetStart, offsetEnd };
    } else {
      return {
        offsetStart: state.emailContactsCount,
        offsetEnd: state.emailContactsCount,
      };
    }
  }
  return { offsetStart: 0, offsetEnd: 0 };
};
const getPhonePageCount = () => {
  if (state.phoneContactsCount) {
    if (state.displayPhoneRes) {
      const offsetStart =
        (state.currentPage - 1) * maxIndivualResultsPerPage + 1;
      const offsetEnd = offsetStart + state.displayPhoneRes - 1;
      return { offsetStart, offsetEnd };
    } else {
      /* If we have results but they're not on this page */
      return {
        offsetStart: state.phoneContactsCount,
        offsetEnd: state.phoneContactsCount,
      };
    }
  }
  return { offsetStart: 0, offsetEnd: 0 };
};

const showAddContactModal = (contactType) => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(ContactsViewEdit),
      props: {
        setPrimary: true,
        contactId: null,
        startMode: ADD,
        associatedIdentityId: props.identityId,
        cloakedContactId:
          contactType === PHONE ? props.cloakedPhoneId : props.cloakedEmailId,
        contactType,
      },
      events: {
        "contact-updated": () => fetchContactsPage(),
      },
    },
  });
};

const handleOpenContactModal = ({ contactId, contactType }) => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(ContactsViewEdit),
      props: {
        setPrimary: true,
        contactId: contactId,
        contactType: contactType,
      },
      events: {
        "contact-updated": () => fetchContactsPage(),
      },
    },
  });
};
const handleChangeStatus = ({ contactId, contactType, newStatus }) => {
  if (newStatus === BLOCK || newStatus === APPROVE) {
    ContactsService.changeContactStatus(contactType, contactId, newStatus)
      .then((res) => {
        state.status = res.status;
        toast.success("Contact updated");
        fetchContactsPage();
        if (newStatus === BLOCK) {
          const contact = state.displayContacts.find((c) => c.id === contactId);
          const evt = new CustomEvent("contact:blocked", { detail: contact });
          window.dispatchEvent(evt);
        }
      })
      .catch(() => {
        toast.error("Something went wrong. Please try again later.");
      });
  }
};
</script>
<template>
  <section class="cloak-identifier-section">
    <header class="cloak-identifier-section__header">
      <h3 class="cloak-identifier-section__header-title">
        <span>Contacts</span>
        <UiTooltip
          :title="'Contacts you’ve approved will appear here. Review pending activity in the “Requests” section of your dashboard.'"
          position="top"
          max-width="192"
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
        v-if="!state.loaded"
        class="spinner-wrapper"
      >
        <InputSpinner />
      </div>
      <div
        v-else-if="state.displayContacts?.length > 0"
        class="cloak-identifier-section__group cloak-identifier-section__group--no-separator"
      >
        <CloakContactsItem
          v-for="contact in state.displayContacts"
          :key="contact.id"
          :contact="contact"
          :identity-id="props.identityId"
          @change-status="handleChangeStatus"
          @edit="handleOpenContactModal"
        />
      </div>
      <AtomPaginationWidget
        v-if="totalContactsCount > 0"
        :fetch-page-number-data="fetchNumberContactsPage"
        :current-items-count="
          parseInt(state.displayEmailRes + state.displayPhoneRes)
        "
        :total-items-count="totalContactsCount"
        :custom-offset="getOveralOffset()"
        :results-per-page="maxIndivualResultsPerPage"
        :left-arrow-disabled="
          !state.previousEmailPage && !state.previousPhonePage
        "
        :right-arrow-disabled="!state.nextEmailPage && !state.nextPhonePage"
      />

      <div class="cloak-identifier-section__add-contact">
        <UiMenu
          :value="isMenuOpen"
          width="188px"
          placement="bottom-start"
          @input="(event) => (isMenuOpen = event)"
        >
          <ButtonAdd label="Add a contact" />
          <template #content>
            <UiMenuButton
              v-if="props.cloakedPhoneId"
              title="Phone number"
              @click="showAddContactModal(PHONE)"
            >
              <template #icon>
                <InlineSvg name="phone-outline" />
              </template>
            </UiMenuButton>
            <UiMenuButton
              v-if="props.cloakedEmailId"
              title="Email"
              @click="showAddContactModal(EMAIL)"
            >
              <template #icon>
                <InlineSvg name="email-outline" />
              </template>
            </UiMenuButton>
          </template>
        </UiMenu>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 42px;
  margin-top: 20px;
}

.empty {
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: $color-primary-100;
  padding: 20px 20px 8px;
}

.cloak-identifier-section {
  padding: 20px 24px;

  &__header {
    display: flex;
    align-items: center;
    margin-top: 0;
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

    &__count {
      font-weight: 300;
      color: $color-primary-50;
    }
  }

  &__add-contact {
    margin-top: 8px;
  }

  &__group {
    border-top: 1px solid rgb(23 23 23 / 10%);
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;

    &--no-separator {
      border-top: none;
    }
  }
}
</style>
