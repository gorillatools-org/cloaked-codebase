<script setup>
import store from "@/store";
import CloakActions from "@/features/cloakDetails/CloakActions.vue";
import CloakNicknameSection from "@/features/cloakDetails/CloakNicknameSection.vue";
import CloakCategorySection from "@/features/cloakDetails/CloakCategorySection.vue";
import CloakWebSection from "@/features/cloakDetails/CloakWebSection.vue";
import CloakIdentifierSection from "@/features/cloakDetails/CloakIdentifierSection.vue";
import CloakCommunicationSection from "@/features/cloakDetails/CloakCommunicationSection.vue";
import CloakNotesSection from "@/features/cloakDetails/CloakNotesSection.vue";
import CloakContacts from "@/features/cloakDetails/CloakContacts.vue";
import CustomFieldsSection from "@/features/cloakDetails/CustomFields/CustomFieldsContainer.vue";
import CloakVirtualCards from "@/features/cloakDetails/CloakVirtualCards.vue";

import SidebarHeaderButton from "@/features/Sidebar/SidebarHeaderButton.vue";
import SidebarHeader from "@/features/Sidebar/SidebarHeader.vue";
import SidebarSeparator from "@/features/Sidebar/SidebarSeparator.vue";

import InlineSvg from "@/features/InlineSvg.vue";
import { getAddressFromAutofill } from "@/features/cloakDetails/CustomFields/CustomFieldForm/utils.js";
import {
  getLatestDetailType,
  getLatestDetailObject,
} from "@/scripts/cloakHelpers.js";
import { getShouldShowCards } from "@/scripts/constants.js";
import { useBasicMode } from "@/composables/useBasicMode.js";

import { reactive, computed, onMounted, watch } from "vue";

const { isBasicModeEnabled } = useBasicMode();
const state = reactive({
  loading: false,
  apiCloak: null,
});

onMounted(async () => {
  await refreshApi();
});

const storeCloak = computed(() => {
  return store.getters.getCloak;
});

const isCancelled = computed(() => {
  return store.getters["settings/isCancelled"];
});

const isTrial = computed(() => {
  return store.getters["settings/isTrial"];
});

const showCloakDetails = computed(() => {
  return store.getters.getCloakDetails;
});

const cloak = computed(() => {
  if (state.apiCloak) {
    return {
      ...state.apiCloak,
      ...storeCloak.value,
    };
  }
  return storeCloak.value;
});

const cardsEnabled = computed(() => {
  return getShouldShowCards(store.state.authentication?.user);
});

const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});

const customFields = computed(() => {
  return cloak.value.customFields?.filter(
    (field) => !["totp_url", "totp_secret"].includes(field.type)
  );
});

const existingAddresses = computed(() => {
  if (store.state.autofill) {
    return [getAddressFromAutofill(store.state.autofill)].filter((address) =>
      [
        "country",
        "state",
        "city",
        "street_address",
        "unit",
        "postal_code",
      ].some((key) => !!address?.[key])
    );
  }
  return [];
});

const phoneIdentifierType = computed(() =>
  getLatestDetailType("phone", cloak.value)
);
const showPhoneSection = computed(() => {
  const phone = getLatestDetailObject("phone", cloak.value);
  return phone && phoneIdentifierType.value === "cloaked";
});

const cloakedPhoneId = computed(() => {
  const phone = getLatestDetailObject("phone", cloak.value);
  return phoneIdentifierType.value === "cloaked" ? phone.id : null;
});

const emailIdentifierType = computed(() =>
  getLatestDetailType("email", cloak.value)
);

const showEmailSection = computed(() => {
  const email = getLatestDetailObject("email", cloak.value);
  return email && emailIdentifierType.value === "cloaked";
});
const cloakedEmailId = computed(() => {
  const email = getLatestDetailObject("email", cloak.value);
  return emailIdentifierType.value === "cloaked" ? email.id : null;
});

watch(
  () => showCloakDetails.value,
  (value) => {
    if (value === true) {
      refreshApi();
    }
  },
  { deep: true }
);

function openSubscribeModal() {
  store.dispatch("subscription/openSubscriptionModal");
}

function refreshApi() {
  return store.dispatch("fetchPopulatedData", cloak.value).then((data) => {
    state.apiCloak = data;
  });
}

function handleClosePanel() {
  store.dispatch("closeRightPanel");
}

