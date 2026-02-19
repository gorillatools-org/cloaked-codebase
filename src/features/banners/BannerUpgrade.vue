<script setup>
import NavigationPayNowModal from "@/features/Navigation/NavigationPayNowModalOld.vue";
import { computed, ref } from "vue";
import moment from "moment";
import store from "@/store";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import AtomTopBannerButton from "@/library/AtomTopBannerButton.vue";

const isModalOpen = ref(false);

const planDetails = computed(
  () => store.getters["subscription/getSubscriptionDetails"]
);

const daysLeft = computed(() => {
  const dateNow = moment.now();
  const dateNextBilling = moment(planDetails.value?.next_billing_date);
  const diff = Math.ceil(dateNextBilling.diff(dateNow, "days", true));
  return diff !== 1 ? `${diff} days` : `${diff} day`;
});
</script>

<template>
  <AtomTopBanner variant="cloaked">
    <span>
      Your free trial has {{ daysLeft }} left.
      <AtomTopBannerButton @click="isModalOpen = true">
        Upgrade now
      </AtomTopBannerButton>
    </span>
    <NavigationPayNowModal
      :value="isModalOpen"
      @input="isModalOpen = $event"
      @close="isModalOpen = false"
    />
  </AtomTopBanner>
</template>
