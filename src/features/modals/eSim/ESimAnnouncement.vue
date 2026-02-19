<script setup>
import { computed, watchEffect, reactive, onBeforeMount } from "vue";
import IdentityService from "@/api/actions/identity-service";
import AppModal from "@/features/ui/AppModal";
import ESimOfferAnnouncement from "./ESimOfferAnnouncement.vue";
import {
  ESIM_FEATURE_ANNOUNCEMENT_PRESENTED_DATE,
  HAS_SEEN_UK_NUMBERS_ALERT_MODAL,
} from "@/scripts/userFlags";
import moment from "moment";
import UserService from "@/api/actions/user-service";
import router from "@/routes/router";
import store from "@/store";

defineEmits(["close"]);
const state = reactive({
  number: 0,
});
const isSubscribed = computed(() => {
  return store.getters["settings/isSubscribed"];
});
const isLegacy = computed(() => {
  return store.getters["settings/isLegacy"];
});
const showModal = computed(() => {
  return store.state.ui.modals.eSimModalAllUsers;
});
const showESimModalAnnouncementPaid = computed(() => {
  return (
    isSubscribed.value &&
    !store.getters.getFlag(ESIM_FEATURE_ANNOUNCEMENT_PRESENTED_DATE)
  );
});
const showESimModalAnnouncementUnpaid = computed(() => {
  return (
    isLegacy.value &&
    !store.getters.getFlag(ESIM_FEATURE_ANNOUNCEMENT_PRESENTED_DATE)
  );
});
const sawESimModalAnnouncementAtLeastOneDayAgo = computed(() => {
  /* Show paid + legacy users this modal if they've seen
  the previous one at least one day ago */
  return moment().isAfter(
    moment(
      new Date(store.getters.getFlag(ESIM_FEATURE_ANNOUNCEMENT_PRESENTED_DATE))
    ).add(1, "day")
  );
});

onBeforeMount(async () => {
  try {
    const res = await IdentityService.fetchTwillioIdentitiesV2();
    state.number = res.data.count;
  } catch {
    // do nothing
  }
});

watchEffect(() => {
  if (
    (showESimModalAnnouncementPaid.value ||
      showESimModalAnnouncementUnpaid.value ||
      sawESimModalAnnouncementAtLeastOneDayAgo.value) &&
    state.number > 0
  ) {
    store.dispatch("toggleESimModalAllUsersModal", true);
    return;
  }
  if (
    store.getters.getFlag(HAS_SEEN_UK_NUMBERS_ALERT_MODAL) &&
    typeof store.getters.getFlag(HAS_SEEN_UK_NUMBERS_ALERT_MODAL) === "string"
  ) {
    /* Make flag a bool instead- fixes bug on mobile */
    UserService.setFlag({
      name: HAS_SEEN_UK_NUMBERS_ALERT_MODAL,
      value: true,
    });
  }
  store.dispatch("toggleESimModalAllUsersModal", false);
});

function close() {
  if (
    showESimModalAnnouncementPaid.value ||
    showESimModalAnnouncementUnpaid.value
  ) {
    UserService.setFlag({
      name: ESIM_FEATURE_ANNOUNCEMENT_PRESENTED_DATE,
      value: moment().toISOString(),
    });
  } else if (sawESimModalAnnouncementAtLeastOneDayAgo.value) {
    UserService.setFlag({
      name: HAS_SEEN_UK_NUMBERS_ALERT_MODAL,
      value: true,
    });
  }
  store.dispatch("toggleESimModalAllUsersModal", false);
}

function upgrade() {
  UserService.setFlag({
    name: ESIM_FEATURE_ANNOUNCEMENT_PRESENTED_DATE,
    value: moment().toISOString(),
  });
  router.push({ name: "settings.subscription" });
  store.dispatch("toggleESimModalAllUsersModal", false);
}
</script>
<template>
  <AppModal
    :value="
      showModal &&
      (showESimModalAnnouncementPaid || showESimModalAnnouncementUnpaid)
    "
    @input="close"
  >
    <ESimOfferAnnouncement
      v-if="showESimModalAnnouncementPaid"
      top-title="Ultimate security"
      second-title="for calls & texts"
      subtitle="Cloaked eSIM is the most secure way to communicate from your existing mobile device."
      @close="close"
    />
    <ESimOfferAnnouncement
      v-else-if="showESimModalAnnouncementUnpaid"
      top-title="Get Cloaked eSIM for free"
      second-title="when you upgrade"
      subtitle="For a limited time, get Cloaked eSIM for free ($115 dollar value) when you subscribe to an annual plan."
      :highlight-features="[
        'Data removal & monitoring',
        '$1M identity protection',
        '24/7 customer support',
      ]"
      button-label="Upgrade now"
      :button-action="upgrade"
      @close="close"
    />
  </AppModal>
</template>