async function refreshCloak(newCloakData, callback) {
  state.loading = true;
  return store
    .dispatch("fetchPopulatedData", newCloakData)
    .then((data) => {
      state.loading = false;
      if (callback) {
        callback();
      }
      state.apiCloak = data;

      store.commit("updateCloakInfoOnCards", newCloakData);
      store.dispatch("updateCloakDetails", data);
    })
    .catch(() => {
      if (callback) {
        callback();
      }
      state.loading = false;
    });
}
</script>

<template>
  <section
    v-if="cloak"
    :key="`cloak-details-${cloak.id}`"
    class="cloak-details-wrapper"
  >
    <SidebarHeader>
      <SidebarHeaderButton
        no-background
        tabindex="0"
        @click="handleClosePanel"
        @keydown.enter="handleClosePanel"
        @keydown.space="handleClosePanel"
      >
        <InlineSvg name="double-chevron-right" />
      </SidebarHeaderButton>

      <CloakActions
        v-if="!isBasicModeEnabled"
        :cloak="cloak"
        @refresh="refreshCloak"
      />
    </SidebarHeader>

    <CloakNicknameSection
      :read-only="isCancelled"
      :cloak="cloak"
      :refresh-callback="refreshCloak"
    />
    <button
      v-if="isCancelled"
      class="read-only"
      @click="openSubscribeModal"
    >
      Your identities are read-only • Upgrade now
    </button>
    <CloakCategorySection
      :read-only="isCancelled"
      :refreshing="state.loading"
      :cloak="cloak"
      @refresh="refreshCloak"
    />

    <CloakWebSection
      :key="`web-${cloak.id}`"
      :read-only="isCancelled"
      :refreshing="state.loading"
      :cloak="cloak"
      :show-replace-name-modal="!isBasicModeEnabled"
      @refresh="refreshCloak"
    />

    <SidebarSeparator />

    <CloakIdentifierSection
      v-if="!isBasicModeEnabled"
      :refreshing="state.loading"
      :cloak="cloak"
      :read-only="isCancelled"
      :show-limits="isTrial"
      @refresh="refreshCloak"
    />

    <SidebarSeparator />

    <CustomFieldsSection
      v-if="!isBasicModeEnabled"
      :read-only="isCancelled"
      :identity="cloak"
      :items="customFields"
      :existing-addresses="existingAddresses"
      @refresh="refreshCloak"
    />
    <SidebarSeparator v-if="store.getters.isV2User" />

    <CloakContacts
      v-if="(showEmailSection || showPhoneSection) && !isBasicModeEnabled"
      :identity-id="cloak.id"
      :read-only="isCancelled"
      :cloaked-phone-id="cloakedPhoneId"
      :cloaked-email-id="cloakedEmailId"
    />

    <SidebarSeparator />

    <CloakVirtualCards
      v-if="cardsEnabled && kycValidated && !isBasicModeEnabled"
      :cloak="cloak"
      :read-only="isCancelled"
      @refresh-api="refreshApi"
    />

    <SidebarSeparator
      v-if="cardsEnabled && kycValidated && !isBasicModeEnabled"
    />

    <CloakCommunicationSection
      v-if="(showEmailSection || showPhoneSection) && !isBasicModeEnabled"
      :refreshing="state.loading"
      :cloak="cloak"
      :read-only="isCancelled"
      :show-email-section="showEmailSection"
      :show-phone-section="showPhoneSection"
      @refresh="refreshCloak"
    />

    <SidebarSeparator />

    <CloakNotesSection
      :cloak="cloak"
      :read-only="isCancelled"
      @refresh="refreshCloak"
    />

    <SidebarSeparator v-if="!isBasicModeEnabled" />
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.disable {
  pointer-events: none;
  opacity: 0.4;
}
.read-only {
  border: none;
  cursor: pointer;
  font-size: 12px;
  width: calc(100% - 40px);
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: $color-primary-1;
  background-color: $color-primary-100;
  border-radius: 100px;
  padding: 8px 20px;
  text-align: center;
  margin: 0 20px;
}
.cloak-details-wrapper {
  overflow: auto;
  @include custom-scroll-bar();
  display: flex;
  flex-direction: column;
  height: 100%;

  .sidebar-header {
    justify-content: space-between;
    z-index: 1001;
    background-color: $color-base-white-100;
  }

  &__body {
    flex: 1 1 0;
    overflow: auto;
  }
}
</style>
