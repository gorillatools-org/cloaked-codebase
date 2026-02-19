<script setup>
import { useRoute } from "vue-router";
import { reactive, nextTick, computed, watch, onMounted } from "vue";
import store from "@/store";
import { SHOWN_PLUGIN, HAS_ACTIVATED_WEB } from "@/scripts/userFlags";
import router from "@/routes/router";
import { logout } from "@/scripts/actions/auth";
import RightPanel from "@/features/global/rightPanel";
import GetStarted from "@/features/modals/GetStarted";
import CardsServices from "@/api/actions/cards-services";
import { dbMixin, getLatestTimestamp } from "@/mixins/db";
import { useIntervalFn, useWindowFocus } from "@vueuse/core";
import Modal from "@/features/Modal.vue";
import { initiateEncryption } from "@/scripts/actions/encryption";
import MigrationModalFlow from "@/features/modals/migrationFlow/MigrationModalFlow.vue";
import DownloadMobileModal from "@/features/onboarding/ModalApp";
import ESimAnnouncement from "@/features/modals/eSim/ESimAnnouncement";
import InboxCompose from "@/features/inbox/InboxCompose";
import UserService from "@/api/actions/user-service";
import { initShareBroadcast } from "@/scripts/messaging/shareBroadcast.js";
import DataDeleteService from "@/api/actions/data-delete-service";
import { IMPORT_STATUS_FINISHED } from "@/store/modules/accounts-importer/shared";
import InboxService from "@/api/actions/inbox-service";
import ChoosePlanModal from "@/features/subscribe/ChoosePlanModal.vue";
import AppLayoutDefault from "@/features/AppLayoutDefault.vue";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";
import CreateEncryptionModal from "@/features/encryption/CreateEncryptionModal.vue";
import { constants } from "@/scripts/constants";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import MonitoringActivateModal from "@/features/monitoring/MonitoringActivateModal.vue";
import { useMonitoringModal } from "@/features/monitoring/useMonitoringModal.js";
import { initializeExtensionMessaging } from "@/scripts/messaging";
import VirtualCardsLeadInSection from "@/features/VirtualCards/Sections/VirtualCardsLeadInSection.vue";

const route = useRoute();
const routePath = computed(() => route.path);

const {
  pause: pauseUpdateIdentitiesPolling,
  resume: startUpdateIdentitiesPolling,
} = useIntervalFn(updateIdentities, 30 * 1000, {
  immediate: false,
});
const isTabFocused = useWindowFocus();

const state = reactive({
  exitDownload: false,
  bootReady: false,
  offset: "",
  mobileDevice: false,
  enablePay: !!route?.query?.enable_pay,
});

const subscription = computed(() => {
  return store.getters["settings/getSubscription"];
});

const importStatus = computed(() => {
  return store.state.accountsImporter.importStatus;
});
const overflow = computed(() => {
  return store.state.ui.bodyOverflowHidden;
});

const rightPanelState = computed(() => {
  return store.getters["getRightPanelStatus"];
});

const hasPlugin = computed(() => {
  return store.getters["browser/pluginDetected"];
});

const showDownload = computed(() => {
  return !hasPlugin.value && !shownPlugin.value;
});

const authenticated = computed(() => {
  return store.getters.auth_token;
});

const user = computed(() => {
  return store.state.authentication?.user;
});

const shouldClipBody = computed(() => {
  return store.state.ui.open_dialog;
});

const shownPlugin = computed(() => {
  return store.getters.getFlag(SHOWN_PLUGIN);
});

const shouldShowEncryptionMigrationModal = computed(() => {
  const userIsV2User =
    store.state.authentication?.user?.encryption_status === 3;
  if (userIsV2User) {
    return false;
  } else if (store.state.authentication?.user?.flags?.migrate_enc_v2) {
    return true;
  }
  return false;
});

const userEncryptionVersion = computed(() => {
  return store.state.authentication?.user?.encryption_status;
});

const userCountry = computed(() => {
  return user?.value?.country_at_registration
    ? user?.value?.country_at_registration
    : user?.value?.current_country;
});

