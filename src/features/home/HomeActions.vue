<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import store from "@/store";
import UserService from "@/api/actions/user-service";
import MfaService from "@/api/actions/mfa-service";
import { computed, onBeforeMount, reactive } from "vue";
import router from "@/routes/router";

import { PH_EVENT_HOME_ACTION } from "@/scripts/posthogEvents";
import DataDeleteService from "@/api/actions/data-delete-service";
import { posthogCapture } from "@/scripts/posthog.js";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import { userFlags } from "@/scripts/userFlags";
import BaseText from "@/library/BaseText.vue";

const MIN_ACTIONS_TO_SHOW = 3;

const state = reactive({
  showingAll: false,
  mfaMethods: store.state.authentication.MfaMethods || [],
  loaded: false,
});

onBeforeMount(async () => {
  // NOTE: for now, keep verify email banner
  if (store.state.authentication?.MfaMethods?.length) {
    state.loaded = true;
  } else {
    Promise.allSettled([
      getMfaMethods(),
      // getEmail();
    ]).then(() => {
      state.loaded = true;
    });
  }
  DataDeleteService.getEnrollmentData();
  store.dispatch("subscription/fetchInvitations");
});

const usedMobileRecently = computed(() => {
  return store.state.authentication?.user?.is_recent_mobile_user;
});

const showDownloadMobile = computed(() => {
  if (usedMobileRecently.value) {
    return false;
  }
  return !store.getters.getFlag(userFlags.DISMISSED_MOBILE_ACTION);
});

const showImportPasswords = computed(() => {
  const importedCloaks = store.state.localdb.db_cloaks?.filter(
    (cloak) => !!cloak.import_uuid
  );
  if (importedCloaks?.length) {
    return false;
  }
  return !store.getters.getFlag(userFlags.DISMISSED_IMPORT_ACTION);
});

const show2FA = computed(() => {
  if (state.mfaMethods?.length || !state.loaded) {
    return false;
  }
  return !store.getters.getFlag(userFlags.DISMISSED_2FA_ACTION);
});

const { freeSpots } = useInvites();

const showSendInvite = computed(() => {
  return (
    freeSpots.value > 0 &&
    store.getters["settings/getSubscription"]?.owner &&
    !store.getters.getFlag(userFlags.DISMISSED_SEND_INVITE_ACTION)
  );
});

const allActionsObj = computed(() => {
  return {
    showSendInvite: showSendInvite.value,

    showDownloadMobile: showDownloadMobile.value,
    showImportPasswords: showImportPasswords.value,
    show2FA: show2FA.value,
  };
});

const numberOfActionsAvailable = computed(() => {
  return Object.values(allActionsObj.value).filter((f) => f)?.length;
});

const visibleActions = computed(() => {
  const actionsToShow = Object.keys(allActionsObj.value).filter(
    (key) => allActionsObj.value[key]
  );
  if (state.showingAll) {
    return actionsToShow;
  }
  return actionsToShow.slice(0, MIN_ACTIONS_TO_SHOW);
});

const showShowAllButton = computed(() => {
  return numberOfActionsAvailable.value > MIN_ACTIONS_TO_SHOW;
});

function toggleItems() {
  state.showingAll = !state.showingAll;
}

function removeRow(userFlag) {
  UserService.setFlag({ name: userFlag, value: true });
}

async function getMfaMethods() {
  return MfaService.getEnabledMfaMethods()
    .then(async (response) => {
      const { enabled_methods } = response.data;
      state.mfaMethods = enabled_methods;
    })
    .catch(() => {
      // NOTE: this isnt really necessary,
      // but vue throws a console error if this doesnt have a catch (on logout)
      state.mfaMethods = [];
    });
}

function onClickMobile() {
  sendPosthogEvent("download_mobile_app");
  store.dispatch("toggleMobileAppModal", true);
}

function onClickImport() {
  sendPosthogEvent("password_importer");
  router.push({ name: "Import" });
}

function onClick2FA() {
  sendPosthogEvent("setup_2fa");
  router.push({ name: "settings.account" });
}

function onClickSendInvite() {
  sendPosthogEvent("send_invite");
  router.push({ name: "settings.subscription" });
}

