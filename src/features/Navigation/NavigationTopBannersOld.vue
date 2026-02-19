<script setup>
import {
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
  ref,
  onBeforeMount,
} from "vue";
import store from "@/store";
import { HAS_ACTIVATED_PLUGIN } from "@/scripts/userFlags";
import EmailService from "@/api/actions/email-service";
import BannerAccountDelete from "@/features/banners/BannerAccountDelete.vue";
import BannerExpired from "@/features/banners/BannerExpired.vue";
import BannerUpgrade from "@/features/banners/BannerUpgrade.vue";
import BannerVerifyEmail from "@/features/banners/BannerVerifyEmail.vue";
import BannerDownloadExtension from "@/features/banners/BannerDownloadExtension.vue";
import { useBasicMode } from "@/composables/useBasicMode";
import { useDisplay } from "@/composables/useDisplay";
import BannerBlackFridayPromotion from "../banners/BannerBlackFridayPromotion.vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";

const { isBasicModeEnabled } = useBasicMode();
const { isMobile } = useDisplay();

const { activePlan } = usePlans();

const isBlackFriday2025PromotionEnabled = computed(() => {
  const user = store.state.authentication?.user;
  return user?.flags?.monthly_plan_experiment === "black-friday-2025";
});

const showBlackFriday2025 = computed(
  () =>
    activePlan?.value?.owner &&
    activePlan?.value?.recurring_interval === "monthly" &&
    isBlackFriday2025PromotionEnabled.value
);

defineEmits(["visible"]);

const showExtensionBanner = ref(
  localStorage.getItem("showExtensionBanner") === "true"
);

const dismissedPromotion = ref(
  localStorage.getItem("blackFridayBannerDismissed") === "true"
);

onMounted(() => {
  window.addEventListener("cloak:refresh-emails", getEmail);
  getEmail();
  const showExtBanner = localStorage.getItem("showExtensionBanner");
  if (showExtBanner === null) {
    showExtensionBanner.value = !extensionInstalled.value;
    localStorage.setItem("showExtensionBanner", !extensionInstalled.value);
  }
});

onBeforeMount(() => {
  store.dispatch("subscription/fetchSubscriptionDetails");
});

onBeforeUnmount(() => {
  window.removeEventListener("cloak:refresh-emails", getEmail);
});

const dataLoaded = ref(false);

const verifiedPrimaryEmail = computed(() => {
  const allEmails = store.getters["settings/getPersonalEmails"];
  return allEmails.find((f) => f.verified && f.primary);
});

const firstUnverifiedEmail = computed(() => {
  const allEmails = store.getters["settings/getPersonalEmails"];
  return allEmails.find((e) => !e.verified);
});

const extensionInstalled = computed(() => {
  return (
    store.getters.getFlag(HAS_ACTIVATED_PLUGIN) ||
    store.getters["browser/pluginDetected"]
  );
});

const isCancelled = computed(() => {
  return store.getters["settings/isCancelled"];
});

const isPendingDeletion = computed(() => {
  return store.getters["authentication/isPendingDeletion"];
});

const isTrialing = computed(() => {
  return (
    store.getters["subscription/getSubscriptionDetails"]
      ?.provider_subscription_status === "trialing"
  );
});

watch(
  () => extensionInstalled.value,
  (newValue) => {
    if (newValue) {
      showExtensionBanner.value = false;
      localStorage.setItem("showExtensionBanner", false);
    }
  },
  { immediate: true }
);

function getEmail() {
  return EmailService.getUserEmails().then(() => {
    dataLoaded.value = true;
  });
}

function dismissExtBanner() {
  showExtensionBanner.value = false;
  localStorage.setItem("showExtensionBanner", false);
}
</script>

<template>
  <div v-if="dataLoaded">
    <BannerBlackFridayPromotion
      v-if="!dismissedPromotion && showBlackFriday2025"
      v-model="dismissedPromotion"
    />
    <BannerAccountDelete v-else-if="isPendingDeletion" />
    <BannerExpired v-else-if="isCancelled" />
    <BannerUpgrade v-else-if="isTrialing" />

    <!-- NOTE: not showing on mobile because input in modal is not styled for small screens -->
    <BannerVerifyEmail
      v-else-if="!verifiedPrimaryEmail && !isMobile"
      :email="firstUnverifiedEmail"
    />

    <!-- NOTE: not showing on mobile because extension is for desktop use -->
    <BannerDownloadExtension
      v-else-if="showExtensionBanner && !isBasicModeEnabled && !isMobile"
      @dismiss="dismissExtBanner"
    />
  </div>
</template>