const isSupportedCardCountry = computed(() => {
  return constants.SUPPORTED_CARDS_COUNTRIES.includes(userCountry.value);
});

const canEnablePay = computed(() => {
  return (
    (store.getters["settings/isSubscribed"] ||
      store.getters["settings/isTrial"] ||
      store.getters["settings/isLegacy"]) &&
    isSupportedCardCountry.value
  );
});

watch(
  () => subscription.value,
  (newVal, oldVal) => {
    if (!oldVal && newVal) {
      nextTick(() => showPayModal());
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => rightPanelState.value,
  (value) => {
    if (value === true) {
      document.body.classList.add("active-right-panel");
    } else {
      document.body.classList.remove("active-right-panel");
    }
  },
  { deep: true }
);

watch(
  () => showDownload.value,
  (value) => {
    if (!value) {
      setTimeout(() => {
        state.exitDownload = true;
      }, 5000);
    }
  },
  { deep: true }
);

watch(
  () => authenticated.value,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      logout();
    }
  },
  { deep: true }
);

watch(
  () => authenticated.value,
  (authToken) => {
    if (authToken) {
      initShareBroadcast();
    }
  },
  { immediate: true }
);

watch(
  () => shouldClipBody.value,
  (value) => {
    if (value) {
      state.offset = window.scrollY.toString();
    } else {
      const reset_top = parseInt(state.offset, 10);
      state.offset = 0;
      window.scrollTo(0, reset_top);
      setTimeout(() => {
        window.scrollTo(0, reset_top);
      }, 3);
    }
  },
  { deep: true }
);

watch(
  () => overflow.value,
  (value) => {
    if (value === true) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  },
  { deep: true }
);

watch(
  () => importStatus.value,
  (newValue) => {
    if (newValue === IMPORT_STATUS_FINISHED) {
      updateIdentities();
    }
  },
  { deep: true }
);

watch(
  isTabFocused,
  (isFocused) => {
    if (isFocused) {
      startUpdateIdentitiesPolling();
      updateIdentities();
    } else {
      pauseUpdateIdentitiesPolling();
    }
  },
  { deep: true, immediate: true }
);

function showPayModal() {
  if (state.enablePay) {
    const newQuery = { ...route.query };
    delete newQuery.enable_pay;
    router.replace({
      query: newQuery,
    });
    if (canEnablePay.value) {
      CardsServices.enableSettings({
        enable_pay: route?.query?.enable_pay,
      })
        .then(() => {
          return store.dispatch("authentication/getUser");
        })
        .then(() => {
          if (store.getters["settings/isTrial"]) {
            store.dispatch("openModal", {
              header: "Congratulations you're an early user for Cloaked Pay!",
              subheader:
                "To enable Cloaked Pay, please upgrade with this promo code <b>FAM2024</b> for 80% off the monthly subscription.",
              button: {
                text: "Upgrade now",
                onClick: () =>
                  store.dispatch("subscription/openSubscriptionModal", {
                    promoCode: "FAM2024",
                    callback: () => router.push({ name: "VirtualCards" }),
                  }),
              },
            });
          } else if (
            store.getters["settings/isSubscribed"] ||
            store.getters["settings/isLegacy"]
          ) {
            store.dispatch("openModal", {
              header: "Congrats, you got early access to Cloaked Pay",
              button: {
                text: "To Wallet page",
                onClick: () => router.push({ name: "VirtualCards" }),
              },
            });
          }
        })
        .catch((error) => {
          console.error("Error in pay modal flow:", error);
          store.dispatch("openModal", {
            header: "Error enabling Cloaked Pay",
            subheader: "Invalid link. Please contact support for assistance.",
            button: {
              text: "Contact support",
              onClick: () =>
                window.open(constants.HELP_CENTER_BASE_URL, "_blank"),
            },
          });
        });
    }
  }
}