function sendPosthogEvent(eventName) {
  posthogCapture(PH_EVENT_HOME_ACTION, {
    action: eventName,
  });
}
</script>
<template>
  <section
    v-show="numberOfActionsAvailable > 0"
    class="recents"
  >
    <div class="header-row">
      <BaseText
        as="h1"
        variant="headline-3-bold"
      >
        Action Items
      </BaseText>
      <BaseText
        v-if="showShowAllButton"
        as="div"
        variant="body-3-semibold"
        underline
        class="toggle"
        @click="toggleItems"
      >
        {{ state.showingAll ? "Show Less" : "Show All" }}
      </BaseText>
    </div>
    <div class="actions">
      <div
        v-if="visibleActions.includes('showSendInvite')"
        class="action-row"
        @click="onClickSendInvite"
      >
        <div class="icon green reverse">
          <InlineSvg
            key="homeaction-play"
            name="verified"
          />
        </div>

        <div class="text-section">
          <BaseText
            variant="headline-6-medium"
            as="div"
          >
            Add someone to your Cloaked plan
          </BaseText>
          <div class="action-subtitle">
            <BaseText
              variant="body-3-semibold"
              underline
            >
              Send invite link
            </BaseText>
            <InlineSvg
              key="homeaction-right-1"
              name="chevron-right"
            />
          </div>
        </div>
        <UiTooltip
          class="delete"
          @click.stop.prevent="
            removeRow(userFlags.DISMISSED_SEND_INVITE_ACTION)
          "
        >
          <InlineSvg
            key="homeaction-delete-1"
            name="delete"
          />
        </UiTooltip>
      </div>

      <div
        v-if="visibleActions.includes('showDownloadMobile')"
        class="action-row"
        @click="onClickMobile"
      >
        <div class="icon orange reverse">
          <InlineSvg
            key="homeaction-cloaked"
            name="cloaked-filled"
          />
        </div>

        <div class="text-section">
          <BaseText
            as="div"
            variant="headline-6-medium"
          >
            Use Cloaked on-the-go with the mobile app
          </BaseText>
          <div class="action-subtitle">
            <BaseText
              variant="body-3-semibold"
              underline
            >
              Download now
            </BaseText>
            <InlineSvg
              key="homeaction-right-2"
              name="chevron-right"
            />
          </div>
        </div>
        <UiTooltip
          class="delete"
          @click.stop.prevent="removeRow(userFlags.DISMISSED_MOBILE_ACTION)"
        >
          <InlineSvg
            key="homeaction-delete-2"
            name="delete"
          />
        </UiTooltip>
      </div>

      <div
        v-if="visibleActions.includes('showImportPasswords')"
        class="action-row"
        @click="onClickImport"
      >
        <div class="icon yellow">
          <InlineSvg
            key="homeaction-key"
            name="key-filled"
          />
        </div>

        <div class="text-section">
          <BaseText
            as="div"
            variant="headline-6-medium"
          >
            Import your passwords to Cloaked
          </BaseText>
          <div class="action-subtitle">
            <BaseText
              variant="body-3-semibold"
              underline
            >
              Get started
            </BaseText>
            <InlineSvg
              key="homeaction-right-3"
              name="chevron-right"
            />
          </div>
        </div>
        <UiTooltip
          class="delete"
          @click.stop.prevent="removeRow(userFlags.DISMISSED_IMPORT_ACTION)"
        >
          <InlineSvg
            key="homeaction-delete-3"
            name="delete"
          />
        </UiTooltip>
      </div>

      <div
        v-if="visibleActions.includes('show2FA')"
        class="action-row"
        @click="onClick2FA"
      >
        <div class="icon green">
          <InlineSvg
            key="homeaction-lock"
            name="lock-shield"
          />
        </div>

        <div class="text-section">
          <BaseText
            as="div"
            variant="headline-6-medium"
          >
            Set up two-factor authentication
          </BaseText>
          <div class="action-subtitle">
            <BaseText
              variant="body-3-semibold"
              underline
            >
              Add additional security
            </BaseText>
            <InlineSvg
              key="homeaction-right-4"
              name="chevron-right"
            />
          </div>
        </div>
        <UiTooltip
          class="delete"
          @click.stop.prevent="removeRow(userFlags.DISMISSED_2FA_ACTION)"
        >
          <InlineSvg
            key="homeaction-delete-4"
            name="delete"
          />
        </UiTooltip>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.header-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: $color-primary-100;

  .toggle {
    cursor: pointer;
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;

  .action-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border: 1px solid $color-primary-10;
    padding: 16px 20px;
    border-radius: 12px;
    gap: 18px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    &:hover {
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      transform: scale(1.009);
      background-color: $color-primary-5;

      .delete {
        visibility: visible;
      }
    }

    .icon {
      height: 48px;
      width: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        height: 50%;
        width: auto;
        color: $white;
      }

      &.reverse {
        svg {
          width: 50%;
          height: auto;
        }
      }
    }

    .text-section {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      .action-subtitle {
        > svg {
          color: $color-primary-90;
          height: 9px;
          width: auto;
          margin-left: 8px;
        }
      }
    }

    .delete {
      visibility: hidden;
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: $color-primary-100;

      > svg {
        width: 50%;
        height: auto;
      }

      &:hover {
        background-color: $color-primary-10;
      }
    }
  }
}

.green {
  background-color: $color-brand-6-100;
}

.blue {
  background-color: $color-brand-4-100;
}

.orange {
  background-color: $color-info;
}

.yellow {
  background-color: $color-warning;
}

.pink {
  background-color: $color-brand-1-100;
}
</style>
