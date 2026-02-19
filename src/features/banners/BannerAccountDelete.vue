<script setup>
import moment from "moment";
import { get } from "lodash-es";
import store from "@/store";
import router from "@/routes/router";

import { computed, nextTick } from "vue";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import AtomTopBannerButton from "@/library/AtomTopBannerButton.vue";

const user = computed(() => {
  return store?.state?.authentication?.user;
});

const deleteDateLabel = computed(() => {
  const deleteDate = get(user.value, "deletion_date");
  let then = moment().add(30, "days");

  if (deleteDate) {
    then = moment(deleteDate);
  }

  return then.format("LL");
});

function openRestoreAccount() {
  if (router.currentRoute.name !== "settings.account") {
    router.push({
      name: "settings.account",
    });
  }

  nextTick(() => {
    store.commit("openPreference", {
      selected: "account",
      right: "manage-account",
      step: "restore",
    });
  });
}

function openManageAccount() {
  if (router.currentRoute.name !== "settings.account") {
    router.push({
      name: "settings.account",
    });
  }

  nextTick(() => {
    store.commit("openPreference", {
      selected: "account",
      step: "manage",
      right: "manage-account",
    });
  });
}
</script>

<template>
  <AtomTopBanner variant="danger">
    Your account will be permanently deleted on
    {{ deleteDateLabel }}.
    <AtomTopBannerButton @click="openRestoreAccount">
      Restore your account
    </AtomTopBannerButton>
    <AtomTopBannerButton @click="openManageAccount">
      Manage account
    </AtomTopBannerButton>
  </AtomTopBanner>
</template>