function prefetchInbox() {
  const allInboxParams = {
    contact_status: "approved",
    muted: false,
    page_size: 20,
    page: 1,
  };
  InboxService.getInbox(allInboxParams);
  const emailsInboxParams = {
    contact_status: "approved",
    muted: false,
    activity_type: "email",
    page_size: 20,
    page: 1,
  };
  InboxService.getInbox(emailsInboxParams);
  const textsInboxParams = {
    contact_status: "approved",
    muted: false,
    activity_type: "message",
    page_size: 20,
    page: 1,
  };
  InboxService.getInbox(textsInboxParams);
  const callsInboxParams = {
    contact_status: "approved",
    muted: false,
    activity_type: "call",
    page_size: 20,
    page: 1,
  };
  InboxService.getInbox(callsInboxParams);
  const requestsInboxParams = {
    contact_status: "unknown",
    muted: false,
    page_size: 20,
    page: 1,
  };
  InboxService.getInbox(requestsInboxParams);
}

function listenForCloaks() {
  startUpdateIdentitiesPolling();
  window.addEventListener("cloak:identities", updateIdentities);
}
async function updateIdentities() {
  let url = "/api/v1/search/identity/";
  const timestamp = await getLatestTimestamp();
  // NOTE: if no timestamp, then db is empty - fetch all cloaks
  if (timestamp) {
    url += `?updated_at__gt=${timestamp}`;
  }
  dbMixin.methods.frontLoadCloaks(false, url);
}

const payEnabled = computed(() => {
  return (
    user?.value?.cloaked_card_enabled ||
    user?.value?.cloaked_card_enabled_status === "enabled"
  );
});

const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});

onMounted(async () => {
  await initiateEncryption();
  state.bootReady = true;
  listenForCloaks();
  initializeExtensionMessaging();
  prefetchInbox();
  DataDeleteService.getEnrollmentData();
  DataDeleteService.getEnrollmentProfile();
  UserService.setProductUseFlag({ name: HAS_ACTIVATED_WEB, value: true });

  if (payEnabled.value && kycValidated.value) {
    CardsServices.getFundingSources();
    CardsServices.getCardSettings();
    CardsServices.getCardList();
  }
});

const { openPlansModal, isPlansModalOpen } = usePlansModal();
const {
  isModalOpen: isEncryptionModalOpen,
  modalContext: encryptionModalContext,
  isEncryptionAvailable,
} = useEncryptionGate();

const { isMonitoringModalOpen } = useMonitoringModal();

const hasNeverPaid = computed(() => {
  return store.getters["settings/isTrial"];
});

watch(
  [() => hasNeverPaid.value, () => routePath.value],
  ([hasNeverPaidNew]) => {
    if (hasNeverPaidNew) {
      openPlansModal(false);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    v-if="state.bootReady"
    class="app-wrapper"
  >
    <MigrationModalFlow
      v-if="shouldShowEncryptionMigrationModal"
      :user-encryption-version="userEncryptionVersion"
    />

    <RightPanel />
    <GetStarted />
    <Modal />
    <DownloadMobileModal />
    <ESimAnnouncement />
    <InboxCompose />
    <ChoosePlanModal
      :value="isPlansModalOpen"
      @input="isPlansModalOpen = $event"
    />
    <CreateEncryptionModal
      :value="isEncryptionModalOpen && !isEncryptionAvailable"
      :context="encryptionModalContext"
      @input="isEncryptionModalOpen = $event"
    />
    <MonitoringActivateModal v-model="isMonitoringModalOpen" />
    <VirtualCardsLeadInSection />
    <AppLayoutDefault>
      <router-view />
    </AppLayoutDefault>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
[data-lastpass-icon-root] {
  display: none !important;
}
#user-app {
  height: 100vh;
  .app-div {
    height: auto;
    .app-wrapper {
      height: auto;
      .content-container {
        height: auto;
        > div {
          height: 100%;
        }
      }
    }
  }

  @media screen and (min-width: $screen-md) {
    height: 100vh;
    .app-div {
      height: 100%;
      .app-wrapper {
        height: 100%;
        .content-container {
          height: 100%;
          > div {
            height: 100%;
          }
        }
      }
    }
  }
}

.highlight-text {
  font-weight: 600;
  color: $color-info;
}
</style>
